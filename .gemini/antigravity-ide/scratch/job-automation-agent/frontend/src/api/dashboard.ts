import { apiClient } from './client';
import { DashboardStats } from '../lib/types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  }
};
