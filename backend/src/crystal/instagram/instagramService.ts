// backend/src/crystal/instagram/instagramService.ts

import createHttpError from "http-errors";
import { config } from "../../config/config";
import { logger } from "../../utils/logger";
import { prisma } from "../../config/db";
import {
  InstagramAccount,
  InstagramOAuthUrl,
  InstagramTokens,
  InstagramUser,
  InstagramConfig,
  InstagramApiError,
  InstagramTokenResponse,
  InstagramLongLivedTokenResponse,
  InstagramRefreshTokenResponse,
  ConnectInstagramRequest,
  InstagramAccountResponse,
  InstagramAccountsListResponse,
} from "./instagramTypes";

export class InstagramService {
  private static readonly INSTAGRAM_CONFIG: InstagramConfig = {
    appId: config.instagramAppId as string,
    appSecret: config.instagramAppSecret as string,
    redirectUri: config.instagramRedirectUri as string,
    scopes: ["user_profile", "user_media"],
    apiVersion: "v18.0",
    baseUrl: "https://graph.instagram.com",
  };

  /**
   * Generate Instagram OAuth URL for user authorization
   */
  static generateOAuthUrl(userId: string): InstagramOAuthUrl {
    try {
      // Generate random state for CSRF protection
      const state = this.generateSecureState(userId);

      const params = new URLSearchParams({
        client_id: this.INSTAGRAM_CONFIG.appId,
        redirect_uri: this.INSTAGRAM_CONFIG.redirectUri,
        scope: this.INSTAGRAM_CONFIG.scopes.join(","),
        response_type: "code",
        state: state,
      });

      const authUrl = `https://api.instagram.com/oauth/authorize?${params.toString()}`;

      logger.info(`Generated Instagram OAuth URL for user: ${userId}`);

      return {
        authUrl,
        state,
      };
    } catch (error: any) {
      logger.error("Error generating Instagram OAuth URL:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to generate Instagram authorization URL"
      );
    }
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string): Promise<InstagramTokens> {
    try {
      const tokenUrl = `https://api.instagram.com/oauth/access_token`;

      const body = new URLSearchParams({
        client_id: this.INSTAGRAM_CONFIG.appId,
        client_secret: this.INSTAGRAM_CONFIG.appSecret,
        grant_type: "authorization_code",
        redirect_uri: this.INSTAGRAM_CONFIG.redirectUri,
        code: code,
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
      });

      const data = (await response.json()) as InstagramTokenResponse;

      if (!response.ok) {
        logger.error("Instagram token exchange failed:", data);
        throw createHttpError(400, "Failed to connect Instagram account");
      }

      logger.info("Successfully exchanged code for Instagram token");

      return {
        accessToken: data.access_token,
        tokenType: "bearer",
        expiresIn: data.expires_in,
        scope: data.scope || this.INSTAGRAM_CONFIG.scopes.join(","),
        userId: data.user_id,
      };
    } catch (error: any) {
      logger.error("Error exchanging Instagram code for token:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to connect Instagram account");
    }
  }

