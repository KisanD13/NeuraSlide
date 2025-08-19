// backend/src/crystal/campaigns/campaignRouter.ts

import express from "express";
import { CampaignController } from "./campaignController";
import { authenticate } from "../../middlewares/authenticate";

const campaignRouter = express.Router();
campaignRouter.use(authenticate);

// Campaign CRUD
campaignRouter.post("/", CampaignController.createCampaign);
campaignRouter.get("/", CampaignController.listCampaigns);
campaignRouter.get("/:id", CampaignController.getCampaign);
campaignRouter.put("/:id", CampaignController.updateCampaign);

// Campaign Analytics
campaignRouter.get("/:id/analytics", CampaignController.getCampaignAnalytics);

// FAQ Management
campaignRouter.post("/:campaignId/faqs", CampaignController.createFAQ);
campaignRouter.put("/:campaignId/faqs/:faqId", CampaignController.updateFAQ);
campaignRouter.get("/:campaignId/faqs", CampaignController.searchFAQs);

// Message Processing
campaignRouter.post("/:campaignId/process", CampaignController.processMessage);

export default campaignRouter;
