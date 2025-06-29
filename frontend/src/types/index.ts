// User types
export interface User {
  id: string;
  email: string;
  person1FirstName: string;
  person1LastName: string;
  person2FirstName: string;
  person2LastName: string;
  weddingDate: string;
  weddingLocation: string;
  weddingTheme: string;
  estimatedBudget: number;
  vendorCategories: string[];
  bio?: string;
  profilePicture?: string;
  allowMessages: boolean;
  profileVisible: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PublicUser {
  id: string;
  person1FirstName: string;
  person1LastName: string;
  person2FirstName: string;
  person2LastName: string;
  weddingDate: string;
  weddingLocation: string;
  weddingTheme: string;
  estimatedBudget: number;
  vendorCategories: string[];
  bio?: string;
  profilePicture?: string;
  allowMessages: boolean;
  createdAt: string;
  compatibilityScore?: number;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  person1FirstName: string;
  person1LastName: string;
  person2FirstName: string;
  person2LastName: string;
  profileCompleted: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  person1FirstName: string;
  person1LastName: string;
  person2FirstName: string;
  person2LastName: string;
  email: string;
  password: string;
  weddingDate: string;
  weddingLocation: string;
  weddingTheme: string;
  estimatedBudget: number;
  vendorCategories?: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message: string;
}

// Match types
export interface Match {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  isInitiator: boolean;
  otherUser: PublicUser;
  sharedVendorCategories: string[];
  estimatedSavings?: number;
  compatibilityScore?: number;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchRequest {
  receiverId: string;
  message: string;
}

// Message types
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  matchId?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    person1FirstName: string;
    person1LastName: string;
    person2FirstName: string;
    person2LastName: string;
    profilePicture?: string;
  };
}

export interface Conversation {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  otherUser: PublicUser;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageRequest {
  content: string;
  receiverId: string;
  matchId?: string;
}

// Search and filter types
export interface SearchFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  location?: string;
  theme?: string;
  budgetRange?: {
    min?: number;
    max?: number;
  };
  vendorCategories?: string[];
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MarketplaceResponse {
  users: PublicUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface ApiError {
  error: string;
  details?: any;
  requiresVerification?: boolean;
}

// Form types
export interface ProfileUpdateData {
  person1FirstName?: string;
  person1LastName?: string;
  person2FirstName?: string;
  person2LastName?: string;
  weddingDate?: string;
  weddingLocation?: string;
  weddingTheme?: string;
  estimatedBudget?: number;
  vendorCategories?: string[];
  bio?: string;
  allowMessages?: boolean;
  profileVisible?: boolean;
}

// Vendor categories
export const VENDOR_CATEGORIES = [
  'PHOTOGRAPHER',
  'VIDEOGRAPHER', 
  'VENUE',
  'CATERING',
  'FLOWERS',
  'MUSIC_DJ',
  'TRANSPORTATION',
  'DECORATIONS',
  'WEDDING_PLANNER',
  'MAKEUP_HAIR',
  'CAKE',
  'INVITATIONS',
  'RENTALS',
  'OTHER'
] as const;

export type VendorCategory = typeof VENDOR_CATEGORIES[number];

// Wedding themes
export const WEDDING_THEMES = [
  'Traditional',
  'Modern',
  'Rustic',
  'Beach',
  'Garden',
  'Vintage',
  'Bohemian',
  'Elegant',
  'Casual',
  'Destination',
  'Cultural',
  'Themed',
  'Other'
] as const;

export type WeddingTheme = typeof WEDDING_THEMES[number];

export type GeocodeResult = {
  properties: {
    formatted: string;
  };
}; 