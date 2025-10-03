// backend/src/crystal/automations/automationService.ts

import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import { config } from "../../config/config";
import {
  Automation,
  CreateAutomationRequest,
  UpdateAutomationRequest,
  AutomationListRequest,
  AutomationListResponse,
  AutomationStats,
  AutomationExecution,
  TestAutomationRequest,
  Trigger,
  Response,
  AutomationStatus,
  AutomationPriority,
} from "./automationTypes";

export class AutomationService {
  // ========================================
  // CRUD OPERATIONS
  // ========================================

  static async createAutomation(
    userId: string,
    data: CreateAutomationRequest
  ): Promise<Automation> {
    try {
      // Check if user has reached automation limit
      const userAutomationCount = await prisma.automation.count({
        where: { userId },
      });

      // TODO: Get user's plan limits from subscription
      const maxAutomations = 10; // Default limit
      if (userAutomationCount >= maxAutomations) {
        throw createHttpError(
          403,
          "You have reached your automation limit. Upgrade your plan to create more automations."
        );
      }

      // Create automation in database
      const automation = await prisma.automation.create({
        data: {
          userId,
          name: data.name,
          description: data.description || null,
          trigger: data.trigger as any, // Prisma stores as JSON
          response: data.response as any,
          priority: data.priority || "MEDIUM",
          tags: data.tags || [],
          conditions: data.conditions || [],
          status: "DRAFT",
          isActive: false,
          performance: {
            totalTriggers: 0,
            successfulResponses: 0,
            failedResponses: 0,
            averageResponseTime: 0,
            successRate: 0,
          },
        },
      });

      // Transform to our interface
      return this.transformToAutomation(automation);
    } catch (error: any) {
      logger.error("Create automation error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to create automation");
    }
  }

