import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileCheck, 
  CheckCircle2, 
  Mail, 
  Clock, 
  Database, 
  Globe, 
  Settings,
  Bot
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', path: '/jobs', icon: Briefcase },
  { name: 'Applications', path: '/applications', icon: FileCheck },
  { name: 'Approvals Queue', path: '/approvals', icon: CheckCircle2 },
  { name: 'HR Outreach', path: '/outreach', icon: Mail },
  { name: 'Activity Timeline', path: '/timeline', icon: Clock },
  { name: 'Knowledge Base', path: '/knowledge', icon: Database },
  { name: 'Portals', path: '/portals', icon: Globe },
  { name: 'Settings & Audit', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#121821] border-r border-[#263043] min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-[#263043]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-violet">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#E6EAF2] tracking-tight">AutoJob AI</h1>
            <p className="text-xs text-[#8B95A7]">Autonomous Agent</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-cyan-500/10 text-violet-400 border border-violet-500/30 font-semibold shadow-sm'
                      : 'text-[#8B95A7] hover:text-[#E6EAF2] hover:bg-[#1A2230]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Status Footnote */}
      <div className="p-4 m-4 rounded-xl bg-[#1A2230] border border-[#263043] flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
        <div className="text-xs">
          <p className="font-medium text-[#E6EAF2]">Agent Active</p>
          <p className="text-[#8B95A7] text-[11px]">Mock Engine Ready</p>
        </div>
      </div>
    </aside>
  );
};
