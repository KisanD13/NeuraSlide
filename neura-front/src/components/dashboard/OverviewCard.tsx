import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type OverviewCardProps = {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  color: "cyan" | "blue" | "green" | "purple" | "orange" | "red";
};

const colorClasses = {
  cyan: "from-cyan-500 to-cyan-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  red: "from-red-500 to-red-600",
};

export default function OverviewCard({
  title,
  value,
  change,
  icon,
  color,
}: OverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 sm:p-6 hover:bg-white/15 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-white text-xl sm:text-2xl font-bold mt-1">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${change >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {change >= 0 ? "+" : ""}
                {change}%
              </span>
              <span className="text-white/40 text-sm ml-1">
                from last month
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center`}
        >
          {React.createElement(icon, {
            className: "w-5 h-5 sm:w-6 sm:h-6 text-white",
          })}
        </div>
      </div>
    </motion.div>
  );
}
