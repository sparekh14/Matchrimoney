// @ts-nocheck
import express, { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import prisma from '../utils/prisma.js'; // Use shared instance
import { authenticateToken } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/types.js';
import { updateProfileSchema, searchFiltersSchema } from '../validators/user.js';
import { uploadProfilePicture, handleUploadError, getFileUrl, useS3 } from '../middleware/upload.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { deleteFromS3, extractS3KeyFromUrl } from '../utils/s3.js';

const router = Router();

// GET /api/users/profile - Get current user's profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        weddingDate: true,
        weddingLocation: true,
        weddingTheme: true,
        estimatedBudget: true,
        vendorCategories: true,
        bio: true,
        profilePicture: true,
        allowMessages: true,
        profileVisible: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    
    const updateData: any = { ...validatedData };
    
    // Convert weddingDate to Date object if provided
    if (validatedData.weddingDate) {
      updateData.weddingDate = new Date(validatedData.weddingDate);
    }

    // Mark profile as completed if it has essential fields
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { 
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        weddingDate: true, 
        weddingLocation: true, 
        weddingTheme: true, 
        estimatedBudget: true 
      },
    });

    const updatedFields = { ...currentUser, ...updateData };
    const isProfileComplete = !!(
      updatedFields.person1FirstName &&
      updatedFields.person1LastName &&
      updatedFields.person2FirstName &&
      updatedFields.person2LastName &&
      updatedFields.weddingDate &&
      updatedFields.weddingLocation &&
      updatedFields.weddingTheme &&
      updatedFields.estimatedBudget
    );

    updateData.profileCompleted = isProfileComplete;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        weddingDate: true,
        weddingLocation: true,
        weddingTheme: true,
        estimatedBudget: true,
        vendorCategories: true,
        bio: true,
        profilePicture: true,
        allowMessages: true,
        profileVisible: true,
        profileCompleted: true,
        updatedAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/profile/upload-picture - Upload profile picture
router.post('/profile/upload-picture', authenticateToken, uploadProfilePicture.single('profilePicture'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get the URL for the uploaded file (works for both S3 and local storage)
    const profilePictureUrl = getFileUrl(req.file);

    // Delete old profile picture if it exists
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { profilePicture: true },
    });

    if (currentUser?.profilePicture) {
      try {
        if (useS3) {
          // Delete from S3
          const oldKey = extractS3KeyFromUrl(currentUser.profilePicture);
          if (oldKey) {
            await deleteFromS3(oldKey);
          }
        } else {
          // Delete from local storage
          const oldFilePath = path.join(process.cwd(), currentUser.profilePicture);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
        // Continue with upload even if old file deletion fails
      }
    }

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        email: true,
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        weddingDate: true,
        weddingLocation: true,
        weddingTheme: true,
        estimatedBudget: true,
        vendorCategories: true,
        bio: true,
        profilePicture: true,
        allowMessages: true,
        profileVisible: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}, handleUploadError);

