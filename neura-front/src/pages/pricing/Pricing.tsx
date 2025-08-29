import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { theme } from "../../config/theme";
import { usePayment } from "../../stripe/hooks/usePayment";
import { stripeApi } from "../../stripe/utils/api";
import { useApiCall } from "../../hooks/useApiCall";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  cta: string;
  popular: boolean;
  color: string;
  stripePriceId: string;
};

export default function Pricing() {
  const { createSubscription, loading } = usePayment();
  const { callApi } = useApiCall();
  const [plans, setPlans] = useState<Plan[]>([]);

  // Fetch plans from backend using useApiCall
  useEffect(() => {
    const fetchPlans = async () => {
      const result = await callApi({
        apiFunction: stripeApi.getPlans,
        data: {},
        fallbackSuccessMessage: "Pricing plans loaded",
        fallbackErrorMessage: "Failed to load pricing plans",
      });

      if (result.success && result.data?.data?.data) {
        const backendPlans = result.data.data.data;

        // Transform backend plans to frontend format
        const transformedPlans: Plan[] = backendPlans.map(
          (plan: {
            id: string;
            name: string;
            price: number;
            interval: string;
            description: string;
            features: Record<string, unknown>;
            stripePriceId?: string;
          }) => ({
            id: plan.id,
            name: plan.name,
            price: `$${plan.price}`,
            period: plan.interval === "MONTH" ? "per month" : "per year",
            description: plan.description,
            features: [
              plan.features.aiReplies === -1
                ? "Unlimited AI replies"
                : `${plan.features.aiReplies} AI replies per month`,
              "Instagram integration",
              "Response templates",
              plan.features.prioritySupport
                ? "Priority support"
                : "Email support",
              ...(plan.features.advancedAutomations
                ? ["Automation workflows"]
                : []),
              ...(plan.features.advancedAnalytics
                ? ["Advanced analytics"]
                : []),
              ...(plan.features.productCatalog
                ? ["Product catalog management"]
                : []),
              ...(plan.features.realTimeMonitoring
                ? ["Real-time conversation monitoring"]
                : []),
            ],
            limitations:
              plan.price === 0
                ? [
                    "No advanced automations",
                    "Limited analytics",
                    "No priority support",
                  ]
                : [],
            cta: plan.price === 0 ? "Get Started Free" : "Start Pro Trial",
            popular: plan.name === "Pro Monthly",
            color:
              plan.name === "Pro Monthly"
                ? "from-cyan-500 to-blue-600"
                : plan.name === "Pro Annual"
                  ? "from-purple-500 to-pink-600"
                  : "from-gray-500 to-gray-600",
            stripePriceId: plan.id, // Use the database plan ID, not Stripe price ID
          })
        );

        setPlans(transformedPlans);
      }
    };

    fetchPlans();
  }, [callApi]);

  const handleSubscribe = (planId: string) => {
    if (planId === "price_free" || planId.includes("free")) {
      // Handle free plan - redirect to dashboard or signup
      window.location.href = "/auth/signup";
    } else {
      createSubscription(planId);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.gradients.background}`}
    >
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center pb-16"
          >
            <h1 className="text-white text-4xl sm:text-5xl font-bold pb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-white/60 text-lg sm:text-xl max-w-3xl mx-auto">
              Choose the perfect plan for your business. Start free and upgrade
              as you grow.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
            {plans.length === 0 ? (
              <div className="col-span-3 text-center">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="text-white/60 mt-4">Loading pricing plans...</p>
              </div>
            ) : (
              plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative bg-white/10 backdrop-blur-lg border rounded-2xl p-8 ${
                    plan.popular
                      ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                      : "border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center pb-8">
                    <h3 className="text-white text-2xl font-bold pb-2">
                      {plan.name}
                    </h3>
                    <div className="pb-4">
                      <span className="text-white text-4xl font-bold">
                        {plan.price}
                      </span>
                      <span className="text-white/60 text-lg">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{plan.description}</p>
                  </div>

                  <div className="space-y-4 pb-8">
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wide">
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-white/80 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-4 pb-8">
                      <h4 className="text-white/60 font-semibold text-sm uppercase tracking-wide">
                        Limitations:
                      </h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li
                            key={limitationIndex}
                            className="flex items-start"
                          >
                            <X className="text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-white/60 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                    } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {loading ? (
                      <div className="loading loading-spinner loading-sm"></div>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-white text-3xl font-bold pb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="text-left">
                <h3 className="text-white font-semibold pb-2">
                  Can I change my plan anytime?
                </h3>
                <p className="text-white/60 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes will be reflected in your next billing cycle.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold pb-2">
                  Is there a free trial?
                </h3>
                <p className="text-white/60 text-sm">
                  Yes! Start with our free plan and upgrade when you're ready.
                  No credit card required to get started.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold pb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-white/60 text-sm">
                  We accept all major credit cards, debit cards, and digital
                  wallets through our secure payment processor.
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-white font-semibold pb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-white/60 text-sm">
                  Absolutely! You can cancel your subscription at any time with
                  no cancellation fees or penalties.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
