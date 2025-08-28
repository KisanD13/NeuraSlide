import axiosInstance, { tokenManager } from './axiosInstance';

// Types
export interface SignupRequest {
  name: string;
  email: string;
  teamName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isEmailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      teamId?: string;
    };
    accessToken: string;
    team?: {
      id: string;
      name: string;
      ownerId: string;
      plan: string;
      createdAt: string;
      updatedAt: string;
    };
    emailVerificationToken?: string;
  };
  timestamp: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isEmailVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
  timestamp: string;
}

// Auth API functions
export const authApi = {
  // Sign up new user
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/crystal/auth/signup', data);
    const result = response.data;
    
    if (result.success && result.data.accessToken) {
      tokenManager.setToken(result.data.accessToken);
    }
    
    return result;
  },

  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/crystal/auth/login', data);
    const result = response.data;
    
    if (result.success && result.data.accessToken) {
      tokenManager.setToken(result.data.accessToken);
    }
    
    return result;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await axiosInstance.get('/crystal/auth/me');
    return response.data;
  },

  // Logout user
  logout: (): void => {
    tokenManager.removeToken();
    // Redirect to home page
    window.location.href = '/';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return tokenManager.hasValidToken();
  }
};
