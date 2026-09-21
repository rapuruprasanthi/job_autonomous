import React from 'react';
import { 
  Briefcase, 
  Send, 
  UserCheck, 
  TrendingUp, 
  Zap, 
  Activity, 
  Clock, 
  FileCode, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import MetricCard from './MetricCard';

export default function DashboardTab({ jobs, hrContacts, userSession, onOpenApproval, onSelectJob }) {
  const appliedJobsCount = jobs.filter(j => j.status.includes('Applied')).length;
  const pendingApprovalCount = jobs.filter(j => j.status === 'Pending Approval').length;
  const positiveRepliesCount = hrContacts.filter(c => c.outreachStatus.includes('Positive')).length;

  // Audit activity stream
  const timelineEvents = [
    {
      id: "ev-1",
      time: "10:14 AM Today",
      type: "Application Submitted",
      title: "Senior Full Stack & Cloud Security Engineer",
      company: "Apex Cloud Systems",
      portal: "LinkedIn",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      detail: "Custom Overleaf LaTeX resume generated with GraphQL & Kubernetes keywords."
    },
    {
      id: "ev-2",
      time: "09:15 AM Today",
      type: "Recruiter Response Received",
      title: "Screening Call Scheduled",
      company: "Apex Cloud Systems (Ananya Sharma - TA Lead)",
      portal: "Email Outreach",
      icon: UserCheck,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      detail: "Positive reply categorized. Introductory 30-min call set for tomorrow 3 PM IST."
    },
    {
      id: "ev-3",
      time: "08:45 AM Today",
      type: "Cold Email Sent",
      title: "Autonomous Agent Architect Role Outreach",
      company: "NeuralFlow Technologies (Vikramaditya Rao)",
      portal: "Outreach Engine",
      icon: Send,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      detail: "Personalized cold email sent with GitHub repository link & customized PDF."
    },
    {
      id: "ev-4",
      time: "08:30 AM Today",
      type: "Job Discovered & JD Match",
      title: "Lead AI & Autonomous Agent Architect",
      company: "NeuralFlow Technologies",
      portal: "Naukri",
      icon: Sparkles,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      detail: "91% Semantic Match Score. Auto-filled 2 screening questions via Knowledge Base."
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner Alert if Pending Approvals */}
      {pendingApprovalCount > 0 && (
        <div className="glass-panel border-amber-500/30 bg-amber-500/10 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 animate-bounce" />
            <div>
              <span className="text-sm font-bold text-amber-200">
                {pendingApprovalCount} Action Item(s) Require Candidate Approval
              </span>
              <p className="text-xs text-amber-300/80">
                Agent is operating in <strong className="underline">{userSession.activeMode} Mode</strong>. Tailored applications are staged for your review.
              </p>
            </div>
          </div>
          <button 
            onClick={onOpenApproval}
            className="btn-gold text-xs px-4 py-2"
          >
            Review Applications <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Jobs Discovered"
          value="48"
          subtext="Across 12 portals today"
          icon={Briefcase}
          color="purple"
          trend="+18 New"
        />
        <MetricCard
          title="Applications Submitted"
          value={appliedJobsCount.toString()}
          subtext={`${userSession.quotas.appliedToday}/${userSession.quotas.maxPerDay} Daily limit used`}
          icon={CheckCircle2}
          color="emerald"
          trend="100% ATS Pass"
        />
        <MetricCard
          title="HR Cold Emails Sent"
          value={hrContacts.length.toString()}
          subtext="Recruiters reached"
          icon={Send}
          color="cyan"
          trend="84% Open Rate"
        />
        <MetricCard
          title="Positive Response Rate"
          value="28.4%"
          subtext={`${positiveRepliesCount} Interview invites`}
          icon={TrendingUp}
          color="gold"
          trend="+12.6% vs Avg"
        />
      </div>

      {/* Main Grid: Application Funnel + Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Conversion Funnel & Target Preferences */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Conversion Funnel */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" /> Application Conversion Pipeline
                </h3>
                <p className="text-xs text-gray-400">Step-by-step breakdown from multi-portal discovery to interview scheduling</p>
              </div>
              <span className="badge badge-purple font-mono text-xs">Self-Learning Active</span>
            </div>

            <div className="space-y-3">
              {/* Funnel Step 1 */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">1</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">Portal Job Discovery & JD Ingestion</div>
                    <div className="text-[11px] text-gray-400">LinkedIn, Naukri, Indeed, Glassdoor, Wellfound, Instahyre</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">48 Jobs</span>
                  <div className="text-[10px] text-emerald-400">100% Filtered</div>
                </div>
              </div>

              {/* Funnel Step 2 */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center">2</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">Semantic Matching & Skill Gap Scoring</div>
                    <div className="text-[11px] text-gray-400">Analyzed against Master Resume keywords & experience</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">24 Qualified</span>
                  <div className="text-[10px] text-cyan-400">&gt;85% Match</div>
                </div>
              </div>

              {/* Funnel Step 3 */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center">3</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">Overleaf / LaTeX Resume Tailoring</div>
                    <div className="text-[11px] text-gray-400">Dynamic skill emphasis, project highlights & ATS formatting</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">12 Compiled</span>
                  <div className="text-[10px] text-emerald-400">0 Errors</div>
                </div>
              </div>

              {/* Funnel Step 4 */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">4</div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">HR Discovery & Personalized Outreach</div>
                    <div className="text-[11px] text-gray-400">Direct cold email to TA Partners with resume & portfolio link</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">8 Sent</span>
                  <div className="text-[10px] text-amber-400">28.4% Replied</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Summary */}
          <div className="glass-panel p-5 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Active Candidate Search Configuration
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400">Target Titles</div>
                <div className="font-semibold text-purple-300 mt-0.5">Full Stack / Cloud Sec / AI</div>
              </div>
              <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400">Locations</div>
                <div className="font-semibold text-emerald-300 mt-0.5">Bengaluru, Remote, Hyd</div>
              </div>
              <div className="bg-black/40 border border-white/10 p-3 rounded-xl">
                <div className="text-gray-400">Min Salary Target</div>
                <div className="font-semibold text-amber-300 mt-0.5">₹28LPA+ / $120k</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Live Activity Stream Timeline */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Agent Activity Feed
              </h3>
              <span className="badge badge-emerald text-[10px] font-mono">LIVE SYNC</span>
            </div>

            <div className="space-y-4">
              {timelineEvents.map((ev) => {
                const IconComponent = ev.icon;
                return (
                  <div key={ev.id} className="relative pl-6 pb-4 border-l border-white/10 last:border-l-0 last:pb-0">
                    <div className={`absolute -left-[13px] top-0 p-1 rounded-full border ${ev.color}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-0.5">
                        <span className="font-bold text-gray-200">{ev.type}</span>
                        <span className="text-gray-400 font-mono text-[10px]">{ev.time}</span>
                      </div>
                      <div className="text-xs font-medium text-purple-300">{ev.title}</div>
                      <div className="text-[11px] text-gray-400">{ev.company} • {ev.portal}</div>
                      <div className="mt-1 text-[11px] text-gray-300 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                        {ev.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 text-center">
            <span className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Continuous Monitoring Active
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