  static async getAutomations(
    userId: string,
    filters: AutomationListRequest
  ): Promise<AutomationListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { userId };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = { $in: filters.tags };
      }

      if (filters.search) {
        where.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ];
      }

      // Get automations with pagination
      const [automations, total] = await Promise.all([
        prisma.automation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.automation.count({ where }),
      ]);

      // Transform results
      const transformedAutomations = automations.map(
        this.transformToAutomation
      );

      return {
        automations: transformedAutomations,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error("Get automations error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to fetch automations");
    }
  }

  static async getAutomation(
    userId: string,
    automationId: string
  ): Promise<Automation> {
    try {
      const automation = await prisma.automation.findFirst({
        where: {
          id: automationId,
          userId,
        },
      });

      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      return this.transformToAutomation(automation);
    } catch (error: any) {
      logger.error("Get automation error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to fetch automation");
    }
  }

  static async updateAutomation(
    userId: string,
    automationId: string,
    data: UpdateAutomationRequest
  ): Promise<Automation> {
    try {
      // Check if automation exists and belongs to user
      const existingAutomation = await prisma.automation.findFirst({
        where: {
          id: automationId,
          userId,
        },
      });

      if (!existingAutomation) {
        throw createHttpError(404, "Automation not found");
      }

      // Update automation
      const updatedAutomation = await prisma.automation.update({
        where: { id: automationId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.trigger && { trigger: data.trigger as any }),
          ...(data.response && { response: data.response as any }),
          ...(data.status && { status: data.status }),
          ...(data.priority && { priority: data.priority }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.tags && { tags: data.tags }),
          ...(data.conditions && { conditions: data.conditions as any }),
          updatedAt: new Date(),
        },
      });

      return this.transformToAutomation(updatedAutomation);
    } catch (error: any) {
      logger.error("Update automation error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to update automation");
    }
  }

  static async deleteAutomation(
    userId: string,
    automationId: string
  ): Promise<void> {
    try {
      // Check if automation exists and belongs to user
      const automation = await prisma.automation.findFirst({
        where: {
          id: automationId,
          userId,
        },
      });

      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      // Delete automation
      await prisma.automation.delete({
        where: { id: automationId },
      });

      logger.info(`Automation ${automationId} deleted by user ${userId}`);
    } catch (error: any) {
      logger.error("Delete automation error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to delete automation");
    }
  }

  // ========================================
  // AUTOMATION EXECUTION
  // ========================================

  static async checkAndExecuteAutomations(
    userId: string,
    message: string,
    conversationId: string,
    context: any
  ): Promise<AutomationExecution[]> {
    try {
      // Get user's active automations
      const automations = await prisma.automation.findMany({
        where: {
          userId,
          isActive: true,
          status: "ACTIVE",
        },
      });

      const executions: AutomationExecution[] = [];

      for (const automation of automations) {
        try {
          const shouldExecute = await this.checkTrigger(
            automation.trigger as Trigger,
            message,
            context
          );

          if (shouldExecute) {
            const execution = await this.executeAutomation(
              automation,
              message,
              conversationId,
              context
            );
            executions.push(execution);
          }
        } catch (error: any) {
          logger.error(`Error executing automation ${automation.id}:`, error);
          // Continue with other automations
        }
      }

      return executions;
    } catch (error: any) {
      logger.error("Check and execute automations error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to check automations");
    }
  }

  private static async checkTrigger(
    trigger: Trigger,
    message: string,
    context: any
  ): Promise<boolean> {
    switch (trigger.type) {
      case "keyword":
        return this.checkKeywordTrigger(trigger, message);
      case "intent":
        return this.checkIntentTrigger(trigger, message);
      case "time":
        return this.checkTimeTrigger(trigger);
      case "user_type":
        return this.checkUserTypeTrigger(trigger, context);
      case "message_count":
        return this.checkMessageCountTrigger(trigger, context);
      default:
        return false;
    }
  }

  private static checkKeywordTrigger(trigger: any, message: string): boolean {
    const messageLower = message.toLowerCase();

    for (const keyword of trigger.keywords) {
      const keywordLower = keyword.toLowerCase();

      switch (trigger.matchType) {
        case "exact":
          if (messageLower === keywordLower) return true;
          break;
        case "contains":
          if (messageLower.includes(keywordLower)) return true;
          break;
        case "starts_with":
          if (messageLower.startsWith(keywordLower)) return true;
          break;
        case "ends_with":
          if (messageLower.endsWith(keywordLower)) return true;
          break;
      }
    }

    return false;
  }

  private static async checkIntentTrigger(
    trigger: any,
    message: string
  ): Promise<boolean> {
    try {
      // TODO: Integrate with AI service to detect intent
      // For now, use simple keyword matching as fallback
      const messageLower = message.toLowerCase();

      for (const intent of trigger.intents) {
        if (messageLower.includes(intent.toLowerCase())) {
          return true;
        }
      }

      return false;
    } catch (error: any) {
      logger.error("Intent detection error:", error);
      return false;
    }
  }

  private static checkTimeTrigger(trigger: any): boolean {
    const now = new Date();
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      timeZone: trigger.timezone || "UTC",
    });

    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedDay = currentDay === 0 ? 7 : currentDay; // Convert to 1-7 format

    // Check if current day is in allowed days
    if (!trigger.daysOfWeek.includes(adjustedDay)) {
      return false;
    }

    // Check if current time is within range
    return (
      currentTime >= trigger.timeRange.start &&
      currentTime <= trigger.timeRange.end
    );
  }

  private static checkUserTypeTrigger(trigger: any, context: any): boolean {
    const userType = context.userType || "unknown";
    return trigger.userTypes.includes(userType);
  }

  private static async checkMessageCountTrigger(
    trigger: any,
    context: any
  ): Promise<boolean> {
    try {
      // Count messages in the conversation within the time window
      const timeWindow = new Date(Date.now() - trigger.timeWindow * 60 * 1000);

      const messageCount = await prisma.message.count({
        where: {
          conversationId: context.conversationId,
          createdAt: {
            gte: timeWindow,
          },
        },
      });

      return messageCount >= trigger.count;
    } catch (error: any) {
      logger.error("Message count check error:", error);
      return false;
    }
  }

  private static async executeAutomation(
    automation: any,
    message: string,
    conversationId: string,
    context: any
  ): Promise<AutomationExecution> {
    const startTime = Date.now();

    try {
      // Generate response based on automation type
      let aiResponse: string | undefined;

      switch (automation.response.type) {
        case "ai_generated":
          aiResponse = await this.generateAIResponse(
            automation.response,
            message,
            context
          );
          break;
        case "template":
          aiResponse = await this.generateTemplateResponse(
            automation.response,
            context
          );
          break;
        case "custom":
          aiResponse = this.generateCustomResponse(
            automation.response,
            context
          );
          break;
        case "delay":
          // Handle delay response (queue for later)
          await this.queueDelayedResponse(
            automation,
            message,
            conversationId,
            context
          );
          aiResponse = "Response queued for delayed delivery";
          break;
      }

      const responseTime = Date.now() - startTime;

      // Log execution
      const execution: AutomationExecution = {
        id: `exec_${Date.now()}_${Math.random()}`,
        automationId: automation.id,
        conversationId,
        trigger: automation.trigger,
        response: automation.response,
        executedAt: new Date().toISOString(),
        responseTime,
        success: true,
        aiResponse,
      };

      // Update automation performance
      await this.updateAutomationPerformance(automation.id, true, responseTime);

      // TODO: Send response to Instagram via webhook/API
      logger.info(`Automation ${automation.id} executed successfully`);

      return execution;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      logger.error(`Automation execution error:`, error);

      // Update automation performance (failed)
      await this.updateAutomationPerformance(
        automation.id,
        false,
        responseTime
      );

      return {
        id: `exec_${Date.now()}_${Math.random()}`,
        automationId: automation.id,
        conversationId,
        trigger: automation.trigger,
        response: automation.response,
        executedAt: new Date().toISOString(),
        responseTime,
        success: false,
        errorMessage: error.message,
        aiResponse: undefined,
      };
    }
  }

  // ========================================
  // AI INTEGRATION
  // ========================================

  private static async generateAIResponse(
    response: any,
    message: string,
    _context: any
  ): Promise<string> {
    try {
      const prompt = response.prompt;
      const maxLength = response.maxLength || 200;
      // const temperature = response.temperature || 0.7;

      // Check if OpenAI API key is configured
      if (!config.openaiApiKey) {
        logger.warn("OpenAI API key not configured, using fallback response");
        return this.generateFallbackResponse(prompt, message, maxLength);
      }

      // TODO: Implement actual OpenAI API call
      // This is a placeholder for the OpenAI integration
      // In production, you would use:
      // const openai = new OpenAI({ apiKey: config.openaiApiKey });
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-3.5-turbo",
      //   messages: [
      //     { role: "system", content: prompt },
      //     { role: "user", content: message }
      //   ],
      //   max_tokens: maxLength,
      //   temperature: temperature
      // });
      // return completion.choices[0].message.content;

      // For now, generate a more realistic placeholder response
      return this.generateFallbackResponse(prompt, message, maxLength);
    } catch (error: any) {
      logger.error("AI response generation error:", error);
      throw createHttpError(500, "Failed to generate AI response");
    }
  }

  private static generateFallbackResponse(
    _prompt: string,
    _message: string,
    maxLength: number
  ): string {
    // Simple "Thank you" responses for Instagram comments
    const responses = [
      "Thank you! 😊",
      "Thanks! 🙏",
      "Appreciate it! ✨",
      "Thank you for the comment! 💙",
      "Thanks for the support! 🎉",
    ];

    const randomResponse =
      responses[Math.floor(Math.random() * responses.length)];

    // Keep it simple - just the thank you message
    let result: string = randomResponse || "Thank you! 😊";

    if (result.length > maxLength) {
      result = result.substring(0, maxLength - 3) + "...";
    }

    return result;
  }

  private static async generateTemplateResponse(
    response: any,
    _context: any
  ): Promise<string> {
    try {
      // TODO: Fetch template from database
      const template =
        "Hello! Thanks for reaching out. How can I help you today?";

      // Replace variables in template
      let result = template;
      if (response.variables) {
        for (const [key, value] of Object.entries(response.variables)) {
          result = result.replace(new RegExp(`{${key}}`, "g"), value as string);
        }
      }

      return result;
    } catch (error: any) {
      logger.error("Template response generation error:", error);
      throw createHttpError(500, "Failed to generate template response");
    }
  }

  private static generateCustomResponse(response: any, context: any): string {
    try {
      let result = response.message;

      // Replace variables in custom response
      if (response.variables) {
        for (const variable of response.variables) {
          const variableName = variable.replace(/[{}]/g, "");
          const value = context[variableName] || variable;
          result = result.replace(new RegExp(variable, "g"), value);
        }
      }

      return result;
    } catch (error: any) {
      logger.error("Custom response generation error:", error);
      throw createHttpError(500, "Failed to generate custom response");
    }
  }

  private static async queueDelayedResponse(
    automation: any,
    _message: string,
    _conversationId: string,
    _context: any
  ): Promise<void> {
    try {
      // TODO: Implement delayed response queue
      // This could use Redis, database, or message queue
      logger.info(`Delayed response queued for automation ${automation.id}`);
    } catch (error: any) {
      logger.error("Queue delayed response error:", error);
      throw createHttpError(500, "Failed to queue delayed response");
    }
  }

  // ========================================
  // PERFORMANCE TRACKING
  // ========================================

  private static async updateAutomationPerformance(
    automationId: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    try {
      const automation = await prisma.automation.findUnique({
        where: { id: automationId },
      });

      if (!automation) return;

      const performance = automation.performance as any;

      // Update performance metrics
      performance.totalTriggers += 1;
      if (success) {
        performance.successfulResponses += 1;
      } else {
        performance.failedResponses += 1;
      }

      // Calculate average response time
      const totalTime =
        performance.averageResponseTime * (performance.totalTriggers - 1) +
        responseTime;
      performance.averageResponseTime = totalTime / performance.totalTriggers;

      // Calculate success rate
      performance.successRate =
        (performance.successfulResponses / performance.totalTriggers) * 100;
      performance.lastTriggeredAt = new Date().toISOString();

      // Update in database
      await prisma.automation.update({
        where: { id: automationId },
        data: { performance },
      });
    } catch (error: any) {
      logger.error("Update automation performance error:", error);
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  static async getAutomationStats(userId: string): Promise<AutomationStats> {
    try {
      const [totalAutomations, activeAutomations, automations] =
        await Promise.all([
          prisma.automation.count({ where: { userId } }),
          prisma.automation.count({
            where: {
              userId,
              isActive: true,
              status: "ACTIVE",
            },
          }),
          prisma.automation.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5,
          }),
        ]);

      // Calculate total triggers and average success rate
      let totalTriggers = 0;
      let totalSuccessRate = 0;
      let automationCount = 0;

      for (const automation of automations) {
        const performance = automation.performance as any;
        totalTriggers += performance.totalTriggers || 0;
        totalSuccessRate += performance.successRate || 0;
        automationCount++;
      }

      const averageSuccessRate =
        automationCount > 0 ? totalSuccessRate / automationCount : 0;

      return {
        totalAutomations,
        activeAutomations,
        totalTriggers,
        averageSuccessRate,
        topPerformingAutomations: automations.map(this.transformToAutomation),
      };
    } catch (error: any) {
      logger.error("Get automation stats error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to fetch automation statistics");
    }
  }

  static async testAutomation(data: TestAutomationRequest): Promise<string> {
    try {
      // Check if trigger would match
      const shouldExecute = await this.checkTrigger(
        data.trigger,
        data.testMessage,
        data.context || {}
      );

      if (!shouldExecute) {
        return "Trigger would not execute for this test message";
      }

      // Generate response
      let response: string;
      switch (data.response.type) {
        case "ai_generated":
          response = await this.generateAIResponse(
            data.response,
            data.testMessage,
            data.context || {}
          );
          break;
        case "template":
          response = await this.generateTemplateResponse(
            data.response,
            data.context || {}
          );
          break;
        case "custom":
          response = this.generateCustomResponse(
            data.response,
            data.context || {}
          );
          break;
        case "delay":
          response = "Delayed response would be queued";
          break;
        default:
          response = "Unknown response type";
      }

      return response;
    } catch (error: any) {
      logger.error("Test automation error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to test automation");
    }
  }

  // Toggle automation status (enable/disable)
  static async toggleAutomationStatus(
    userId: string,
    automationId: string
  ): Promise<Automation> {
    try {
      // Get current automation
      const automation = await prisma.automation.findFirst({
        where: { id: automationId, userId },
      });

      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      // Toggle status
      const newStatus = automation.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const isActive = newStatus === "ACTIVE";

      const updatedAutomation = await prisma.automation.update({
        where: { id: automationId },
        data: {
          status: newStatus,
          isActive,
        },
      });

      return this.transformToAutomation(updatedAutomation);
    } catch (error: any) {
      logger.error("Toggle automation status error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to toggle automation status");
    }
  }

  // Get specific automation performance
  static async getAutomationPerformance(
    userId: string,
    automationId: string
  ): Promise<any> {
    try {
      const automation = await prisma.automation.findFirst({
        where: { id: automationId, userId },
      });

      if (!automation) {
        throw createHttpError(404, "Automation not found");
      }

      // Get conversation count for this automation
      const conversationCount = await prisma.conversation.count({
        where: { automationId },
      });

      // Get recent executions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentExecutions = await prisma.jobLog.count({
        where: {
          automationId,
          runAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      const performance = automation.performance as any;

      return {
        automationId,
        name: automation.name,
        status: automation.status,
        performance: {
          totalTriggers: performance.totalTriggers || 0,
          successfulResponses: performance.successfulResponses || 0,
          failedResponses: performance.failedResponses || 0,
          averageResponseTime: performance.averageResponseTime || 0,
          successRate: performance.successRate || 0,
          conversationCount,
          recentExecutions,
        },
        lastExecuted: automation.updatedAt.toISOString(),
      };
    } catch (error: any) {
      logger.error("Get automation performance error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to fetch automation performance");
    }
  }

  private static transformToAutomation(dbAutomation: any): Automation {
    return {
      id: dbAutomation.id,
      userId: dbAutomation.userId,
      name: dbAutomation.name,
      description: dbAutomation.description,
      trigger: dbAutomation.trigger as Trigger,
      response: dbAutomation.response as Response,
      status: dbAutomation.status as AutomationStatus,
      priority: dbAutomation.priority as AutomationPriority,
      isActive: dbAutomation.isActive,
      tags: dbAutomation.tags || [],
      conditions: dbAutomation.conditions || [],
      performance: dbAutomation.performance,
      createdAt: dbAutomation.createdAt.toISOString(),
      updatedAt: dbAutomation.updatedAt.toISOString(),
    };
  }
}
