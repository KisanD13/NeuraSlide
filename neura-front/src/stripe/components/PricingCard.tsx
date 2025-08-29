import type { PaymentPlan } from "../types";
import { usePayment } from "../hooks/usePayment";

type PricingCardProps = {
  plan: PaymentPlan;
  isPopular?: boolean;
};

export const PricingCard = ({ plan, isPopular = false }: PricingCardProps) => {
  const { createCheckout, loading } = usePayment();

  const handleSubscribe = () => {
    createCheckout(plan.stripePriceId);
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
            /{plan.interval}
          </span>
        </div>

        <ul className="space-y-2 py-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-success"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
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
