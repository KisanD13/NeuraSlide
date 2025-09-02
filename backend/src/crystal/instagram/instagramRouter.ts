// backend/src/crystal/instagram/instagramRouter.ts

import express from "express";
import { InstagramController } from "./instagramController";
import { authenticate } from "../../middlewares/authenticate";

const instagramRouter = express.Router();

// Public Instagram OAuth routes (no auth required)
instagramRouter.get("/oauth-url", InstagramController.getOAuthUrl);
instagramRouter.get("/callback", InstagramController.handleOAuthCallback);

// Protected Instagram routes (auth required)
instagramRouter.post(
  "/connect",
  authenticate,
  InstagramController.connectAccount
);

// Instagram account management routes
instagramRouter.get(
  "/accounts",
  authenticate,
  InstagramController.getConnectedAccounts
);
instagramRouter.get(
  "/accounts/:accountId",
  authenticate,
  InstagramController.getAccountDetails
);
instagramRouter.delete(
  "/accounts/:accountId",
  authenticate,
  InstagramController.disconnectAccount
);

// Instagram token management routes
instagramRouter.post(
  "/accounts/:accountId/refresh-token",
  authenticate,
  InstagramController.refreshAccountToken
);

// Instagram utility routes
instagramRouter.get(
  "/test-connection/:accountId",
  authenticate,
  InstagramController.testConnection
);

export default instagramRouter;
