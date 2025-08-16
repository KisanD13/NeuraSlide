// backend/src/crystal/auth/authTypes.ts

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  plan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "owner" | "admin" | "member" | "viewer";

export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";

// Request/Response interfaces
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  teamName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  team?: Team;
  accessToken: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

// JWT Payload interface
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: UserRole;
  teamId?: string | undefined;
  iat: number;
  exp: number;
}

// Database model interfaces (for Prisma)
export interface UserModel extends Omit<User, "id"> {
  _id: string;
}

export interface TeamModel extends Omit<Team, "id"> {
  _id: string;
}
