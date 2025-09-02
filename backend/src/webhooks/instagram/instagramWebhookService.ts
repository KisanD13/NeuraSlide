import { PrismaClient } from "@prisma/client";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import crypto from "crypto";
import {
  InstagramWebhookEvent,
  InstagramWebhookEntry,
  InstagramMessagingEvent,
  InstagramChangeEvent,
  ProcessedWebhookEvent,
  ProcessedMessagingEvent,
  ProcessedChangeEvent,
  WebhookEventType,
  WebhookProcessingResult,
  WebhookVerificationChallenge,
  WebhookSubscription,
} from "./instagramWebhookTypes";
import { config } from "../../config/config";

const prisma = new PrismaClient();

export class InstagramWebhookService {
  private readonly verifyToken: string;
  private readonly appSecret: string;

  constructor() {
    this.verifyToken = config.instagramWebhookVerifyToken || "";
    this.appSecret = config.instagramAppSecret || "";
  }

  // Webhook Verification
  async verifyWebhook(
    challenge: WebhookVerificationChallenge
  ): Promise<string> {
    try {
      logger.info("Instagram webhook verification request received");

      if (
        challenge["hub.mode"] === "subscribe" &&
        challenge["hub.verify_token"] === this.verifyToken
      ) {
        logger.info("Instagram webhook verification successful");
        return challenge["hub.challenge"];
      }

      logger.warn(
        "Instagram webhook verification failed - invalid verify token"
      );
      throw createHttpError(403, "Invalid verify token");
    } catch (error: any) {
      logger.error("Error verifying Instagram webhook:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to verify webhook. Please try again.");
    }
  }

