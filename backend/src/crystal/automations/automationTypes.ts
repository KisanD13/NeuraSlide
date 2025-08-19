// backend/src/crystal/automations/automationTypes.ts

// ========================================
// CORE AUTOMATION TYPES
// ========================================

export type AutomationStatus = "ACTIVE" | "INACTIVE" | "DRAFT";
export type TriggerType =
  | "keyword"
  | "intent"
  | "time"
  | "user_type"
  | "message_count";
export type ResponseType = "ai_generated" | "template" | "custom" | "delay";
export type AutomationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

// ========================================
// TRIGGER TYPES
// ========================================

export type KeywordTrigger = {
  type: "keyword";
  keywords: string[];
  matchType: "exact" | "contains" | "starts_with" | "ends_with";
  caseSensitive: boolean;
};

export type IntentTrigger = {
  type: "intent";
  intents: string[];
  confidence: number; // 0-1
};

export type TimeTrigger = {
  type: "time";
  timeRange: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  daysOfWeek: number[]; // [1,2,3,4,5] for Monday-Friday
  timezone: string;
};

export type UserTypeTrigger = {
  type: "user_type";
  userTypes: string[]; // ["new_customer", "returning_customer", "vip"]
};

export type MessageCountTrigger = {
  type: "message_count";
  count: number;
  timeWindow: number; // in minutes
};

export type Trigger =
  | KeywordTrigger
  | IntentTrigger
  | TimeTrigger
  | UserTypeTrigger
  | MessageCountTrigger;

// ========================================
// RESPONSE TYPES
// ========================================

export type AIGeneratedResponse = {
  type: "ai_generated";
  prompt: string;
  maxLength: number;
  temperature: number; // 0-1
  includeContext: boolean;
};

export type TemplateResponse = {
  type: "template";
  templateId: string;
  variables: Record<string, string>;
};

export type CustomResponse = {
  type: "custom";
  message: string;
  variables: string[]; // ["{user_name}", "{business_name}"]
};

export type DelayResponse = {
  type: "delay";
  delayMinutes: number;
  fallbackResponse: CustomResponse;
};

export type Response =
  | AIGeneratedResponse
  | TemplateResponse
  | CustomResponse
  | DelayResponse;

// ========================================
// MAIN AUTOMATION TYPE
// ========================================

export type Automation = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  trigger: Trigger;
  response: Response;
  status: AutomationStatus;
  priority: AutomationPriority;
  isActive: boolean;
  tags: string[];
  conditions: AutomationCondition[];
  performance: AutomationPerformance;
  createdAt: string;
  updatedAt: string;
};

// ========================================
// SUPPORTING TYPES
// ========================================

export type AutomationCondition = {
  field: string; // "conversation.participantType"
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string | number | boolean;
};

export type AutomationPerformance = {
  totalTriggers: number;
  successfulResponses: number;
  failedResponses: number;
  averageResponseTime: number; // in milliseconds
  lastTriggeredAt?: string;
  successRate: number; // 0-100
};

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export type CreateAutomationRequest = {
  name: string;
  description?: string;
  trigger: Trigger;
  response: Response;
  priority?: AutomationPriority;
  tags?: string[];
  conditions?: AutomationCondition[];
};

export type UpdateAutomationRequest = {
  name?: string;
  description?: string;
  trigger?: Trigger;
  response?: Response;
  status?: AutomationStatus;
  priority?: AutomationPriority;
  isActive?: boolean;
  tags?: string[];
  conditions?: AutomationCondition[];
};

export type AutomationListRequest = {
  page?: number;
  limit?: number;
  status?: AutomationStatus;
  priority?: AutomationPriority;
  tags?: string[];
  search?: string;
};

export type AutomationListResponse = {
  automations: Automation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AutomationStats = {
  totalAutomations: number;
  activeAutomations: number;
  totalTriggers: number;
  averageSuccessRate: number;
  topPerformingAutomations: Automation[];
};

// ========================================
// TEMPLATE TYPES
// ========================================

export type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: Trigger;
  response: Response;
  isPublic: boolean;
  usageCount: number;
};

// ========================================
// EXECUTION TYPES
// ========================================

export type AutomationExecution = {
  id: string;
  automationId: string;
  conversationId: string;
  trigger: Trigger;
  response: Response;
  executedAt: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  aiResponse?: string | undefined;
};

export type TestAutomationRequest = {
  trigger: Trigger;
  response: Response;
  testMessage: string;
  context?: Record<string, any>;
};
