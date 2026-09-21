import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  FileCode, 
  CheckCircle2, 
  ExternalLink, 
  Zap, 
  HelpCircle, 
  ArrowRight,
  Filter,
  Eye,
  Send,
  Code
} from 'lucide-react';
import { generateTailoredLatex } from '../utils/latexGenerator';

export default function JobDiscoveryTab({ jobs, userSession, onOpenLatexModal, onOpenApproval }) {
  const [selectedPortal, setSelectedPortal] = useState('All');
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [showCode, setShowCode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const portals = ['All', 'LinkedIn', 'Naukri', 'Wellfound', 'Instahyre', 'Indeed', 'Glassdoor'];

  const filteredJobs = selectedPortal === 'All' 
    ? jobs 
    : jobs.filter(j => j.portal.toLowerCase() === selectedPortal.toLowerCase());

  const handleRunPipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenApproval();
    }, 800);
  };

  const currentLatexCode = generateTailoredLatex(
    userSession.user.fullName,
    selectedJob.title,
    selectedJob.company,
    selectedJob.keyRequirements,
    selectedJob.missingKeywords
  );

  return (
    <div className="space-y-6">
      
      {/* Header & Portal Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" /> Multi-Portal Job Engine & Overleaf LaTeX Tailoring
          </h2>
          <p className="text-xs text-gray-400">
            Scanning 12+ job portals. Automatically generates custom Overleaf LaTeX resumes matching JD keywords.
          </p>
        </div>

        {/* Portal Badges Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          {portals.map(portal => (
            <button
              key={portal}
              onClick={() => setSelectedPortal(portal)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedPortal === portal 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {portal}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Job Feed List + Tailoring Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Job Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredJobs.map((job) => {
            const isSelected = selectedJob.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-purple-500/60 bg-purple-900/20 shadow-lg shadow-purple-500/10' 
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-purple text-[10px] font-mono">{job.portal}</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">{job.matchScore}% Match Score</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1 line-clamp-1">{job.title}</h3>
                    <div className="text-xs text-gray-300 font-medium">{job.company}</div>
                  </div>
                  <span className={`badge text-[10px] ${
                    job.status.includes('Applied') ? 'badge-emerald' : 'badge-gold'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-2">
                  <span>{job.location}</span>
                  <span className="font-semibold text-amber-300">{job.salary}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Tailoring Workspace & LaTeX Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            
            {/* Selected Job Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-cyan text-xs font-mono">{selectedJob.portal}</span>
                  <span className="badge badge-purple text-xs font-mono">{selectedJob.workMode}</span>
                  <span className="badge badge-gold text-xs font-mono">{selectedJob.experienceLevel}</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mt-2">{selectedJob.title}</h3>
                <div className="text-sm font-semibold text-purple-300">{selectedJob.company} • <span className="text-gray-400">{selectedJob.location}</span></div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-emerald-400 font-mono">{selectedJob.matchScore}%</div>
                <div className="text-[10px] text-gray-400 uppercase font-semibold">Semantic Match Score</div>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div>
              <div className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" /> Key Skills Matched vs Tailored Emphasis:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.keyRequirements.map((req, i) => (
                  <span key={i} className="badge badge-emerald text-[11px]">
                    ✓ {req}
                  </span>
                ))}
                {selectedJob.missingKeywords.map((mk, i) => (
                  <span key={i} className="badge badge-gold text-[11px]">
                    + Injected: {mk}
                  </span>
                ))}
              </div>
            </div>

            {/* Overleaf LaTeX Resume Tailoring Card */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-gray-200">Overleaf / LaTeX Resume Tailored Code</span>
                  <span className="badge badge-cyan text-[10px] font-mono">Compiles Clean</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowCode(!showCode)}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <Code className="w-3.5 h-3.5" />
                    {showCode ? 'Hide Code' : 'View Code'}
                  </button>
                  <button 
                    onClick={() => onOpenLatexModal(currentLatexCode)}
                    className="btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" /> Full Preview
                  </button>
                </div>
              </div>

              {showCode ? (
                <pre className="code-block max-h-48 text-[11px]">
                  {currentLatexCode}
                </pre>
              ) : (
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg text-xs text-gray-300 space-y-1 font-mono">
                  <div className="text-emerald-400 font-bold">✓ Customized Section Header: Senior Full Stack & Cloud Security Specialist</div>
                  <div className="text-gray-400">✓ Injected Keywords: {selectedJob.keyRequirements.slice(0, 4).join(', ')}</div>
                  <div className="text-gray-400">✓ Overleaf Sync Status: PDF Compiled Ready for Upload</div>
                </div>
              )}
            </div>

            {/* Auto-Answered Screening Questions */}
            <div>
              <div className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" /> Auto-Answered Screening Questions (Verified KB):
              </div>
              <div className="space-y-2">
                {selectedJob.applicationQuestions.map((qItem, idx) => (
                  <div key={idx} className="bg-white/[0.03] border border-white/5 p-2.5 rounded-lg text-xs">
                    <div className="font-semibold text-purple-300">{qItem.q}</div>
                    <div className="text-gray-300 font-mono text-[11px] mt-0.5">A: {qItem.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-gray-400 font-mono flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Mode: <strong className="text-white">{userSession.activeMode}</strong>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handleRunPipeline}
                  disabled={isProcessing}
                  className="btn-primary text-xs"
                >
                  {isProcessing ? (
                    <span>Running Tailoring Engine...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Stage & Apply to {selectedJob.company}
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
