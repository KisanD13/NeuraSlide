// backend/src/nexus/admin/adminRouter.ts

import { Router } from "express";
import { AdminController } from "./adminController";

const router = Router();

// ========================================
// USER MANAGEMENT ROUTES
// ========================================

// Get all users with pagination and filters
router.get("/users", AdminController.getUsers);

// Get specific user by ID
router.get("/users/:id", AdminController.getUser);

// Update user
router.put("/users/:id", AdminController.updateUser);

// ========================================
// SYSTEM MONITORING ROUTES
// ========================================

// Get system metrics
router.get("/metrics", AdminController.getSystemMetrics);

// Get system health
router.get("/health", AdminController.getSystemHealth);

// ========================================
// ADMIN ACTIONS ROUTES
// ========================================

// Perform admin action
router.post("/actions", AdminController.performAdminAction);

// Get admin actions with filters
router.get("/actions", AdminController.getAdminActions);

// ========================================
// BULK OPERATIONS ROUTES
// ========================================

// Perform bulk operation
router.post("/bulk-operations", AdminController.performBulkOperation);

// Get bulk operation status
router.get("/bulk-operations/:operationId", AdminController.getBulkOperationStatus);

// ========================================
// PLATFORM SETTINGS ROUTES
// ========================================

// Get platform settings
router.get("/settings", AdminController.getSettings);

// Update platform settings
router.put("/settings", AdminController.updateSettings);

export default router;
