// backend/src/crystal/ai/aiService.ts

import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import { config } from "../../config/config";
import {
  AIResponse,
  AIConversation,
  AIMessage,
  AITrainingData,
  AIPerformance,
  GenerateResponseRequest,
  GenerateResponseResponse,
  CreateConversationRequest,
  UpdateConversationRequest,
  AddMessageRequest,
  SearchConversationsRequest,
  AddTrainingDataRequest,
} from "./aiTypes";

export class AIService {
  /**
   * Generate AI response for a given message
   */
  static async generateResponse(
    userId: string,
    request: GenerateResponseRequest
  ): Promise<GenerateResponseResponse> {
    try {
      const startTime = Date.now();

      // Check user's AI usage limits
      await this.checkUserLimits(userId);

      // Generate response using AI model
      const response = await this.callAIModel(request);

      const responseTime = Date.now() - startTime;

      // Save the response to database
      await this.saveAIResponse(userId, request, response, responseTime);

      // Update user's AI usage
      await this.updateUserUsage(userId, response.tokensUsed);

      return {
        response: response.content,
        tokensUsed: response.tokensUsed,
        responseTime,
        confidence: response.confidence,
        metadata: response.metadata,
      };
    } catch (error: any) {
      logger.error("Error generating AI response:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to generate AI response");
    }
  }

  /**
   * Create a new AI conversation
   */
  static async createConversation(
    userId: string,
    request: CreateConversationRequest
  ): Promise<AIConversation> {
    try {
      const conversation = await prisma.aIConversation.create({
        data: {
          userId,
          title: request.title,
          summary: null,
          tags: request.tags || [],
          isActive: true,
          messages: {
            create: request.initialMessage
              ? [
                  {
                    role: "user",
                    content: request.initialMessage,
                    metadata: {},
                  },
                ]
              : [],
          },
        },
        include: {
          messages: true,
        },
      });

      return this.transformToAIConversation(conversation);
    } catch (error: any) {
      logger.error("Error creating AI conversation:", error);
      throw createHttpError(500, "Failed to create conversation");
    }
  }

