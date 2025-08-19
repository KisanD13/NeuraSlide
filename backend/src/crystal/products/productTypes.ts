// backend/src/crystal/products/productTypes.ts

// ========================================
// CORE PRODUCT TYPES
// ========================================

export type Product = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: string[];
  tags: string[];
  specifications: Record<string, any>;
  availability: ProductAvailability;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
};

export type ProductAvailability =
  | "IN_STOCK"
  | "OUT_OF_STOCK"
  | "PRE_ORDER"
  | "DISCONTINUED";

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export type CreateProductRequest = {
  name: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, any>;
  availability?: ProductAvailability;
  metadata?: Record<string, any>;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export type ProductListRequest = {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  availability?: ProductAvailability;
  tags?: string[];
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ========================================
// RAG SEARCH TYPES
// ========================================

export type RAGSearchRequest = {
  query: string;
  category?: string;
  limit?: number;
  includeSpecifications?: boolean;
  filters?: Record<string, any>;
};

export type RAGSearchResult = {
  product: Product;
  relevanceScore: number;
  matchedFields: string[];
  highlightedText: string;
};

export type RAGSearchResponse = {
  results: RAGSearchResult[];
  totalFound: number;
  searchTime: number;
  suggestions: string[];
};

// ========================================
// PRODUCT CATEGORY TYPES
// ========================================

export type ProductCategory = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  parentCategoryId?: string;
};

// ========================================
// PRODUCT ANALYTICS TYPES
// ========================================

export type ProductAnalytics = {
  totalProducts: number;
  categories: {
    name: string;
    count: number;
    percentage: number;
  }[];
  availability: {
    inStock: number;
    outOfStock: number;
    preOrder: number;
    discontinued: number;
  };
  topSearchedProducts: {
    productId: string;
    productName: string;
    searchCount: number;
  }[];
  searchTrends: {
    date: string;
    searches: number;
  }[];
};

// ========================================
// BULK OPERATIONS TYPES
// ========================================

export type BulkProductImport = {
  products: CreateProductRequest[];
  updateExisting?: boolean;
  categoryMapping?: Record<string, string>;
};

export type BulkImportResult = {
  totalProcessed: number;
  successful: number;
  failed: number;
  errors: {
    row: number;
    error: string;
  }[];
};

// ========================================
// PRODUCT TEMPLATE TYPES
// ========================================

export type ProductTemplate = {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: string;
  templateFields: {
    name: string;
    type: "text" | "number" | "boolean" | "select" | "multiselect";
    required: boolean;
    options?: string[];
    defaultValue?: any;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateRequest = {
  name: string;
  description: string;
  category: string;
  templateFields: {
    name: string;
    type: "text" | "number" | "boolean" | "select" | "multiselect";
    required: boolean;
    options?: string[];
    defaultValue?: any;
  }[];
};
