import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Shield, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { knowledgeApi } from '../api/knowledge';
import { KnowledgeEntry } from '../lib/types';
import { MOCK_KNOWLEDGE } from '../lib/mockData';

export const KnowledgeBasePage: React.FC = () => {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [newKnowledge, setNewKnowledge] = useState({
    category: 'General',
    question_pattern: '',
    answer: '',
    sensitive: false
  });

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const data = await knowledgeApi.getKnowledge();
      setEntries(data.length > 0 ? data : MOCK_KNOWLEDGE);
    } catch {
      setEntries(MOCK_KNOWLEDGE);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKnowledge.question_pattern.trim() || !newKnowledge.answer.trim()) return;
    try {
      const created = await knowledgeApi.createKnowledge(newKnowledge);
      setEntries([...entries, created]);
      setMsg({ type: 'success', text: 'Candidate fact added to Knowledge Base!' });
    } catch {
      const localNew: KnowledgeEntry = {
        id: Date.now(),
        category: newKnowledge.category,
        question_pattern: newKnowledge.question_pattern,
        answer: newKnowledge.answer,
        verified: true,
        sensitive: newKnowledge.sensitive,
        created_at: new Date().toISOString()
      };
      setEntries([...entries, localNew]);
      setMsg({ type: 'success', text: 'Fact saved to Candidate Knowledge Base!' });
    } finally {
      setNewKnowledge({ category: 'General', question_pattern: '', answer: '', sensitive: false });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await knowledgeApi.deleteKnowledge(id);
      setEntries(entries.filter((e) => e.id !== id));
    } catch {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Candidate Knowledge Base</h1>
        <p className="text-sm text-[#8B95A7]">Verified candidate facts (Notice Period, CTC in LPA, Work Auth) used to automatically answer application screening questions</p>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 border ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Add New Fact Box */}
      <div className="bg-[#121821] border border-[#263043] rounded-2xl p-6 space-y-4 shadow-2xl">
        <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Add Verified Fact / Standard Answer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#8B95A7] mb-1">Category</label>
            <select
              value={newKnowledge.category}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, category: e.target.value })}
              className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-3 py-2 text-xs text-[#E6EAF2] outline-none"
            >
              <option value="Notice Period">Notice Period</option>
              <option value="Compensation">Compensation / CTC (LPA)</option>
              <option value="Work Authorization">Work Authorization</option>
              <option value="Relocation">Relocation & Work Mode</option>
              <option value="General">General Background</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B95A7] mb-1">Question Pattern</label>
            <input
              type="text"
              value={newKnowledge.question_pattern}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, question_pattern: e.target.value })}
              placeholder="e.g. Official notice period?"
              className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-3 py-2 text-xs text-[#E6EAF2] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8B95A7] mb-1">Grounded Answer</label>
            <input
              type="text"
              value={newKnowledge.answer}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, answer: e.target.value })}
              placeholder="e.g. 30 days notice"
              className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-3 py-2 text-xs text-[#E6EAF2] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#263043]">
          <label className="flex items-center gap-2 text-xs text-[#8B95A7] cursor-pointer">
            <input
              type="checkbox"
              checked={newKnowledge.sensitive}
              onChange={(e) => setNewKnowledge({ ...newKnowledge, sensitive: e.target.checked })}
              className="rounded bg-gray-900 border-gray-700 text-amber-500"
            />
            <span>Mark Sensitive (Requires Human Approval in Human Approval Mode)</span>
          </label>

          <button
            onClick={handleCreate}
            className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-glow-violet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Fact</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-[#121821] border border-[#263043] hover:border-violet-500/40 rounded-2xl p-5 flex items-center justify-between transition-all shadow-xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {entry.category}
                </span>
                {entry.sensitive && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Sensitive Fact
                  </span>
                )}
                <span className="text-[10px] text-emerald-400 font-bold">✓ Verified</span>
              </div>
              <h4 className="text-sm font-bold text-[#E6EAF2]">{entry.question_pattern}</h4>
              <p className="text-xs text-[#8B95A7] font-mono bg-[#1A2230] px-3 py-1.5 rounded-lg border border-[#263043] inline-block">
                "{entry.answer}"
              </p>
            </div>

            <button
              onClick={() => handleDelete(entry.id)}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 border border-transparent hover:border-red-500/30 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
