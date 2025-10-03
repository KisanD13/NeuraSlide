// backend/src/crystal/ai/aiTypes.ts

export interface AIRequest {
  userId: string;
  message: string;
  conversationId?: string;
  context?: AIContext;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIContext {
  userProfile?: {
    name?: string;
    preferences?: string[];
    history?: string[];
  };
  conversationHistory?: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[];
  productContext?: {
    productId?: string;
    productName?: string;
    category?: string;
  };
  businessContext?: {
    businessName?: string;
    industry?: string;
    tone?: "professional" | "casual" | "friendly";
  };
  postContext?: {
    title?: string;
    description?: string;
    keyPoints?: string[];
    pricing?: any;
    promotions?: any;
    faqs?: any;
    responseTone?: string;
    contextType?: string;
  };
}

export interface AIResponse {
  id: string;
  userId: string;
  conversationId?: string;
  message: string;
  response: string;
  model: string;
  tokensUsed: number;
  responseTime: number;
  confidence: number;
  metadata?: {
    intent?: string;
    entities?: string[];
    sentiment?: "positive" | "negative" | "neutral";
    suggestedActions?: string[];
  };
  createdAt: Date;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  summary?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    confidence?: number;
  };
}

export interface AITrainingData {
  id: string;
  userId: string;
  input: string;
  expectedOutput: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface AIPerformance {
  totalRequests: number;
  averageResponseTime: number;
  successRate: number;
  tokenUsage: {
    total: number;
    average: number;
    byModel: Record<string, number>;
  };
  popularIntents: Array<{
    intent: string;
    count: number;
  }>;
  errorRate: number;
  lastUpdated: Date;
}

// Request/Response Types
export interface GenerateResponseRequest {
  message: string;
  context?: AIContext;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateResponseResponse {
  response: string;
  tokensUsed: number;
  responseTime: number;
  confidence: number;
  metadata?: {
    intent?: string;
    entities?: string[];
    sentiment?: "positive" | "negative" | "neutral";
  };
}

export interface CreateConversationRequest {
  title: string;
  initialMessage?: string;
  tags?: string[];
}

export interface UpdateConversationRequest {
  title?: string;
  summary?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface AddMessageRequest {
  conversationId: string;
  content: string;
  role: "user" | "assistant" | "system";
}

export interface GetConversationHistoryRequest {
  conversationId: string;
  limit?: number;
  offset?: number;
}

export interface SearchConversationsRequest {
  query?: string;
  tags?: string[];
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface AddTrainingDataRequest {
  input: string;
  expectedOutput: string;
  category: string;
  tags?: string[];
}

export interface UpdateTrainingDataRequest {
  input?: string;
  expectedOutput?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

// Error Types
export interface AIError {
  code: string;
  message: string;
  details?: any;
}

export interface AILimitError extends AIError {
  code: "RATE_LIMIT" | "TOKEN_LIMIT" | "QUOTA_EXCEEDED";
  retryAfter?: number;
  limit?: number;
  used?: number;
}
