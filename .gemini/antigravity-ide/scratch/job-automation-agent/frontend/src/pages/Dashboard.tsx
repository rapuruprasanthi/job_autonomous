import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FileCheck, CheckCircle2, Mail, Users, Play, Sparkles, Award, TrendingUp, Inbox, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { dashboardApi } from '../api/dashboard';
import { orchestratorApi } from '../api/orchestrator';
import { DashboardStats } from '../lib/types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch {
      // Fallback sample data if empty
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    setRunning(true);
    try {
      await orchestratorApi.runNow();
      await loadStats();
    } finally {
      setRunning(false);
    }
  };

  const COLORS = ['#8B5CF6', '#22D3EE', '#34D399', '#FBBF24', '#F87171'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Agent Dashboard & Analytics</h1>
          <p className="text-sm text-[#8B95A7]">Autonomous job hunting pipeline performance and recruiter conversion metrics</p>
        </div>

        <button
          onClick={handleRunNow}
          disabled={running}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow-violet active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Running Pipeline...' : 'Run Agent Loop'}</span>
        </button>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Jobs Discovered', val: stats?.jobs_discovered || 0, icon: Briefcase, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          { title: '70%+ Relevant Jobs', val: stats?.jobs_relevant || 0, icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { title: 'Applications Submitted', val: stats?.apps_submitted || 0, icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { title: 'Interviews Landed', val: stats?.interviews || 0, icon: Sparkles, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`p-5 rounded-2xl border ${card.bg} bg-[#121821] space-y-2 shadow-xl`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8B95A7]">{card.title}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-black text-[#E6EAF2] tracking-tight">{card.val}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Funnel Chart */}
        <div className="lg:col-span-2 bg-[#121821] border border-[#263043] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#E6EAF2]">Application Funnel</h3>
              <p className="text-xs text-[#8B95A7]">Conversion pipeline from discovery to interviews</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.funnel || [
                { stage: "Discovered", count: 12 },
                { stage: "Relevant", count: 8 },
                { stage: "Queued", count: 5 },
                { stage: "Applied", count: 3 },
                { stage: "Interviews", count: 1 }
              ]}>
                <XAxis dataKey="stage" stroke="#8B95A7" fontSize={11} tickLine={false} />
                <YAxis stroke="#8B95A7" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A2230', borderColor: '#263043', borderRadius: '12px', color: '#E6EAF2' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(stats?.funnel || [1,2,3,4,5]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Portal Breakdown Distribution */}
        <div className="bg-[#121821] border border-[#263043] rounded-2xl p-6 space-y-4 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#E6EAF2]">Portal Distribution</h3>
            <p className="text-xs text-[#8B95A7]">Job sources across 13+ portals</p>
          </div>

          <div className="space-y-3">
            {(stats?.portal_breakdown || [
              { portal: "LinkedIn", count: 5 },
              { portal: "Naukri", count: 4 },
              { portal: "Wellfound", count: 3 }
            ]).map((p, idx) => (
              <div key={p.portal} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1A2230] border border-[#263043]">
                <span className="font-semibold text-[#E6EAF2]">{p.portal}</span>
                <span className="font-bold text-violet-400">{p.count} Postings</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#263043] text-[11px] text-[#8B95A7] flex items-center justify-between">
            <span>Overall Outreach Reply Rate</span>
            <span className="font-bold text-emerald-400">{stats?.conversion_rate || 33.3}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
