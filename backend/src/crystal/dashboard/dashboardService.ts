import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  DashboardData,
  DashboardOverview,
  RecentActivity,
  PerformanceMetrics,
  SystemHealth,
  QuickActions,
  DashboardFilters,
} from "./dashboardTypes";

const prisma = new PrismaClient();

export class DashboardService {
  async getDashboardData(
    userId: string,
    _filters?: DashboardFilters
  ): Promise<DashboardData> {
    try {
      // Get overview statistics
      const overview = await this.getOverview(userId);

      // Get recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Get performance metrics
      const performance = await this.getPerformanceMetrics(userId);

      // Get system health
      const systemHealth = await this.getSystemHealth(userId);

      // Get quick actions availability
      const quickActions = await this.getQuickActions(userId);

      return {
        overview,
        recentActivity,
        performance,
        systemHealth,
        quickActions,
      };
    } catch (error: any) {
      logger.error("Error getting dashboard data:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to load dashboard data. Please try again."
      );
    }
  }

  private async getOverview(userId: string): Promise<DashboardOverview> {
    const [
      totalConversations,
      activeAutomations,
      totalProducts,
      totalCampaigns,
      aiConversations,
      recentMessages,
      automationTriggers,
      aiResponses,
    ] = await Promise.all([
      // Total conversations
      prisma.conversation.count({
        where: { userId },
      }),

      // Active automations
      prisma.automation.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      }),

      // Total products
      prisma.product.count({
        where: { userId },
      }),

      // Total campaigns
      prisma.campaign.count({
        where: { userId },
      }),

      // AI conversations
      prisma.aIConversation.count({
        where: { userId },
      }),

      // Recent messages (last 7 days)
      prisma.message.count({
        where: {
          conversation: { userId },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Automation triggers (last 7 days)
      prisma.jobLog.count({
        where: {
          automation: { userId },
          runAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // AI responses (last 7 days)
      prisma.aIResponse.count({
        where: {
          user: { id: userId },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalConversations,
      activeAutomations,
      totalProducts,
      totalCampaigns,
      aiConversations,
      recentMessages,
      automationTriggers,
      aiResponses,
    };
  }

  private async getRecentActivity(userId: string): Promise<RecentActivity> {
    const [conversations, automations, products, aiResponses] =
      await Promise.all([
        // Recent conversations
        prisma.conversation.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            participantUsername: true,
            status: true,
            updatedAt: true,
            lastMessageText: true,
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { text: true },
            },
          },
        }),

        // Recent automations
        prisma.automation.findMany({
          where: { userId },
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            trigger: true,
            status: true,
            jobLogs: {
              orderBy: { runAt: "desc" },
              take: 1,
              select: { runAt: true },
            },
          },
        }),

        // Recent products
        prisma.product.findMany({
          where: { userId },
          orderBy: { searchCount: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            category: true,
            searchCount: true,
            updatedAt: true,
          },
        }),

        // Recent AI responses
        prisma.aIResponse.findMany({
          where: {
            user: { id: userId },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            response: true,
            confidence: true,
            createdAt: true,
            conversationId: true,
          },
        }),
      ]);

    return {
      conversations: conversations.map((conv) => ({
        id: conv.id,
        title: conv.participantUsername || "Untitled Conversation",
        lastMessage:
          conv.lastMessageText || conv.messages[0]?.text || "No messages",
        updatedAt: conv.updatedAt.toISOString(),
        status: conv.status,
      })),
      automations: automations.map((auto) => ({
        id: auto.id,
        name: auto.name,
        trigger: JSON.stringify(auto.trigger),
        status: auto.status,
        lastTriggered: auto.jobLogs[0]?.runAt.toISOString() || "Never",
      })),
      products: products.map((prod) => ({
        id: prod.id,
        name: prod.name,
        category: prod.category,
        searchCount: prod.searchCount,
        lastSearched: prod.updatedAt.toISOString(),
      })),
      aiResponses: aiResponses.map((response) => ({
        id: response.id,
        conversationId: response.conversationId || "No conversation",
        response:
          response.response.substring(0, 100) +
          (response.response.length > 100 ? "..." : ""),
        confidence: response.confidence,
        createdAt: response.createdAt.toISOString(),
      })),
    };
  }

  private async getPerformanceMetrics(
    userId: string
  ): Promise<PerformanceMetrics> {
    const [automationStats, aiStats, productStats, conversationStats] =
      await Promise.all([
        // Automation performance
        this.getAutomationPerformance(userId),

        // AI performance
        this.getAIPerformance(userId),

        // Product performance
        this.getProductPerformance(userId),

        // Conversation performance
        this.getConversationPerformance(userId),
      ]);

    return {
      automationPerformance: automationStats,
      aiPerformance: aiStats,
      productPerformance: productStats,
      conversationPerformance: conversationStats,
    };
  }

  private async getAutomationPerformance(userId: string) {
    const totalTriggers = await prisma.jobLog.count({
      where: {
        automation: { userId },
      },
    });

    const successfulResponses = await prisma.jobLog.count({
      where: {
        automation: { userId },
        status: "COMPLETED",
      },
    });

    const successRate =
      totalTriggers > 0 ? (successfulResponses / totalTriggers) * 100 : 0;

    // Calculate average response time (simplified)
    const avgResponseTime = totalTriggers > 0 ? 2.5 : 0; // Placeholder

    return {
      totalTriggers,
      successfulResponses,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: avgResponseTime,
    };
  }

  private async getAIPerformance(userId: string) {
    const totalResponses = await prisma.aIResponse.count({
      where: {
        user: { id: userId },
      },
    });

    const avgConfidence = await prisma.aIResponse.aggregate({
      where: {
        user: { id: userId },
      },
      _avg: {
        confidence: true,
      },
    });

    return {
      totalResponses,
      averageConfidence: avgConfidence._avg?.confidence || 0,
      responseQuality: 85, // Placeholder - would be calculated from user feedback
      userSatisfaction: 92, // Placeholder - would be calculated from ratings
    };
  }

  private async getProductPerformance(userId: string) {
    const totalSearches = await prisma.product.aggregate({
      where: { userId },
      _sum: {
        searchCount: true,
      },
    });

    const topSearchedProducts = await prisma.product.findMany({
      where: { userId },
      orderBy: { searchCount: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        searchCount: true,
      },
    });

    return {
      totalSearches: totalSearches._sum.searchCount || 0,
      topSearchedProducts,
      searchSuccessRate: 78, // Placeholder - would be calculated from search results
    };
  }

  private async getConversationPerformance(userId: string) {
    const totalMessages = await prisma.message.count({
      where: {
        conversation: { userId },
      },
    });

    const activeConversations = await prisma.conversation.count({
      where: {
        userId,
        status: "ACTIVE",
      },
    });

    return {
      totalMessages,
      averageResponseTime: 1.2, // Placeholder - would be calculated from actual response times
      resolutionRate: 87, // Placeholder - would be calculated from conversation outcomes
      activeConversations,
    };
  }

  private async getSystemHealth(_userId: string): Promise<SystemHealth> {
    // Note: Instagram accounts are team-based, not user-based in current schema
    // This is a simplified version - in production, you'd need to join through teams
    const instagramConnections = 0; // Placeholder - would need team-based query
    const activeConnections = 0; // Placeholder - would need team-based query

    return {
      instagramConnections: {
        total: instagramConnections,
        active: activeConnections,
        lastSync: "Never", // Placeholder - would need team-based query
      },
      apiStatus: {
        instagram: "healthy", // Placeholder - would check actual API status
        ai: "healthy",
        automation: "healthy",
      },
      databaseStatus: "healthy",
      lastBackup: new Date().toISOString(), // Placeholder
    };
  }

  private async getQuickActions(_userId: string): Promise<QuickActions> {
    // Note: Instagram accounts are team-based, not user-based in current schema
    // This is a simplified version - in production, you'd need to join through teams
    const hasInstagramAccounts = false; // Placeholder - would need team-based query

    return {
      createAutomation: {
        available: hasInstagramAccounts,
        message: hasInstagramAccounts
          ? "Create new automation rule"
          : "Connect Instagram account first",
      },
      addProduct: {
        available: true,
        message: "Add new product to catalog",
      },
      testAI: {
        available: true,
        message: "Test AI response generation",
      },
      connectInstagram: {
        available: !hasInstagramAccounts,
        message: hasInstagramAccounts
          ? "Instagram already connected"
          : "Connect your Instagram account",
      },
    };
  }
}
