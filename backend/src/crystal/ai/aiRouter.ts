// backend/src/crystal/ai/aiRouter.ts

import express from "express";
import { AIController } from "./aiController";
import { authenticate } from "../../middlewares/authenticate";

const aiRouter = express.Router();
aiRouter.use(authenticate);

// AI Response Generation
aiRouter.post("/generate", AIController.generateResponse);

// AI Conversations
aiRouter.post("/conversations", AIController.createConversation);
aiRouter.get("/conversations", AIController.searchConversations);
aiRouter.get("/conversations/:id", AIController.getConversation);
aiRouter.put("/conversations/:id", AIController.updateConversation);

// AI Messages
aiRouter.post("/messages", AIController.addMessage);

// AI Training Data
aiRouter.post("/training", AIController.addTrainingData);

// AI Performance
aiRouter.get("/performance", AIController.getPerformance);

export default aiRouter;
