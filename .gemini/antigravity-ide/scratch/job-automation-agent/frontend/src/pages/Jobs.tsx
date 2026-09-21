import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Filter, ExternalLink, Sparkles, MapPin, DollarSign, Award, Play } from 'lucide-react';
import { jobsApi } from '../api/jobs';
import { orchestratorApi } from '../api/orchestrator';
import { Job } from '../lib/types';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRelevant, setFilterRelevant] = useState<boolean | undefined>(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [filterRelevant]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsApi.getJobs({ is_relevant: filterRelevant, search });
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await orchestratorApi.runNow();
      await loadJobs();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Discovered Jobs</h1>
          <p className="text-sm text-[#8B95A7]">Autonomous multi-portal job search & relevance scoring</p>
        </div>

        <button
          onClick={handleRunNow}
          disabled={running}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-violet active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Running Pipeline...' : 'Run Job Discovery'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#121821] border border-[#263043] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8B95A7] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
            placeholder="Search jobs by title or company..."
            className="w-full bg-[#1A2230] border border-[#263043] focus:border-violet-500 rounded-xl px-4 py-2 pl-10 text-xs text-[#E6EAF2] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterRelevant(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterRelevant === true
                ? 'bg-violet-600/20 text-violet-400 border-violet-500/40 shadow-glow-violet'
                : 'bg-[#1A2230] text-[#8B95A7] border-[#263043]'
            }`}
          >
            Relevant Only
          </button>
          <button
            onClick={() => setFilterRelevant(undefined)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterRelevant === undefined
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[#1A2230] text-[#8B95A7] border-[#263043]'
            }`}
          >
            All Postings
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#121821] border border-[#263043] animate-pulse p-6" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-[#121821] border border-[#263043] rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-12 h-12 text-[#8B95A7] mx-auto" />
          <h3 className="text-base font-bold text-[#E6EAF2]">No Job Postings Found</h3>
          <p className="text-xs text-[#8B95A7]">Click "Run Job Discovery" to search enabled job portals automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-[#121821] border border-[#263043] hover:border-violet-500/40 rounded-2xl p-6 transition-all space-y-4 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1A2230] border border-[#263043] text-[10px] font-bold text-[#8B95A7] uppercase tracking-wider">
                      {job.portal_name || 'Portal'}
                    </span>
                    <h3 className="text-base font-bold text-[#E6EAF2] mt-1 tracking-tight">{job.title}</h3>
                    <p className="text-xs font-semibold text-violet-400">{job.company}</p>
                  </div>

                  {/* Score Badge */}
                  <div className={`px-3 py-1 rounded-xl text-xs font-extrabold border flex items-center gap-1 ${
                    job.score >= 80 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : job.score >= 60
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}>
                    <Award className="w-3.5 h-3.5" />
                    <span>{job.score.toFixed(0)}% Score</span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-[#8B95A7] pt-2">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" /> {job.salary_range}
                    </span>
                  )}
                </div>

                {/* Reasoning */}
                {job.reasoning && (
                  <div className="mt-3 p-3 rounded-xl bg-[#1A2230] border border-[#263043] text-xs text-[#8B95A7] italic leading-relaxed">
                    "{job.reasoning}"
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#263043] flex items-center justify-between">
                <span className="text-[11px] text-[#8B95A7]">Work Mode: <strong className="text-[#E6EAF2]">{job.work_mode}</strong></span>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-cyan-400 rounded-xl border border-[#263043] flex items-center gap-1.5"
                >
                  <span>View Original Job</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
