import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OperatingMode } from '../lib/types';

interface LayoutProps {
  mode?: OperatingMode;
  onRunNow?: () => void;
  isAgentRunning?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ mode = 'APPROVAL', onRunNow, isAgentRunning }) => {
  return (
    <div className="flex min-h-screen bg-[#0B0F14] text-[#E6EAF2]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar mode={mode} onRunNow={onRunNow} isAgentRunning={isAgentRunning} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
