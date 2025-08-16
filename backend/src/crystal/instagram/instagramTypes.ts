// backend/src/crystal/instagram/instagramTypes.ts

export interface InstagramAccount {
  id: string;
  userId: string; // NeuraSlide user ID
  instagramId: string; // Instagram user ID
  username: string;
  name?: string | undefined;
  profilePictureUrl?: string | undefined;
  accessToken: string;
  tokenType: "user" | "page"; // Instagram token type
  expiresAt?: Date | undefined; // For long-lived tokens
  scopes: string[]; // Permissions granted
  isActive: boolean;
  connectedAt: Date;
  lastSyncAt?: Date | undefined;
  metadata?: InstagramAccountMetadata | undefined;
}

export interface InstagramAccountMetadata {
  followerCount?: number;
  followingCount?: number;
  mediaCount?: number;
  accountType?: "personal" | "business" | "creator";
  category?: string;
  website?: string | undefined;
  biography?: string | undefined;
}

export interface InstagramOAuthUrl {
  authUrl: string;
  state: string; // CSRF protection
}

export interface InstagramOAuthCallback {
  code: string;
  state: string;
}

export interface InstagramTokens {
  accessToken: string;
  tokenType: "bearer";
  expiresIn?: number | undefined; // Seconds until expiration
  scope: string;
  userId?: string | undefined; // Instagram user ID
}

export interface InstagramUser {
  id: string;
  username: string;
  name?: string;
  account_type?: "PERSONAL" | "BUSINESS" | "CREATOR";
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
  profile_picture_url?: string;
  website?: string;
  biography?: string;
}

// TODO: These interfaces will be used when implementing webhooks and media management
// export interface InstagramMedia { ... }
// export interface InstagramComment { ... }
// export interface InstagramWebhookEvent { ... }
// etc.

// Request/Response Types
export interface ConnectInstagramRequest {
  code: string;
  state: string;
}

export interface RefreshTokenRequest {
  accountId: string;
}

export interface InstagramAccountResponse {
  id: string;
  username: string;
  name?: string | undefined;
  profilePictureUrl?: string | undefined;
  isActive: boolean;
  connectedAt: string;
  lastSyncAt?: string | undefined;
  metadata?: InstagramAccountMetadata | undefined;
}

export interface InstagramAccountsListResponse {
  accounts: InstagramAccountResponse[];
  total: number;
}

// Error Types
export interface InstagramApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

// Instagram API Response Types
export interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
  user_id?: string;
}

export interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Usually 5184000 (60 days)
}

export interface InstagramRefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // Extended for another 60 days
}

// Service Configuration
export interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
  apiVersion: string;
  baseUrl: string;
}

// Database Model Types (for MongoDB with Prisma)
export interface InstagramAccountModel extends Omit<InstagramAccount, "id"> {
  _id: string;
}

export type InstagramTokenType = "user" | "page";
export type InstagramAccountType = "personal" | "business" | "creator";
// TODO: These types will be used when implementing webhooks and media management
// export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
// export type InstagramWebhookField = "comments" | "media" | "messages" | "messaging_postbacks";
