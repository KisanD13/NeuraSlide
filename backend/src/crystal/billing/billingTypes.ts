// Billing Types for NeuraSlide
export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialStart?: string;
  trialEnd?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  intervalCount: number;
  features: PlanFeatures;
  isActive: boolean;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanFeatures = {
  maxAutomations: number;
  maxConversations: number;
  maxProducts: number;
  maxAIRequests: number;
  maxCampaigns: number;
  maxInstagramAccounts: number;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
  hasAPIAccess: boolean;
};

export type Invoice = {
  id: string;
  userId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  description: string;
  invoiceUrl?: string;
  paidAt?: string;
  dueDate: string;
  stripeInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = {
  id: string;
  userId: string;
  type: PaymentMethodType;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
};

export type UsageRecord = {
  id: string;
  userId: string;
  subscriptionId: string;
  feature: string;
  usage: number;
  limit: number;
  period: string; // YYYY-MM format
  createdAt: string;
  updatedAt: string;
};

// Enums
export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "PAST_DUE"
  | "TRIALING"
  | "UNPAID";

export type BillingInterval = "MONTH" | "YEAR";

export type InvoiceStatus =
  | "DRAFT"
  | "OPEN"
  | "PAID"
  | "VOID"
  | "UNCOLLECTIBLE";

export type PaymentMethodType = "CARD" | "BANK_ACCOUNT" | "PAYPAL";

// Request/Response Types
export type CreateSubscriptionRequest = {
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
};

export type UpdateSubscriptionRequest = {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
};

export type CreatePaymentMethodRequest = {
  type: PaymentMethodType;
  stripePaymentMethodId: string;
  isDefault?: boolean;
};

export type BillingOverview = {
  subscription?: Subscription | null;
  plan?: SubscriptionPlan | null;
  usage: {
    automations: { current: number; limit: number };
    conversations: { current: number; limit: number };
    products: { current: number; limit: number };
    aiRequests: { current: number; limit: number };
    campaigns: { current: number; limit: number };
    instagramAccounts: { current: number; limit: number };
  };
  upcomingInvoice?: Invoice | null;
  paymentMethods: PaymentMethod[];
};

export type SubscriptionResponse = {
  success: boolean;
  data: Subscription;
  message?: string;
};

export type BillingOverviewResponse = {
  success: boolean;
  data: BillingOverview;
  message?: string;
};

export type InvoicesResponse = {
  success: boolean;
  data: {
    invoices: Invoice[];
    hasMore: boolean;
    total: number;
  };
  message?: string;
};

export type PaymentMethodsResponse = {
  success: boolean;
  data: PaymentMethod[];
  message?: string;
};

export type PlansResponse = {
  success: boolean;
  data: SubscriptionPlan[];
  message?: string;
};

export type UsageResponse = {
  success: boolean;
  data: UsageRecord[];
  message?: string;
};

// Stripe webhook types
export type StripeWebhookEvent = {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
};

export type WebhookResponse = {
  success: boolean;
  message?: string;
};
