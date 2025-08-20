// Stripe Webhook Types for NeuraSlide
export type StripeWebhookEvent = {
  id: string;
  object: "event";
  api_version: string;
  created: number;
  data: {
    object: any;
    previous_attributes?: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  };
  type: StripeEventType;
};

export type StripeEventType =
  // Customer events
  | "customer.created"
  | "customer.updated"
  | "customer.deleted"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "customer.subscription.trial_will_end"
  // Payment events
  | "payment_intent.created"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.canceled"
  // Invoice events
  | "invoice.created"
  | "invoice.finalized"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "invoice.payment_action_required"
  | "invoice.upcoming"
  // Subscription events
  | "subscription_schedule.created"
  | "subscription_schedule.updated"
  | "subscription_schedule.canceled"
  // Payment method events
  | "payment_method.attached"
  | "payment_method.detached"
  | "setup_intent.succeeded"
  | "setup_intent.setup_failed"
  // Checkout events
  | "checkout.session.completed"
  | "checkout.session.expired"
  // Price and product events
  | "price.created"
  | "price.updated"
  | "product.created"
  | "product.updated";

// Stripe Customer object
export type StripeCustomer = {
  id: string;
  object: "customer";
  created: number;
  email: string | null;
  metadata: { [key: string]: string };
  name: string | null;
  phone: string | null;
  description: string | null;
  default_source: string | null;
  invoice_prefix: string | null;
  preferred_locales: string[];
  tax_exempt: "none" | "exempt" | "reverse";
};

// Stripe Subscription object
export type StripeSubscription = {
  id: string;
  object: "subscription";
  application_fee_percent: number | null;
  billing_cycle_anchor: number;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  created: number;
  current_period_end: number;
  current_period_start: number;
  customer: string;
  ended_at: number | null;
  items: {
    object: "list";
    data: StripeSubscriptionItem[];
  };
  latest_invoice: string;
  metadata: { [key: string]: string };
  status: StripeSubscriptionStatus;
  trial_end: number | null;
  trial_start: number | null;
};

export type StripeSubscriptionItem = {
  id: string;
  object: "subscription_item";
  created: number;
  metadata: { [key: string]: string };
  price: StripePrice;
  quantity: number;
  subscription: string;
};

export type StripePrice = {
  id: string;
  object: "price";
  active: boolean;
  billing_scheme: "per_unit" | "tiered";
  created: number;
  currency: string;
  metadata: { [key: string]: string };
  nickname: string | null;
  product: string;
  recurring: {
    aggregate_usage: string | null;
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
    usage_type: "licensed" | "metered";
  } | null;
  type: "one_time" | "recurring";
  unit_amount: number | null;
  unit_amount_decimal: string | null;
};

export type StripeSubscriptionStatus =
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

// Stripe Invoice object
export type StripeInvoice = {
  id: string;
  object: "invoice";
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  application_fee_amount: number | null;
  attempt_count: number;
  attempted: boolean;
  auto_advance: boolean;
  billing_reason: string;
  created: number;
  currency: string;
  customer: string;
  customer_email: string | null;
  customer_name: string | null;
  description: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  metadata: { [key: string]: string };
  paid: boolean;
  payment_intent: string | null;
  period_end: number;
  period_start: number;
  status: StripeInvoiceStatus;
  subscription: string | null;
  subtotal: number;
  tax: number | null;
  total: number;
};

export type StripeInvoiceStatus =
  | "draft"
  | "open"
  | "paid"
  | "void"
  | "uncollectible";

// Stripe Payment Intent object
export type StripePaymentIntent = {
  id: string;
  object: "payment_intent";
  amount: number;
  amount_received: number;
  application: string | null;
  application_fee_amount: number | null;
  canceled_at: number | null;
  cancellation_reason: string | null;
  capture_method: "automatic" | "manual";
  client_secret: string;
  confirmation_method: "automatic" | "manual";
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  invoice: string | null;
  metadata: { [key: string]: string };
  payment_method: string | null;
  receipt_email: string | null;
  status: StripePaymentIntentStatus;
  subscription: string | null;
};

export type StripePaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded";

// Internal processing types
export type ProcessedStripeEvent = {
  id: string;
  stripeEventId: string;
  eventType: StripeEventType;
  userId?: string;
  customerId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  paymentIntentId?: string;
  processed: boolean;
  processingResult?: WebhookProcessingResult;
  timestamp: Date;
  data: any;
  createdAt: Date;
};

export type WebhookProcessingResult = {
  success: boolean;
  action: string;
  details?: {
    subscriptionUpdated?: boolean;
    invoiceCreated?: boolean;
    paymentProcessed?: boolean;
    userNotified?: boolean;
    usageRecorded?: boolean;
  };
  error?: string;
};

// Response types
export type StripeWebhookResponse = {
  success: boolean;
  data?: ProcessedStripeEvent;
  message?: string;
};

export type StripeWebhookEventsResponse = {
  success: boolean;
  data: {
    events: ProcessedStripeEvent[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
};

// Validation types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
