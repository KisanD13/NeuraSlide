// backend/src/crystal/ai/aiController.ts

import { Request, Response, NextFunction } from "express";
import { AIService } from "./aiService";
import { AIValidation } from "./aiValidation";
import { logger } from "../../utils/logger";

export class AIController {
  /**
   * Generate AI response
   */
  static async generateResponse(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const validation = AIValidation.validateGenerateResponse(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const response = await AIService.generateResponse(userId, req.body);

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      logger.error("AI Controller - Generate Response Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Create AI conversation
   */
  static async createConversation(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const validation = AIValidation.validateCreateConversation(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const conversation = await AIService.createConversation(userId, req.body);

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error("AI Controller - Create Conversation Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get AI conversation by ID
   */
  static async getConversation(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const conversationId = req.params["id"];

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "Conversation ID is required",
        });
        return;
      }

      const validation = AIValidation.validateId(conversationId);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const conversation = await AIService.getConversation(
        userId,
        conversationId
      );

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error("AI Controller - Get Conversation Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update AI conversation
   */
  static async updateConversation(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const conversationId = req.params["id"];

      if (!conversationId) {
        res.status(400).json({
          success: false,
          message: "Conversation ID is required",
        });
        return;
      }

      const validation = AIValidation.validateId(conversationId);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const updateValidation = AIValidation.validateUpdateConversation(
        req.body
      );
      if (!updateValidation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: updateValidation.errors,
        });
        return;
      }

      const conversation = await AIService.updateConversation(
        userId,
        conversationId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: conversation,
      });
    } catch (error: any) {
      logger.error("AI Controller - Update Conversation Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Add message to AI conversation
   */
  static async addMessage(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const validation = AIValidation.validateAddMessage(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const message = await AIService.addMessage(userId, req.body);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      logger.error("AI Controller - Add Message Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Search AI conversations
   */
  static async searchConversations(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const query = req.query["query"] as string;
      const tags = req.query["tags"] as string;
      const isActive = req.query["isActive"] as string;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const searchRequest: any = {
        query,
        tags: tags ? tags.split(",") : [],
        isActive: isActive ? isActive === "true" : undefined,
        limit,
        offset,
      };

      const result = await AIService.searchConversations(userId, searchRequest);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("AI Controller - Search Conversations Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Add training data
   */
  static async addTrainingData(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const validation = AIValidation.validateAddTrainingData(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const trainingData = await AIService.addTrainingData(userId, req.body);

      res.status(201).json({
        success: true,
        data: trainingData,
      });
    } catch (error: any) {
      logger.error("AI Controller - Add Training Data Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get AI performance metrics
   */
  static async getPerformance(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const performance = await AIService.getPerformance(userId);

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error: any) {
      logger.error("AI Controller - Get Performance Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
