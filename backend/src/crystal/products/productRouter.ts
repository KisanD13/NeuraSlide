// backend/src/crystal/products/productRouter.ts

import express from "express";
import { ProductController } from "./productController";
import { authenticate } from "../../middlewares/authenticate";

const productRouter = express.Router();

// Apply authentication middleware to all routes
productRouter.use(authenticate);

// ========================================
// CRUD OPERATIONS
// ========================================

// Product management routes
productRouter.post("/", ProductController.createProduct);
productRouter.get("/", ProductController.getProducts);
productRouter.get("/:id", ProductController.getProduct);
productRouter.put("/:id", ProductController.updateProduct);
productRouter.delete("/:id", ProductController.deleteProduct);

// ========================================
// RAG SEARCH OPERATIONS
// ========================================

// RAG search route
productRouter.post("/search", ProductController.searchProducts);

// ========================================
// CATEGORY OPERATIONS
// ========================================

// Category management routes
productRouter.post("/categories", ProductController.createCategory);

// ========================================
// ANALYTICS OPERATIONS
// ========================================

// Analytics routes
productRouter.get("/analytics/overview", ProductController.getProductAnalytics);

// ========================================
// BULK OPERATIONS
// ========================================

// Bulk operations routes
productRouter.post("/bulk/import", ProductController.bulkImportProducts);

export default productRouter;
