import React, { useState, useEffect } from 'react';
import { Mail, Search, Sparkles, Send, MessageSquare, UserCheck, Play, Lightbulb, CheckCircle2 } from 'lucide-react';
import { outreachApi } from '../api/outreach';
import { Contact, OutreachEmail } from '../lib/types';

export const OutreachPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'emails'>('emails');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [insights, setInsights] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOutreachData();
  }, []);

  const loadOutreachData = async () => {
    setLoading(true);
    try {
      const [c, e, ins] = await Promise.all([
        outreachApi.getContacts().catch(() => []),
        outreachApi.getEmails().catch(() => []),
        outreachApi.getInsights().catch(() => ({}))
      ]);
      setContacts(c);
      setEmails(e);
      setInsights(ins);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateReply = async (emailId: number) => {
    try {
      await outreachApi.simulateReply(emailId);
      await loadOutreachData();
    } catch {
      alert('Failed to simulate recruiter reply');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">HR Outreach & Cold Emailing</h1>
          <p className="text-sm text-[#8B95A7]">Personalized cold email outreach, recruiter contact discovery, and A/B subject variant tracking</p>
        </div>
      </div>

      {/* Self-Learning Insights Panel */}
      {insights.prompt_hint && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/30 to-cyan-900/20 border border-violet-500/30 flex items-start gap-3 shadow-xl">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Self-Learning Feedback Insight</h4>
            <p className="text-xs text-[#E6EAF2] leading-relaxed">{insights.prompt_hint}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#263043] gap-2">
        <button
          onClick={() => setActiveTab('emails')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'emails'
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-glow-violet'
              : 'text-[#8B95A7] hover:text-[#E6EAF2] hover:bg-[#1A2230]'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Outreach Emails ({emails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'contacts'
              ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-glow-violet'
              : 'text-[#8B95A7] hover:text-[#E6EAF2] hover:bg-[#1A2230]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Discovered Contacts ({contacts.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          {emails.map((e) => (
            <div key={e.id} className="bg-[#121821] border border-[#263043] rounded-2xl p-6 transition-all space-y-3 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      e.status === 'REPLIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {e.status}
                    </span>
                    <span className="text-xs font-bold text-violet-400">Variant: {e.subject_variant}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#E6EAF2] mt-1">{e.subject}</h3>
                  <p className="text-xs text-[#8B95A7]">To: {e.contact?.name || 'Recruiter'} ({e.contact?.company_name})</p>
                </div>

                {e.status !== 'REPLIED' && (
                  <button
                    onClick={() => handleSimulateReply(e.id)}
                    className="px-3.5 py-1.5 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-cyan-400 rounded-xl border border-[#263043] flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Simulate Recruiter Reply</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] text-xs text-[#8B95A7] font-mono whitespace-pre-wrap leading-relaxed">
                {e.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="bg-[#121821] border border-[#263043] rounded-2xl p-5 space-y-2 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#E6EAF2]">{c.name}</h4>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {int_conf(c.confidence_score)}% Confidence
                </span>
              </div>
              <p className="text-xs text-violet-400">{c.title || 'Recruiter'} at {c.company_name}</p>
              <p className="text-xs text-[#8B95A7] font-mono">{c.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function int_conf(val: number) {
  return Math.round((val || 0.85) * 100);
}
