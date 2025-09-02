// backend/src/crystal/instagram/instagramRouter.ts

import express from "express";
import { InstagramController } from "./instagramController";
import { authenticate } from "../../middlewares/authenticate";

const instagramRouter = express.Router();

// Public Instagram OAuth routes (no auth required)
instagramRouter.get(
  "/oauth-url",
  authenticate,
  InstagramController.getOAuthUrl
);
instagramRouter.get("/callback", InstagramController.handleOAuthCallback);

// Protected Instagram routes (auth required)
instagramRouter.use(authenticate);

// Instagram routes (all authenticated)
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
