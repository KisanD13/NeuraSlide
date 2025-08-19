// backend/src/crystal/campaigns/campaignService.ts

import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  Campaign,
  FAQ,
  CampaignAnalytics,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  SearchFAQsRequest,
  GetCampaignResponse,
  ListCampaignsRequest,
  ListCampaignsResponse,
  SearchFAQsResponse,
  ProcessMessageRequest,
  ProcessMessageResponse,
} from "./campaignTypes";

export class CampaignService {
  /**
   * Create a new campaign
   */
  static async createCampaign(
    userId: string,
    request: CreateCampaignRequest
  ): Promise<Campaign> {
    try {
      // Check user's campaign limits
      await this.checkUserLimits(userId);

      const campaign = await prisma.campaign.create({
        data: {
          userId,
          name: request.name,
          description: request.description || null,
          type: JSON.parse(JSON.stringify(request.type)),
          status: JSON.parse(JSON.stringify({ status: "DRAFT" })),
          isActive: true,
          settings: JSON.parse(JSON.stringify(request.settings)),
          metadata: request.metadata
            ? JSON.parse(JSON.stringify(request.metadata))
            : null,
        },
      });

      return this.transformToCampaign(campaign);
    } catch (error: any) {
      logger.error("Error creating campaign:", error);
      throw createHttpError(500, "Failed to create campaign");
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaign(
    userId: string,
    campaignId: string
  ): Promise<GetCampaignResponse> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
        include: {
          faqs: {
            where: { isActive: true },
            orderBy: { usageCount: "desc" },
          },
          _count: {
            select: {
              faqs: true,
              responses: true,
            },
          },
        },
      });

      if (!campaign) {
        throw createHttpError(404, "Campaign not found");
      }

      const analytics = await this.getCampaignAnalytics(campaignId);

