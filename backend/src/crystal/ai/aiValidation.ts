// backend/src/crystal/ai/aiValidation.ts

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class AIValidation {
  static validateGenerateResponse(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.message || typeof data.message !== "string") {
      errors.push("Message is required and must be a string");
    }

    if (data.message && data.message.trim().length === 0) {
      errors.push("Message cannot be empty");
    }

    if (data.message && data.message.length > 1000) {
      errors.push("Message cannot exceed 1000 characters");
    }

    if (data.temperature !== undefined) {
      if (typeof data.temperature !== "number") {
        errors.push("Temperature must be a number");
      } else if (data.temperature < 0 || data.temperature > 2) {
        errors.push("Temperature must be between 0 and 2");
      }
    }

    if (data.maxTokens !== undefined) {
      if (typeof data.maxTokens !== "number") {
        errors.push("Max tokens must be a number");
      } else if (data.maxTokens < 1 || data.maxTokens > 4000) {
        errors.push("Max tokens must be between 1 and 4000");
      }
    }

    if (data.model && typeof data.model !== "string") {
      errors.push("Model must be a string");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateCreateConversation(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.title || typeof data.title !== "string") {
      errors.push("Title is required and must be a string");
    }

    if (data.title && data.title.trim().length === 0) {
      errors.push("Title cannot be empty");
    }

    if (data.title && data.title.length > 100) {
      errors.push("Title cannot exceed 100 characters");
    }

    if (data.initialMessage && typeof data.initialMessage !== "string") {
      errors.push("Initial message must be a string");
    }

    if (data.initialMessage && data.initialMessage.length > 1000) {
      errors.push("Initial message cannot exceed 1000 characters");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (typeof tag !== "string") {
          errors.push("All tags must be strings");
          break;
        }
        if (tag.length > 50) {
          errors.push("Tag length cannot exceed 50 characters");
          break;
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateUpdateConversation(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.title !== undefined) {
      if (typeof data.title !== "string") {
        errors.push("Title must be a string");
      } else if (data.title.trim().length === 0) {
        errors.push("Title cannot be empty");
      } else if (data.title.length > 100) {
        errors.push("Title cannot exceed 100 characters");
      }
    }

    if (data.summary !== undefined && typeof data.summary !== "string") {
      errors.push("Summary must be a string");
    }

    if (data.summary && data.summary.length > 500) {
      errors.push("Summary cannot exceed 500 characters");
    }

    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (typeof tag !== "string") {
          errors.push("All tags must be strings");
          break;
        }
        if (tag.length > 50) {
          errors.push("Tag length cannot exceed 50 characters");
          break;
        }
      }
    }

    if (data.isActive !== undefined && typeof data.isActive !== "boolean") {
      errors.push("Is active must be a boolean");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateAddMessage(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.conversationId || typeof data.conversationId !== "string") {
      errors.push("Conversation ID is required and must be a string");
    }

    if (!data.content || typeof data.content !== "string") {
      errors.push("Content is required and must be a string");
    }

    if (data.content && data.content.trim().length === 0) {
      errors.push("Content cannot be empty");
    }

    if (data.content && data.content.length > 1000) {
      errors.push("Content cannot exceed 1000 characters");
    }

    if (!data.role || !["user", "assistant", "system"].includes(data.role)) {
      errors.push("Role must be one of: user, assistant, system");
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateAddTrainingData(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.input || typeof data.input !== "string") {
      errors.push("Input is required and must be a string");
    }

    if (data.input && data.input.trim().length === 0) {
      errors.push("Input cannot be empty");
    }

    if (data.input && data.input.length > 1000) {
      errors.push("Input cannot exceed 1000 characters");
    }

    if (!data.expectedOutput || typeof data.expectedOutput !== "string") {
      errors.push("Expected output is required and must be a string");
    }

    if (data.expectedOutput && data.expectedOutput.trim().length === 0) {
      errors.push("Expected output cannot be empty");
    }

    if (data.expectedOutput && data.expectedOutput.length > 1000) {
      errors.push("Expected output cannot exceed 1000 characters");
    }

    if (!data.category || typeof data.category !== "string") {
      errors.push("Category is required and must be a string");
    }

    if (data.category && data.category.trim().length === 0) {
      errors.push("Category cannot be empty");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    if (data.tags && Array.isArray(data.tags)) {
      for (const tag of data.tags) {
        if (typeof tag !== "string") {
          errors.push("All tags must be strings");
          break;
        }
        if (tag.length > 50) {
          errors.push("Tag length cannot exceed 50 characters");
          break;
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateId(id: string): ValidationResult {
    const errors: string[] = [];
    if (!id || typeof id !== "string") {
      errors.push("ID is required and must be a string");
    }
    if (id && id.trim().length === 0) {
      errors.push("ID cannot be empty");
    }
    return { isValid: errors.length === 0, errors };
  }
}
