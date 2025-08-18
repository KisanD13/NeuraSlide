// backend/src/crystal/instagram/instagramController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { InstagramService } from "./instagramService";
import { InstagramValidation } from "./instagramValidation";
import {
  ConnectInstagramRequest,
  InstagramOAuthCallback,
} from "./instagramTypes";
import { logger } from "../../utils/logger";

export class InstagramController {
  /**
   * Generate Instagram OAuth URL
   * GET /crystal/instagram/oauth-url
   */
  static async getOAuthUrl(req: Request, res: Response, next: NextFunction) {
    try {
      // Get user ID from JWT token (added by auth middleware)
      const userId = (req as any).user?.sub;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      // Generate OAuth URL
      const oauthData = InstagramService.generateOAuthUrl(userId);

      logger.info(`Generated Instagram OAuth URL for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: "Instagram authorization URL generated successfully",
        data: oauthData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Handle Instagram OAuth callback
   * GET /crystal/instagram/callback
   */
  static async handleOAuthCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const callbackData: InstagramOAuthCallback = {
        code: req.query["code"] as string,
        state: req.query["state"] as string,
      };

      // Validate callback data
      const validation =
        InstagramValidation.validateOAuthCallback(callbackData);
      if (!validation.isValid) {
        return next(createHttpError(400, "Invalid callback parameters"));
      }

      // TODO: Verify state parameter matches what we sent
      // This should be implemented with proper state storage/verification

      // For now, extract user ID from state (simplified approach)
      const userId = this.extractUserIdFromState(callbackData.state);
      if (!userId) {
        return next(createHttpError(400, "Invalid state parameter"));
      }

      // Connect Instagram account
      const account = await InstagramService.connectInstagramAccount(userId, {
        code: callbackData.code,
        state: callbackData.state,
      });

      logger.info(
        `Instagram account connected successfully for user: ${userId}`
      );

      // In a real app, you'd redirect to frontend with success message
      res.status(200).json({
        success: true,
        message: "Instagram account connected successfully",
        data: {
          accountId: account.id,
          username: account.username,
          connectedAt: account.connectedAt,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get user's connected Instagram accounts
   * GET /crystal/instagram/accounts
   */
  static async getConnectedAccounts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Get user ID from JWT token
      const userId = (req as any).user?.sub;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      // Get user's Instagram accounts
      const accountsData = await InstagramService.getUserInstagramAccounts(
        userId
      );

      res.status(200).json({
        success: true,
        message: "Instagram accounts retrieved successfully",
        data: accountsData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get specific Instagram account details
   * GET /crystal/instagram/accounts/:accountId
   */
  static async getAccountDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.params;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId) {
        return next(createHttpError(400, "Account ID is required"));
      }

      // Validate account ID format
      const validation = InstagramValidation.validateRefreshToken({
        accountId,
      });
      if (!validation.isValid) {
        return next(createHttpError(400, "Invalid account ID format"));
      }

      // Get account details (placeholder - will implement with database)
      // const account = await InstagramService.getAccountDetails(userId, accountId);

      // For now, return placeholder response
      res.status(200).json({
        success: true,
        message: "Account details retrieved successfully",
        data: {
          accountId,
          message: "Account details endpoint - coming soon",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Disconnect Instagram account
   * DELETE /crystal/instagram/accounts/:accountId
   */
  static async disconnectAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.params;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId) {
        return next(createHttpError(400, "Account ID is required"));
      }

      // Validate account ID format
      const validation = InstagramValidation.validateRefreshToken({
        accountId,
      });
      if (!validation.isValid) {
        return next(createHttpError(400, "Invalid account ID format"));
      }

      // Disconnect account
      await InstagramService.disconnectInstagramAccount(userId, accountId);

      logger.info(
        `Instagram account disconnected: ${accountId} for user: ${userId}`
      );

      res.status(200).json({
        success: true,
        message: "Instagram account disconnected successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Refresh Instagram account token
   * POST /crystal/instagram/accounts/:accountId/refresh-token
   */
  static async refreshAccountToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.params;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId) {
        return next(createHttpError(400, "Account ID is required"));
      }

      // Validate request
      const validation = InstagramValidation.validateRefreshToken({
        accountId,
      });
      if (!validation.isValid) {
        return next(createHttpError(400, "Invalid account ID format"));
      }

      // Refresh token
      await InstagramService.refreshAccountToken(userId, accountId);

      logger.info(`Instagram token refreshed for account: ${accountId}`);

      res.status(200).json({
        success: true,
        message: "Instagram access token refreshed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Connect Instagram account (alternative endpoint for frontend)
   * POST /crystal/instagram/connect
   */
  static async connectAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const connectData: ConnectInstagramRequest = req.body;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      // Validate connection data
      const validation =
        InstagramValidation.validateConnectInstagram(connectData);
      if (!validation.isValid) {
        return next(createHttpError(400, "Invalid connection data"));
      }

      // Connect Instagram account
      const account = await InstagramService.connectInstagramAccount(
        userId,
        connectData
      );

      logger.info(
        `Instagram account connected: ${account.username} for user: ${userId}`
      );

      res.status(201).json({
        success: true,
        message: "Instagram account connected successfully",
        data: {
          accountId: account.id,
          username: account.username,
          name: account.name,
          profilePictureUrl: account.profilePictureUrl,
          connectedAt: account.connectedAt,
          metadata: account.metadata,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Test Instagram API connection
   * GET /crystal/instagram/test-connection/:accountId
   */
  static async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.params;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId) {
        return next(createHttpError(400, "Account ID is required"));
      }

      // Test connection (placeholder - will implement with actual API call)
      logger.info(`Testing Instagram connection for account: ${accountId}`);

      res.status(200).json({
        success: true,
        message: "Instagram connection test completed",
        data: {
          accountId,
          status: "connected",
          lastTested: new Date().toISOString(),
          message: "Connection test endpoint - coming soon",
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  // ==============================================
  // PRIVATE HELPER METHODS
  // ==============================================

  /**
   * Extract user ID from state parameter
   * This is a simplified approach - in production, use proper state management
   */
  private static extractUserIdFromState(state: string): string | null {
    try {
      // State format: userHash_timestamp_random
      const parts = state.split("_");
      if (parts.length >= 3) {
        const userHash = parts[0];
        // In production, you'd have a proper state store to map this back to user ID
        // For now, this is a placeholder
        return Buffer.from(userHash || "", "base64").toString("utf8");
      }
      return null;
    } catch (error) {
      logger.error("Error extracting user ID from state:", error);
      return null;
    }
  }
}
