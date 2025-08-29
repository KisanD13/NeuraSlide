import { motion } from "framer-motion";
import { Plus, Package, Lightbulb, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { QuickActions as QuickActionsType } from "../../contexts/types/DashboardTypes";

type QuickActionsProps = {
  actions: QuickActionsType;
};

export default function QuickActions({ actions }: QuickActionsProps) {
  const navigate = useNavigate();
  const actionItems = [
    {
      key: "createAutomation" as keyof QuickActionsType,
      title: "Create Automation",
      description: "Set up automated workflows",
      icon: <Plus className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      key: "addProduct" as keyof QuickActionsType,
      title: "Add Product",
      description: "Add new products to catalog",
      icon: <Package className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      key: "testAI" as keyof QuickActionsType,
      title: "Test AI",
      description: "Test AI response generation",
      icon: <Lightbulb className="w-6 h-6" />,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      key: "connectInstagram" as keyof QuickActionsType,
      title: "Connect Instagram",
      description: "Connect your Instagram account",
      icon: <Link className="w-6 h-6" />,
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg pb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionItems.map((item, index) => {
          const action = actions[item.key];
          const isAvailable = action.available;

          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable && item.key === "connectInstagram") {
                  navigate("/instagram/connect");
                }
              }}
              className={`relative p-4 rounded-lg border transition-all duration-200 text-left group ${
                isAvailable
                  ? "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 cursor-pointer"
                  : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white">{item.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm">
                    {item.title}
                  </h4>
                  <p className="text-white/60 text-xs pt-1">{action.message}</p>
                </div>
              </div>
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-white/60 text-xs">Coming Soon</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
