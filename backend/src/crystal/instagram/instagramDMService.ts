// backend/src/crystal/instagram/instagramDMService.ts

import createHttpError from "http-errors";
import { logger } from "../../utils/logger";
import { prisma } from "../../config/db";

export class InstagramDMService {
  /**
   * Send DM to Instagram user
   */
  static async sendDM(
    accountId: string,
    recipientId: string,
    message: string
  ): Promise<any> {
    try {
      logger.info(
        `Sending DM to ${recipientId} from account ${accountId}: ${message}`
      );

      // Get the Instagram account
      const account = await prisma.instagramAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw createHttpError(404, "Instagram account not found");
      }

      if (!account.isActive) {
        throw createHttpError(400, "Instagram account is not active");
      }

      // Send DM using Instagram Graph API
      const url = `https://graph.facebook.com/v23.0/me/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: account.accessToken,
        }),
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        logger.error("Failed to send DM:", data);
        throw createHttpError(
          400,
          `Failed to send DM: ${data.error?.message || "Unknown error"}`
        );
      }

      logger.info(`Successfully sent DM to ${recipientId}: ${message}`);
      logger.info(`DM response:`, data);

      return data;
    } catch (error: any) {
      logger.error("Error sending DM:", error);
      throw createHttpError(500, "Unable to send DM");
    }
  }

  /**
   * Get conversation with Instagram user
   */
  static async getConversation(
    accountId: string,
    userId: string
  ): Promise<any> {
    try {
      // Get the Instagram account
      const account = await prisma.instagramAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw createHttpError(404, "Instagram account not found");
      }

      // Get conversation using Instagram Graph API
      const url = `https://graph.facebook.com/v23.0/me/conversations?user_id=${userId}&access_token=${account.accessToken}`;

      const response = await fetch(url);
      const data = (await response.json()) as any;

      if (!response.ok) {
        logger.error("Failed to get conversation:", data);
        throw createHttpError(
          400,
          `Failed to get conversation: ${
            data.error?.message || "Unknown error"
          }`
        );
      }

      return data;
    } catch (error: any) {
      logger.error("Error getting conversation:", error);
      throw createHttpError(500, "Unable to get conversation");
    }
  }

  /**
   * Get all conversations for Instagram account
   */
  static async getConversations(accountId: string): Promise<any> {
    try {
      // Get the Instagram account
      const account = await prisma.instagramAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw createHttpError(404, "Instagram account not found");
      }

      // Get conversations using Instagram Graph API
      const url = `https://graph.facebook.com/v23.0/me/conversations?access_token=${account.accessToken}`;

      const response = await fetch(url);
      const data = (await response.json()) as any;

      if (!response.ok) {
        logger.error("Failed to get conversations:", data);
        throw createHttpError(
          400,
          `Failed to get conversations: ${
            data.error?.message || "Unknown error"
          }`
        );
      }

      return data;
    } catch (error: any) {
      logger.error("Error getting conversations:", error);
      throw createHttpError(500, "Unable to get conversations");
    }
  }

  /**
   * Send DM with link (LinkDM feature)
   */
  static async sendDMWithLink(
    accountId: string,
    recipientId: string,
    message: string,
    link: string
  ): Promise<any> {
    try {
      // Create message with link
      const messageWithLink = `${message}\n\n🔗 ${link}`;

      return await this.sendDM(accountId, recipientId, messageWithLink);
    } catch (error: any) {
      logger.error("Error sending DM with link:", error);
      throw error;
    }
  }
}
