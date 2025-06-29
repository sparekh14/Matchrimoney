// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../../generated/prisma';
import { ZodError } from 'zod';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
    return;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        res.status(409).json({
          error: 'Duplicate entry',
          details: `${error.meta?.target} already exists`
        });
        return;
      case 'P2025':
        res.status(404).json({
          error: 'Record not found'
        });
        return;
      default:
        res.status(500).json({
          error: 'Database error',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}; 