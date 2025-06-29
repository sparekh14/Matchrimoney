// @ts-nocheck
import { Router, Request, Response, NextFunction } from 'express';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
} from '../utils/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.js';
import prisma from '../utils/prisma.js';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(409).json({ 
        error: 'User with this email already exists' 
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        password: hashedPassword,
        person1FirstName: validatedData.person1FirstName,
        person1LastName: validatedData.person1LastName,
        person2FirstName: validatedData.person2FirstName,
        person2LastName: validatedData.person2LastName,
        weddingDate: new Date(validatedData.weddingDate),
        weddingLocation: validatedData.weddingLocation,
        weddingTheme: validatedData.weddingTheme,
        estimatedBudget: validatedData.estimatedBudget,
        vendorCategories: validatedData.vendorCategories || [],
        isEmailVerified: true, // Bypass email verification
      },
      select: {
        id: true,
        email: true,
        person1FirstName: true,
        person1LastName: true,
        person2FirstName: true,
        person2LastName: true,
        isEmailVerified: true,
      },
    });

    res.status(201).json({
      message: 'User created successfully. You can now log in.',
      user: {
        id: user.id,
        email: user.email,
        person1FirstName: user.person1FirstName,
        person1LastName: user.person1LastName,
        person2FirstName: user.person2FirstName,
        person2LastName: user.person2LastName,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check if email is verified (bypass in development)
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!user.isEmailVerified && !isDevelopment) {
      res.status(401).json({ 
        error: 'Please verify your email before logging in',
        requiresVerification: true 
      });
      return;
    }

    // Auto-verify in development if not already verified
    if (isDevelopment && !user.isEmailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          isEmailVerified: true,
          profileCompleted: true // Also complete profile in dev
        }
      });
      console.log(`🔧 Development: Auto-verified user ${user.email}`);
    }

    // Generate token
    const token = generateAccessToken(user.id, user.email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        person1FirstName: user.person1FirstName,
        person1LastName: user.person1LastName,
        person2FirstName: user.person2FirstName,
        person2LastName: user.person2LastName,
        profileCompleted: user.profileCompleted || isDevelopment,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verification) {
      // In development, try to find user by token in their profile and auto-verify
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development: Verification token not found, attempting auto-verify for token: ${token.substring(0, 20)}...`);
        
        const userWithToken = await prisma.user.findFirst({
          where: { emailVerificationToken: token }
        });
        
        if (userWithToken) {
          await prisma.user.update({
            where: { id: userWithToken.id },
            data: {
              isEmailVerified: true,
              profileCompleted: true,
              emailVerificationToken: null,
            },
          });
          console.log(`🔧 Development: Auto-verified user ${userWithToken.email}`);
          return res.json({ message: 'Email verified successfully (development mode)' });
        }
      }
      
      return res.status(400).json({ 
        error: 'Invalid or expired verification token. Please request a new verification email.' 
      });
    }

    // Check if token is expired
    if (verification.expiresAt < new Date()) {
      await prisma.emailVerification.delete({ where: { token } });
      return res.status(400).json({ 
        error: 'Verification token has expired. Please request a new verification email.' 
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: verification.email },
      data: {
        isEmailVerified: true,
        profileCompleted: true, // Auto-complete profile on verification
        emailVerificationToken: null,
      },
    });

    // Delete verification record
    await prisma.emailVerification.delete({ where: { token } });

    console.log(`✅ Email verified successfully for user: ${updatedUser.email}`);
    res.json({ message: 'Email verified successfully! Your profile has been activated.' });
  } catch (error) {
    console.error('Verification error:', error);
    next(error);
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();

    // Update user
    await prisma.user.update({
      where: { email: user.email },
      data: { emailVerificationToken: verificationToken },
    });

    // Delete old verification and create new one
    await prisma.emailVerification.deleteMany({ where: { email: user.email } });
    await prisma.emailVerification.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    const displayName = `${user.person1FirstName} ${user.person1LastName} & ${user.person2FirstName} ${user.person2LastName}`;
    await sendVerificationEmail(user.email, displayName, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal whether user exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email: user.email },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    const displayName = `${user.person1FirstName} ${user.person1LastName} & ${user.person2FirstName} ${user.person2LastName}`;
    await sendPasswordResetEmail(user.email, displayName, resetToken);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

// Development only - Manual verification endpoint
if (process.env.NODE_ENV === 'development') {
  router.post('/dev-verify-user', async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          profileCompleted: true,
          emailVerificationToken: null,
        }
      });
      
      // Clean up any verification tokens
      await prisma.emailVerification.deleteMany({
        where: { email: user.email }
      });
      
      console.log(`🔧 Development: Manually verified user ${user.email}`);
      res.json({ 
        message: `User ${user.email} has been manually verified and profile completed`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          person1FirstName: updatedUser.person1FirstName,
          person1LastName: updatedUser.person1LastName,
          person2FirstName: updatedUser.person2FirstName,
          person2LastName: updatedUser.person2LastName,
          isEmailVerified: updatedUser.isEmailVerified,
          profileCompleted: updatedUser.profileCompleted
        }
      });
    } catch (error) {
      console.error('Manual verification error:', error);
      next(error);
    }
  });
}

export default router;
