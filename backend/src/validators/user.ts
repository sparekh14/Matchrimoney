import { z } from 'zod';

export const updateProfileSchema = z.object({
  person1FirstName: z.string().min(1, 'First person\'s first name is required').max(50).optional(),
  person1LastName: z.string().min(1, 'First person\'s last name is required').max(50).optional(),
  person2FirstName: z.string().min(1, 'Second person\'s first name is required').max(50).optional(),
  person2LastName: z.string().min(1, 'Second person\'s last name is required').max(50).optional(),
  weddingDate: z.string().refine((date) => {
    if (!date) return true;
    const weddingDate = new Date(date);
    const today = new Date();
    const threeYearsFromNow = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    
    return weddingDate > today && weddingDate <= threeYearsFromNow;
  }, 'Wedding date must be in the future and within 3 years').optional(),
  weddingLocation: z.string().min(3, 'Wedding location must be at least 3 characters').max(100).optional(),
  weddingTheme: z.string().min(2, 'Wedding theme must be at least 2 characters').max(50).optional(),
  estimatedBudget: z.number()
    .min(1000, 'Budget must be at least $1,000')
    .max(1000000, 'Budget cannot exceed $1,000,000').optional(),
  vendorCategories: z.array(z.string()).optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  allowMessages: z.boolean().optional(),
  profileVisible: z.boolean().optional(),
});

export const searchFiltersSchema = z.object({
  // Handle flat URL query params for dateRange
  'dateRange[start]': z.string().optional(),
  'dateRange[end]': z.string().optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  // Handle flat URL query params for budgetRange
  'budgetRange[min]': z.coerce.number().min(0).optional(),
  'budgetRange[max]': z.coerce.number().min(0).optional(),
  vendorCategories: z.union([z.string(), z.array(z.string())]).optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(50).default(20).optional(),
}).transform((data) => {
  // Transform flat params back to nested structure
  const result: any = {
    page: data.page,
    limit: data.limit,
    location: data.location,
    theme: data.theme,
  };

  // Reconstruct dateRange object if either start or end is provided
  if (data['dateRange[start]'] || data['dateRange[end]']) {
    result.dateRange = {
      start: data['dateRange[start]'],
      end: data['dateRange[end]'],
    };
  }

  // Reconstruct budgetRange object if either min or max is provided
  if (data['budgetRange[min]'] !== undefined || data['budgetRange[max]'] !== undefined) {
    result.budgetRange = {
      min: data['budgetRange[min]'],
      max: data['budgetRange[max]'],
    };
  }

  // Handle vendorCategories (ensure it's always an array)
  if (data.vendorCategories) {
    result.vendorCategories = Array.isArray(data.vendorCategories) 
      ? data.vendorCategories 
      : [data.vendorCategories];
  }

  return result;
}); 