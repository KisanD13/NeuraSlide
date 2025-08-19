// backend/src/crystal/conversations/conversationController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { ConversationService } from "./conversationService";
import { ConversationValidation } from "./conversationValidation";
import {
  SendMessageRequest,
  ReplyMessageRequest,
  ConversationListRequest,
  MessageListRequest,
  ConversationStatus,
} from "./conversationTypes";

import { logger } from "../../utils/logger";

export class ConversationController {
  /**
   * Get conversations list
   * GET /crystal/conversations
   */
  static async getConversations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const filters: ConversationListRequest = {
        page: parseInt(req.query["page"] as string) || 1,
        limit: parseInt(req.query["limit"] as string) || 20,
        status: req.query["status"] as ConversationStatus,
        isAutomated:
          req.query["isAutomated"] === "true"
            ? true
            : req.query["isAutomated"] === "false"
            ? false
            : undefined,
        tags: req.query["tags"]
          ? (req.query["tags"] as string).split(",")
          : undefined,
        search: req.query["search"] as string,
        sortBy: req.query["sortBy"] as any,
        sortOrder: req.query["sortOrder"] as "asc" | "desc",
      };

      const result = await ConversationService.getConversations(
        userId,
        filters
      );

      logger.info(`Conversations retrieved for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: "Conversations retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get conversation by ID
   * GET /crystal/conversations/:id
   */
  static async getConversation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const conversation = await ConversationService.getConversation(
        userId,
        conversationId
      );
      if (!conversation) {
        return next(createHttpError(404, "Conversation not found"));
      }

      logger.info(
        `Conversation ${conversationId} retrieved for user: ${userId}`
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
   * Get messages in a conversation
   * GET /crystal/conversations/:id/messages
   */
  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const filters: MessageListRequest = {
        conversationId,
        page: parseInt(req.query["page"] as string) || 1,
        limit: parseInt(req.query["limit"] as string) || 50,
        before: req.query["before"]
          ? new Date(req.query["before"] as string)
          : undefined,
        after: req.query["after"]
          ? new Date(req.query["after"] as string)
          : undefined,
      };

      const result = await ConversationService.getMessages(
        userId,
        conversationId,
        filters
      );

      logger.info(`Messages retrieved for conversation ${conversationId}`);

      res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Send a message in a conversation
   * POST /crystal/conversations/:id/send
   */
  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const request: SendMessageRequest = {
        conversationId,
        text: req.body.text,
        mediaUrls: req.body.mediaUrls,
        messageType: req.body.messageType,
        metadata: req.body.metadata,
      };

      // Validate request
      const validation = ConversationValidation.validateSendMessage(request);
      if (!validation.isValid) {
        return next(createHttpError(400, validation.errors.join(", ")));
      }

      const message = await ConversationService.sendMessage(userId, request);

      logger.info(
        `Message sent in conversation ${conversationId} by user ${userId}`
      );

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Reply to a specific message
   * POST /crystal/conversations/:id/reply
   */
  static async replyToMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const request: ReplyMessageRequest = {
        conversationId,
        messageId: req.body.messageId,
        text: req.body.text,
        mediaUrls: req.body.mediaUrls,
        messageType: req.body.messageType,
        metadata: req.body.metadata,
      };

      // Validate request
      const validation = ConversationValidation.validateReplyMessage(request);
      if (!validation.isValid) {
        return next(createHttpError(400, validation.errors.join(", ")));
      }

      const message = await ConversationService.replyToMessage(userId, request);

      logger.info(
        `Reply sent to message ${request.messageId} in conversation ${conversationId}`
      );

      res.status(201).json({
        success: true,
        message: "Reply sent successfully",
        data: message,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Get conversation statistics
   * GET /crystal/conversations/stats
   */
  static async getConversationStats(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const stats = await ConversationService.getConversationStats(userId);

      logger.info(`Conversation stats retrieved for user: ${userId}`);

      res.status(200).json({
        success: true,
        message: "Conversation statistics retrieved successfully",
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Update conversation status
   * PATCH /crystal/conversations/:id/status
   */
  static async updateConversationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const status = req.body.status as ConversationStatus;
      if (!status) {
        return next(createHttpError(400, "Status is required"));
      }

      // Validate status
      const validStatuses = Object.values(ConversationStatus);
      if (!validStatuses.includes(status)) {
        return next(createHttpError(400, "Invalid status"));
      }

      const conversation = await ConversationService.updateConversationStatus(
        userId,
        conversationId,
        status
      );

      logger.info(`Conversation ${conversationId} status updated to ${status}`);

      res.status(200).json({
        success: true,
        message: "Conversation status updated successfully",
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }

  /**
   * Add tags to conversation
   * POST /crystal/conversations/:id/tags
   */
  static async addTagsToConversation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return next(createHttpError(401, "User not authenticated"));
      }

      const conversationId = req.params["id"];
      if (!conversationId) {
        return next(createHttpError(400, "Conversation ID is required"));
      }

      const tags = req.body.tags;
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        return next(createHttpError(400, "Tags array is required"));
      }

      const conversation = await ConversationService.addTagsToConversation(
        userId,
        conversationId,
        tags
      );

      logger.info(
        `Tags added to conversation ${conversationId}: ${tags.join(", ")}`
      );

      res.status(200).json({
        success: true,
        message: "Tags added successfully",
        data: conversation,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return next(error);
    }
  }
}
