// backend/src/crystal/instagram/instagramDMController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { InstagramDMService } from "./instagramDMService";
import { logger } from "../../utils/logger";

export class InstagramDMController {
  /**
   * Send DM to Instagram user
   * POST /crystal/instagram/dm/send
   */
  static async sendDM(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId, recipientId, message, link } = req.body;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId || !recipientId || !message) {
        return next(
          createHttpError(
            400,
            "Account ID, recipient ID, and message are required"
          )
        );
      }

      let result;
      if (link) {
        // Send DM with link (LinkDM feature)
        result = await InstagramDMService.sendDMWithLink(
          accountId,
          recipientId,
          message,
          link
        );
      } else {
        // Send regular DM
        result = await InstagramDMService.sendDM(
          accountId,
          recipientId,
          message
        );
      }

      logger.info(`DM sent by user: ${userId} to: ${recipientId}`);

      res.status(200).json({
        success: true,
        message: "DM sent successfully",
        data: {
          recipientId,
          message,
          link: link || null,
          result,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get conversation with Instagram user
   * GET /crystal/instagram/dm/conversation/:userId
   */
  static async getConversation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.query;
      const { userId: targetUserId } = req.params;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId || !targetUserId) {
        return next(
          createHttpError(400, "Account ID and target user ID are required")
        );
      }

      const conversation = await InstagramDMService.getConversation(
        accountId as string,
        targetUserId
      );

      res.status(200).json({
        success: true,
        message: "Conversation retrieved successfully",
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get all conversations for Instagram account
   * GET /crystal/instagram/dm/conversations
   */
  static async getConversations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      const { accountId } = req.query;

      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      if (!accountId) {
        return next(createHttpError(400, "Account ID is required"));
      }

      const conversations = await InstagramDMService.getConversations(
        accountId as string
      );

      res.status(200).json({
        success: true,
        message: "Conversations retrieved successfully",
        data: conversations,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }
}
