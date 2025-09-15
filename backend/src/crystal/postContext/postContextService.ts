import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  PostContext,
  CreatePostContextRequest,
  UpdatePostContextRequest,
  PostContextListRequest,
  PostContextListResponse,
} from "./postContextTypes";

export class PostContextService {
  static async createPostContext(
    userId: string,
    data: CreatePostContextRequest
  ): Promise<PostContext> {
    try {
      // Verify the Instagram account belongs to the user
      const instagramAccount = await prisma.instagramAccount.findFirst({
        where: {
          id: data.instagramAccountId,
          team: {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        },
      });

      if (!instagramAccount) {
        throw createHttpError(
          404,
          "Instagram account not found or access denied"
        );
      }

      // Create post context
      const postContext = await prisma.postContext.create({
        data: {
          userId,
          instagramAccountId: data.instagramAccountId,
          mediaId: data.mediaId,
          caption: data.caption || null,
          contextType: "MANUAL",
          title: data.title || null,
          description: data.description || null,
          keyPoints: data.keyPoints || [],
          products: data.products || [],
          pricing: data.pricing || null,
          promotions: data.promotions || null,
          faqs: data.faqs || null,
          responseTone: data.responseTone || "friendly",
          isActive: true,
        },
      });

      return this.transformToPostContext(postContext);
    } catch (error: any) {
      logger.error("Create post context error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to create post context");
    }
  }

  static async getPostContexts(
    userId: string,
    filters: PostContextListRequest
  ): Promise<PostContextListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { userId };

      if (filters.instagramAccountId) {
        where.instagramAccountId = filters.instagramAccountId;
      }

      if (filters.mediaId) {
        where.mediaId = filters.mediaId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      // Get post contexts with pagination
      const [postContexts, total] = await Promise.all([
        prisma.postContext.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.postContext.count({ where }),
      ]);

      // Transform results
      const transformedPostContexts = postContexts.map(
        this.transformToPostContext
      );

      return {
        postContexts: transformedPostContexts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error("Get post contexts error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to fetch post contexts");
    }
  }

  static async getPostContext(
    userId: string,
    postContextId: string
  ): Promise<PostContext> {
    try {
      const postContext = await prisma.postContext.findFirst({
        where: {
          id: postContextId,
          userId,
        },
      });

      if (!postContext) {
        throw createHttpError(404, "Post context not found");
      }

      return this.transformToPostContext(postContext);
    } catch (error: any) {
      logger.error("Get post context error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to fetch post context");
    }
  }

  static async updatePostContext(
    userId: string,
    postContextId: string,
    data: UpdatePostContextRequest
  ): Promise<PostContext> {
    try {
      // Check if post context exists and belongs to user
      const existingPostContext = await prisma.postContext.findFirst({
        where: {
          id: postContextId,
          userId,
        },
      });

      if (!existingPostContext) {
        throw createHttpError(404, "Post context not found");
      }

      // Update post context
      const updatedPostContext = await prisma.postContext.update({
        where: { id: postContextId },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.keyPoints !== undefined && { keyPoints: data.keyPoints }),
          ...(data.products !== undefined && { products: data.products }),
          ...(data.pricing !== undefined && { pricing: data.pricing }),
          ...(data.promotions !== undefined && { promotions: data.promotions }),
          ...(data.faqs !== undefined && { faqs: data.faqs }),
          ...(data.responseTone !== undefined && {
            responseTone: data.responseTone,
          }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          updatedAt: new Date(),
        },
      });

      return this.transformToPostContext(updatedPostContext);
    } catch (error: any) {
      logger.error("Update post context error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to update post context");
    }
  }

  static async deletePostContext(
    userId: string,
    postContextId: string
  ): Promise<void> {
    try {
      // Check if post context exists and belongs to user
      const postContext = await prisma.postContext.findFirst({
        where: {
          id: postContextId,
          userId,
        },
      });

      if (!postContext) {
        throw createHttpError(404, "Post context not found");
      }

      // Delete post context
      await prisma.postContext.delete({
        where: { id: postContextId },
      });

      logger.info(`Post context ${postContextId} deleted by user ${userId}`);
    } catch (error: any) {
      logger.error("Delete post context error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to delete post context");
    }
  }

  private static transformToPostContext(dbPostContext: any): PostContext {
    return {
      id: dbPostContext.id,
      userId: dbPostContext.userId,
      instagramAccountId: dbPostContext.instagramAccountId,
      mediaId: dbPostContext.mediaId,
      caption: dbPostContext.caption,
      contextType: dbPostContext.contextType,
      title: dbPostContext.title,
      description: dbPostContext.description,
      keyPoints: dbPostContext.keyPoints || [],
      products: dbPostContext.products || [],
      pricing: dbPostContext.pricing,
      promotions: dbPostContext.promotions,
      faqs: dbPostContext.faqs,
      responseTone: dbPostContext.responseTone,
      isActive: dbPostContext.isActive,
      createdAt: dbPostContext.createdAt.toISOString(),
      updatedAt: dbPostContext.updatedAt.toISOString(),
    };
  }
}