  /**
   * Get AI conversation by ID
   */
  static async getConversation(
    userId: string,
    conversationId: string
  ): Promise<AIConversation> {
    try {
      const conversation = await prisma.aIConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          messages: {
            orderBy: { timestamp: "asc" },
          },
        },
      });

      if (!conversation) {
        throw createHttpError(404, "Conversation not found");
      }

      return this.transformToAIConversation(conversation);
    } catch (error: any) {
      logger.error("Error getting AI conversation:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to get conversation");
    }
  }

  /**
   * Update AI conversation
   */
  static async updateConversation(
    userId: string,
    conversationId: string,
    request: UpdateConversationRequest
  ): Promise<AIConversation> {
    try {
      const conversation = await prisma.aIConversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw createHttpError(404, "Conversation not found");
      }

      const updateData: any = {};
      if (request.title !== undefined) updateData.title = request.title;
      if (request.summary !== undefined) updateData.summary = request.summary;
      if (request.tags !== undefined) updateData.tags = request.tags;
      if (request.isActive !== undefined)
        updateData.isActive = request.isActive;

      const updatedConversation = await prisma.aIConversation.update({
        where: { id: conversationId },
        data: updateData,
        include: {
          messages: {
            orderBy: { timestamp: "asc" },
          },
        },
      });

      return this.transformToAIConversation(updatedConversation);
    } catch (error: any) {
      logger.error("Error updating AI conversation:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to update conversation");
    }
  }

  /**
   * Add message to AI conversation
   */
  static async addMessage(
    userId: string,
    request: AddMessageRequest
  ): Promise<AIMessage> {
    try {
      const conversation = await prisma.aIConversation.findFirst({
        where: {
          id: request.conversationId,
          userId,
        },
      });

      if (!conversation) {
        throw createHttpError(404, "Conversation not found");
      }

      const message = await prisma.aIMessage.create({
        data: {
          conversationId: request.conversationId,
          role: request.role,
          content: request.content,
          metadata: {},
        },
      });

      return this.transformToAIMessage(message);
    } catch (error: any) {
      logger.error("Error adding message to AI conversation:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to add message");
    }
  }

  /**
   * Search AI conversations
   */
  static async searchConversations(
    userId: string,
    request: SearchConversationsRequest
  ): Promise<{ conversations: AIConversation[]; total: number }> {
    try {
      const where: any = { userId };

      if (request.query) {
        where.OR = [
          { title: { contains: request.query, mode: "insensitive" } },
          { summary: { contains: request.query, mode: "insensitive" } },
        ];
      }

      if (request.tags && request.tags.length > 0) {
        where.tags = { hasSome: request.tags };
      }

      if (request.isActive !== undefined) {
        where.isActive = request.isActive;
      }

      const [conversations, total] = await Promise.all([
        prisma.aIConversation.findMany({
          where,
          include: {
            messages: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
          orderBy: { updatedAt: "desc" },
          take: request.limit || 10,
          skip: request.offset || 0,
        }),
        prisma.aIConversation.count({ where }),
      ]);

      return {
        conversations: conversations.map(this.transformToAIConversation),
        total,
      };
    } catch (error: any) {
      logger.error("Error searching AI conversations:", error);
      throw createHttpError(500, "Failed to search conversations");
    }
  }

  /**
   * Add training data
   */
  static async addTrainingData(
    userId: string,
    request: AddTrainingDataRequest
  ): Promise<AITrainingData> {
    try {
      const trainingData = await prisma.aITrainingData.create({
        data: {
          userId,
          input: request.input,
          expectedOutput: request.expectedOutput,
          category: request.category,
          tags: request.tags || [],
          isActive: true,
        },
      });

      return this.transformToAITrainingData(trainingData);
    } catch (error: any) {
      logger.error("Error adding training data:", error);
      throw createHttpError(500, "Failed to add training data");
    }
  }

  /**
   * Get AI performance metrics
   */
  static async getPerformance(userId: string): Promise<AIPerformance> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [totalRequests, responses, errors] = await Promise.all([
        prisma.aIResponse.count({
          where: {
            userId,
            createdAt: { gte: thirtyDaysAgo },
          },
        }),
        prisma.aIResponse.findMany({
          where: {
            userId,
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            responseTime: true,
            tokensUsed: true,
            model: true,
          },
        }),
        prisma.aIResponse.count({
          where: {
            userId,
            createdAt: { gte: thirtyDaysAgo },
            // TODO: Fix metadata error filtering when Prisma supports it
          },
        }),
      ]);

      const averageResponseTime =
        responses.length > 0
          ? responses.reduce((sum, r) => sum + r.responseTime, 0) /
            responses.length
          : 0;

      const totalTokens = responses.reduce((sum, r) => sum + r.tokensUsed, 0);
      const averageTokens =
        responses.length > 0 ? totalTokens / responses.length : 0;

      const tokenUsageByModel: Record<string, number> = {};
      responses.forEach((r) => {
        tokenUsageByModel[r.model] =
          (tokenUsageByModel[r.model] || 0) + r.tokensUsed;
      });

      const successRate =
        totalRequests > 0
          ? ((totalRequests - errors) / totalRequests) * 100
          : 0;

      return {
        totalRequests,
        averageResponseTime,
        successRate,
        tokenUsage: {
          total: totalTokens,
          average: averageTokens,
          byModel: tokenUsageByModel,
        },
        popularIntents: [], // TODO: Implement intent tracking
        errorRate: totalRequests > 0 ? (errors / totalRequests) * 100 : 0,
        lastUpdated: new Date(),
      };
    } catch (error: any) {
      logger.error("Error getting AI performance:", error);
      throw createHttpError(500, "Failed to get performance metrics");
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private static async checkUserLimits(userId: string): Promise<void> {
    // TODO: Implement user subscription limits
    // For now, allow unlimited usage
    logger.info(`Checking AI limits for user: ${userId}`);
  }

  private static async callAIModel(request: GenerateResponseRequest): Promise<{
    content: string;
    tokensUsed: number;
    confidence: number;
    metadata: any;
  }> {
    try {
      // Check if OpenAI API key is configured
      if (!config.openaiApiKey) {
        logger.warn("OpenAI API key not configured, using fallback response");
        return this.generateFallbackResponse(request);
      }

      // Import OpenAI dynamically
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });

      // Build system prompt from context
      let systemPrompt =
        "You are a helpful assistant that responds to Instagram comments in a friendly, engaging way. Keep responses under 200 characters and use emojis when appropriate.";

      if (request.context?.businessContext) {
        systemPrompt += `\n\nBusiness Context: ${JSON.stringify(
          request.context.businessContext
        )}`;
      }

      if (request.context?.postContext) {
        systemPrompt += `\n\nPost Context: ${JSON.stringify(
          request.context.postContext
        )}`;
      }

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: request.model || config.openaiModel || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.message },
        ],
        max_tokens: request.maxTokens || config.openaiMaxTokens || 200,
        temperature: request.temperature || config.openaiTemperature || 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "Thank you for your comment!";
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content: response,
        tokensUsed: tokensUsed,
        confidence: 0.9,
        metadata: {
          model: completion.model,
          finishReason: completion.choices[0]?.finish_reason,
        },
      };
    } catch (error: any) {
      logger.error("Error calling AI model:", error);
      throw createHttpError(500, "Failed to generate AI response");
    }
  }

  private static generateFallbackResponse(request: GenerateResponseRequest): {
    content: string;
    tokensUsed: number;
    confidence: number;
    metadata: any;
  } {
    const responses = [
      "I understand your message. Let me help you with that.",
      "Thank you for reaching out. I'd be happy to assist you.",
      "I see what you're asking about. Here's what I can tell you.",
      "Thanks for your message! I'm here to help with your inquiry.",
      "I appreciate you contacting me. Let me provide you with some information.",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    const content = `${randomResponse} [Context: ${request.message}]`;

    return {
      content,
      tokensUsed: Math.ceil(content.length / 4), // Rough token estimation
      confidence: 0.7,
      metadata: {
        model: "fallback",
        intent: "general",
        sentiment: "neutral",
      },
    };
  }

  private static async saveAIResponse(
    userId: string,
    request: GenerateResponseRequest,
    response: any,
    responseTime: number
  ): Promise<AIResponse> {
    try {
      const aiResponse = await prisma.aIResponse.create({
        data: {
          userId,
          message: request.message,
          response: response.content,
          model: request.model || "fallback",
          tokensUsed: response.tokensUsed,
          responseTime,
          confidence: response.confidence,
          metadata: response.metadata,
        },
      });

      return this.transformToAIResponse(aiResponse);
    } catch (error: any) {
      logger.error("Error saving AI response:", error);
      throw createHttpError(500, "Failed to save AI response");
    }
  }

  private static async updateUserUsage(
    userId: string,
    tokensUsed: number
  ): Promise<void> {
    // TODO: Update user's AI usage tracking
    logger.info(`Updated AI usage for user ${userId}: ${tokensUsed} tokens`);
  }

  // ========================================
  // TRANSFORMATION METHODS
  // ========================================

  private static transformToAIResponse(dbResponse: any): AIResponse {
    return {
      id: dbResponse.id,
      userId: dbResponse.userId,
      conversationId: dbResponse.conversationId,
      message: dbResponse.message,
      response: dbResponse.response,
      model: dbResponse.model,
      tokensUsed: dbResponse.tokensUsed,
      responseTime: dbResponse.responseTime,
      confidence: dbResponse.confidence,
      metadata: dbResponse.metadata,
      createdAt: dbResponse.createdAt,
    };
  }

  private static transformToAIConversation(
    dbConversation: any
  ): AIConversation {
    return {
      id: dbConversation.id,
      userId: dbConversation.userId,
      title: dbConversation.title,
      messages: dbConversation.messages?.map(this.transformToAIMessage) || [],
      summary: dbConversation.summary,
      tags: dbConversation.tags,
      isActive: dbConversation.isActive,
      createdAt: dbConversation.createdAt,
      updatedAt: dbConversation.updatedAt,
    };
  }

  private static transformToAIMessage(dbMessage: any): AIMessage {
    return {
      id: dbMessage.id,
      conversationId: dbMessage.conversationId,
      role: dbMessage.role,
      content: dbMessage.content,
      timestamp: dbMessage.timestamp,
      metadata: dbMessage.metadata,
    };
  }

  private static transformToAITrainingData(
    dbTrainingData: any
  ): AITrainingData {
    return {
      id: dbTrainingData.id,
      userId: dbTrainingData.userId,
      input: dbTrainingData.input,
      expectedOutput: dbTrainingData.expectedOutput,
      category: dbTrainingData.category,
      tags: dbTrainingData.tags,
      isActive: dbTrainingData.isActive,
      createdAt: dbTrainingData.createdAt,
    };
  }
}
