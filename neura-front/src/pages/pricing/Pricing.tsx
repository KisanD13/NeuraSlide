import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { theme } from "../../config/theme";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out NeuraSlide",
    features: [
      "50 AI replies per month",
      "Basic Instagram integration",
      "Standard response templates",
      "Email support",
    ],
    limitations: [
      "No advanced automations",
      "Limited analytics",
      "No priority support",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "from-gray-500 to-gray-600",
  },
  {
    name: "Pro",
    price: "$60",
    period: "per month",
    description: "Perfect for growing businesses",
    features: [
      "Unlimited AI replies",
      "Advanced Instagram integration",
      "Custom response templates",
      "Automation workflows",
      "Advanced analytics",
      "Priority support",
      "Product catalog management",
      "Real-time conversation monitoring",
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true,
    color: "from-cyan-500 to-blue-600",
  },
  {
    name: "Pro Annual",
    price: "$600",
    period: "per year",
    description: "Save $120 with annual billing",
    features: [
      "Everything in Pro",
      "2 months free",
      "Early access to new features",
      "Dedicated account manager",
    ],
    limitations: [],
    cta: "Start Annual Trial",
    popular: false,
    color: "from-purple-500 to-pink-600",
  },
];

const features = [
  "AI-powered responses",
  "Instagram integration",
  "Automation workflows",
  "Analytics dashboard",
  "Product catalog",
  "Real-time monitoring",
  "Priority support",
  "Custom templates",
  "Multi-account support",
  "API access",
];

export default function Pricing() {
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
            {plans.map((plan, index) => (
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
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <>
                      <h4 className="text-white/60 font-semibold text-sm uppercase tracking-wide pt-4">
                        Limitations:
                      </h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li
                            key={limitationIndex}
                            className="flex items-start space-x-3"
                          >
                            <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-white/60 text-sm">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
          >
            <h2 className="text-white text-2xl font-bold text-center pb-8">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white/60 font-medium pb-4">
                      Feature
                    </th>
                    <th className="text-center text-white/60 font-medium pb-4">
                      Free
                    </th>
                    <th className="text-center text-white/60 font-medium pb-4">
                      Pro
                    </th>
                    <th className="text-center text-white/60 font-medium pb-4">
                      Pro Annual
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {features.map((feature, index) => (
                    <tr key={feature} className="border-b border-white/10">
                      <td className="text-white font-medium py-4">{feature}</td>
                      <td className="text-center py-4">
                        {index < 3 ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-4">
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      </td>
                      <td className="text-center py-4">
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center pt-16"
          >
            <h2 className="text-white text-2xl font-bold pb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60 pb-8">
              Can't find what you're looking for?{" "}
              <Link to="/contact" className="text-cyan-400 hover:text-cyan-300">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
