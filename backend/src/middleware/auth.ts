// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import type { AuthenticatedRequest } from './types.js';

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isEmailVerified: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // This check is important but might be better handled in specific routes
    // if you want to allow access to some routes without verification.
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: 'Email not verified. Please check your inbox for a verification link.',
        requiresVerification: true
      });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    next(error); // Pass other errors to the error handling middleware
  }
};

export type { AuthenticatedRequest }; 