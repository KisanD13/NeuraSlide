// backend/src/crystal/automations/automationRouter.ts

import express from "express";
import { AutomationController } from "./automationController";
import { authenticate } from "../../middlewares/authenticate";

const automationRouter = express.Router();

// Apply authentication middleware to all routes
automationRouter.use(authenticate);

// CRUD operations for automations
automationRouter.post("/", AutomationController.createAutomation);
automationRouter.get("/", AutomationController.getAutomations);
automationRouter.get("/:id", AutomationController.getAutomation);
automationRouter.put("/:id", AutomationController.updateAutomation);
automationRouter.delete("/:id", AutomationController.deleteAutomation);

// Automation management operations
automationRouter.patch(
  "/:id/toggle",
  AutomationController.toggleAutomationStatus
);
automationRouter.post("/test", AutomationController.testAutomation);
automationRouter.get(
  "/:id/performance",
  AutomationController.getAutomationPerformance
);
automationRouter.get("/stats", AutomationController.getAutomationStats);

export default automationRouter;
