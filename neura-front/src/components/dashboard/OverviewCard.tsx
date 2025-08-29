import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type OverviewCardProps = {
  title: string;
  value: number | string;
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
  icon,
  color,
}: OverviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative p-4 rounded-lg border border-white/20 transition-all duration-200 bg-white/5 hover:bg-white/10"
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-10 h-10 bg-gradient-to-r ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          {React.createElement(icon, {
            className: "w-6 h-6 text-white",
          })}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm">{title}</h4>
          <p className="text-white text-xl font-bold pt-1">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
