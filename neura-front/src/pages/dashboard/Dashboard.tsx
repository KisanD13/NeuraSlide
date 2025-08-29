import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApiCall } from "../../hooks/useApiCall";
import { getDashboardData } from "./api";
import type { DashboardData } from "../../contexts/types/DashboardTypes";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardSkeleton from "../../components/ui/DashboardSkeleton";
import OverviewCard from "../../components/dashboard/OverviewCard";
import QuickActions from "../../components/dashboard/QuickActions";
import SystemHealth from "../../components/dashboard/SystemHealth";
import { MessageSquare, Settings, Package, Brain } from "lucide-react";
import { getCurrentUser } from "../auth/api";
import { useAuthContext } from "../../contexts/AuthContext";

export default function Dashboard() {
  const { setUser } = useAuthContext();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const { callApi, loadingCount } = useApiCall();

  useEffect(() => {
    const loadDashboardData = async () => {
      const userResponse = await getCurrentUser();
      if (userResponse.success && userResponse.data?.user) {
        setUser(userResponse.data.user);
      }

      const result = await callApi({
        apiFunction: getDashboardData,
        data: {},
      });

      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    };

    loadDashboardData();
  }, [callApi]);

  if (!!loadingCount || !dashboardData) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const { overview, performance, systemHealth, quickActions } = dashboardData;

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-white text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-white/60">
            Welcome to your NeuraSlide control center
          </p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Total Conversations"
            value={overview.totalConversations}
            icon={MessageSquare}
            color="cyan"
          />
          <OverviewCard
            title="Active Automations"
            value={overview.activeAutomations}
            icon={Settings}
            color="purple"
          />
          <OverviewCard
            title="Total Products"
            value={overview.totalProducts}
            icon={Package}
            color="blue"
          />
          <OverviewCard
            title="AI Conversations"
            value={overview.aiConversations}
            icon={Brain}
            color="green"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Automation Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold text-lg mb-4">
              Automation Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Success Rate</span>
                <span className="text-white font-semibold">
                  {performance.automationPerformance.successRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Total Triggers</span>
                <span className="text-white font-semibold">
                  {performance.automationPerformance.totalTriggers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Avg Response Time</span>
                <span className="text-white font-semibold">
                  {performance.automationPerformance.averageResponseTime}s
                </span>
              </div>
            </div>
          </motion.div>

          {/* AI Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold text-lg mb-4">
              AI Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Response Quality</span>
                <span className="text-white font-semibold">
                  {performance.aiPerformance.responseQuality}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">User Satisfaction</span>
                <span className="text-white font-semibold">
                  {performance.aiPerformance.userSatisfaction}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Avg Confidence</span>
                <span className="text-white font-semibold">
                  {performance.aiPerformance.averageConfidence}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Conversation Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6"
          >
            <h3 className="text-white font-semibold text-lg mb-4">
              Conversation Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Resolution Rate</span>
                <span className="text-white font-semibold">
                  {performance.conversationPerformance.resolutionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">
                  Active Conversations
                </span>
                <span className="text-white font-semibold">
                  {performance.conversationPerformance.activeConversations}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Avg Response Time</span>
                <span className="text-white font-semibold">
                  {performance.conversationPerformance.averageResponseTime}s
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions and System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <QuickActions actions={quickActions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SystemHealth health={systemHealth} />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
