import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Edit3, ShieldAlert, Sparkles, FileText, Check, AlertTriangle } from 'lucide-react';
import { approvalsApi } from '../api/approvals';
import { Application, ScreeningQA } from '../lib/types';

export const ApprovalsPage: React.FC = () => {
  const [queue, setQueue] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editedQa, setEditedQa] = useState<ScreeningQA[]>([]);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await approvalsApi.getApprovalQueue();
      setQueue(data);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: number) => {
    try {
      await approvalsApi.executeAction(appId, 'approve');
      setQueue(queue.filter((a) => a.id !== appId));
    } catch (err) {
      alert('Failed to approve application');
    }
  };

  const handleReject = async (appId: number) => {
    try {
      await approvalsApi.executeAction(appId, 'reject');
      setQueue(queue.filter((a) => a.id !== appId));
    } catch (err) {
      alert('Failed to reject application');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    try {
      await approvalsApi.executeAction(editingApp.id, 'edit', editedQa);
      setEditingApp(null);
      await loadQueue();
    } catch (err) {
      alert('Failed to save edited answers');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Human Approval Queue</h1>
            <p className="text-sm text-[#8B95A7]">Review prepared applications, verify sensitive Q&A answers, and approve with 1 click</p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            {queue.length} Pending Review
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-[#121821] border border-[#263043] animate-pulse" />
          ))}
        </div>
      ) : queue.length === 0 ? (
        <div className="bg-[#121821] border border-[#263043] rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-[#E6EAF2]">Approval Queue Clear</h3>
          <p className="text-xs text-[#8B95A7]">No applications currently pending human review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((app) => (
            <div key={app.id} className="bg-[#121821] border border-amber-500/30 rounded-2xl p-6 transition-all space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase">
                      Action Required
                    </span>
                    <span className="text-xs text-[#8B95A7]">{app.portal_name}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#E6EAF2] mt-1 tracking-tight">{app.job?.title}</h3>
                  <p className="text-xs font-semibold text-violet-400">{app.job?.company} $\cdot$ <span className="text-emerald-400">{app.job?.salary_range || 'Competitive'}</span></p>
                </div>

                {/* Approve / Edit / Reject buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingApp(app);
                      setEditedQa([...app.screening_qa]);
                    }}
                    className="px-3.5 py-2 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-[#E6EAF2] rounded-xl border border-[#263043] flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit Answers</span>
                  </button>

                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Submit</span>
                  </button>
                </div>
              </div>

              {/* Prepared Q&A items */}
              {app.screening_qa && app.screening_qa.length > 0 && (
                <div className="pl-2 pt-3 border-t border-[#263043] space-y-2">
                  <p className="text-xs font-bold text-[#8B95A7] uppercase">Prepared Screening Q&A Answers:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {app.screening_qa.map((qa, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#1A2230] border border-[#263043] text-xs space-y-1">
                        <p className="font-semibold text-[#E6EAF2]">{qa.question}</p>
                        <p className="text-[#8B95A7] font-mono bg-[#121821] p-2 rounded border border-[#263043]">"{qa.answer}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121821] border border-[#263043] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#E6EAF2]">Edit Screening Q&A Answers</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {editedQa.map((qa, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-xs font-semibold text-[#8B95A7]">{qa.question}</label>
                  <textarea
                    rows={2}
                    value={qa.answer}
                    onChange={(e) => {
                      const updated = [...editedQa];
                      updated[idx].answer = e.target.value;
                      setEditedQa(updated);
                    }}
                    className="w-full bg-[#1A2230] border border-[#263043] focus:border-violet-500 rounded-xl p-3 text-xs text-[#E6EAF2] outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#263043]">
              <button onClick={() => setEditingApp(null)} className="px-4 py-2 bg-[#1A2230] text-xs font-semibold rounded-xl text-[#8B95A7]">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-glow-violet">
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
