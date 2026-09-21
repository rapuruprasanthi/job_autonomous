import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { LogOut, User as UserIcon, ShieldAlert, Play, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { OperatingMode } from '../lib/types';

interface TopbarProps {
  mode?: OperatingMode;
  onRunNow?: () => void;
  isAgentRunning?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  mode = 'APPROVAL', 
  onRunNow, 
  isAgentRunning = false 
}) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getModeBadge = (m: OperatingMode) => {
    switch (m) {
      case 'AUTONOMOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            AUTONOMOUS MODE
          </span>
        );
      case 'APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            HUMAN APPROVAL MODE
          </span>
        );
      case 'ASSISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            ASSISTED MODE
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-[#121821] border-b border-[#263043] px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mode badge & Run Agent trigger */}
      <div className="flex items-center gap-4">
        {getModeBadge(mode)}
        
        {onRunNow && (
          <button
            onClick={onRunNow}
            disabled={isAgentRunning}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              isAgentRunning
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-glow-violet active:scale-95'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
            <span>{isAgentRunning ? 'Running Pipeline...' : 'Run Agent Now'}</span>
          </button>
        )}
      </div>

      {/* Right: User menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-[#1A2230] border border-transparent hover:border-[#263043] transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-xs">
            {user?.full_name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[#E6EAF2]">{user?.full_name || 'Candidate'}</p>
            <p className="text-[11px] text-[#8B95A7]">{user?.email}</p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-[#121821] border border-[#263043] rounded-xl shadow-2xl py-1.5 z-50">
            <div className="px-4 py-2 border-b border-[#263043]">
              <p className="text-xs font-medium text-[#E6EAF2] truncate">{user?.full_name}</p>
              <p className="text-[11px] text-[#8B95A7] truncate">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
