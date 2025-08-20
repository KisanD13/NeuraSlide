// Instagram Webhook Types for NeuraSlide
export type InstagramWebhookEvent = {
  object: "instagram";
  entry: InstagramWebhookEntry[];
};

export type InstagramWebhookEntry = {
  id: string; // Instagram User ID
  time: number; // Unix timestamp
  messaging?: InstagramMessagingEvent[];
  changes?: InstagramChangeEvent[];
};

export type InstagramMessagingEvent = {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message?: InstagramMessage;
  postback?: InstagramPostback;
  delivery?: InstagramDelivery;
  read?: InstagramRead;
};

export type InstagramMessage = {
  mid: string;
  text?: string;
  attachments?: InstagramAttachment[];
  quick_reply?: {
    payload: string;
  };
  reply_to?: {
    mid: string;
  };
};

export type InstagramAttachment = {
  type: "image" | "video" | "audio" | "file";
  payload: {
    url: string;
  };
};

export type InstagramPostback = {
  title: string;
  payload: string;
  mid: string;
};

export type InstagramDelivery = {
  mids: string[];
  watermark: number;
};

export type InstagramRead = {
  watermark: number;
};

export type InstagramChangeEvent = {
  field: string;
  value: InstagramChangeValue;
};

export type InstagramChangeValue = {
  id?: string;
  media_id?: string;
  comment_id?: string;
  parent_id?: string;
  created_time?: number;
  text?: string;
  from?: {
    id: string;
    username: string;
  };
  media?: {
    id: string;
    media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  };
};

// Internal processing types
export type ProcessedMessagingEvent = {
  id: string;
  type: "MESSAGE_RECEIVED" | "MESSAGE_DELIVERED" | "MESSAGE_READ" | "UNKNOWN";
  instagramUserId: string;
  conversationId: string; // Required for messaging events
  messageId: string; // Required for messaging events
  timestamp: Date;
  data: any;
  processed: boolean;
  createdAt: Date;
};

export type ProcessedChangeEvent = {
  id: string;
  type:
    | "COMMENT_CREATED"
    | "COMMENT_DELETED"
    | "MENTION_CREATED"
    | "STORY_MENTION"
    | "MEDIA_PUBLISHED"
    | "UNKNOWN";
  instagramUserId: string;
  // No conversationId or messageId for change events
  timestamp: Date;
  data: any;
  processed: boolean;
  createdAt: Date;
};

export type ProcessedWebhookEvent =
  | ProcessedMessagingEvent
  | ProcessedChangeEvent;

export type WebhookEventType =
  | "MESSAGE_RECEIVED"
  | "MESSAGE_DELIVERED"
  | "MESSAGE_READ"
  | "COMMENT_CREATED"
  | "COMMENT_DELETED"
  | "MENTION_CREATED"
  | "STORY_MENTION"
  | "MEDIA_PUBLISHED"
  | "UNKNOWN";

export type MessagingWebhookResult = {
  success: boolean;
  eventId: string;
  eventType:
    | "MESSAGE_RECEIVED"
    | "MESSAGE_DELIVERED"
    | "MESSAGE_READ"
    | "UNKNOWN";
  conversationId: string; // Required for messaging events
  automationTriggered: boolean;
  responseGenerated: boolean;
  error: string | null;
};

export type ChangeWebhookResult = {
  success: boolean;
  eventId: string;
  eventType:
    | "COMMENT_CREATED"
    | "COMMENT_DELETED"
    | "MENTION_CREATED"
    | "STORY_MENTION"
    | "MEDIA_PUBLISHED"
    | "UNKNOWN";
  // No conversationId for change events
  automationTriggered: boolean;
  responseGenerated: boolean;
  error: string | null;
};

export type WebhookProcessingResult =
  | MessagingWebhookResult
  | ChangeWebhookResult;

export type WebhookVerificationChallenge = {
  "hub.mode": string;
  "hub.challenge": string;
  "hub.verify_token": string;
};

export type WebhookSubscription = {
  id: string;
  userId: string;
  instagramAccountId: string;
  subscriptionId: string;
  isActive: boolean;
  events: string[];
  webhookUrl: string;
  verifyToken: string;
  createdAt: Date;
  updatedAt: Date;
};

// Response types
export type WebhookEventResponse = {
  success: boolean;
  data: ProcessedWebhookEvent;
  message?: string;
};

export type WebhookEventsResponse = {
  success: boolean;
  data: {
    events: ProcessedWebhookEvent[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
};

export type WebhookSubscriptionResponse = {
  success: boolean;
  data: WebhookSubscription;
  message?: string;
};

// Validation types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