  // Signature Verification
  verifySignature(payload: string, signature: string): boolean {
    try {
      if (!this.appSecret) {
        logger.warn("Instagram app secret not configured");
        return false;
      }

      const expectedSignature = crypto
        .createHmac("sha256", this.appSecret)
        .update(payload, "utf8")
        .digest("hex");

      const providedSignature = signature.replace("sha256=", "");

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "hex"),
        Buffer.from(providedSignature, "hex")
      );
    } catch (error: any) {
      logger.error("Error verifying Instagram webhook signature:", error);
      return false;
    }
  }

  // Process Webhook Event
  async processWebhookEvent(
    event: InstagramWebhookEvent
  ): Promise<WebhookProcessingResult[]> {
    try {
      logger.info("Processing Instagram webhook event", {
        entriesCount: event.entry.length,
      });

      const results: WebhookProcessingResult[] = [];

      for (const entry of event.entry) {
        const entryResults = await this.processEntry(entry);
        results.push(...entryResults);
      }

      logger.info("Instagram webhook event processed", {
        resultsCount: results.length,
      });
      return results;
    } catch (error: any) {
      logger.error("Error processing Instagram webhook event:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to process webhook event. Please try again."
      );
    }
  }

  // Process Individual Entry
  private async processEntry(
    entry: InstagramWebhookEntry
  ): Promise<WebhookProcessingResult[]> {
    const results: WebhookProcessingResult[] = [];

    // Process messaging events
    if (entry.messaging) {
      for (const messagingEvent of entry.messaging) {
        const result = await this.processMessagingEvent(
          entry.id,
          messagingEvent
        );
        results.push(result);
      }
    }

    // Process change events (comments, mentions, etc.)
    if (entry.changes) {
      for (const changeEvent of entry.changes) {
        const result = await this.processChangeEvent(entry.id, changeEvent);
        results.push(result);
      }
    }

    return results;
  }

  // Process Messaging Events (DMs)
  private async processMessagingEvent(
    instagramUserId: string,
    event: InstagramMessagingEvent
  ): Promise<WebhookProcessingResult> {
    try {
      let eventType: WebhookEventType = "UNKNOWN";
      let conversationId: string = "";
      let automationTriggered = false;
      let responseGenerated = false;

      // Determine event type
      if (event.message) {
        eventType = "MESSAGE_RECEIVED";
      } else if (event.delivery) {
        eventType = "MESSAGE_DELIVERED";
      } else if (event.read) {
        eventType = "MESSAGE_READ";
      }

      // Find or create conversation
      if (event.message) {
        conversationId = await this.findOrCreateConversation(
          instagramUserId,
          event.sender.id,
          event.recipient.id
        );

        // Save the message
        await this.saveMessage(
          conversationId,
          event.message,
          event.sender.id,
          event.timestamp
        );

        // Trigger automation if it's an incoming message
        if (event.sender.id !== instagramUserId) {
          const automationResult = await this.triggerAutomation(
            conversationId,
            event.message
          );
          automationTriggered = automationResult.triggered;
          responseGenerated = automationResult.responseGenerated;
        }
      }

      // Save processed event
      const processedEvent = await this.saveProcessedMessagingEvent({
        type: eventType as
          | "MESSAGE_RECEIVED"
          | "MESSAGE_DELIVERED"
          | "MESSAGE_READ"
          | "UNKNOWN",
        instagramUserId,
        conversationId,
        messageId: event.message?.mid || "",
        timestamp: new Date(event.timestamp),
        data: event,
      });

      return {
        success: true,
        eventId: processedEvent.id,
        eventType,
        conversationId,
        automationTriggered,
        responseGenerated,
        error: null,
      };
    } catch (error: any) {
      logger.error("Error processing messaging event:", error);
      return {
        success: false,
        eventId: "",
        eventType: "UNKNOWN",
        automationTriggered: false,
        responseGenerated: false,
        error: error.message,
      };
    }
  }

  // Process Change Events (Comments, Mentions)
  private async processChangeEvent(
    instagramUserId: string,
    event: InstagramChangeEvent
  ): Promise<WebhookProcessingResult> {
    try {
      let eventType: WebhookEventType = "UNKNOWN";

      // Determine event type based on field
      switch (event.field) {
        case "comments":
          eventType = "COMMENT_CREATED";
          break;
        case "mentions":
          eventType = "MENTION_CREATED";
          break;
        case "story_insights":
          eventType = "STORY_MENTION";
          break;
        case "media":
          eventType = "MEDIA_PUBLISHED";
          break;
      }

      // Save processed event
      const processedEvent = await this.saveProcessedChangeEvent({
        type: eventType as
          | "COMMENT_CREATED"
          | "COMMENT_DELETED"
          | "MENTION_CREATED"
          | "STORY_MENTION"
          | "MEDIA_PUBLISHED"
          | "UNKNOWN",
        instagramUserId,
        timestamp: new Date(),
        data: event,
      });

      // Trigger automation for comments and mentions
      let automationTriggered = false;
      let responseGenerated = false;

      if (eventType === "COMMENT_CREATED") {
        try {
          const automationResult = await this.triggerCommentAutomation(
            instagramUserId,
            event,
            processedEvent.id
          );
          automationTriggered = automationResult.triggered;
          responseGenerated = automationResult.responseGenerated;
        } catch (error) {
          logger.error("Error triggering comment automation:", error);
        }
      }

      return {
        success: true,
        eventId: processedEvent.id,
        eventType,
        automationTriggered,
        responseGenerated,
        error: null,
      };
    } catch (error: any) {
      logger.error("Error processing change event:", error);
      return {
        success: false,
        eventId: "",
        eventType: "UNKNOWN",
        automationTriggered: false,
        responseGenerated: false,
        error: error.message,
      };
    }
  }

  // Find or Create Conversation
  private async findOrCreateConversation(
    instagramAccountId: string,
    senderId: string,
    recipientId: string
  ): Promise<string> {
    try {
      // Find the Instagram account in our system
      const instagramAccount = await prisma.instagramAccount.findFirst({
        where: { igUserId: instagramAccountId },
        include: { team: { include: { members: true } } },
      });

      if (!instagramAccount) {
        throw createHttpError(404, "Instagram account not found");
      }

      // Use the first team member as the user (in a real app, you might have better logic)
      const userId = instagramAccount.team.members[0]?.userId;
      if (!userId) {
        throw createHttpError(404, "No user found for Instagram account");
      }

      // Create external conversation ID (combination of sender and recipient)
      const externalConversationId = `${senderId}_${recipientId}`;

      // Find existing conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          userId,
          instagramAccountId: instagramAccount.id,
          externalConversationId,
        },
      });

      // Create new conversation if it doesn't exist
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId,
            instagramAccountId: instagramAccount.id,
            externalConversationId,
            participantId: senderId,
            participantUsername: `user_${senderId}`, // We'd get this from Instagram API in production
            status: "ACTIVE",
            lastMessageAt: new Date(),
            messageCount: 0,
          },
        });
      }

      return conversation.id;
    } catch (error: any) {
      logger.error("Error finding/creating conversation:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Unable to find or create conversation.");
    }
  }

  // Save Message
  private async saveMessage(
    conversationId: string,
    message: any,
    senderId: string,
    timestamp: number
  ): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          conversationId,
          externalMessageId: message.mid,
          senderType: "USER",
          senderId,
          senderName: `user_${senderId}`,
          text: message.text || "",
          messageType: "TEXT", // Simplified - would handle attachments in production
          status: "DELIVERED",
          metadata: JSON.stringify(message),
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(timestamp),
          lastMessageText: message.text || "",
          messageCount: { increment: 1 },
        },
      });
    } catch (error: any) {
      logger.error("Error saving message:", error);
      throw error;
    }
  }

  // Trigger Automation
  private async triggerAutomation(
    conversationId: string,
    message: any
  ): Promise<{ triggered: boolean; responseGenerated: boolean }> {
    try {
      // Get conversation details
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { user: true },
      });

      if (!conversation) {
        return { triggered: false, responseGenerated: false };
      }

      // Find active automations for this user
      const automations = await prisma.automation.findMany({
        where: {
          userId: conversation.userId,
          isActive: true,
          status: "ACTIVE",
        },
      });

      let triggered = false;
      let responseGenerated = false;

      for (const automation of automations) {
        // Simple trigger check - in production, this would be more sophisticated
        const trigger = automation.trigger as any;
        if (trigger.type === "message_received") {
          triggered = true;

          // TODO: Integrate with automation engine to generate and send response
          // This would involve calling the automation service to process the trigger
          // and potentially generate an AI response

          logger.info("Automation triggered", {
            automationId: automation.id,
            conversationId,
            messageText: message.text,
          });

          // For now, just log that automation was triggered
          responseGenerated = false; // Would be true if we actually sent a response
        }
      }

      return { triggered, responseGenerated };
    } catch (error: any) {
      logger.error("Error triggering automation:", error);
      return { triggered: false, responseGenerated: false };
    }
  }

  // Save Processed Messaging Event
  private async saveProcessedMessagingEvent(eventData: {
    type: "MESSAGE_RECEIVED" | "MESSAGE_DELIVERED" | "MESSAGE_READ" | "UNKNOWN";
    instagramUserId: string;
    conversationId: string;
    messageId: string;
    timestamp: Date;
    data: any;
  }): Promise<ProcessedMessagingEvent> {
    try {
      // For now, we'll create a simple log entry
      // In production, you might want a dedicated webhook events table
      const eventId = crypto.randomUUID();

      const processedEvent: ProcessedWebhookEvent = {
        id: eventId,
        type: eventData.type,
        instagramUserId: eventData.instagramUserId,
        conversationId: eventData.conversationId,
        messageId: eventData.messageId,
        timestamp: eventData.timestamp,
        data: eventData.data,
        processed: true,
        createdAt: new Date(),
      };

      logger.info("Webhook event processed and saved", {
        eventId,
        type: eventData.type,
        instagramUserId: eventData.instagramUserId,
      });

      return processedEvent;
    } catch (error: any) {
      logger.error("Error saving processed messaging event:", error);
      throw error;
    }
  }

  // Save Processed Change Event
  private async saveProcessedChangeEvent(eventData: {
    type:
      | "COMMENT_CREATED"
      | "COMMENT_DELETED"
      | "MENTION_CREATED"
      | "STORY_MENTION"
      | "MEDIA_PUBLISHED"
      | "UNKNOWN";
    instagramUserId: string;
    timestamp: Date;
    data: any;
  }): Promise<ProcessedChangeEvent> {
    try {
      // For now, we'll create a simple log entry
      // In production, you might want a dedicated webhook events table
      const eventId = crypto.randomUUID();

      const processedEvent: ProcessedChangeEvent = {
        id: eventId,
        type: eventData.type,
        instagramUserId: eventData.instagramUserId,
        timestamp: eventData.timestamp,
        data: eventData.data,
        processed: true,
        createdAt: new Date(),
      };

      logger.info("Change webhook event processed and saved", {
        eventId,
        type: eventData.type,
        instagramUserId: eventData.instagramUserId,
      });

      return processedEvent;
    } catch (error: any) {
      logger.error("Error saving processed change event:", error);
      throw error;
    }
  }

  // Get Processed Events (for debugging/monitoring)
  async getProcessedEvents(
    _userId: string,
    _limit = 50,
    _offset = 0
  ): Promise<{
    events: ProcessedWebhookEvent[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // This would query a dedicated webhook events table in production
      // For now, return empty array as placeholder
      return {
        events: [],
        total: 0,
        hasMore: false,
      };
    } catch (error: any) {
      logger.error("Error getting processed events:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to get processed events. Please try again."
      );
    }
  }

  // Subscription Management
  async createWebhookSubscription(
    userId: string,
    instagramAccountId: string,
    events: string[]
  ): Promise<WebhookSubscription> {
    try {
      // In production, this would create a subscription via Instagram Graph API
      const subscription: WebhookSubscription = {
        id: crypto.randomUUID(),
        userId,
        instagramAccountId,
        subscriptionId: crypto.randomUUID(),
        isActive: true,
        events,
        webhookUrl: `${process.env["BACKEND_URL"]}/webhooks/instagram`,
        verifyToken: this.verifyToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      logger.info("Webhook subscription created", {
        userId,
        instagramAccountId,
        events,
      });

      return subscription;
    } catch (error: any) {
      logger.error("Error creating webhook subscription:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(
        500,
        "Unable to create webhook subscription. Please try again."
      );
    }
  }

  // ==============================================
  // COMMENT AUTOMATION METHODS
  // ==============================================

  /**
   * Trigger automation for Instagram comments
   */
  private async triggerCommentAutomation(
    instagramUserId: string,
    commentEvent: InstagramChangeEvent,
    eventId: string
  ): Promise<{ triggered: boolean; responseGenerated: boolean }> {
    try {
      logger.info("Triggering comment automation", {
        instagramUserId,
        commentId: commentEvent.value.comment_id,
        eventId,
      });

      // Find the Instagram account
      const instagramAccount = await prisma.instagramAccount.findFirst({
        where: { igUserId: instagramUserId },
      });

      if (!instagramAccount) {
        logger.warn("Instagram account not found for automation", {
          instagramUserId,
        });
        return { triggered: false, responseGenerated: false };
      }

      // Find active automations for this user
      const automations = await prisma.automation.findMany({
        where: {
          userId: instagramAccount.teamId, // Use teamId to find user
          isActive: true,
          status: "ACTIVE",
        },
      });

      if (automations.length === 0) {
        logger.info("No active automations found for user", {
          userId: instagramAccount.teamId,
        });
        return { triggered: false, responseGenerated: false };
      }

      // Find automation that triggers on comments
      const commentAutomation = automations.find((automation) => {
        const trigger = automation.trigger as any;
        return trigger.type === "comment_received";
      });

      if (!commentAutomation) {
        logger.info("No comment automation found", {
          automations: automations.map((a) => a.name),
        });
        return { triggered: false, responseGenerated: false };
      }

      logger.info("Comment automation found and triggered", {
        automationId: commentAutomation.id,
        automationName: commentAutomation.name,
      });

      // Generate and post reply
      const replyGenerated = await this.generateAndPostReply(
        commentAutomation,
        commentEvent,
        instagramAccount
      );

      return {
        triggered: true,
        responseGenerated: replyGenerated,
      };
    } catch (error: any) {
      logger.error("Error in comment automation:", error);
      return { triggered: false, responseGenerated: false };
    }
  }

  /**
   * Generate and post reply to comment
   */
  private async generateAndPostReply(
    automation: any,
    commentEvent: InstagramChangeEvent,
    instagramAccount: any
  ): Promise<boolean> {
    try {
      const commentId = commentEvent.value.comment_id;
      const commentText = commentEvent.value.text;

      if (!commentId || !commentText) {
        logger.warn("Missing comment data for reply", {
          commentId,
          commentText,
        });
        return false;
      }

      // Generate AI response using existing AI service
      const aiResponse = await this.generateAIResponse(commentText, automation);

      if (!aiResponse) {
        logger.warn("Failed to generate AI response");
        return false;
      }

      // Post reply using Instagram service
      const { InstagramService } = await import(
        "../../crystal/instagram/instagramService"
      );
      await InstagramService.replyToComment(
        instagramAccount.id,
        commentId,
        aiResponse
      );

      logger.info("Successfully posted automated reply", {
        commentId,
        replyText: aiResponse,
        automationId: automation.id,
      });

      return true;
    } catch (error: any) {
      logger.error("Error generating and posting reply:", error);
      return false;
    }
  }

  /**
   * Generate AI response for comment
   */
  private async generateAIResponse(
    commentText: string,
    automation: any
  ): Promise<string | null> {
    try {
      // Use existing AI service to generate response
      const { AIService } = await import("../../crystal/ai/aiService");

      const response = await AIService.generateResponse(automation.userId, {
        message: commentText,
        context: {
          businessContext: {
            businessName: "NeuraSlide",
            industry: "social_media_automation",
            tone: "friendly",
          },
        },
        maxTokens: 200,
      });

      return response.response;
    } catch (error: any) {
      logger.error("Error generating AI response:", error);
      return null;
    }
  }
}
