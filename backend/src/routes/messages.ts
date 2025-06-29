// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js'; // Use shared instance
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/types.js';

const router = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  receiverId: z.string().min(1, 'Receiver ID is required'),
  matchId: z.string().min(1, 'Match ID is required').optional(),
});

const markReadSchema = z.object({
  messageIds: z.array(z.string()).min(1, 'At least one message ID required'),
});

// POST /api/messages - Send a new message
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { content, receiverId, matchId } = sendMessageSchema.parse(req.body);
    const senderId = req.user!.id;

    if (senderId === receiverId) {
      res.status(400).json({ error: 'Cannot send message to yourself' });
      return;
    }

    // Verify receiver exists and allows messages
    const receiver = await prisma.user.findUnique({
      where: { 
        id: receiverId,
        allowMessages: true,
      },
      select: { id: true, person1FirstName: true, person1LastName: true, person2FirstName: true, person2LastName: true },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found or not accepting messages' });
    }

    // If matchId provided, verify the match exists and user is part of it
    if (matchId) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.initiatorId !== senderId && match.receiverId !== senderId) {
        return res.status(403).json({ error: 'Not authorized for this match' });
      }

      if (match.initiatorId !== receiverId && match.receiverId !== receiverId) {
        return res.status(400).json({ error: 'Receiver is not part of this match' });
      }

      // Only allow messaging if match is accepted or sender is initiator (for initial message)
      if (match.status === 'DECLINED') {
        return res.status(403).json({ error: 'Cannot send messages to a declined match' });
      }

      if (match.status === 'PENDING' && match.initiatorId !== senderId) {
        return res.status(403).json({ error: 'Cannot send messages until match is accepted' });
      }
    } else {
      // If no matchId, check if users have an accepted match
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            { initiatorId: senderId, receiverId },
            { initiatorId: receiverId, receiverId: senderId },
          ],
          status: 'ACCEPTED',
        },
      });

      if (!existingMatch) {
        return res.status(403).json({ 
          error: 'No accepted match found. Cannot send direct messages.' 
        });
      }
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        matchId: matchId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            profilePicture: true,
          },
        },
      },
    });

    // Update match timestamp if associated with a match
    if (matchId) {
      await prisma.match.update({
        where: { id: matchId },
        data: { updatedAt: new Date() },
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/conversations - Get user's conversations
router.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all matches for the user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId },
        ],
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      include: {
        initiator: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            profilePicture: true,
          },
        },
        receiver: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            profilePicture: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, person1FirstName: true, person1LastName: true, person2FirstName: true, person2LastName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get unread message counts
    const conversationsWithUnread = await Promise.all(
      matches.map(async (match) => {
        const isInitiator = match.initiatorId === userId;
        const otherUser = isInitiator ? match.receiver : match.initiator;
        const lastMessage = match.messages[0];

        // Count unread messages from the other user
        const unreadCount = await prisma.message.count({
          where: {
            matchId: match.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          id: match.id,
          status: match.status,
          otherUser,
          lastMessage: lastMessage || null,
          unreadCount,
          updatedAt: match.updatedAt,
        };
      })
    );

    res.json({ conversations: conversationsWithUnread });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/conversation/:matchId - Get messages for a specific match
router.get('/conversation/:matchId', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.initiatorId !== userId && match.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Get messages
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { matchId },
        include: {
          sender: {
            select: {
              id: true,
              person1FirstName: true,
              person1LastName: true,
              person2FirstName: true,
              person2LastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { matchId } }),
    ]);

    // Reverse to show oldest first
    messages.reverse();

    res.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/user/:userId - Get message history with a specific user (not tied to a match)
router.get('/user/:userId', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId: currentUserId, receiverId: otherUserId },
          { initiatorId: otherUserId, receiverId: currentUserId },
        ],
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.initiatorId !== currentUserId && match.receiverId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages
    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              person1FirstName: true,
              person1LastName: true,
              person2FirstName: true,
              person2LastName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: currentUserId },
          ],
        },
      }),
    ]);

    messages.reverse();

    res.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/read - Mark messages as read
router.post('/read', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { messageIds } = markReadSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      message: `${result.count} messages marked as read`,
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/messages/mark-conversation-read/:matchId - Mark all messages in a conversation as read
router.put('/mark-conversation-read/:matchId', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user!.id;

    // Verify user is part of this match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.initiatorId !== userId && match.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark all unread messages in this match as read (for current user)
    const updatedMessages = await prisma.message.updateMany({
      where: {
        matchId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      message: 'All messages in conversation marked as read',
      updatedCount: updatedMessages.count,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/unread-count - Get total unread message count
router.get('/unread-count', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    next(error);
  }
});

export default router;
