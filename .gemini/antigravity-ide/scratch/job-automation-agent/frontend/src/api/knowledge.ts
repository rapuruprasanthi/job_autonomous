import { apiClient } from './client';
import { KnowledgeEntry } from '../lib/types';

export const knowledgeApi = {
  async getKnowledge(): Promise<KnowledgeEntry[]> {
    const res = await apiClient.get<KnowledgeEntry[]>('/knowledge');
    return res.data;
  },

  async createKnowledge(data: { category?: string; question_pattern: string; answer: string; verified?: boolean; sensitive?: boolean }): Promise<KnowledgeEntry> {
    const res = await apiClient.post<KnowledgeEntry>('/knowledge', data);
    return res.data;
  },

  async updateKnowledge(id: number, data: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> {
    const res = await apiClient.put<KnowledgeEntry>(`/knowledge/${id}`, data);
    return res.data;
  },

  async deleteKnowledge(id: number): Promise<void> {
    await apiClient.delete(`/knowledge/${id}`);
  }
};
