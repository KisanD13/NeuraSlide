// backend/src/crystal/instagram/instagramRouter.ts

import express from "express";
import { InstagramController } from "./instagramController";
import { authenticate } from "../../middlewares/authenticate";

const instagramRouter = express.Router();

// Apply authentication middleware to all Instagram routes
instagramRouter.use(authenticate);

// Instagram OAuth routes
instagramRouter.get("/oauth-url", InstagramController.getOAuthUrl);
instagramRouter.get("/callback", InstagramController.handleOAuthCallback);
instagramRouter.post("/connect", InstagramController.connectAccount);

// Instagram account management routes
instagramRouter.get("/accounts", InstagramController.getConnectedAccounts);
instagramRouter.get(
  "/accounts/:accountId",
  InstagramController.getAccountDetails
);
instagramRouter.delete(
  "/accounts/:accountId",
  InstagramController.disconnectAccount
);

// Instagram token management routes
instagramRouter.post(
  "/accounts/:accountId/refresh-token",
  InstagramController.refreshAccountToken
);

// Instagram utility routes
instagramRouter.get(
  "/test-connection/:accountId",
  InstagramController.testConnection
);

export default instagramRouter;
