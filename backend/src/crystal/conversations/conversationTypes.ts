// backend/src/crystal/conversations/conversationTypes.ts

export interface Conversation {
  id: string;
  userId: string;
  instagramAccountId: string;
  externalConversationId: string; // Instagram conversation ID
  participantId: string; // Instagram user ID
  participantUsername: string;
  participantFullName?: string | null;
  participantProfilePic?: string | null;
  status: ConversationStatus;
  lastMessageAt: Date;
  lastMessageText?: string | null;
  messageCount: number;
  isAutomated: boolean;
  automationId?: string | null;
  tags: string[];
  priority: ConversationPriority;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  externalMessageId: string; // Instagram message ID
  senderType: MessageSenderType;
  senderId: string;
  senderName: string;
  text: string;
  mediaUrls: string[];
  messageType: MessageType;
  status: MessageStatus;
  metadata?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  mediaUrls?: string[];
  messageType?: MessageType | undefined;
  metadata?: Record<string, any>;
}

export interface ReplyMessageRequest {
  conversationId: string;
  messageId: string;
  text: string;
  mediaUrls?: string[];
  messageType?: MessageType;
  metadata?: Record<string, any>;
}

export interface ConversationListRequest {
  page?: number;
  limit?: number;
  status?: ConversationStatus;
  isAutomated?: boolean | undefined;
  tags?: string[] | undefined;
  search?: string;
  sortBy?: "lastMessageAt" | "createdAt" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MessageListRequest {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: Date | undefined;
  after?: Date | undefined;
}

export interface MessageListResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ConversationStats {
  totalConversations: number;
  activeConversations: number;
  automatedConversations: number;
  manualConversations: number;
  unreadConversations: number;
  todayMessages: number;
  thisWeekMessages: number;
  thisMonthMessages: number;
}

// Enums - using string literals to match Prisma
export enum ConversationStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  BLOCKED = "BLOCKED",
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
}

export enum ConversationPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum MessageSenderType {
  USER = "USER",
  BOT = "BOT",
  EXTERNAL = "EXTERNAL",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  STICKER = "STICKER",
  LOCATION = "LOCATION",
}

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
  FAILED = "FAILED",
  PENDING = "PENDING",
}
