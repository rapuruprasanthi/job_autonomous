import { apiClient } from './client';
import { CandidateProfile, MasterResume, Preferences } from '../lib/types';

export const profileApi = {
  async getProfile(): Promise<CandidateProfile> {
    const res = await apiClient.get<CandidateProfile>('/profile/me');
    return res.data;
  },

  async updateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await apiClient.put<CandidateProfile>('/profile/me', data);
    return res.data;
  },

  async getMasterResume(): Promise<MasterResume> {
    const res = await apiClient.get<MasterResume>('/profile/resume');
    return res.data;
  },

  async pasteResume(raw_text: string): Promise<MasterResume> {
    const res = await apiClient.post<MasterResume>('/profile/resume/paste', { raw_text });
    return res.data;
  },

  async uploadResume(file: File): Promise<MasterResume> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<MasterResume>('/profile/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async updateStructuredResume(structured_json: Record<string, any>): Promise<MasterResume> {
    const res = await apiClient.put<MasterResume>('/profile/resume/structured', structured_json);
    return res.data;
  },

  async getPreferences(): Promise<Preferences> {
    const res = await apiClient.get<Preferences>('/profile/preferences');
    return res.data;
  },

  async updatePreferences(data: Partial<Preferences>): Promise<Preferences> {
    const res = await apiClient.put<Preferences>('/profile/preferences', data);
    return res.data;
  }
};
