// Dashboard Types
export type DashboardOverview = {
  totalConversations: number;
  activeAutomations: number;
  totalProducts: number;
  totalCampaigns: number;
  aiConversations: number;
  recentMessages: number;
  automationTriggers: number;
  aiResponses: number;
};

export type RecentActivity = {
  conversations: {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: string;
    status: string;
  }[];
  automations: {
    id: string;
    name: string;
    trigger: string;
    status: string;
    lastTriggered: string;
  }[];
  products: {
    id: string;
    name: string;
    category: string;
    searchCount: number;
    lastSearched: string;
  }[];
  aiResponses: {
    id: string;
    conversationId: string;
    response: string;
    confidence: number;
    createdAt: string;
  }[];
};

export type PerformanceMetrics = {
  automationPerformance: {
    totalTriggers: number;
    successfulResponses: number;
    successRate: number;
    averageResponseTime: number;
  };
  aiPerformance: {
    totalResponses: number;
    averageConfidence: number;
    responseQuality: number;
    userSatisfaction: number;
  };
  productPerformance: {
    totalSearches: number;
    topSearchedProducts: Array<{
      id: string;
      name: string;
      searchCount: number;
    }>;
    searchSuccessRate: number;
  };
  conversationPerformance: {
    totalMessages: number;
    averageResponseTime: number;
    resolutionRate: number;
    activeConversations: number;
  };
};

export type SystemHealth = {
  instagramConnections: {
    total: number;
    active: number;
    lastSync: string;
  };
  apiStatus: {
    instagram: "healthy" | "warning" | "error";
    ai: "healthy" | "warning" | "error";
    automation: "healthy" | "warning" | "error";
  };
  databaseStatus: "healthy" | "warning" | "error";
  lastBackup: string;
};

export type QuickActions = {
  createAutomation: {
    available: boolean;
    message: string;
  };
  addProduct: {
    available: boolean;
    message: string;
  };
  testAI: {
    available: boolean;
    message: string;
  };
  connectInstagram: {
    available: boolean;
    message: string;
  };
};

export type DashboardData = {
  overview: DashboardOverview;
  recentActivity: RecentActivity;
  performance: PerformanceMetrics;
  systemHealth: SystemHealth;
  quickActions: QuickActions;
};
