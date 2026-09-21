import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, FileText, Sliders, Globe, Database, 
  Plus, Trash2, CheckCircle2, Save, Key, Lock, AlertCircle, Shield
} from 'lucide-react';
import { profileApi } from '../api/profile';
import { settingsApi } from '../api/settings';
import { portalsApi } from '../api/portals';
import { knowledgeApi } from '../api/knowledge';
import { CandidateProfile, MasterResume, Preferences, AgentSettings, Portal, KnowledgeEntry, OperatingMode } from '../lib/types';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'agent' | 'portals' | 'knowledge'>('profile');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Data states
  const [profile, setProfile] = useState<Partial<CandidateProfile>>({});
  const [masterResume, setMasterResume] = useState<Partial<MasterResume>>({});
  const [preferences, setPreferences] = useState<Partial<Preferences>>({ target_titles: [] });
  const [newTitle, setNewTitle] = useState('');
  const [agentSettings, setAgentSettings] = useState<Partial<AgentSettings>>({});
  const [portals, setPortals] = useState<Portal[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeEntry[]>([]);
  const [newKnowledge, setNewKnowledge] = useState({ category: 'General', question_pattern: '', answer: '', sensitive: false });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [p, r, pref, s, port, k] = await Promise.all([
        profileApi.getProfile().catch(() => ({})),
        profileApi.getMasterResume().catch(() => ({})),
        profileApi.getPreferences().catch(() => ({ target_titles: [] })),
        settingsApi.getSettings().catch(() => ({})),
        portalsApi.getPortals().catch(() => []),
        knowledgeApi.getKnowledge().catch(() => [])
      ]);

      setProfile(p);
      setMasterResume(r);
      setPreferences(pref);
      setAgentSettings(s);
      setPortals(port);
      setKnowledgeList(k);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileApi.updateProfile(profile);
      setMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to save profile' });
    }
  };

  const handleSavePreferences = async () => {
    if ((preferences.target_titles?.length || 0) > 3) {
      setMsg({ type: 'error', text: 'Maximum 3 target job titles allowed!' });
      return;
    }
    try {
      await profileApi.updatePreferences(preferences);
      setMsg({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update preferences' });
    }
  };

  const handleAddTitle = () => {
    if (!newTitle.trim()) return;
    const current = preferences.target_titles || [];
    if (current.length >= 3) {
      setMsg({ type: 'error', text: 'Maximum 3 target job titles allowed.' });
      return;
    }
    setPreferences({ ...preferences, target_titles: [...current, newTitle.trim()] });
    setNewTitle('');
    setMsg({ type: '', text: '' });
  };

  const handleSaveAgentSettings = async () => {
    try {
      await settingsApi.updateSettings(agentSettings);
      setMsg({ type: 'success', text: 'Agent settings saved!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to update agent settings' });
    }
  };

  const handleCreateKnowledge = async () => {
    if (!newKnowledge.question_pattern || !newKnowledge.answer) return;
    try {
      const created = await knowledgeApi.createKnowledge(newKnowledge);
      setKnowledgeList([...knowledgeList, created]);
      setNewKnowledge({ category: 'General', question_pattern: '', answer: '', sensitive: false });
      setMsg({ type: 'success', text: 'Knowledge base entry added!' });
    } catch {
      setMsg({ type: 'error', text: 'Failed to create knowledge entry' });
    }
  };

  const handleDeleteKnowledge = async (id: number) => {
    try {
      await knowledgeApi.deleteKnowledge(id);
      setKnowledgeList(knowledgeList.filter((k) => k.id !== id));
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete entry' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Agent Settings & Controls</h1>
        <p className="text-sm text-[#8B95A7]">Configure profile details,preferences, portal permissions, and candidate knowledge base</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#263043] gap-2 overflow-x-auto pb-1">
        {[
          { id: 'profile', name: 'Profile & Master Resume', icon: UserIcon },
          { id: 'preferences', name: 'Preferences (3 Titles)', icon: FileText },
          { id: 'agent', name: 'Operating Mode & Limits', icon: Sliders },
          { id: 'portals', name: 'Portals & Credentials', icon: Globe },
          { id: 'knowledge', name: 'Candidate Knowledge Base', icon: Database },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id as any); setMsg({ type: '', text: '' }); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30 shadow-glow-violet' 
                  : 'text-[#8B95A7] hover:text-[#E6EAF2] hover:bg-[#1A2230]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="bg-[#121821] border border-[#263043] rounded-2xl p-6 shadow-2xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#E6EAF2]">Candidate Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={profile.experience_years || 0}
                  onChange={(e) => setProfile({ ...profile, experience_years: Number(e.target.value) })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-violet"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#E6EAF2]">Job Search Preferences</h2>
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-bold">
                {preferences.target_titles?.length || 0} / 3 Target Titles
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">Target Job Titles (Max 3)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  disabled={(preferences.target_titles?.length || 0) >= 3}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Add target title..."
                  className="flex-1 bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
                <button
                  onClick={handleAddTitle}
                  disabled={(preferences.target_titles?.length || 0) >= 3 || !newTitle.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {preferences.target_titles?.map((t, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold flex items-center gap-2">
                    {t}
                    <button onClick={() => setPreferences({
                      ...preferences,
                      target_titles: preferences.target_titles?.filter((_, idx) => idx !== i)
                    })}>
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-violet"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        )}

        {activeTab === 'agent' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#E6EAF2]">Agent Controls & Limits</h2>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">Operating Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'APPROVAL', name: 'Human Approval Mode' },
                  { id: 'AUTONOMOUS', name: 'Autonomous Mode' },
                  { id: 'ASSISTED', name: 'Assisted Mode' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAgentSettings({ ...agentSettings, mode: m.id as OperatingMode })}
                    className={`p-4 rounded-xl border text-left text-xs font-bold transition-all ${
                      agentSettings.mode === m.id
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-glow-violet'
                        : 'bg-[#1A2230] border-[#263043] text-[#8B95A7]'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">Max Daily Applications</label>
                <input
                  type="number"
                  value={agentSettings.max_apps_per_day || 15}
                  onChange={(e) => setAgentSettings({ ...agentSettings, max_apps_per_day: Number(e.target.value) })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-1">Min Relevance Score Threshold (0 - 100)</label>
                <input
                  type="number"
                  value={agentSettings.min_relevance_score || 70}
                  onChange={(e) => setAgentSettings({ ...agentSettings, min_relevance_score: Number(e.target.value) })}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAgentSettings}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-violet"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        )}

        {activeTab === 'portals' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#E6EAF2]">Portals & Encrypted Credentials</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portals.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#E6EAF2]">{p.name}</h4>
                      <p className="text-[11px] text-[#8B95A7]">{p.base_url}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.has_credential ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {p.has_credential ? `Encrypted (${p.credential_username_masked})` : 'No Credential'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#263043]/50">
                    <label className="flex items-center gap-2 text-xs text-[#8B95A7] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.allowed_to_apply}
                        onChange={async (e) => {
                          const updated = await portalsApi.updatePortal(p.id, { allowed_to_apply: e.target.checked });
                          setPortals(portals.map((pt) => pt.id === p.id ? updated : pt));
                        }}
                        className="rounded bg-gray-900 border-gray-700 text-violet-600"
                      />
                      <span>Allowed to Apply</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#E6EAF2]">Candidate Knowledge Base (Verified Facts)</h2>

            {/* Add Entry Form */}
            <div className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] space-y-3">
              <h3 className="text-xs font-bold text-[#8B95A7] uppercase">Add Verified Fact / Screening Q&A Answer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newKnowledge.question_pattern}
                  onChange={(e) => setNewKnowledge({ ...newKnowledge, question_pattern: e.target.value })}
                  placeholder="Question pattern (e.g. Notice period?)"
                  className="bg-[#121821] border border-[#263043] rounded-xl px-3 py-2 text-xs text-[#E6EAF2] outline-none"
                />
                <input
                  type="text"
                  value={newKnowledge.answer}
                  onChange={(e) => setNewKnowledge({ ...newKnowledge, answer: e.target.value })}
                  placeholder="Grounded answer (e.g. 30 days notice)"
                  className="bg-[#121821] border border-[#263043] rounded-xl px-3 py-2 text-xs text-[#E6EAF2] outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-[#8B95A7]">
                  <input
                    type="checkbox"
                    checked={newKnowledge.sensitive}
                    onChange={(e) => setNewKnowledge({ ...newKnowledge, sensitive: e.target.checked })}
                    className="rounded bg-gray-900 border-gray-700 text-amber-500"
                  />
                  <span>Mark Sensitive (Requires Human Approval in Approval Mode)</span>
                </label>

                <button
                  onClick={handleCreateKnowledge}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-glow-violet"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Fact
                </button>
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {knowledgeList.map((k) => (
                <div key={k.id} className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-400">{k.category}</span>
                      {k.sensitive && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          Sensitive Fact
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#E6EAF2]">{k.question_pattern}</p>
                    <p className="text-xs text-[#8B95A7]">{k.answer}</p>
                  </div>

                  <button onClick={() => handleDeleteKnowledge(k.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
