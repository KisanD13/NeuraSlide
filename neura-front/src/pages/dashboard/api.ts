import axiosInstance from "../../libs/api/axiosInstance";
import type { DashboardData } from "../../contexts/types/DashboardTypes";

// Get dashboard data
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get("/crystal/dashboard");
  return response.data.data;
};

// Get overview statistics
export const getOverview = async () => {
  const response = await axiosInstance.get("/crystal/dashboard/overview");
  return response.data.data;
};

// Get recent activity
export const getRecentActivity = async () => {
  const response = await axiosInstance.get(
    "/crystal/dashboard/recent-activity"
  );
  return response.data.data;
};
