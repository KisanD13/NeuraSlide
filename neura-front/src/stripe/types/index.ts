export type PaymentPlan = {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  stripePriceId: string;
};

export type Subscription = {
  id: string;
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd: string;
  plan: PaymentPlan;
};

export type PaymentMethod = {
  id: string;
  type: "card";
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
};
