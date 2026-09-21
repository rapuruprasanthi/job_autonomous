import { apiClient } from './client';
import { Job } from '../lib/types';

export const jobsApi = {
  async getJobs(params?: { is_relevant?: boolean; portal_id?: number; search?: string }): Promise<Job[]> {
    const res = await apiClient.get<Job[]>('/jobs', { params });
    return res.data;
  },

  async getJobById(id: number): Promise<Job> {
    const res = await apiClient.get<Job>(`/jobs/${id}`);
    return res.data;
  }
};
