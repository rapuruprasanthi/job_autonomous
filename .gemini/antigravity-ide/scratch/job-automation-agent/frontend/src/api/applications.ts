import { apiClient } from './client';
import { Application, ApplicationStatus } from '../lib/types';

export const applicationsApi = {
  async getApplications(status_filter?: ApplicationStatus): Promise<Application[]> {
    const res = await apiClient.get<Application[]>('/applications', { params: { status_filter } });
    return res.data;
  },

  async getApplicationById(id: number): Promise<Application> {
    const res = await apiClient.get<Application>(`/applications/${id}`);
    return res.data;
  },

  getResumeDownloadUrl(appId: number, format: 'tex' | 'pdf' = 'tex'): string {
    const baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
    return `${baseUrl}/applications/${appId}/resume/download?format=${format}`;
  }
};
