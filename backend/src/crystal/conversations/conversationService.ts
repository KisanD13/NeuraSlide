// backend/src/crystal/conversations/conversationService.ts

import { PrismaClient } from "@prisma/client";
import {
  Conversation,
  Message,
  SendMessageRequest,
  ReplyMessageRequest,
  ConversationListRequest,
  ConversationListResponse,
  MessageListRequest,
  MessageListResponse,
  ConversationStats,
  ConversationStatus,
  MessageSenderType,
  MessageType,
  MessageStatus,
  ConversationPriority,
} from "./conversationTypes";
import { logger } from "../../utils/logger";

const prisma = new PrismaClient();

export class ConversationService {
  /**
   * Get conversations list with pagination and filters
   */
  static async getConversations(
    userId: string,
    filters: ConversationListRequest
  ): Promise<ConversationListResponse> {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        isAutomated,
        tags,
        search,
        sortBy = "lastMessageAt",
        sortOrder = "desc",
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        userId,
      };

      if (status) {
        where.status = status;
      }

      if (isAutomated !== undefined) {
        where.isAutomated = isAutomated;
      }

      if (tags && tags.length > 0) {
        where.tags = {
          hasSome: tags,
        };
      }

      if (search) {
        where.OR = [
          {
            participantUsername: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            participantFullName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastMessageText: {
              contains: search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Get conversations
      const [conversations, total] = await Promise.all([
        prisma.conversation.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            instagramAccount: {
              select: {
                igUsername: true,
                meta: true,
              },
            },
          },
        }),
        prisma.conversation.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Transform to match our interface
      const transformedConversations: Conversation[] = conversations.map(
        (conv) => ({
          id: conv.id,
          userId: conv.userId,
          instagramAccountId: conv.instagramAccountId,
          externalConversationId: conv.externalConversationId,
          participantId: conv.participantId,
          participantUsername: conv.participantUsername,
          participantFullName: conv.participantFullName,
          participantProfilePic: conv.participantProfilePic,
          status: conv.status as ConversationStatus,
          lastMessageAt: conv.lastMessageAt,
          lastMessageText: conv.lastMessageText,
          messageCount: conv.messageCount,
          isAutomated: conv.isAutomated,
          automationId: conv.automationId,
          tags: conv.tags,
          priority: conv.priority as ConversationPriority,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        })
      );

      return {
        conversations: transformedConversations,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      logger.error("Error getting conversations:", error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(
    userId: string,
    conversationId: string
  ): Promise<Conversation | null> {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
        include: {
          instagramAccount: {
            select: {
              igUsername: true,
              meta: true,
            },
          },
        },
      });

      if (!conversation) return null;

      // Transform to match our interface
      return {
        id: conversation.id,
        userId: conversation.userId,
        instagramAccountId: conversation.instagramAccountId,
        externalConversationId: conversation.externalConversationId,
        participantId: conversation.participantId,
        participantUsername: conversation.participantUsername,
        participantFullName: conversation.participantFullName,
        participantProfilePic: conversation.participantProfilePic,
        status: conversation.status as ConversationStatus,
        lastMessageAt: conversation.lastMessageAt,
        lastMessageText: conversation.lastMessageText,
        messageCount: conversation.messageCount,
        isAutomated: conversation.isAutomated,
        automationId: conversation.automationId,
        tags: conversation.tags,
        priority: conversation.priority as ConversationPriority,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      };
    } catch (error: any) {
      logger.error("Error getting conversation:", error);
      throw error;
    }
  }

  /**
   * Get messages in a conversation
   */
  static async getMessages(
    userId: string,
    conversationId: string,
    filters: MessageListRequest
  ): Promise<MessageListResponse> {
    try {
      // Verify conversation belongs to user
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const { page = 1, limit = 50, before, after } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        conversationId,
      };

      if (before) {
        where.createdAt = {
          ...where.createdAt,
          lt: before,
        };
      }

      if (after) {
        where.createdAt = {
          ...where.createdAt,
          gt: after,
        };
      }

      // Get messages
      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.message.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Transform to match our interface
      const transformedMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        externalMessageId: msg.externalMessageId,
        senderType: msg.senderType as MessageSenderType,
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        mediaUrls: msg.mediaUrls,
        messageType: msg.messageType as MessageType,
        status: msg.status as MessageStatus,
        metadata: (msg.metadata as Record<string, any>) || {},
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }));

