// backend/src/crystal/conversations/conversationRouter.ts

import express from "express";
import { ConversationController } from "./conversationController";
import { authenticate } from "../../middlewares/authenticate";

const conversationRouter = express.Router();

// Apply authentication middleware to all routes
conversationRouter.use(authenticate);

// Get conversations list with filters
conversationRouter.get("/", ConversationController.getConversations);

// Get conversation statistics
conversationRouter.get("/stats", ConversationController.getConversationStats);

// Get conversation by ID
conversationRouter.get("/:id", ConversationController.getConversation);

// Get messages in a conversation
conversationRouter.get("/:id/messages", ConversationController.getMessages);

// Send a message in a conversation
conversationRouter.post("/:id/send", ConversationController.sendMessage);

// Reply to a specific message
conversationRouter.post("/:id/reply", ConversationController.replyToMessage);

// Update conversation status
conversationRouter.patch(
  "/:id/status",
  ConversationController.updateConversationStatus
);

// Add tags to conversation
conversationRouter.post(
  "/:id/tags",
  ConversationController.addTagsToConversation
);

export default conversationRouter;
