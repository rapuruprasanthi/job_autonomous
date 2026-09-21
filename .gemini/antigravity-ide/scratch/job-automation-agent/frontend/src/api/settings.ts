import { apiClient } from './client';
import { AgentSettings } from '../lib/types';

export const settingsApi = {
  async getSettings(): Promise<AgentSettings> {
    const res = await apiClient.get<AgentSettings>('/settings/me');
    return res.data;
  },

  async updateSettings(data: Partial<AgentSettings>): Promise<AgentSettings> {
    const res = await apiClient.put<AgentSettings>('/settings/me', data);
    return res.data;
  }
};
