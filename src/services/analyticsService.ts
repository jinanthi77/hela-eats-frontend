import apiClient from '../api/client';

export interface DashboardAnalytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalRecipes: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
}

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const { data } = await apiClient.get<DashboardAnalytics>('/analytics/dashboard');
  return data;
};
