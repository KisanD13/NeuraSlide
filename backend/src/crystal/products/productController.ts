// backend/src/crystal/products/productController.ts

import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { ProductService } from "./productService";
import { ProductValidation } from "./productValidation";
import { logger } from "../../utils/logger";

export class ProductController {
  // ========================================
  // CRUD OPERATIONS
  // ========================================

  // Create new product
  static async createProduct(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = ProductValidation.validateCreateProduct(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const product = await ProductService.createProduct(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error creating product:", error);
      throw createHttpError(500, "Unable to create product. Please try again.");
    }
  }

  // Get all products for user
  static async getProducts(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const page = parseInt(req.query["page"] as string) || 1;
      const limit = parseInt(req.query["limit"] as string) || 20;
      const category = req.query["category"] as string;
      const search = req.query["search"] as string;
      const availability = req.query["availability"] as string;
      const tags = req.query["tags"] as string;

      const filters = {
        page,
        limit,
        category,
        search,
        availability: availability as any,
        tags: tags ? tags.split(",") : [],
      };

      const validationResult = ProductValidation.validateListRequest(filters);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const result = await ProductService.getProducts(userId, filters);

      res.status(200).json({
        success: true,
        message: "Products retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching products:", error);
      throw createHttpError(500, "Unable to fetch products. Please try again.");
    }
  }

  // Get single product by ID
  static async getProduct(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const productId = req.params["id"];
      if (!productId) {
        throw createHttpError(400, "Product ID is required");
      }

      const validationResult = ProductValidation.validateId(productId);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const product = await ProductService.getProduct(userId, productId);
      if (!product) {
        throw createHttpError(404, "Product not found");
      }

      res.status(200).json({
        success: true,
        message: "Product retrieved successfully",
        data: product,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching product:", error);
      throw createHttpError(500, "Unable to fetch product. Please try again.");
    }
  }

  // Update product
  static async updateProduct(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const productId = req.params["id"];
      if (!productId) {
        throw createHttpError(400, "Product ID is required");
      }

      const validationResult = ProductValidation.validateUpdateProduct(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const product = await ProductService.updateProduct(
        userId,
        productId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error updating product:", error);
      throw createHttpError(500, "Unable to update product. Please try again.");
    }
  }

  // Delete product
  static async deleteProduct(req: Request, res: Response, _next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const productId = req.params["id"];
      if (!productId) {
        throw createHttpError(400, "Product ID is required");
      }

      const validationResult = ProductValidation.validateId(productId);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      await ProductService.deleteProduct(userId, productId);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error deleting product:", error);
      throw createHttpError(500, "Unable to delete product. Please try again.");
    }
  }

  // ========================================
  // RAG SEARCH OPERATIONS
  // ========================================

  // Search products using RAG
  static async searchProducts(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = ProductValidation.validateRAGSearch(req.body);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const result = await ProductService.searchProducts(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Product search completed successfully",
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error searching products:", error);
      throw createHttpError(
        500,
        "Unable to search products. Please try again."
      );
    }
  }

  // ========================================
  // CATEGORY OPERATIONS
  // ========================================

  // Create product category
  static async createCategory(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = ProductValidation.validateCreateCategory(
        req.body
      );
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const category = await ProductService.createCategory(userId, req.body);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error creating category:", error);
      throw createHttpError(
        500,
        "Unable to create category. Please try again."
      );
    }
  }

  // ========================================
  // ANALYTICS OPERATIONS
  // ========================================

  // Get product analytics
  static async getProductAnalytics(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const analytics = await ProductService.getProductAnalytics(userId);

      res.status(200).json({
        success: true,
        message: "Product analytics retrieved successfully",
        data: analytics,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error fetching product analytics:", error);
      throw createHttpError(
        500,
        "Unable to fetch product analytics. Please try again."
      );
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  // Bulk import products
  static async bulkImportProducts(
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw createHttpError(401, "User not authenticated");
      }

      const validationResult = ProductValidation.validateBulkImport(req.body);
      if (!validationResult.isValid) {
        throw createHttpError(400, validationResult.errors.join(", "));
      }

      const result = await ProductService.bulkImportProducts(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Bulk import completed",
        data: result,
      });
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw createHttpError
      }
      logger.error("Error bulk importing products:", error);
      throw createHttpError(
        500,
        "Unable to import products. Please try again."
      );
    }
  }
}
