// backend/src/crystal/campaigns/campaignController.ts

import { Request, Response, NextFunction } from "express";
import { CampaignService } from "./campaignService";
import { CampaignValidation } from "./campaignValidation";
import { logger } from "../../utils/logger";

export class CampaignController {
  /**
   * Create campaign
   */
  static async createCampaign(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const validation = CampaignValidation.validateCreateCampaign(req.body);

      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const campaign = await CampaignService.createCampaign(userId, req.body);

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Create Campaign Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get campaign by ID
   */
  static async getCampaign(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["id"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const validation = CampaignValidation.validateId(campaignId);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const result = await CampaignService.getCampaign(userId, campaignId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Get Campaign Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update campaign
   */
  static async updateCampaign(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["id"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const validation = CampaignValidation.validateId(campaignId);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const updateValidation = CampaignValidation.validateUpdateCampaign(
        req.body
      );
      if (!updateValidation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: updateValidation.errors,
        });
        return;
      }

      const campaign = await CampaignService.updateCampaign(
        userId,
        campaignId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Update Campaign Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * List campaigns
   */
  static async listCampaigns(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const status = req.query["status"] as string;
      const type = req.query["type"] as string;
      const isActive = req.query["isActive"] as string;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const request: any = {
        status,
        type,
        isActive: isActive ? isActive === "true" : undefined,
        limit,
        offset,
      };

      const result = await CampaignService.listCampaigns(userId, request);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - List Campaigns Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Create FAQ
   */
  static async createFAQ(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["campaignId"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const validation = CampaignValidation.validateCreateFAQ(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const faq = await CampaignService.createFAQ(userId, campaignId, req.body);

      res.status(201).json({
        success: true,
        data: faq,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Create FAQ Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Update FAQ
   */
  static async updateFAQ(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["campaignId"];
      const faqId = req.params["faqId"];

      if (!campaignId || !faqId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID and FAQ ID are required",
        });
        return;
      }

      const validation = CampaignValidation.validateUpdateFAQ(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const faq = await CampaignService.updateFAQ(
        userId,
        campaignId,
        faqId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: faq,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Update FAQ Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Search FAQs
   */
  static async searchFAQs(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["campaignId"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const query = req.query["query"] as string;
      const category = req.query["category"] as string;
      const tags = req.query["tags"] as string;
      const priority = req.query["priority"] as string;
      const isActive = req.query["isActive"] as string;
      const limit = parseInt(req.query["limit"] as string) || 10;
      const offset = parseInt(req.query["offset"] as string) || 0;

      const request: any = {
        query,
        category,
        tags: tags ? tags.split(",") : [],
        priority,
        isActive: isActive ? isActive === "true" : undefined,
        limit,
        offset,
      };

      const result = await CampaignService.searchFAQs(
        userId,
        campaignId,
        request
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Search FAQs Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Process message
   */
  static async processMessage(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["campaignId"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const validation = CampaignValidation.validateProcessMessage(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      const result = await CampaignService.processMessage(
        userId,
        campaignId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Process Message Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * Get campaign analytics
   */
  static async getCampaignAnalytics(
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.sub;
      const campaignId = req.params["id"];

      if (!campaignId) {
        res.status(400).json({
          success: false,
          message: "Campaign ID is required",
        });
        return;
      }

      const validation = CampaignValidation.validateId(campaignId);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        });
        return;
      }

      // Verify campaign belongs to user
      await CampaignService.getCampaign(userId, campaignId);
      const analytics = await CampaignService.getCampaignAnalytics(campaignId);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      logger.error("Campaign Controller - Get Analytics Error:", error);

      if (error.status) {
        res.status(error.status).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
