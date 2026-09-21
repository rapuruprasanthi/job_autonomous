import { apiClient } from './client';
import { User, AuthTokens } from '../lib/types';

export const authApi = {
  async register(data: { email: string; password: string; full_name: string }): Promise<User> {
    const res = await apiClient.post<User>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthTokens> {
    const res = await apiClient.post<AuthTokens>('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  }
};
