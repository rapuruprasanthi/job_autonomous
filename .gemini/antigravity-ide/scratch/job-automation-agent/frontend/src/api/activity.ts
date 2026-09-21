import { apiClient } from './client';
import { ActivityLog } from '../lib/types';

export const activityApi = {
  async getTimeline(event_type?: string): Promise<ActivityLog[]> {
    const res = await apiClient.get<ActivityLog[]>('/activity', { params: { event_type } });
    return res.data;
  },

  getCsvExportUrl(): string {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/activity/export/csv`;
  },

  async deleteMyData(): Promise<void> {
    await apiClient.delete('/activity/privacy/delete-my-data');
  }
};
