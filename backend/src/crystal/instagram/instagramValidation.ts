// backend/src/crystal/instagram/instagramValidation.ts

import {
  ConnectInstagramRequest,
  RefreshTokenRequest,
  InstagramOAuthCallback,
} from "./instagramTypes";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InstagramValidation {
  /**
   * Validate Instagram OAuth callback data
   */
  static validateOAuthCallback(data: InstagramOAuthCallback): ValidationResult {
    const errors: string[] = [];

    // Validate code
    if (
      !data.code ||
      typeof data.code !== "string" ||
      data.code.trim().length === 0
    ) {
      errors.push("Authorization code is required");
    }

    // Validate state (CSRF protection)
    if (
      !data.state ||
      typeof data.state !== "string" ||
      data.state.trim().length === 0
    ) {
      errors.push("State parameter is required for security");
    }

    // Check for minimum code length (Instagram codes are typically long)
    if (data.code && data.code.length < 10) {
      errors.push("Invalid authorization code format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Instagram connection request
   */
  static validateConnectInstagram(
    data: ConnectInstagramRequest
  ): ValidationResult {
    const errors: string[] = [];

    // Validate code
    if (
      !data.code ||
      typeof data.code !== "string" ||
      data.code.trim().length === 0
    ) {
      errors.push("Authorization code is required");
    }

    // Validate state
    if (
      !data.state ||
      typeof data.state !== "string" ||
      data.state.trim().length === 0
    ) {
      errors.push("State parameter is required");
    }

    // Additional format validation
    if (data.code && (data.code.length < 10 || data.code.length > 500)) {
      errors.push("Authorization code format is invalid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate refresh token request
   */
  static validateRefreshToken(data: RefreshTokenRequest): ValidationResult {
    const errors: string[] = [];

    // Validate account ID
    if (
      !data.accountId ||
      typeof data.accountId !== "string" ||
      data.accountId.trim().length === 0
    ) {
      errors.push("Account ID is required");
    }

    // Validate ID format (MongoDB ObjectId or UUID)
    if (data.accountId) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(data.accountId);
      const isValidUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          data.accountId
        );

      if (!isValidObjectId && !isValidUUID) {
        errors.push("Invalid account ID format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Instagram username format
   */
  static validateInstagramUsername(username: string): ValidationResult {
    const errors: string[] = [];

    if (!username || typeof username !== "string") {
      errors.push("Username is required");
      return { isValid: false, errors };
    }

    const trimmedUsername = username.trim();

    // Instagram username rules
    if (trimmedUsername.length === 0) {
      errors.push("Username cannot be empty");
    } else if (trimmedUsername.length > 30) {
      errors.push("Username cannot exceed 30 characters");
    } else if (!/^[a-zA-Z0-9_.]+$/.test(trimmedUsername)) {
      errors.push(
        "Username can only contain letters, numbers, periods, and underscores"
      );
    } else if (
      trimmedUsername.startsWith(".") ||
      trimmedUsername.endsWith(".")
    ) {
      errors.push("Username cannot start or end with a period");
    } else if (trimmedUsername.includes("..")) {
      errors.push("Username cannot contain consecutive periods");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Instagram account ID format
   */
  static validateInstagramId(instagramId: string): ValidationResult {
    const errors: string[] = [];

    if (!instagramId || typeof instagramId !== "string") {
      errors.push("Instagram ID is required");
      return { isValid: false, errors };
    }

    const trimmedId = instagramId.trim();

    // Instagram user IDs are numeric strings
    if (trimmedId.length === 0) {
      errors.push("Instagram ID cannot be empty");
    } else if (!/^\d+$/.test(trimmedId)) {
      errors.push("Instagram ID must be a numeric string");
    } else if (trimmedId.length < 5 || trimmedId.length > 20) {
      errors.push("Instagram ID format is invalid");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate access token format
   */
  static validateAccessToken(token: string): ValidationResult {
    const errors: string[] = [];

    if (!token || typeof token !== "string") {
      errors.push("Access token is required");
      return { isValid: false, errors };
    }

    const trimmedToken = token.trim();

    if (trimmedToken.length === 0) {
      errors.push("Access token cannot be empty");
    } else if (trimmedToken.length < 50) {
      errors.push("Access token format appears invalid");
    } else if (!/^[a-zA-Z0-9_-]+$/.test(trimmedToken)) {
      errors.push("Access token contains invalid characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate webhook verification
   */
  static validateWebhookVerification(data: {
    mode?: string;
    challenge?: string;
    verify_token?: string;
  }): ValidationResult {
    const errors: string[] = [];

    if (!data.mode || data.mode !== "subscribe") {
      errors.push("Invalid webhook mode");
    }

    if (!data.challenge || typeof data.challenge !== "string") {
      errors.push("Webhook challenge is required");
    }

    if (!data.verify_token || typeof data.verify_token !== "string") {
      errors.push("Webhook verify token is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate webhook payload
   */
  static validateWebhookPayload(payload: any): ValidationResult {
    const errors: string[] = [];

    if (!payload || typeof payload !== "object") {
      errors.push("Invalid webhook payload");
      return { isValid: false, errors };
    }

    if (payload.object !== "instagram") {
      errors.push("Invalid webhook object type");
    }

    if (!Array.isArray(payload.entry)) {
      errors.push("Webhook entry must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Validation error messages specific to Instagram
export const instagramValidationErrors = {
  invalidCode: "Authorization code is invalid or expired",
  invalidState: "Security state parameter is invalid",
  invalidToken: "Access token is invalid or expired",
  invalidUsername: "Instagram username format is invalid",
  invalidInstagramId: "Instagram user ID format is invalid",
  connectionFailed: "Failed to connect Instagram account",
  webhookValidationFailed: "Webhook validation failed",
  tokenRefreshFailed: "Failed to refresh access token",
  accountNotFound: "Instagram account not found",
  accountAlreadyConnected: "Instagram account is already connected",
  insufficientPermissions: "Insufficient Instagram permissions",
  rateLimitExceeded: "Instagram API rate limit exceeded",
  temporaryError: "Temporary Instagram API error, please try again",
} as const;
