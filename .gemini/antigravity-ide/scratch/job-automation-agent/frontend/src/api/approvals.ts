import { apiClient } from './client';
import { Application, ScreeningQA } from '../lib/types';

export const approvalsApi = {
  async getApprovalQueue(): Promise<Application[]> {
    const res = await apiClient.get<Application[]>('/approvals');
    return res.data;
  },

  async executeAction(appId: number, action: 'approve' | 'reject' | 'edit', edited_qa?: ScreeningQA[], notes?: string): Promise<Application> {
    const res = await apiClient.post<Application>(`/approvals/${appId}/action`, {
      action,
      edited_qa,
      notes
    });
    return res.data;
  }
};