  /**
   * Get Instagram user profile information
   */
  static async getUserProfile(accessToken: string): Promise<InstagramUser> {
    try {
      const fields = [
        "id",
        "username",
        "name",
        "account_type",
        "media_count",
        "followers_count",
        "follows_count",
        "profile_picture_url",
        "website",
        "biography",
      ].join(",");

      const url = `${this.INSTAGRAM_CONFIG.baseUrl}/me?fields=${fields}&access_token=${accessToken}`;

      const response = await fetch(url);
      const data = (await response.json()) as InstagramUser;

      if (!response.ok) {
        this.handleInstagramApiError(data as any as InstagramApiError);
      }

      logger.info(`Retrieved Instagram profile for user: ${data.username}`);

      return data as InstagramUser;
    } catch (error: any) {
      logger.error("Error fetching Instagram user profile:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to fetch Instagram profile");
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  static async exchangeForLongLivedToken(
    shortToken: string
  ): Promise<InstagramTokens> {
    try {
      const url = `${this.INSTAGRAM_CONFIG.baseUrl}/access_token`;

      const params = new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: this.INSTAGRAM_CONFIG.appSecret,
        access_token: shortToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = (await response.json()) as InstagramLongLivedTokenResponse;

      if (!response.ok) {
        this.handleInstagramApiError(data as any as InstagramApiError);
      }

      logger.info("Successfully exchanged for long-lived Instagram token");

      return {
        accessToken: data.access_token,
        tokenType: "bearer",
        expiresIn: data.expires_in, // Usually 60 days
        scope: this.INSTAGRAM_CONFIG.scopes.join(","),
      };
    } catch (error: any) {
      logger.error("Error exchanging for long-lived token:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to create long-lived access token");
    }
  }

  /**
   * Refresh long-lived access token
   */
  static async refreshLongLivedToken(
    currentToken: string
  ): Promise<InstagramTokens> {
    try {
      const url = `${this.INSTAGRAM_CONFIG.baseUrl}/refresh_access_token`;

      const params = new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: currentToken,
      });

      const response = await fetch(`${url}?${params.toString()}`);
      const data = (await response.json()) as InstagramRefreshTokenResponse;

      if (!response.ok) {
        this.handleInstagramApiError(data as any as InstagramApiError);
      }

      logger.info("Successfully refreshed Instagram access token");

      return {
        accessToken: data.access_token,
        tokenType: "bearer",
        expiresIn: data.expires_in, // Extended for another 60 days
        scope: this.INSTAGRAM_CONFIG.scopes.join(","),
      };
    } catch (error: any) {
      logger.error("Error refreshing Instagram token:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to refresh Instagram access token");
    }
  }

  /**
   * Connect Instagram account to user
   */
  static async connectInstagramAccount(
    userId: string,
    connectData: ConnectInstagramRequest
  ): Promise<InstagramAccount> {
    try {
      // Exchange code for short-lived token
      const shortTokenData = await this.exchangeCodeForToken(connectData.code);

      // Exchange for long-lived token
      const longTokenData = await this.exchangeForLongLivedToken(
        shortTokenData.accessToken
      );

      // Get user profile
      const profile = await this.getUserProfile(longTokenData.accessToken);

      // Check if account already connected
      const existingAccount = await this.findAccountByInstagramId(profile.id);
      if (existingAccount) {
        throw createHttpError(409, "Instagram account is already connected");
      }

      // Create account record
      const instagramAccount: InstagramAccount = {
        id: this.generateAccountId(), // Will be replaced by database
        userId: userId,
        instagramId: profile.id,
        username: profile.username,
        name: profile.name,
        profilePictureUrl: profile.profile_picture_url,
        accessToken: longTokenData.accessToken,
        tokenType: "user",
        expiresAt: longTokenData.expiresIn
          ? new Date(Date.now() + longTokenData.expiresIn * 1000)
          : undefined,
        scopes: this.INSTAGRAM_CONFIG.scopes,
        isActive: true,
        connectedAt: new Date(),
        metadata: {
          followerCount: profile.followers_count || 0,
          followingCount: profile.follows_count || 0,
          mediaCount: profile.media_count || 0,
          accountType: profile.account_type?.toLowerCase() as any,
          website: profile.website,
          biography: profile.biography,
        },
      };

      // Save to database (placeholder - will implement with Prisma)
      const savedAccount = await this.saveInstagramAccount(instagramAccount);

      logger.info(
        `Connected Instagram account: ${profile.username} for user: ${userId}`
      );

      return savedAccount;
    } catch (error: any) {
      logger.error("Error connecting Instagram account:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to connect Instagram account");
    }
  }

  /**
   * Get user's connected Instagram accounts
   */
  static async getUserInstagramAccounts(
    userId: string
  ): Promise<InstagramAccountsListResponse> {
    try {
      // Fetch from database (placeholder)
      const accounts = await this.findAccountsByUserId(userId);

      const accountResponses: InstagramAccountResponse[] = accounts.map(
        (account) => ({
          id: account.id,
          username: account.username,
          name: account.name,
          profilePictureUrl: account.profilePictureUrl,
          isActive: account.isActive,
          connectedAt: account.connectedAt.toISOString(),
          lastSyncAt: account.lastSyncAt?.toISOString(),
          metadata: account.metadata,
        })
      );

      return {
        accounts: accountResponses,
        total: accountResponses.length,
      };
    } catch (error: any) {
      logger.error("Error fetching user Instagram accounts:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to fetch Instagram accounts");
    }
  }

