import axios from 'axios';
import type {
  LoginCredentials,
  SignupData,
  ProfileUpdateData,
  SearchFilters,
  CreateMatchRequest,
  SendMessageRequest,
  ApiError,
} from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = <T>(response: { data: T }): T => response.data;

const handleError = (error: any): never => {
  const apiError: ApiError = {
    error: error.response?.data?.error || 'An unexpected error occurred',
    details: error.response?.data?.details,
    requiresVerification: error.response?.data?.requiresVerification,
  };
  throw apiError;
};

// Authentication API
export const authApi = {
  signup: async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  verifyEmail: async (token: string) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  resendVerification: async (email: string) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  updateProfile: async (data: ProfileUpdateData) => {
    try {
      const response = await api.put('/users/profile', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getMarketplace: async (filters?: SearchFilters) => {
    try {
      // Manually construct query parameters to handle arrays properly
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.dateRange?.start) params.append('dateRange[start]', filters.dateRange.start);
        if (filters.dateRange?.end) params.append('dateRange[end]', filters.dateRange.end);
        if (filters.location) params.append('location', filters.location);
        if (filters.theme) params.append('theme', filters.theme);
        if (filters.budgetRange?.min) params.append('budgetRange[min]', filters.budgetRange.min.toString());
        if (filters.budgetRange?.max) params.append('budgetRange[max]', filters.budgetRange.max.toString());
        if (filters.vendorCategories && filters.vendorCategories.length > 0) {
          filters.vendorCategories.forEach(category => {
            params.append('vendorCategories', category);
          });
        }
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
      }
      
      const response = await api.get(`/users/marketplace?${params.toString()}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  uploadProfilePicture: async (formData: FormData) => {
    try {
      const response = await api.post('/users/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  removeProfilePicture: async () => {
    try {
      const response = await api.delete('/users/profile/remove-picture');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/users/profile/change-password', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Matches API
export const matchApi = {
  createMatch: async (data: CreateMatchRequest) => {
    try {
      const response = await api.post('/matches', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getMatches: async (status?: string) => {
    try {
      const response = await api.get('/matches', {
        params: status ? { status } : undefined,
      });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getMatchById: async (id: string) => {
    try {
      const response = await api.get(`/matches/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  respondToMatch: async (
    id: string,
    action: 'accept' | 'decline'
  ) => {
    try {
      const response = await api.put(`/matches/${id}/action`, { action });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

// Messages API
export const messageApi = {
  sendMessage: async (data: SendMessageRequest) => {
    try {
      const response = await api.post('/messages', data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getConversation: async (
    matchId: string,
    page?: number,
    limit?: number
  ) => {
    try {
      const response = await api.get(`/messages/conversation/${matchId}`, {
        params: { page, limit },
      });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  markMessagesRead: async (messageIds: string[]) => {
    try {
      const response = await api.put('/messages/mark-read', { messageIds });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  markConversationRead: async (matchId: string) => {
    try {
      const response = await api.put(`/messages/mark-conversation-read/${matchId}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread-count');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },
};

export default api; 