      return {
        messages: transformedMessages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      logger.error("Error getting messages:", error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(
    userId: string,
    request: SendMessageRequest
  ): Promise<Message> {
    try {
      const { conversationId, text, mediaUrls, messageType, metadata } =
        request;

      // Verify conversation belongs to user
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Create message in database
      const message = await prisma.message.create({
        data: {
          conversationId,
          externalMessageId: `manual_${Date.now()}`, // Temporary ID
          senderType: "USER" as any,
          senderId: userId,
          senderName: "You", // Will be replaced with actual user name
          text,
          mediaUrls: mediaUrls || [],
          messageType: (messageType || "TEXT") as any,
          status: "PENDING" as any,
          metadata: metadata || {},
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessageText: text,
          messageCount: {
            increment: 1,
          },
        },
      });

      // TODO: Send message via Instagram API
      // This will be implemented when we have Instagram API integration
      // await InstagramService.sendMessage(conversation.instagramAccountId, text);

      logger.info(
        `Message sent in conversation ${conversationId} by user ${userId}`
      );

      // Transform to match our interface
      return {
        id: message.id,
        conversationId: message.conversationId,
        externalMessageId: message.externalMessageId,
        senderType: message.senderType as MessageSenderType,
        senderId: message.senderId,
        senderName: message.senderName,
        text: message.text,
        mediaUrls: message.mediaUrls,
        messageType: message.messageType as MessageType,
        status: message.status as MessageStatus,
        metadata: (message.metadata as Record<string, any>) || {},
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    } catch (error: any) {
      logger.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Reply to a specific message
   */
  static async replyToMessage(
    userId: string,
    request: ReplyMessageRequest
  ): Promise<Message> {
    try {
      const {
        conversationId,
        messageId,
        text,
        mediaUrls,
        messageType,
        metadata,
      } = request;

      // Verify conversation belongs to user
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Verify message exists
      const originalMessage = await prisma.message.findFirst({
        where: {
          id: messageId,
          conversationId,
        },
      });

      if (!originalMessage) {
        throw new Error("Message not found");
      }

      // Create reply message
      const replyMessage = await this.sendMessage(userId, {
        conversationId,
        text,
        mediaUrls: mediaUrls || [],
        messageType: messageType || undefined,
        metadata: {
          ...metadata,
          replyTo: messageId,
          originalMessage: {
            id: originalMessage.id,
            text: originalMessage.text,
            senderName: originalMessage.senderName,
          },
        },
      });

      logger.info(
        `Reply sent to message ${messageId} in conversation ${conversationId}`
      );

      return replyMessage;
    } catch (error: any) {
      logger.error("Error replying to message:", error);
      throw error;
    }
  }

  /**
   * Get conversation statistics
   */
  static async getConversationStats(
    userId: string
  ): Promise<ConversationStats> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        now.getDate()
      );

      const [
        totalConversations,
        activeConversations,
        automatedConversations,
        manualConversations,
        unreadConversations,
        todayMessages,
        thisWeekMessages,
        thisMonthMessages,
      ] = await Promise.all([
        prisma.conversation.count({ where: { userId } }),
        prisma.conversation.count({
          where: { userId, status: "ACTIVE" as any },
        }),
        prisma.conversation.count({
          where: { userId, isAutomated: true },
        }),
        prisma.conversation.count({
          where: { userId, isAutomated: false },
        }),
        prisma.conversation.count({
          where: { userId, status: "PENDING" as any },
        }),
        prisma.message.count({
          where: {
            conversation: { userId },
            createdAt: { gte: today },
          },
        }),
        prisma.message.count({
          where: {
            conversation: { userId },
            createdAt: { gte: weekAgo },
          },
        }),
        prisma.message.count({
          where: {
            conversation: { userId },
            createdAt: { gte: monthAgo },
          },
        }),
      ]);

      return {
        totalConversations,
        activeConversations,
        automatedConversations,
        manualConversations,
        unreadConversations,
        todayMessages,
        thisWeekMessages,
        thisMonthMessages,
      };
    } catch (error: any) {
      logger.error("Error getting conversation stats:", error);
      throw error;
    }
  }

  /**
   * Update conversation status
   */
  static async updateConversationStatus(
    userId: string,
    conversationId: string,
    status: ConversationStatus
  ): Promise<Conversation> {
    try {
      // Verify conversation belongs to user
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const updatedConversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: status as any },
        include: {
          instagramAccount: {
            select: {
              igUsername: true,
              meta: true,
            },
          },
        },
      });

      logger.info(`Conversation ${conversationId} status updated to ${status}`);

      // Transform to match our interface
      return {
        id: updatedConversation.id,
        userId: updatedConversation.userId,
        instagramAccountId: updatedConversation.instagramAccountId,
        externalConversationId: updatedConversation.externalConversationId,
        participantId: updatedConversation.participantId,
        participantUsername: updatedConversation.participantUsername,
        participantFullName: updatedConversation.participantFullName,
        participantProfilePic: updatedConversation.participantProfilePic,
        status: updatedConversation.status as ConversationStatus,
        lastMessageAt: updatedConversation.lastMessageAt,
        lastMessageText: updatedConversation.lastMessageText,
        messageCount: updatedConversation.messageCount,
        isAutomated: updatedConversation.isAutomated,
        automationId: updatedConversation.automationId,
        tags: updatedConversation.tags,
        priority: updatedConversation.priority as ConversationPriority,
        createdAt: updatedConversation.createdAt,
        updatedAt: updatedConversation.updatedAt,
      };
    } catch (error: any) {
      logger.error("Error updating conversation status:", error);
      throw error;
    }
  }

  /**
   * Add tags to conversation
   */
  static async addTagsToConversation(
    userId: string,
    conversationId: string,
    tags: string[]
  ): Promise<Conversation> {
    try {
      // Verify conversation belongs to user
      const conversation = await this.getConversation(userId, conversationId);
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Merge existing tags with new tags
      const existingTags = conversation.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];

      const updatedConversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { tags: newTags },
        include: {
          instagramAccount: {
            select: {
              igUsername: true,
              meta: true,
            },
          },
        },
      });

      logger.info(
        `Tags added to conversation ${conversationId}: ${tags.join(", ")}`
      );

      // Transform to match our interface
      return {
        id: updatedConversation.id,
        userId: updatedConversation.userId,
        instagramAccountId: updatedConversation.instagramAccountId,
        externalConversationId: updatedConversation.externalConversationId,
        participantId: updatedConversation.participantId,
        participantUsername: updatedConversation.participantUsername,
        participantFullName: updatedConversation.participantFullName,
        participantProfilePic: updatedConversation.participantProfilePic,
        status: updatedConversation.status as ConversationStatus,
        lastMessageAt: updatedConversation.lastMessageAt,
        lastMessageText: updatedConversation.lastMessageText,
        messageCount: updatedConversation.messageCount,
        isAutomated: updatedConversation.isAutomated,
        automationId: updatedConversation.automationId,
        tags: updatedConversation.tags,
        priority: updatedConversation.priority as ConversationPriority,
        createdAt: updatedConversation.createdAt,
        updatedAt: updatedConversation.updatedAt,
      };
    } catch (error: any) {
      logger.error("Error adding tags to conversation:", error);
      throw error;
    }
  }
}
