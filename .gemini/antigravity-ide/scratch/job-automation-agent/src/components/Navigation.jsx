import React from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  Briefcase, 
  Mail, 
  BrainCircuit, 
  Sliders, 
  KeyRound, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, userSession, setUserSession, onOpenAuthModal }) {
  const { user, activeMode } = userSession;

  const handleModeChange = (e) => {
    setUserSession(prev => ({
      ...prev,
      activeMode: e.target.value
    }));
  };

  return (
    <header className="sticky top-0 z-50 px-4 lg:px-8 py-3 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0d0e17] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-gray-100 to-purple-300 bg-clip-text text-transparent">
                AuraCareer
              </h1>
              <span className="badge badge-purple font-mono text-[10px]">
                Agent v2.4
              </span>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>Autonomous Career Automation Agent</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'jobs' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Engine & LaTeX</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'outreach' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>HR Cold Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'learning' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Self-Learning & KB</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Portal Controls</span>
          </button>
        </nav>

        {/* Right Controls: Mode Selector & JWT Auth Badge */}
        <div className="flex items-center gap-3">
          
          {/* Operating Mode Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={userSession.activeMode}
              onChange={(e) => setUserSession(prev => ({ ...prev, activeMode: e.target.value }))}
              className="bg-transparent text-xs font-semibold text-gray-200 outline-none cursor-pointer"
            >
              <option value="Autonomous" className="bg-[#0d0e17] text-purple-300">Fully Autonomous</option>
              <option value="Approval" className="bg-[#0d0e17] text-amber-300">Approval Mode</option>
              <option value="Assisted" className="bg-[#0d0e17] text-cyan-300">Assisted Mode</option>
            </select>
          </div>

          {/* JWT Session Badge Button */}
          <button 
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-mono transition-all"
            title="Inspect Active JWT Security Token"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">JWT Secured</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Candidate Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <img 
              src={user.avatar} 
              alt={user.fullName} 
              className="w-8 h-8 rounded-full border border-purple-500/50 object-cover"
            />
          </div>

        </div>

      </div>
    </header>
  );
}