// DELETE /api/users/profile/remove-picture - Remove profile picture
router.delete('/profile/remove-picture', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { profilePicture: true },
    });

    if (user?.profilePicture) {
      try {
        if (useS3) {
          // Delete from S3
          const s3Key = extractS3KeyFromUrl(user.profilePicture);
          if (s3Key) {
            await deleteFromS3(s3Key);
          }
        } else {
          // Delete from local storage
          const filePath = path.join(process.cwd(), user.profilePicture);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (deleteError) {
        console.error('Error deleting profile picture:', deleteError);
        // Continue with database update even if file deletion fails
      }
    }

    // Update user's profile picture in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { profilePicture: null },
      select: {
        id: true,
        email: true,
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        weddingDate: true,
        weddingLocation: true,
        weddingTheme: true,
        estimatedBudget: true,
        vendorCategories: true,
        bio: true,
        profilePicture: true,
        allowMessages: true,
        profileVisible: true,
        profileCompleted: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile picture removed successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/users/profile/change-password - Change password
router.put('/profile/change-password', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/users/marketplace - Get potential matches with filtering
router.get('/marketplace', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const filters = searchFiltersSchema.parse(req.query);
    
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        weddingDate: true,
        weddingLocation: true,
        estimatedBudget: true,
        vendorCategories: true,
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      id: { not: req.user!.id }, // Exclude current user
      profileVisible: true,
      profileCompleted: true,
      isEmailVerified: true,
    };

    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      whereClause.weddingDate = {};
      if (filters.dateRange.start) {
        whereClause.weddingDate.gte = new Date(filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        whereClause.weddingDate.lte = new Date(filters.dateRange.end);
      }
    } else {
      // Default: show couples getting married within 6 months of current user
      const userWeddingDate = currentUser.weddingDate;
      const sixMonthsBefore = new Date(userWeddingDate);
      sixMonthsBefore.setMonth(sixMonthsBefore.getMonth() - 6);
      const sixMonthsAfter = new Date(userWeddingDate);
      sixMonthsAfter.setMonth(sixMonthsAfter.getMonth() + 6);
      
      whereClause.weddingDate = {
        gte: sixMonthsBefore,
        lte: sixMonthsAfter,
      };
    }

    // Location filter
    if (filters.location) {
      whereClause.weddingLocation = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    // Theme filter
    if (filters.theme) {
      whereClause.weddingTheme = {
        contains: filters.theme,
        mode: 'insensitive',
      };
    }

    // Budget range filter
    if (filters.budgetRange?.min || filters.budgetRange?.max) {
      whereClause.estimatedBudget = {};
      if (filters.budgetRange.min) {
        whereClause.estimatedBudget.gte = filters.budgetRange.min;
      }
      if (filters.budgetRange.max) {
        whereClause.estimatedBudget.lte = filters.budgetRange.max;
      }
    }

    // Vendor categories filter
    if (filters.vendorCategories && filters.vendorCategories.length > 0) {
      whereClause.vendorCategories = {
        hasSome: filters.vendorCategories,
      };
    }

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
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
          bio: true,
          profilePicture: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: [
          { weddingDate: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Calculate compatibility scores
    const usersWithScores = users.map(user => {
      const score = calculateCompatibilityScore(currentUser, user);
      return { ...user, compatibilityScore: score };
    });

    // Sort by compatibility score
    usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      users: usersWithScores,
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

// GET /api/users/:id - Get specific user profile (public view)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Use /profile endpoint for your own profile' });
    }

    const user = await prisma.user.findUnique({
      where: { 
        id,
        profileVisible: true,
        profileCompleted: true,
        isEmailVerified: true,
      },
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
        bio: true,
        profilePicture: true,
        allowMessages: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found or profile not public' });
    }

    // Calculate compatibility with current user
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        weddingDate: true,
        weddingLocation: true,
        estimatedBudget: true,
        vendorCategories: true,
      },
    });

    const compatibilityScore = currentUser ? calculateCompatibilityScore(currentUser, user) : 0;

    res.json({ 
      user: { 
        ...user, 
        compatibilityScore 
      } 
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to calculate compatibility score
function calculateCompatibilityScore(user1: any, user2: any): number {
  let score = 0;
  let maxScore = 0;

  // Date proximity (40% of score)
  const dateDiff = Math.abs(
    new Date(user1.weddingDate).getTime() - new Date(user2.weddingDate).getTime()
  );
  const daysDiff = dateDiff / (1000 * 60 * 60 * 24);
  const dateScore = Math.max(0, 40 - (daysDiff / 30) * 10); // Decrease by 10 points per month
  score += Math.max(0, dateScore);
  maxScore += 40;

  // Location proximity (30% of score)
  const location1 = user1.weddingLocation.toLowerCase();
  const location2 = user2.weddingLocation.toLowerCase();
  
  if (location1 === location2) {
    score += 30;
  } else if (location1.includes(location2) || location2.includes(location1)) {
    score += 20;
  } else {
    // Check if same state (rough approximation)
    const state1 = location1.split(',').pop()?.trim();
    const state2 = location2.split(',').pop()?.trim();
    if (state1 === state2) {
      score += 10;
    }
  }
  maxScore += 30;

  // Budget similarity (20% of score)
  const budgetDiff = Math.abs(user1.estimatedBudget - user2.estimatedBudget);
  const budgetAvg = (user1.estimatedBudget + user2.estimatedBudget) / 2;
  const budgetScore = Math.max(0, 20 - (budgetDiff / budgetAvg) * 20);
  score += budgetScore;
  maxScore += 20;

  // Shared vendor categories (10% of score)
  const sharedCategories = user1.vendorCategories.filter((cat: string) =>
    user2.vendorCategories.includes(cat)
  );
  const categoryScore = Math.min(10, sharedCategories.length * 2);
  score += categoryScore;
  maxScore += 10;

  return Math.round((score / maxScore) * 100);
}

export default router;
