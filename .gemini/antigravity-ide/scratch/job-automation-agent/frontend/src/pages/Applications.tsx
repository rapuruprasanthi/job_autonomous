import React, { useState, useEffect } from 'react';
import { FileCheck, Download, Eye, CheckCircle2, Clock, XCircle, Sparkles, ExternalLink, FileText } from 'lucide-react';
import { applicationsApi } from '../api/applications';
import { Application, ApplicationStatus } from '../lib/types';

export const ApplicationsPage: React.FC = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQaApp, setSelectedQaApp] = useState<Application | null>(null);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    setLoading(true);
    try {
      const data = await applicationsApi.getApplications();
      setApps(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: ApplicationStatus) => {
    switch (st) {
      case 'APPLIED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Applied</span>;
      case 'QUEUED_FOR_APPROVAL':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Approval Queued</span>;
      case 'INTERVIEW':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">Interview Call</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">{st}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Application Tracker</h1>
        <p className="text-sm text-[#8B95A7]">Full history of tailored LaTeX resumes, screening Q&A, and portal submission statuses</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-[#121821] border border-[#263043] animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="bg-[#121821] border border-[#263043] rounded-2xl p-12 text-center space-y-3">
          <FileCheck className="w-12 h-12 text-[#8B95A7] mx-auto" />
          <h3 className="text-base font-bold text-[#E6EAF2]">No Applications Recorded</h3>
          <p className="text-xs text-[#8B95A7]">Trigger the agent pipeline to generate tailored applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-[#121821] border border-[#263043] hover:border-violet-500/40 rounded-2xl p-6 transition-all space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-[#E6EAF2] tracking-tight">{app.job?.title || 'Role'}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs font-semibold text-violet-400">
                    {app.job?.company} $\cdot$ <span className="text-[#8B95A7]">{app.portal_name}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {app.screening_qa && app.screening_qa.length > 0 && (
                    <button
                      onClick={() => setSelectedQaApp(app)}
                      className="px-3.5 py-2 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-[#E6EAF2] rounded-xl border border-[#263043] flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>View Q&A ({app.screening_qa.length})</span>
                    </button>
                  )}

                  {app.resume_version_id && (
                    <a
                      href={applicationsApi.getResumeDownloadUrl(app.id, 'tex')}
                      download
                      className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-glow-violet"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download .tex Resume</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Keywords weaved in */}
              {app.resume_version?.keywords_added && app.resume_version.keywords_added.length > 0 && (
                <div className="pt-3 border-t border-[#263043]/60 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8B95A7] uppercase">Weaved Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.resume_version.keywords_added.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 text-[11px] font-medium border border-violet-500/30">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Screening Q&A Modal */}
      {selectedQaApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121821] border border-[#263043] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#263043] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#E6EAF2]">Screening Q&A Resolver</h3>
                <p className="text-xs text-[#8B95A7]">{selectedQaApp.job?.title} at {selectedQaApp.job?.company}</p>
              </div>
              <button onClick={() => setSelectedQaApp(null)} className="p-2 hover:bg-gray-800 rounded-lg text-[#8B95A7]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedQaApp.screening_qa.map((qa, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-400">Question {idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Source: {qa.source} ({(qa.confidence * 100).toFixed(0)}% confidence)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#E6EAF2]">{qa.question}</p>
                  <p className="text-xs text-[#8B95A7] bg-[#121821] p-3 rounded-lg border border-[#263043] font-mono">
                    "{qa.answer}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
