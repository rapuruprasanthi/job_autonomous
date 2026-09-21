import { apiClient } from './client';
import { Contact, OutreachEmail } from '../lib/types';

export const outreachApi = {
  async getContacts(): Promise<Contact[]> {
    const res = await apiClient.get<Contact[]>('/outreach/contacts');
    return res.data;
  },

  async discoverContacts(companyName: string, role?: string): Promise<Contact[]> {
    const res = await apiClient.post<Contact[]>(`/outreach/discover/${companyName}`, null, { params: { role } });
    return res.data;
  },

  async getEmails(): Promise<OutreachEmail[]> {
    const res = await apiClient.get<OutreachEmail[]>('/outreach/emails');
    return res.data;
  },

  async draftColdEmail(contact_id: number, application_id?: number): Promise<OutreachEmail> {
    const res = await apiClient.post<OutreachEmail>('/outreach/emails/draft', { contact_id, application_id });
    return res.data;
  },

  async simulateReply(email_id: number): Promise<void> {
    await apiClient.post(`/outreach/emails/${email_id}/simulate-reply`);
  },

  async getInsights(): Promise<Record<string, any>> {
    const res = await apiClient.get<Record<string, any>>('/outreach/insights');
    return res.data;
  }
};