      return {
        campaign: this.transformToCampaign(campaign),
        faqs: campaign.faqs.map(this.transformToFAQ),
        analytics: {
          totalFAQs: campaign._count.faqs,
          activeFAQs: campaign.faqs.length,
          totalResponses: campaign._count.responses,
          averageResponseTime: analytics.averageResponseTime,
        },
      };
    } catch (error: any) {
      logger.error("Error getting campaign:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to get campaign");
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(
    userId: string,
    campaignId: string,
    request: UpdateCampaignRequest
  ): Promise<Campaign> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw createHttpError(404, "Campaign not found");
      }

      const updateData: any = {};
      if (request.name !== undefined) updateData.name = request.name;
      if (request.description !== undefined)
        updateData.description = request.description;
      if (request.type !== undefined)
        updateData.type = JSON.parse(JSON.stringify(request.type));
      if (request.status !== undefined)
        updateData.status = JSON.parse(JSON.stringify(request.status));
      if (request.isActive !== undefined)
        updateData.isActive = request.isActive;
      if (request.settings !== undefined)
        updateData.settings = JSON.parse(JSON.stringify(request.settings));
      if (request.metadata !== undefined)
        updateData.metadata = JSON.parse(JSON.stringify(request.metadata));

      const updatedCampaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: updateData,
      });

      return this.transformToCampaign(updatedCampaign);
    } catch (error: any) {
      logger.error("Error updating campaign:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to update campaign");
    }
  }

  /**
   * List campaigns
   */
  static async listCampaigns(
    userId: string,
    request: ListCampaignsRequest
  ): Promise<ListCampaignsResponse> {
    try {
      const where: any = { userId };

      if (request.status) {
        where.status = { path: ["status"], equals: request.status };
      }

      if (request.type) {
        where.type = { path: ["type"], equals: request.type };
      }

      if (request.isActive !== undefined) {
        where.isActive = request.isActive;
      }

      const limit = request.limit || 10;
      const offset = request.offset || 0;

      const [campaigns, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.campaign.count({ where }),
      ]);

      return {
        campaigns: campaigns.map(this.transformToCampaign),
        total,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error("Error listing campaigns:", error);
      throw createHttpError(500, "Failed to list campaigns");
    }
  }

  /**
   * Create FAQ
   */
  static async createFAQ(
    userId: string,
    campaignId: string,
    request: CreateFAQRequest
  ): Promise<FAQ> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw createHttpError(404, "Campaign not found");
      }

      const faq = await prisma.fAQ.create({
        data: {
          campaignId,
          question: request.question,
          answer: request.answer,
          category: request.category,
          tags: request.tags || [],
          priority: JSON.parse(
            JSON.stringify(
              request.priority || { priority: "MEDIUM", weight: 5 }
            )
          ),
          isActive: true,
          usageCount: 0,
        },
      });

      return this.transformToFAQ(faq);
    } catch (error: any) {
      logger.error("Error creating FAQ:", error);
      throw createHttpError(500, "Failed to create FAQ");
    }
  }

  /**
   * Update FAQ
   */
  static async updateFAQ(
    userId: string,
    campaignId: string,
    faqId: string,
    request: UpdateFAQRequest
  ): Promise<FAQ> {
    try {
      const faq = await prisma.fAQ.findFirst({
        where: {
          id: faqId,
          campaignId,
          campaign: { userId },
        },
      });

      if (!faq) {
        throw createHttpError(404, "FAQ not found");
      }

      const updateData: any = {};
      if (request.question !== undefined)
        updateData.question = request.question;
      if (request.answer !== undefined) updateData.answer = request.answer;
      if (request.category !== undefined)
        updateData.category = request.category;
      if (request.tags !== undefined) updateData.tags = request.tags;
      if (request.priority !== undefined)
        updateData.priority = JSON.parse(JSON.stringify(request.priority));
      if (request.isActive !== undefined)
        updateData.isActive = request.isActive;

      const updatedFAQ = await prisma.fAQ.update({
        where: { id: faqId },
        data: updateData,
      });

      return this.transformToFAQ(updatedFAQ);
    } catch (error: any) {
      logger.error("Error updating FAQ:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to update FAQ");
    }
  }

  /**
   * Search FAQs
   */
  static async searchFAQs(
    userId: string,
    campaignId: string,
    request: SearchFAQsRequest
  ): Promise<SearchFAQsResponse> {
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
        },
      });

      if (!campaign) {
        throw createHttpError(404, "Campaign not found");
      }

      const where: any = { campaignId };

      if (request.query) {
        where.OR = [
          { question: { contains: request.query, mode: "insensitive" } },
          { answer: { contains: request.query, mode: "insensitive" } },
        ];
      }

      if (request.category) {
        where.category = request.category;
      }

      if (request.tags && request.tags.length > 0) {
        where.tags = { hasSome: request.tags };
      }

      if (request.priority) {
        where.priority = { path: ["priority"], equals: request.priority };
      }

      if (request.isActive !== undefined) {
        where.isActive = request.isActive;
      }

      const limit = request.limit || 10;
      const offset = request.offset || 0;

      const [faqs, total] = await Promise.all([
        prisma.fAQ.findMany({
          where,
          orderBy: { usageCount: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.fAQ.count({ where }),
      ]);

      return {
        faqs: faqs.map(this.transformToFAQ),
        total,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error("Error searching FAQs:", error);
      throw createHttpError(500, "Failed to search FAQs");
    }
  }

  /**
   * Process message and find best FAQ response
   */
  static async processMessage(
    userId: string,
    campaignId: string,
    request: ProcessMessageRequest
  ): Promise<ProcessMessageResponse> {
    try {
      const startTime = Date.now();

      const campaign = await prisma.campaign.findFirst({
        where: {
          id: campaignId,
          userId,
          isActive: true,
        },
        include: {
          faqs: {
            where: { isActive: true },
          },
        },
      });

      if (!campaign) {
        throw createHttpError(404, "Campaign not found or inactive");
      }

      // Find best matching FAQ
      const bestMatch = await this.findBestFAQMatch(
        request.message,
        campaign.faqs
      );

      let response: string;
      let faqId: string | undefined;
      let responseType: "FAQ" | "AUTO" | "MANUAL" | "FALLBACK";
      let confidence: number;
      let metadata: any = {};

      if (bestMatch && bestMatch.confidence > 0.7) {
        // Use FAQ response
        response = bestMatch.faq.answer;
        faqId = bestMatch.faq.id;
        responseType = "FAQ";
        confidence = bestMatch.confidence;
        metadata = {
          matchedKeywords: bestMatch.matchedKeywords,
          intent: bestMatch.intent,
        };

        // Update FAQ usage count
        await prisma.fAQ.update({
          where: { id: bestMatch.faq.id },
          data: {
            usageCount: { increment: 1 },
            lastUsed: new Date(),
          },
        });
      } else {
        // Use fallback response
        response = this.generateFallbackResponse(request.message);
        responseType = "FALLBACK";
        confidence = 0.3;
        metadata = {
          suggestedFAQs: campaign.faqs.slice(0, 3).map((f) => f.question),
        };
      }

      const responseTime = Date.now() - startTime;

      // Save response
      await prisma.campaignResponse.create({
        data: {
          campaignId,
          conversationId: request.conversationId,
          faqId: faqId || null,
          userMessage: request.message,
          botResponse: response,
          responseType,
          confidence,
          responseTime,
          metadata: JSON.parse(JSON.stringify(metadata)),
        },
      });

      return {
        response,
        faqId: faqId || "",
        confidence,
        responseType,
        metadata,
      };
    } catch (error: any) {
      logger.error("Error processing message:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to process message");
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(
    campaignId: string
  ): Promise<CampaignAnalytics> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        totalCampaigns,
        activeCampaigns,
        totalResponses,
        responses,
        topFAQs,
        categoryBreakdown,
      ] = await Promise.all([
        prisma.campaign.count(),
        prisma.campaign.count({ where: { isActive: true } }),
        prisma.campaignResponse.count(),
        prisma.campaignResponse.findMany({
          where: {
            campaignId,
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            responseTime: true,
            confidence: true,
          },
        }),
        prisma.fAQ.findMany({
          where: { campaignId },
          orderBy: { usageCount: "desc" },
          take: 5,
          select: {
            id: true,
            question: true,
            usageCount: true,
          },
        }),
        prisma.fAQ.groupBy({
          by: ["category"],
          where: { campaignId },
          _count: { category: true },
        }),
      ]);

      const averageResponseTime =
        responses.length > 0
          ? responses.reduce((sum, r) => sum + r.responseTime, 0) /
            responses.length
          : 0;

      const successRate =
        responses.length > 0
          ? (responses.filter((r) => r.confidence > 0.7).length /
              responses.length) *
            100
          : 0;

      // Generate response trends (simplified)
      const responseTrends = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        if (dateStr) {
          responseTrends.push({
            date: dateStr,
            responses: Math.floor(Math.random() * 10), // TODO: Replace with actual data
            successRate: Math.random() * 100,
          });
        }
      }

      const totalFAQs = categoryBreakdown.reduce(
        (sum, cat) => sum + cat._count.category,
        0
      );

      return {
        totalCampaigns,
        activeCampaigns,
        totalResponses,
        averageResponseTime,
        successRate,
        topFAQs: topFAQs.map((faq) => ({
          faqId: faq.id,
          question: faq.question,
          usageCount: faq.usageCount,
        })),
        responseTrends,
        categoryBreakdown: categoryBreakdown.map((cat) => ({
          category: cat.category,
          count: cat._count.category,
          percentage: (cat._count.category / totalFAQs) * 100,
        })),
      };
    } catch (error: any) {
      logger.error("Error getting campaign analytics:", error);
      throw createHttpError(500, "Failed to get campaign analytics");
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  private static async checkUserLimits(userId: string): Promise<void> {
    // TODO: Implement user subscription limits
    // For now, allow unlimited campaigns
    logger.info(`Checking campaign limits for user: ${userId}`);
  }

  private static async findBestFAQMatch(
    message: string,
    faqs: any[]
  ): Promise<{
    faq: any;
    confidence: number;
    matchedKeywords: string[];
    intent: string;
  } | null> {
    const messageLower = message.toLowerCase();
    let bestMatch = null;
    let bestConfidence = 0;

    for (const faq of faqs) {
      const questionLower = faq.question.toLowerCase();

      // Simple keyword matching
      const questionWords = questionLower.split(/\s+/);
      const messageWords = messageLower.split(/\s+/);

      const matchedKeywords = questionWords.filter(
        (word: string) => messageWords.includes(word) && word.length > 3
      );

      const confidence =
        matchedKeywords.length / Math.max(questionWords.length, 1);

      if (confidence > bestConfidence && confidence > 0.3) {
        bestConfidence = confidence;
        bestMatch = {
          faq,
          confidence,
          matchedKeywords,
          intent: "question_match",
        };
      }
    }

    return bestMatch;
  }

  private static generateFallbackResponse(message: string): string {
    const responses = [
      "I understand you're asking about this. Let me help you find the right information.",
      "Thanks for your message! I'm here to help with your inquiry.",
      "I see what you're asking about. Let me provide you with some helpful information.",
      "Thank you for reaching out. I'd be happy to assist you with that.",
      "I appreciate your question. Let me help you with the information you need.",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse} [Context: ${message}]`;
  }

  // ========================================
  // TRANSFORMATION METHODS
  // ========================================

  private static transformToCampaign(dbCampaign: any): Campaign {
    return {
      id: dbCampaign.id,
      userId: dbCampaign.userId,
      name: dbCampaign.name,
      description: dbCampaign.description,
      type: dbCampaign.type,
      status: dbCampaign.status,
      isActive: dbCampaign.isActive,
      settings: dbCampaign.settings,
      metadata: dbCampaign.metadata,
      createdAt: dbCampaign.createdAt,
      updatedAt: dbCampaign.updatedAt,
    };
  }

  private static transformToFAQ(dbFAQ: any): FAQ {
    return {
      id: dbFAQ.id,
      campaignId: dbFAQ.campaignId,
      question: dbFAQ.question,
      answer: dbFAQ.answer,
      category: dbFAQ.category,
      tags: dbFAQ.tags,
      priority: dbFAQ.priority,
      isActive: dbFAQ.isActive,
      usageCount: dbFAQ.usageCount,
      lastUsed: dbFAQ.lastUsed,
      createdAt: dbFAQ.createdAt,
      updatedAt: dbFAQ.updatedAt,
    };
  }
}
