// backend/src/crystal/instagram/instagramRouter.ts

import express from "express";
import { InstagramController } from "./instagramController";
import { InstagramDMController } from "./instagramDMController";
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

// Instagram comment management routes
instagramRouter.post(
  "/comments/:commentId/reply",
  InstagramController.replyToComment
);
instagramRouter.get(
  "/comments/:commentId",
  InstagramController.getCommentDetails
);

// Instagram DM management routes (LinkDM features)
instagramRouter.post("/dm/send", InstagramDMController.sendDM);
instagramRouter.get(
  "/dm/conversations",
  InstagramDMController.getConversations
);
instagramRouter.get(
  "/dm/conversation/:userId",
  InstagramDMController.getConversation
);

export default instagramRouter;
