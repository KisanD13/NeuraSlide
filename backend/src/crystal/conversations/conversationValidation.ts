// backend/src/crystal/conversations/conversationValidation.ts

import {
  SendMessageRequest,
  ReplyMessageRequest,
  MessageType,
} from "./conversationTypes";

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class ConversationValidation {
  /**
   * Validate send message request
   */
  static validateSendMessage(data: SendMessageRequest): ValidationResult {
    const errors: string[] = [];

    // Validate conversation ID
    if (!data.conversationId || typeof data.conversationId !== "string") {
      errors.push("Conversation ID is required");
    }

    // Validate text
    if (
      !data.text ||
      typeof data.text !== "string" ||
      data.text.trim().length === 0
    ) {
      errors.push("Message text is required");
    }

    // Validate text length
    if (data.text && data.text.length > 1000) {
      errors.push("Message text cannot exceed 1000 characters");
    }

    // Validate media URLs
    if (data.mediaUrls && !Array.isArray(data.mediaUrls)) {
      errors.push("Media URLs must be an array");
    }

    if (data.mediaUrls && data.mediaUrls.length > 10) {
      errors.push("Cannot attach more than 10 media files");
    }

    // Validate message type
    if (
      data.messageType &&
      !Object.values(MessageType).includes(data.messageType)
    ) {
      errors.push("Invalid message type");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate reply message request
   */
  static validateReplyMessage(data: ReplyMessageRequest): ValidationResult {
    const errors: string[] = [];

    // Validate conversation ID
    if (!data.conversationId || typeof data.conversationId !== "string") {
      errors.push("Conversation ID is required");
    }

    // Validate message ID
    if (!data.messageId || typeof data.messageId !== "string") {
      errors.push("Message ID is required");
    }

    // Validate text
    if (
      !data.text ||
      typeof data.text !== "string" ||
      data.text.trim().length === 0
    ) {
      errors.push("Message text is required");
    }

    // Validate text length
    if (data.text && data.text.length > 1000) {
      errors.push("Message text cannot exceed 1000 characters");
    }

    // Validate media URLs
    if (data.mediaUrls && !Array.isArray(data.mediaUrls)) {
      errors.push("Media URLs must be an array");
    }

    if (data.mediaUrls && data.mediaUrls.length > 10) {
      errors.push("Cannot attach more than 10 media files");
    }

    // Validate message type
    if (
      data.messageType &&
      !Object.values(MessageType).includes(data.messageType)
    ) {
      errors.push("Invalid message type");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
