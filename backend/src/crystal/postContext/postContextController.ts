import { Request, Response } from "express";
import { PostContextService } from "./postContextService";
import { logger } from "../../utils/logger";
import {
  CreatePostContextRequest,
  UpdatePostContextRequest,
  PostContextListRequest,
  PostContextResponse,
  PostContextsResponse,
} from "./postContextTypes";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export class PostContextController {
  static async createPostContext(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const data: CreatePostContextRequest = req.body;
      const postContext = await PostContextService.createPostContext(
        userId,
        data
      );

      const response: PostContextResponse = {
        success: true,
        data: postContext,
        message: "Post context created successfully",
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error("Create post context controller error:", error);

      const response: PostContextResponse = {
        success: false,
        data: {} as any,
        message: error.message || "Failed to create post context",
      };

      res.status(error.status || 500).json(response);
    }
  }

  static async getPostContexts(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const filters: PostContextListRequest = {
        instagramAccountId: req.query["instagramAccountId"] as string,
        mediaId: req.query["mediaId"] as string,
        isActive:
          req.query["isActive"] === "true"
            ? true
            : req.query["isActive"] === "false"
            ? false
            : undefined,
        page: req.query["page"]
          ? parseInt(req.query["page"] as string)
          : undefined,
        limit: req.query["limit"]
          ? parseInt(req.query["limit"] as string)
          : undefined,
      };

      const result = await PostContextService.getPostContexts(userId, filters);

      const response: PostContextsResponse = {
        success: true,
        data: result,
        message: "Post contexts retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Get post contexts controller error:", error);

      const response: PostContextsResponse = {
        success: false,
        data: {
          postContexts: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        },
        message: error.message || "Failed to get post contexts",
      };

      res.status(error.status || 500).json(response);
    }
  }

  static async getPostContext(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Post context ID is required",
        });
        return;
      }
      const postContext = await PostContextService.getPostContext(userId, id);

      const response: PostContextResponse = {
        success: true,
        data: postContext,
        message: "Post context retrieved successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Get post context controller error:", error);

      const response: PostContextResponse = {
        success: false,
        data: {} as any,
        message: error.message || "Failed to get post context",
      };

      res.status(error.status || 500).json(response);
    }
  }

  static async updatePostContext(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Post context ID is required",
        });
        return;
      }
      const data: UpdatePostContextRequest = req.body;
      const postContext = await PostContextService.updatePostContext(
        userId,
        id,
        data
      );

      const response: PostContextResponse = {
        success: true,
        data: postContext,
        message: "Post context updated successfully",
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error("Update post context controller error:", error);

      const response: PostContextResponse = {
        success: false,
        data: {} as any,
        message: error.message || "Failed to update post context",
      };

      res.status(error.status || 500).json(response);
    }
  }

  static async deletePostContext(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Post context ID is required",
        });
        return;
      }
      await PostContextService.deletePostContext(userId, id);

      res.status(200).json({
        success: true,
        message: "Post context deleted successfully",
      });
    } catch (error: any) {
      logger.error("Delete post context controller error:", error);

      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to delete post context",
      });
    }
  }
}
