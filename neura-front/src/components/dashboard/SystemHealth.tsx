import { motion } from "framer-motion";
import { Check, AlertTriangle, X } from "lucide-react";
import type { SystemHealth as SystemHealthType } from "../../contexts/types/DashboardTypes";

type SystemHealthProps = {
  health: SystemHealthType;
};

const getStatusColor = (status: "healthy" | "warning" | "error") => {
  switch (status) {
    case "healthy":
      return "text-green-400";
    case "warning":
      return "text-yellow-400";
    case "error":
      return "text-red-400";
    default:
      return "text-white/60";
  }
};

const getStatusIcon = (status: "healthy" | "warning" | "error") => {
  switch (status) {
    case "healthy":
      return <Check className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "error":
      return <X className="w-4 h-4" />;
    default:
      return null;
  }
};

export default function SystemHealth({ health }: SystemHealthProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">System Health</h3>

      {/* Instagram Connections */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white/80 text-sm font-medium">
            Instagram Connections
          </h4>
          <span className="text-white/60 text-xs">
            {health.instagramConnections.active}/
            {health.instagramConnections.total} active
          </span>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-xs">Last sync</span>
            <span className="text-white text-xs">
              {health.instagramConnections.lastSync === "Never"
                ? "Never connected"
                : new Date(
                    health.instagramConnections.lastSync
                  ).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="space-y-3">
        <h4 className="text-white/80 text-sm font-medium">API Status</h4>

        {Object.entries(health.apiStatus).map(([service, status]) => (
          <motion.div
            key={service}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className={`${getStatusColor(status)}`}>
                {getStatusIcon(status)}
              </span>
              <span className="text-white text-sm capitalize">{service}</span>
            </div>
            <span className={`text-xs font-medium ${getStatusColor(status)}`}>
              {status}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Database Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">Database</span>
          <div className="flex items-center space-x-2">
            <span className={`${getStatusColor(health.databaseStatus)}`}>
              {getStatusIcon(health.databaseStatus)}
            </span>
            <span
              className={`text-xs font-medium ${getStatusColor(health.databaseStatus)}`}
            >
              {health.databaseStatus}
            </span>
          </div>
        </div>
        <div className="mt-2 text-white/40 text-xs">
          Last backup: {new Date(health.lastBackup).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
