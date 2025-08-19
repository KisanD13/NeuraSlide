// backend/src/crystal/auth/authTypes.ts

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Team = {
  id: string;
  name: string;
  ownerId: string;
  plan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = "owner" | "admin" | "member" | "viewer";

export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";

// Request/Response types
export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  teamName?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: Omit<User, "password">;
  team?: Team;
  accessToken: string;
  refreshToken?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type VerifyEmailRequest = {
  token: string;
};

// JWT Payload type
export type JwtPayload = {
  sub: string; // user ID
  email: string;
  role: UserRole;
  teamId?: string | undefined;
  iat: number;
  exp: number;
};

// Database model types (for Prisma)
export type UserModel = Omit<User, "id">;

export type TeamModel = Omit<Team, "id">;
