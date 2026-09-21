import { apiClient } from './client';

export const orchestratorApi = {
  async runNow(): Promise<{ message: string; results: Record<string, any> }> {
    const res = await apiClient.post('/orchestrator/run-now');
    return res.data;
  }
};
