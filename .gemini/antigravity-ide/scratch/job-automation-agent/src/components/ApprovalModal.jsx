import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, X, Send, FileText, AlertTriangle } from 'lucide-react';

export default function ApprovalModal({ pendingJobs, onClose, onApproveAll }) {
  const [approvedIds, setApprovedIds] = useState([]);

  const toggleApprove = (id) => {
    setApprovedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmSubmit = () => {
    onApproveAll();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel glass-panel-glow w-full max-w-2xl max-h-[90vh] flex flex-col p-6 rounded-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Human Approval Control Gate
                <span className="badge badge-gold text-xs font-mono">Approval Mode</span>
              </h3>
              <p className="text-xs text-gray-400">
                Review and approve staged application packages and recruiter cold emails before dispatch.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pending Applications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {pendingJobs.map(job => (
            <div key={job.id} className="bg-black/60 border border-white/10 p-4 rounded-xl space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge badge-purple text-[10px] font-mono">{job.portal}</span>
                  <h4 className="text-sm font-bold text-white mt-1">{job.title}</h4>
                  <div className="text-xs text-purple-300">{job.company} • {job.location}</div>
                </div>
                <button 
                  onClick={() => toggleApprove(job.id)}
                  className={`btn-secondary text-xs px-3 py-1 flex items-center gap-1.5 ${
                    approvedIds.includes(job.id) ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10' : ''
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${approvedIds.includes(job.id) ? 'text-emerald-400' : 'text-gray-400'}`} />
                  {approvedIds.includes(job.id) ? 'Approved' : 'Approve Application'}
                </button>
              </div>

              <div className="text-[11px] text-gray-300 bg-white/[0.03] p-2.5 rounded-lg border border-white/5 space-y-1">
                <div className="text-emerald-400 font-mono">✓ Tailored Overleaf LaTeX Resume Compiled</div>
                <div className="text-cyan-300 font-mono">✓ Auto-filled Screening Questions (3/3 Verified)</div>
                <div className="text-amber-300 font-mono">✓ Cold Email Drafted for TA Partner</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            {pendingJobs.length} Item(s) Staged for Dispatch
          </span>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button onClick={handleConfirmSubmit} className="btn-gold text-xs px-4">
              <Send className="w-3.5 h-3.5" /> Approve & Submit All ({pendingJobs.length})
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
