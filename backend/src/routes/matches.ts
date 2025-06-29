// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma.js'; // Use shared instance
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/types.js';

const router = Router();

const createMatchSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  message: z.string().min(1, 'Initial message is required').max(500, 'Message too long'),
});

const matchActionSchema = z.object({
  action: z.enum(['accept', 'decline']),
});

// POST /api/matches - Create a new match (initiate contact)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { receiverId, message } = createMatchSchema.parse(req.body);
    const initiatorId = req.user!.id;

    if (initiatorId === receiverId) {
      res.status(400).json({ error: 'Cannot create match with yourself' });
      return;
    }

    // Check if receiver exists and allows messages
    const receiver = await prisma.user.findUnique({
      where: { 
        id: receiverId,
        profileVisible: true,
        profileCompleted: true,
        allowMessages: true,
      },
      select: { id: true, person1FirstName: true, person1LastName: true, person2FirstName: true, person2LastName: true, vendorCategories: true },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found or not accepting messages' });
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { initiatorId, receiverId },
          { initiatorId: receiverId, receiverId: initiatorId },
        ],
      },
    });

    if (existingMatch) {
      return res.status(409).json({ error: 'Match already exists between these users' });
    }

    // Get initiator info for compatibility calculation
    const initiator = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: {
        weddingDate: true,
        weddingLocation: true,
        estimatedBudget: true,
        vendorCategories: true,
      },
    });

    // Calculate shared vendor categories and estimated savings
    const sharedCategories = initiator!.vendorCategories.filter(cat =>
      receiver.vendorCategories.includes(cat)
    );

    // Rough estimated savings calculation (10-30% based on shared categories)
    const savingsPercentage = Math.min(30, 10 + sharedCategories.length * 3);
    const estimatedSavings = Math.round(initiator!.estimatedBudget * (savingsPercentage / 100));

    // Create match
    const match = await prisma.match.create({
      data: {
        initiatorId,
        receiverId,
        sharedVendorCategories: sharedCategories,
        estimatedSavings,
      },
      include: {
        receiver: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
            profilePicture: true,
          },
        },
      },
    });

    // Create initial message
    await prisma.message.create({
      data: {
        content: message,
        senderId: initiatorId,
        receiverId,
        matchId: match.id,
      },
    });

    res.status(201).json({
      message: 'Match created successfully',
      match,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/matches - Get user's matches
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string;

    const whereClause: any = {
      OR: [
        { initiatorId: userId },
        { receiverId: userId },
      ],
    };

    if (status && ['PENDING', 'ACCEPTED', 'DECLINED'].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        initiator: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
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
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
            profilePicture: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            isRead: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Format matches to show the other user's info
    const formattedMatches = matches.map(match => {
      const isInitiator = match.initiatorId === userId;
      const otherUser = isInitiator ? match.receiver : match.initiator;
      const lastMessage = match.messages[0];

      return {
        id: match.id,
        status: match.status,
        isInitiator,
        otherUser,
        sharedVendorCategories: match.sharedVendorCategories,
        estimatedSavings: match.estimatedSavings,
        compatibilityScore: match.compatibilityScore,
        lastMessage,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    next(error);
  }
});

// PUT /api/matches/:id/action - Accept or decline a match
router.put('/:id/action', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { action } = matchActionSchema.parse(req.body);
    const userId = req.user!.id;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        initiator: { select: { id: true, person1FirstName: true, person1LastName: true } },
        receiver: { select: { id: true, person1FirstName: true, person1LastName: true } },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Only the receiver can accept/decline
    if (match.receiverId !== userId) {
      return res.status(403).json({ error: 'Only the receiver can respond to this match' });
    }

    if (match.status !== 'PENDING') {
      return res.status(400).json({ error: 'Match has already been responded to' });
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'DECLINED';

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status: newStatus },
      include: {
        initiator: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
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
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
            profilePicture: true,
          },
        },
      },
    });

    res.json({
      message: `Match ${action}ed successfully`,
      match: updatedMatch,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/matches/:id - Get specific match details
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
            profilePicture: true,
            bio: true,
          },
        },
        receiver: {
          select: {
            id: true,
            person1FirstName: true,
            person1LastName: true,
            person2FirstName: true,
            person2LastName: true,
            weddingDate: true,
            weddingLocation: true,
            weddingTheme: true,
            estimatedBudget: true,
            vendorCategories: true,
            profilePicture: true,
            bio: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check if user is part of this match
    if (match.initiatorId !== userId && match.receiverId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const isInitiator = match.initiatorId === userId;
    const otherUser = isInitiator ? match.receiver : match.initiator;

    res.json({
      match: {
        id: match.id,
        status: match.status,
        isInitiator,
        otherUser,
        sharedVendorCategories: match.sharedVendorCategories,
        estimatedSavings: match.estimatedSavings,
        compatibilityScore: match.compatibilityScore,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
