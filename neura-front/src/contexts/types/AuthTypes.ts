// User type
export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  teamId?: string;
};

// API Response types
export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
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
};

export type UserResponse = {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
  timestamp: string;
};

// Error Response type
export type ErrorResponse = {
  success: false;
  message: string;
  errorStack?: string;
  timestamp: string;
};

// API Request types
export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  teamName: string;
  password: string;
};
