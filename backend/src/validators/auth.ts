import { z } from 'zod';

export const signupSchema = z.object({
  person1FirstName: z.string().min(1, 'First person\'s first name is required').max(50),
  person1LastName: z.string().min(1, 'First person\'s last name is required').max(50),
  person2FirstName: z.string().min(1, 'Second person\'s first name is required').max(50),
  person2LastName: z.string().min(1, 'Second person\'s last name is required').max(50),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
  weddingDate: z.string().refine((date) => {
    const weddingDate = new Date(date);
    const today = new Date();
    const threeYearsFromNow = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    
    return weddingDate > today && weddingDate <= threeYearsFromNow;
  }, 'Wedding date must be in the future and within 3 years'),
  weddingLocation: z.string().min(3, 'Wedding location must be at least 3 characters').max(100),
  weddingTheme: z.string().min(2, 'Wedding theme must be at least 2 characters').max(50),
  estimatedBudget: z.number()
    .min(1000, 'Budget must be at least $1,000')
    .max(1000000, 'Budget cannot exceed $1,000,000'),
  vendorCategories: z.array(z.string()).min(1, 'Select at least one vendor category').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
}); 