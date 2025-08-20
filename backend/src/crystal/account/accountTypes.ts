// Account Management Types for NeuraSlide
export type UserProfile = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AccountSettings = {
  id: string;
  userId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  privacySettings: PrivacySettings;
  automationSettings: AutomationSettings;
  aiSettings: AISettings;
  createdAt: string;
  updatedAt: string;
};

export type EmailNotificationSettings = {
  marketing: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  billingReminders: boolean;
  automationAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
};

export type PushNotificationSettings = {
  newMessages: boolean;
  automationTriggers: boolean;
  systemAlerts: boolean;
  billingUpdates: boolean;
};

export type PrivacySettings = {
  profileVisibility: "public" | "private" | "team";
  dataSharing: boolean;
  analyticsTracking: boolean;
  thirdPartyIntegrations: boolean;
};

export type AutomationSettings = {
  autoReplyEnabled: boolean;
  defaultResponseDelay: number; // in minutes
  maxDailyAutomations: number;
  workingHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
  blackoutDates: string[]; // YYYY-MM-DD format
};

export type AISettings = {
  aiEnabled: boolean;
  responseStyle: "professional" | "casual" | "friendly" | "formal";
  languagePreference: string;
  autoImproveResponses: boolean;
  confidenceThreshold: number; // 0-1
  maxResponseLength: number;
};

export type UpdateSettingsRequest = {
  emailNotifications?: Partial<EmailNotificationSettings>;
  pushNotifications?: Partial<PushNotificationSettings>;
  privacySettings?: Partial<PrivacySettings>;
  automationSettings?: Partial<AutomationSettings>;
  aiSettings?: Partial<AISettings>;
};

export type AccountActivity = {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  createdAt: string;
};

export type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "PASSWORD_CHANGE"
  | "PROFILE_UPDATE"
  | "SETTINGS_UPDATE"
  | "SUBSCRIPTION_CHANGE"
  | "PAYMENT_METHOD_ADDED"
  | "PAYMENT_METHOD_REMOVED"
  | "INSTAGRAM_CONNECTED"
  | "INSTAGRAM_DISCONNECTED"
  | "AUTOMATION_CREATED"
  | "AUTOMATION_UPDATED"
  | "AUTOMATION_DELETED"
  | "PRODUCT_ADDED"
  | "PRODUCT_UPDATED"
  | "AI_CONVERSATION_STARTED"
  | "CAMPAIGN_CREATED"
  | "CAMPAIGN_UPDATED"
  | "ACCOUNT_DELETION";

export type AccountStats = {
  totalLogins: number;
  lastLoginAt: string | undefined;
  totalAutomations: number;
  totalConversations: number;
  totalProducts: number;
  totalAIRequests: number;
  totalCampaigns: number;
  accountAge: number; // in days
  subscriptionStatus: string;
  subscriptionDaysRemaining: number;
};

export type DeleteAccountRequest = {
  password: string;
  reason?: string;
  feedback?: string;
};

export type ExportDataRequest = {
  dataTypes: (
    | "profile"
    | "automations"
    | "conversations"
    | "products"
    | "ai"
    | "campaigns"
    | "billing"
  )[];
  format: "json" | "csv";
  dateRange?: {
    start: string;
    end: string;
  };
};

export type ExportDataResponse = {
  id: string;
  userId: string;
  status: "pending" | "processing" | "completed" | "failed";
  dataTypes: string[];
  format: string;
  fileUrl?: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
};

// Response Types
export type ProfileResponse = {
  success: boolean;
  data: UserProfile;
  message?: string;
};

export type SettingsResponse = {
  success: boolean;
  data: AccountSettings;
  message?: string;
};

export type ActivityResponse = {
  success: boolean;
  data: {
    activities: AccountActivity[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
};

export type StatsResponse = {
  success: boolean;
  data: AccountStats;
  message?: string;
};

export type ExportDataResponseWrapper = {
  success: boolean;
  data: ExportDataResponse;
  message?: string;
};

// Enums
export type UserRole = "ADMIN" | "USER";

// Validation Types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
