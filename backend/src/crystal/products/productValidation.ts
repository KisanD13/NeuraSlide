// backend/src/crystal/products/productValidation.ts

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export class ProductValidation {
  // ========================================
  // PRODUCT CRUD VALIDATION
  // ========================================

  static validateCreateProduct(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== "string") {
      errors.push("Product name is required and must be a string");
    } else if (data.name.trim().length < 2) {
      errors.push("Product name must be at least 2 characters long");
    } else if (data.name.trim().length > 100) {
      errors.push("Product name cannot exceed 100 characters");
    }

    if (!data.description || typeof data.description !== "string") {
      errors.push("Product description is required and must be a string");
    } else if (data.description.trim().length < 10) {
      errors.push("Product description must be at least 10 characters long");
    } else if (data.description.trim().length > 1000) {
      errors.push("Product description cannot exceed 1000 characters");
    }

    if (!data.category || typeof data.category !== "string") {
      errors.push("Product category is required and must be a string");
    } else if (data.category.trim().length < 2) {
      errors.push("Product category must be at least 2 characters long");
    }

    if (typeof data.price !== "number" || data.price < 0) {
      errors.push("Product price must be a positive number");
    }

    if (data.currency && typeof data.currency !== "string") {
      errors.push("Currency must be a string");
    }

    if (data.images && !Array.isArray(data.images)) {
      errors.push("Images must be an array");
    } else if (data.images && data.images.length > 10) {
      errors.push("Cannot have more than 10 images per product");
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else if (data.tags && data.tags.length > 20) {
      errors.push("Cannot have more than 20 tags per product");
    }

    if (data.specifications && typeof data.specifications !== "object") {
      errors.push("Specifications must be an object");
    }

    if (
      data.availability &&
      !["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "DISCONTINUED"].includes(
        data.availability
      )
    ) {
      errors.push(
        "Availability must be one of: IN_STOCK, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED"
      );
    }

    if (data.metadata && typeof data.metadata !== "object") {
      errors.push("Metadata must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateProduct(data: any): ValidationResult {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (typeof data.name !== "string") {
        errors.push("Product name must be a string");
      } else if (data.name.trim().length < 2) {
        errors.push("Product name must be at least 2 characters long");
      } else if (data.name.trim().length > 100) {
        errors.push("Product name cannot exceed 100 characters");
      }
    }

    if (data.description !== undefined) {
      if (typeof data.description !== "string") {
        errors.push("Product description must be a string");
      } else if (data.description.trim().length < 10) {
        errors.push("Product description must be at least 10 characters long");
      } else if (data.description.trim().length > 1000) {
        errors.push("Product description cannot exceed 1000 characters");
      }
    }

    if (data.category !== undefined) {
      if (typeof data.category !== "string") {
        errors.push("Product category must be a string");
      } else if (data.category.trim().length < 2) {
        errors.push("Product category must be at least 2 characters long");
      }
    }

    if (data.price !== undefined) {
      if (typeof data.price !== "number" || data.price < 0) {
        errors.push("Product price must be a positive number");
      }
    }

    if (data.currency !== undefined && typeof data.currency !== "string") {
      errors.push("Currency must be a string");
    }

    if (data.images !== undefined) {
      if (!Array.isArray(data.images)) {
        errors.push("Images must be an array");
      } else if (data.images.length > 10) {
        errors.push("Cannot have more than 10 images per product");
      }
    }

    if (data.tags !== undefined) {
      if (!Array.isArray(data.tags)) {
        errors.push("Tags must be an array");
      } else if (data.tags.length > 20) {
        errors.push("Cannot have more than 20 tags per product");
      }
    }

    if (
      data.specifications !== undefined &&
      typeof data.specifications !== "object"
    ) {
      errors.push("Specifications must be an object");
    }

    if (
      data.availability !== undefined &&
      !["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "DISCONTINUED"].includes(
        data.availability
      )
    ) {
      errors.push(
        "Availability must be one of: IN_STOCK, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED"
      );
    }

    if (data.metadata !== undefined && typeof data.metadata !== "object") {
      errors.push("Metadata must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateListRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (
      data.page !== undefined &&
      (typeof data.page !== "number" || data.page < 1)
    ) {
      errors.push("Page must be a positive number");
    }

    if (
      data.limit !== undefined &&
      (typeof data.limit !== "number" || data.limit < 1 || data.limit > 100)
    ) {
      errors.push("Limit must be a number between 1 and 100");
    }

    if (data.category !== undefined && typeof data.category !== "string") {
      errors.push("Category must be a string");
    }

    if (data.search !== undefined && typeof data.search !== "string") {
      errors.push("Search must be a string");
    }

    if (
      data.availability !== undefined &&
      !["IN_STOCK", "OUT_OF_STOCK", "PRE_ORDER", "DISCONTINUED"].includes(
        data.availability
      )
    ) {
      errors.push(
        "Availability must be one of: IN_STOCK, OUT_OF_STOCK, PRE_ORDER, DISCONTINUED"
      );
    }

    if (data.tags !== undefined && !Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // RAG SEARCH VALIDATION
  // ========================================

  static validateRAGSearch(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.query || typeof data.query !== "string") {
      errors.push("Search query is required and must be a string");
    } else if (data.query.trim().length < 2) {
      errors.push("Search query must be at least 2 characters long");
    } else if (data.query.trim().length > 200) {
      errors.push("Search query cannot exceed 200 characters");
    }

    if (data.category !== undefined && typeof data.category !== "string") {
      errors.push("Category filter must be a string");
    }

    if (
      data.limit !== undefined &&
      (typeof data.limit !== "number" || data.limit < 1 || data.limit > 50)
    ) {
      errors.push("Limit must be a number between 1 and 50");
    }

    if (
      data.includeSpecifications !== undefined &&
      typeof data.includeSpecifications !== "boolean"
    ) {
      errors.push("Include specifications must be a boolean");
    }

    if (data.filters !== undefined && typeof data.filters !== "object") {
      errors.push("Filters must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // CATEGORY VALIDATION
  // ========================================

  static validateCreateCategory(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== "string") {
      errors.push("Category name is required and must be a string");
    } else if (data.name.trim().length < 2) {
      errors.push("Category name must be at least 2 characters long");
    } else if (data.name.trim().length > 50) {
      errors.push("Category name cannot exceed 50 characters");
    }

    if (
      data.description !== undefined &&
      typeof data.description !== "string"
    ) {
      errors.push("Category description must be a string");
    } else if (data.description && data.description.trim().length > 200) {
      errors.push("Category description cannot exceed 200 characters");
    }

    if (
      data.parentCategoryId !== undefined &&
      typeof data.parentCategoryId !== "string"
    ) {
      errors.push("Parent category ID must be a string");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // BULK IMPORT VALIDATION
  // ========================================

  static validateBulkImport(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.products || !Array.isArray(data.products)) {
      errors.push("Products must be an array");
    } else if (data.products.length === 0) {
      errors.push("Products array cannot be empty");
    } else if (data.products.length > 1000) {
      errors.push("Cannot import more than 1000 products at once");
    } else {
      // Validate each product in the array
      data.products.forEach((product: any, index: number) => {
        const productValidation = this.validateCreateProduct(product);
        if (!productValidation.isValid) {
          errors.push(
            `Product ${index + 1}: ${productValidation.errors.join(", ")}`
          );
        }
      });
    }

    if (
      data.updateExisting !== undefined &&
      typeof data.updateExisting !== "boolean"
    ) {
      errors.push("Update existing must be a boolean");
    }

    if (
      data.categoryMapping !== undefined &&
      typeof data.categoryMapping !== "object"
    ) {
      errors.push("Category mapping must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ========================================
  // ID VALIDATION
  // ========================================

  static validateId(id: string): ValidationResult {
    const errors: string[] = [];

    if (!id || typeof id !== "string") {
      errors.push("ID is required and must be a string");
    }

    if (id && id.trim().length === 0) {
      errors.push("ID cannot be empty");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
