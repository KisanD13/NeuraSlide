// backend/src/crystal/campaigns/campaignTypes.ts

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  isActive: boolean;
  settings: CampaignSettings;
  metadata?: CampaignMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignType {
  type: "FAQ" | "PROMOTIONAL" | "SUPPORT" | "ONBOARDING";
  subtype?: string;
}

export interface CampaignStatus {
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
  reason?: string;
}

export interface CampaignSettings {
  autoReply: boolean;
  responseDelay?: number; // in seconds
  maxResponsesPerDay?: number;
  workingHours?: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string; // "UTC"
  };
  keywords?: string[];
  excludedKeywords?: string[];
  targetAudience?: {
    ageRange?: [number, number];
    interests?: string[];
    location?: string[];
  };
}

export interface CampaignMetadata {
  totalResponses?: number;
  successRate?: number;
  averageResponseTime?: number;
  lastActivity?: Date;
  tags?: string[];
}

export interface FAQ {
  id: string;
  campaignId: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  priority: FAQPriority;
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQPriority {
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  weight: number; // 1-10
}

export interface CampaignResponse {
  id: string;
  campaignId: string;
  conversationId: string;
  faqId?: string;
  userMessage: string;
  botResponse: string;
  responseType: "FAQ" | "AUTO" | "MANUAL" | "FALLBACK";
  confidence: number;
  responseTime: number; // in milliseconds
  metadata?: {
    matchedKeywords?: string[];
    intent?: string;
    sentiment?: "positive" | "negative" | "neutral";
    userSatisfaction?: number; // 1-5
  };
  createdAt: Date;
}

export interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalResponses: number;
  averageResponseTime: number;
  successRate: number;
  topFAQs: Array<{
    faqId: string;
    question: string;
    usageCount: number;
  }>;
  responseTrends: Array<{
    date: string;
    responses: number;
    successRate: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

// Request/Response Types
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  type: CampaignType;
  settings: CampaignSettings;
  metadata?: CampaignMetadata;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  type?: CampaignType;
  status?: CampaignStatus;
  isActive?: boolean;
  settings?: CampaignSettings;
  metadata?: CampaignMetadata;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  priority?: FAQPriority;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  category?: string;
  tags?: string[];
  priority?: FAQPriority;
  isActive?: boolean;
}

export interface SearchFAQsRequest {
  query?: string;
  category?: string;
  tags?: string[];
  priority?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetCampaignResponse {
  campaign: Campaign;
  faqs: FAQ[];
  analytics: {
    totalFAQs: number;
    activeFAQs: number;
    totalResponses: number;
    averageResponseTime: number;
  };
}

export interface ListCampaignsRequest {
  status?: string;
  type?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListCampaignsResponse {
  campaigns: Campaign[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchFAQsResponse {
  faqs: FAQ[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProcessMessageRequest {
  message: string;
  conversationId: string;
  context?: {
    userId?: string;
    previousMessages?: string[];
    userProfile?: any;
  };
}

export interface ProcessMessageResponse {
  response: string;
  faqId?: string;
  confidence: number;
  responseType: "FAQ" | "AUTO" | "MANUAL" | "FALLBACK";
  metadata?: {
    matchedKeywords?: string[];
    intent?: string;
    suggestedFAQs?: string[];
  };
}

// Error Types
export interface CampaignError {
  code: string;
  message: string;
  details?: any;
}

export interface FAQNotFoundError extends CampaignError {
  code: "FAQ_NOT_FOUND";
  suggestedFAQs?: string[];
}

export interface CampaignLimitError extends CampaignError {
  code: "CAMPAIGN_LIMIT_EXCEEDED" | "RESPONSE_LIMIT_EXCEEDED";
  limit?: number;
  used?: number;
}