  /**
   * Disconnect Instagram account
   */
  static async disconnectInstagramAccount(
    userId: string,
    accountId: string
  ): Promise<void> {
    try {
      // Find account
      const account = await this.findAccountById(accountId);

      if (!account) {
        throw createHttpError(404, "Instagram account not found");
      }

      if (account.userId !== userId) {
        throw createHttpError(403, "Not authorized to disconnect this account");
      }

      // Remove from database (placeholder)
      await this.deleteInstagramAccount(accountId);

      logger.info(
        `Disconnected Instagram account: ${account.username} for user: ${userId}`
      );
    } catch (error: any) {
      logger.error("Error disconnecting Instagram account:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to disconnect Instagram account");
    }
  }

  /**
   * Refresh Instagram account token
   */
  static async refreshAccountToken(
    userId: string,
    accountId: string
  ): Promise<void> {
    try {
      // Find account
      const account = await this.findAccountById(accountId);

      if (!account) {
        throw createHttpError(404, "Instagram account not found");
      }

      if (account.userId !== userId) {
        throw createHttpError(403, "Not authorized to refresh this token");
      }

      // Refresh token
      const newTokenData = await this.refreshLongLivedToken(
        account.accessToken
      );

      // Update account
      const updatedAccount: Partial<InstagramAccount> = {
        accessToken: newTokenData.accessToken,
        lastSyncAt: new Date(),
      };

      // Only set expiresAt if expiresIn is provided
      if (newTokenData.expiresIn) {
        updatedAccount.expiresAt = new Date(
          Date.now() + newTokenData.expiresIn * 1000
        );
      }

      await this.updateInstagramAccount(accountId, updatedAccount);

      logger.info(`Refreshed token for Instagram account: ${account.username}`);
    } catch (error: any) {
      logger.error("Error refreshing Instagram account token:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to refresh Instagram token");
    }
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Handle Instagram API errors
   */
  private static handleInstagramApiError(errorData: InstagramApiError): never {
    const error = errorData.error;

    if (error.code === 190) {
      throw createHttpError(
        401,
        "Instagram access token is invalid or expired"
      );
    } else if (error.code === 200) {
      throw createHttpError(403, "Insufficient Instagram permissions");
    } else if (error.code === 4) {
      throw createHttpError(429, "Instagram API rate limit exceeded");
    } else if (error.code >= 1 && error.code <= 99) {
      throw createHttpError(400, error.message || "Instagram API error");
    } else {
      throw createHttpError(500, "Instagram API temporarily unavailable");
    }
  }

  /**
   * Generate secure state parameter for CSRF protection
   */
  private static generateSecureState(userId: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userHash = Buffer.from(userId).toString("base64").substring(0, 8);

    return `${userHash}_${timestamp}_${random}`;
  }

  /**
   * Generate unique account ID (placeholder - will use database auto-generation)
   */
  private static generateAccountId(): string {
    return `ig_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // ==============================================
  // DATABASE PLACEHOLDER METHODS
  // These will be replaced with actual Prisma calls
  // ==============================================

  private static async saveInstagramAccount(
    account: InstagramAccount
  ): Promise<InstagramAccount> {
    try {
      // Map InstagramAccount interface to Prisma schema
      const savedAccount = await prisma.instagramAccount.create({
        data: {
          teamId: account.userId, // Using userId as teamId for now
          igUserId: account.instagramId,
          igUsername: account.username,
          accessToken: account.accessToken,
          refreshToken: null, // Not in interface
          expiresAt: account.expiresAt || null,
          isActive: account.isActive,
          meta: account.metadata
            ? JSON.parse(JSON.stringify(account.metadata))
            : null,
        },
      });

      // Transform back to interface
      return {
        id: savedAccount.id,
        userId: savedAccount.teamId, // Map back
        instagramId: savedAccount.igUserId,
        username: savedAccount.igUsername,
        name: undefined,
        profilePictureUrl: undefined,
        accessToken: savedAccount.accessToken,
        tokenType: "user",
        expiresAt: savedAccount.expiresAt || undefined,
        scopes: [],
        isActive: savedAccount.isActive,
        connectedAt: savedAccount.createdAt,
        lastSyncAt: savedAccount.updatedAt || undefined,
        metadata: savedAccount.meta as any,
      };
    } catch (error: any) {
      logger.error("Error saving Instagram account:", error);
      throw createHttpError(500, "Failed to save Instagram account");
    }
  }

  private static async findAccountsByUserId(
    userId: string
  ): Promise<InstagramAccount[]> {
    try {
      const accounts = await prisma.instagramAccount.findMany({
        where: { teamId: userId }, // Using userId as teamId
      });

      return accounts.map((account) => ({
        id: account.id,
        userId: account.teamId,
        instagramId: account.igUserId,
        username: account.igUsername,
        name: undefined,
        profilePictureUrl: undefined,
        accessToken: account.accessToken,
        tokenType: "user" as const,
        expiresAt: account.expiresAt || undefined,
        scopes: [],
        isActive: account.isActive,
        connectedAt: account.createdAt,
        lastSyncAt: account.updatedAt || undefined,
        metadata: account.meta as any,
      }));
    } catch (error: any) {
      logger.error("Error finding Instagram accounts by user ID:", error);
      throw createHttpError(500, "Failed to fetch Instagram accounts");
    }
  }

  private static async findAccountById(
    accountId: string
  ): Promise<InstagramAccount | null> {
    try {
      const account = await prisma.instagramAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return null;
      }

      return {
        id: account.id,
        userId: account.teamId,
        instagramId: account.igUserId,
        username: account.igUsername,
        name: undefined,
        profilePictureUrl: undefined,
        accessToken: account.accessToken,
        tokenType: "user" as const,
        expiresAt: account.expiresAt || undefined,
        scopes: [],
        isActive: account.isActive,
        connectedAt: account.createdAt,
        lastSyncAt: account.updatedAt || undefined,
        metadata: account.meta as any,
      };
    } catch (error: any) {
      logger.error("Error finding Instagram account by ID:", error);
      throw createHttpError(500, "Failed to fetch Instagram account");
    }
  }

  private static async findAccountByInstagramId(
    instagramId: string
  ): Promise<InstagramAccount | null> {
    try {
      const account = await prisma.instagramAccount.findUnique({
        where: { igUserId: instagramId },
      });

      if (!account) {
        return null;
      }

      return {
        id: account.id,
        userId: account.teamId,
        instagramId: account.igUserId,
        username: account.igUsername,
        name: undefined,
        profilePictureUrl: undefined,
        accessToken: account.accessToken,
        tokenType: "user" as const,
        expiresAt: account.expiresAt || undefined,
        scopes: [],
        isActive: account.isActive,
        connectedAt: account.createdAt,
        lastSyncAt: account.updatedAt || undefined,
        metadata: account.meta as any,
      };
    } catch (error: any) {
      logger.error("Error finding Instagram account by Instagram ID:", error);
      throw createHttpError(500, "Failed to fetch Instagram account");
    }
  }

  private static async updateInstagramAccount(
    accountId: string,
    updates: Partial<InstagramAccount>
  ): Promise<void> {
    try {
      const updateData: any = {};

      if (updates.username) updateData.igUsername = updates.username;
      if (updates.accessToken) updateData.accessToken = updates.accessToken;
      if (updates.expiresAt) updateData.expiresAt = updates.expiresAt;
      if (updates.isActive !== undefined)
        updateData.isActive = updates.isActive;
      if (updates.metadata)
        updateData.meta = JSON.parse(JSON.stringify(updates.metadata));

      await prisma.instagramAccount.update({
        where: { id: accountId },
        data: updateData,
      });

      logger.info(`Updated Instagram account: ${accountId}`);
    } catch (error: any) {
      logger.error("Error updating Instagram account:", error);
      throw createHttpError(500, "Failed to update Instagram account");
    }
  }

  private static async deleteInstagramAccount(
    accountId: string
  ): Promise<void> {
    try {
      await prisma.instagramAccount.delete({
        where: { id: accountId },
      });

      logger.info(`Deleted Instagram account: ${accountId}`);
    } catch (error: any) {
      logger.error("Error deleting Instagram account:", error);
      throw createHttpError(500, "Failed to delete Instagram account");
    }
  }
}
