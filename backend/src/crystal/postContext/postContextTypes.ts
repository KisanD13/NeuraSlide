// Post Context Types for NeuraSlide

export interface PostContext {
  id: string;
  userId: string;
  instagramAccountId: string;
  mediaId: string;
  caption?: string;
  contextType: "MANUAL" | "AUTO_GENERATED" | "HYBRID";
  title?: string;
  description?: string;
  keyPoints: string[];
  products: string[];
  pricing?: any;
  promotions?: any;
  faqs?: any;
  responseTone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostContextRequest {
  instagramAccountId: string;
  mediaId: string;
  caption?: string;
  title?: string;
  description?: string;
  keyPoints?: string[];
  products?: string[];
  pricing?: any;
  promotions?: any;
  faqs?: any;
  responseTone?: string;
}

export interface UpdatePostContextRequest {
  title?: string;
  description?: string;
  keyPoints?: string[];
  products?: string[];
  pricing?: any;
  promotions?: any;
  faqs?: any;
  responseTone?: string;
  isActive?: boolean;
}

export interface PostContextListRequest {
  instagramAccountId?: string;
  mediaId?: string;
  isActive?: boolean | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}

export interface PostContextListResponse {
  postContexts: PostContext[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostContextResponse {
  success: boolean;
  data: PostContext;
  message?: string;
}

export interface PostContextsResponse {
  success: boolean;
  data: PostContextListResponse;
  message?: string;
}
