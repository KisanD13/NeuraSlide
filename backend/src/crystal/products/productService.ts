// backend/src/crystal/products/productService.ts

import { prisma } from "../../config/db";
import { logger } from "../../utils/logger";
import createHttpError from "http-errors";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductListRequest,
  ProductListResponse,
  RAGSearchRequest,
  RAGSearchResponse,
  RAGSearchResult,
  ProductCategory,
  CreateCategoryRequest,
  ProductAnalytics,
  BulkProductImport,
  BulkImportResult,
} from "./productTypes";

export class ProductService {
  // ========================================
  // CRUD OPERATIONS
  // ========================================

  static async createProduct(
    userId: string,
    data: CreateProductRequest
  ): Promise<Product> {
    try {
      // Check if user has reached product limit
      const userProductCount = await prisma.product.count({
        where: { userId },
      });

      // TODO: Get user's plan limits from subscription
      const maxProducts = 1000; // Default limit
      if (userProductCount >= maxProducts) {
        throw createHttpError(
          403,
          "You have reached your product limit. Upgrade your plan to add more products."
        );
      }

      // Create product in database
      const product = await prisma.product.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          category: data.category,
          price: data.price,
          currency: data.currency || "USD",
          images: data.images || [],
          tags: data.tags || [],
          specifications: data.specifications || {},
          availability: data.availability || "IN_STOCK",
          metadata: data.metadata || {},
        },
      });

      // Transform to our interface
      return this.transformToProduct(product);
    } catch (error: any) {
      logger.error("Create product error:", error);

      if (error.status) {
        throw error;
      }

      throw createHttpError(500, "Failed to create product");
    }
  }

  static async getProducts(
    userId: string,
    filters: ProductListRequest
  ): Promise<ProductListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = { userId };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.availability) {
        where.availability = filters.availability;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { tags: { hasSome: [filters.search] } },
        ];
      }

      if (filters.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags };
      }

      // Get products and count
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.count({ where }),
      ]);

      // Transform products
      const transformedProducts = products.map(this.transformToProduct);

      return {
        products: transformedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Get products error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to fetch products");
    }
  }

  static async getProduct(
    userId: string,
    productId: string
  ): Promise<Product | null> {
    try {
      const product = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!product) {
        return null;
      }

      return this.transformToProduct(product);
    } catch (error: any) {
      logger.error("Get product error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to fetch product");
    }
  }

  static async updateProduct(
    userId: string,
    productId: string,
    data: UpdateProductRequest
  ): Promise<Product> {
    try {
      // Check if product exists and belongs to user
      const existingProduct = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!existingProduct) {
        throw createHttpError(404, "Product not found");
      }

      // Update product
      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.category && { category: data.category }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.currency && { currency: data.currency }),
          ...(data.images && { images: data.images }),
          ...(data.tags && { tags: data.tags }),
          ...(data.specifications && { specifications: data.specifications }),
          ...(data.availability && { availability: data.availability }),
          ...(data.metadata && { metadata: data.metadata }),
        },
      });

      return this.transformToProduct(product);
    } catch (error: any) {
      logger.error("Update product error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to update product");
    }
  }

  static async deleteProduct(userId: string, productId: string): Promise<void> {
    try {
      // Check if product exists and belongs to user
      const product = await prisma.product.findFirst({
        where: { id: productId, userId },
      });

      if (!product) {
        throw createHttpError(404, "Product not found");
      }

      await prisma.product.delete({
        where: { id: productId },
      });
    } catch (error: any) {
      logger.error("Delete product error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to delete product");
    }
  }

  // ========================================
  // RAG SEARCH OPERATIONS
  // ========================================

  static async searchProducts(
    userId: string,
    searchRequest: RAGSearchRequest
  ): Promise<RAGSearchResponse> {
    try {
      const startTime = Date.now();
      const limit = searchRequest.limit || 10;

      // Build search query
      const where: any = { userId };

      if (searchRequest.category) {
        where.category = searchRequest.category;
      }

      // Search in multiple fields
      where.OR = [
        { name: { contains: searchRequest.query, mode: "insensitive" } },
        { description: { contains: searchRequest.query, mode: "insensitive" } },
        { tags: { hasSome: [searchRequest.query] } },
        { category: { contains: searchRequest.query, mode: "insensitive" } },
      ];

      // Add custom filters
      if (searchRequest.filters) {
        Object.entries(searchRequest.filters).forEach(([key, value]) => {
          if (key === "price_min") {
            where.price = { ...where.price, gte: value };
          } else if (key === "price_max") {
            where.price = { ...where.price, lte: value };
          } else if (key === "availability") {
            where.availability = value;
          }
        });
      }

      // Get products
      const products = await prisma.product.findMany({
        where,
        take: limit,
        orderBy: [
          { searchCount: "desc" }, // Prioritize frequently searched products
          { createdAt: "desc" },
        ],
      });

      // Transform to search results with relevance scoring
      const results: RAGSearchResult[] = products.map((product) => {
        const relevanceScore = this.calculateRelevanceScore(
          product,
          searchRequest.query
        );

        return {
          product: this.transformToProduct(product),
          relevanceScore,
          matchedFields: this.getMatchedFields(product, searchRequest.query),
          highlightedText: this.highlightSearchTerms(
            product.description,
            searchRequest.query
          ),
        };
      });

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Generate search suggestions
      const suggestions = this.generateSearchSuggestions(
        searchRequest.query,
        products
      );

      // Update search count for found products
      await this.updateSearchCounts(products.map((p) => p.id));

      const searchTime = Date.now() - startTime;

      return {
        results,
        totalFound: results.length,
        searchTime,
        suggestions,
      };
    } catch (error: any) {
      logger.error("Search products error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to search products");
    }
  }

  // ========================================
  // CATEGORY OPERATIONS
  // ========================================

  static async createCategory(
    userId: string,
    data: CreateCategoryRequest
  ): Promise<ProductCategory> {
    try {
      // Check if category already exists for this user
      const existingCategory = await prisma.product.findFirst({
        where: {
          userId,
          category: data.name,
        },
      });

      if (existingCategory) {
        throw createHttpError(409, "Category already exists");
      }

      // For now, we'll create a placeholder category
      // In a real implementation, you might want a separate Category model
      const category: ProductCategory = {
        id: `category_${Date.now()}`,
        userId,
        name: data.name,
        description: data.description || "",
        parentCategoryId: data.parentCategoryId || "",
        isActive: true,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return category;
    } catch (error: any) {
      logger.error("Create category error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to create category");
    }
  }

  // ========================================
  // ANALYTICS OPERATIONS
  // ========================================

  static async getProductAnalytics(userId: string): Promise<ProductAnalytics> {
    try {
      const [totalProducts, products, topSearchedProducts] = await Promise.all([
        prisma.product.count({ where: { userId } }),
        prisma.product.findMany({ where: { userId } }),
        prisma.product.findMany({
          where: { userId },
          orderBy: { searchCount: "desc" },
          take: 10,
        }),
      ]);

      // Calculate category distribution
      const categoryCounts: Record<string, number> = {};
      products.forEach((product) => {
        categoryCounts[product.category] =
          (categoryCounts[product.category] || 0) + 1;
      });

      const categories = Object.entries(categoryCounts).map(
        ([name, count]) => ({
          name,
          count,
          percentage: (count / totalProducts) * 100,
        })
      );

      // Calculate availability distribution
      const availability = {
        inStock: products.filter((p) => p.availability === "IN_STOCK").length,
        outOfStock: products.filter((p) => p.availability === "OUT_OF_STOCK")
          .length,
        preOrder: products.filter((p) => p.availability === "PRE_ORDER").length,
        discontinued: products.filter((p) => p.availability === "DISCONTINUED")
          .length,
      };

      // Generate search trends (last 7 days)
      const searchTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split("T")[0];
        if (dateString) {
          searchTrends.push({
            date: dateString,
            searches: Math.floor(Math.random() * 50) + 10, // Placeholder data
          });
        }
      }

      return {
        totalProducts,
        categories,
        availability,
        topSearchedProducts: topSearchedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          searchCount: p.searchCount,
        })),
        searchTrends,
      };
    } catch (error: any) {
      logger.error("Get product analytics error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to fetch product analytics");
    }
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  static async bulkImportProducts(
    userId: string,
    importData: BulkProductImport
  ): Promise<BulkImportResult> {
    try {
      const result: BulkImportResult = {
        totalProcessed: importData.products.length,
        successful: 0,
        failed: 0,
        errors: [],
      };

      for (let i = 0; i < importData.products.length; i++) {
        try {
          const productData = importData.products[i];

          if (productData) {
            // Apply category mapping if provided
            if (importData.categoryMapping && productData.category) {
              productData.category =
                importData.categoryMapping[productData.category] ||
                productData.category;
            }

            await this.createProduct(userId, productData);
            result.successful++;
          }
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            error: error.message || "Unknown error",
          });
        }
      }

      return result;
    } catch (error: any) {
      logger.error("Bulk import products error:", error);
      if (error.status) {
        throw error;
      }
      throw createHttpError(500, "Failed to import products");
    }
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  private static transformToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      userId: dbProduct.userId,
      name: dbProduct.name,
      description: dbProduct.description,
      category: dbProduct.category,
      price: dbProduct.price,
      currency: dbProduct.currency,
      images: dbProduct.images || [],
      tags: dbProduct.tags || [],
      specifications: dbProduct.specifications || {},
      availability: dbProduct.availability,
      metadata: dbProduct.metadata || {},
      createdAt: dbProduct.createdAt.toISOString(),
      updatedAt: dbProduct.updatedAt.toISOString(),
    };
  }

  private static calculateRelevanceScore(product: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Name match (highest weight)
    if (product.name.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Description match
    if (product.description.toLowerCase().includes(queryLower)) {
      score += 5;
    }

    // Category match
    if (product.category.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Tag match
    if (
      product.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))
    ) {
      score += 2;
    }

    // Popularity bonus
    score += Math.min(product.searchCount / 10, 5);

    return score;
  }

  private static getMatchedFields(product: any, query: string): string[] {
    const matchedFields: string[] = [];
    const queryLower = query.toLowerCase();

    if (product.name.toLowerCase().includes(queryLower)) {
      matchedFields.push("name");
    }
    if (product.description.toLowerCase().includes(queryLower)) {
      matchedFields.push("description");
    }
    if (product.category.toLowerCase().includes(queryLower)) {
      matchedFields.push("category");
    }
    if (
      product.tags.some((tag: string) => tag.toLowerCase().includes(queryLower))
    ) {
      matchedFields.push("tags");
    }

    return matchedFields;
  }

  private static highlightSearchTerms(text: string, query: string): string {
    // Create case-insensitive regex to highlight all matches
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(regex, "**$1**");
  }

  private static generateSearchSuggestions(
    query: string,
    products: any[]
  ): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();

    // Extract categories from found products
    const categories = [...new Set(products.map((p) => p.category))];
    categories.forEach((category) => {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.push(`Category: ${category}`);
      }
    });

    // Extract tags from found products
    const allTags = products.flatMap((p) => p.tags);
    const uniqueTags = [...new Set(allTags)];
    uniqueTags.slice(0, 5).forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push(`Tag: ${tag}`);
      }
    });

    return suggestions.slice(0, 5);
  }

  private static async updateSearchCounts(productIds: string[]): Promise<void> {
    try {
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { searchCount: { increment: 1 } },
      });
    } catch (error: any) {
      logger.error("Update search counts error:", error);
      // Don't throw error as this is not critical
    }
  }
}
