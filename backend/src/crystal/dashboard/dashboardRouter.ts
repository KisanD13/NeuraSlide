import { Router } from "express";
import { DashboardController } from "./dashboardController";
import { authenticate } from "../../middlewares/authenticate";

const router = Router();
const dashboardController = new DashboardController();

// Apply authentication middleware to all dashboard routes
router.use(authenticate);

// Main dashboard endpoint - returns all dashboard data
router.get("/", dashboardController.getDashboard.bind(dashboardController));

// Individual dashboard sections
router.get(
  "/overview",
  dashboardController.getOverview.bind(dashboardController)
);

router.get(
  "/recent-activity",
  dashboardController.getRecentActivity.bind(dashboardController)
);

router.get(
  "/performance",
  dashboardController.getPerformance.bind(dashboardController)
);

router.get(
  "/system-health",
  dashboardController.getSystemHealth.bind(dashboardController)
);

router.get(
  "/quick-actions",
  dashboardController.getQuickActions.bind(dashboardController)
);

export default router;
