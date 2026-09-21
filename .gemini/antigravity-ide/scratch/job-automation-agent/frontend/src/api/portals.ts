import { apiClient } from './client';
import { Portal } from '../lib/types';

export const portalsApi = {
  async getPortals(): Promise<Portal[]> {
    const res = await apiClient.get<Portal[]>('/portals');
    return res.data;
  },

  async updatePortal(id: number, data: { allowed_to_search?: boolean; allowed_to_apply?: boolean }): Promise<Portal> {
    const res = await apiClient.put<Portal>(`/portals/${id}`, data);
    return res.data;
  },

  async saveCredential(id: number, data: { username?: string; password?: string; api_key?: string }): Promise<Portal> {
    const res = await apiClient.post<Portal>(`/portals/${id}/credential`, data);
    return res.data;
  }
};
