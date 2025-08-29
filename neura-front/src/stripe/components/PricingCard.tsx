import { Check } from "lucide-react";
import type { PaymentPlan } from "../types";
import { usePayment } from "../hooks/usePayment";

type PricingCardProps = {
  plan: PaymentPlan;
  isPopular?: boolean;
};

export const PricingCard = ({ plan, isPopular = false }: PricingCardProps) => {
  const { createSubscription, loading } = usePayment();

  const handleSubscribe = () => {
    createSubscription(plan.stripePriceId);
  };

  return (
    <div
      className={`card bg-base-100 shadow-xl ${isPopular ? "ring-2 ring-primary" : ""}`}
    >
      <div className="card-body">
        {isPopular && (
          <div className="badge badge-primary absolute -top-2 right-4">
            Most Popular
          </div>
        )}

        <h2 className="card-title text-2xl font-bold">{plan.name}</h2>
        <div className="text-3xl font-bold">
          ${plan.price}
          <span className="text-lg font-normal text-base-content/70">
            {plan.interval}
          </span>
        </div>

        <ul className="space-y-2 py-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="card-actions justify-end">
          <button
            className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </button>
        </div>
      </div>
    </div>
  );
};
