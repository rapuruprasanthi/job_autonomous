import React, { useState } from 'react';
import Navigation from './components/Navigation';
import DashboardTab from './components/DashboardTab';
import JobDiscoveryTab from './components/JobDiscoveryTab';
import ColdOutreachTab from './components/ColdOutreachTab';
import SelfLearningTab from './components/SelfLearningTab';
import SettingsPortalTab from './components/SettingsPortalTab';
import AuthModal from './components/AuthModal';
import LaTeXPreviewModal from './components/LaTeXPreviewModal';
import ApprovalModal from './components/ApprovalModal';

import { initialUserSession } from './data/mockAuth';
import { mockJobsData } from './data/mockJobs';
import { mockHRContactsData } from './data/mockHRContacts';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userSession, setUserSession] = useState(initialUserSession);
  const [jobs, setJobs] = useState(mockJobsData);
  const [hrContacts, setHrContacts] = useState(mockHRContactsData);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
  const [activeLatexCode, setActiveLatexCode] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const handleOpenLatexModal = (latexCode) => {
    setActiveLatexCode(latexCode);
    setIsLatexModalOpen(true);
  };

  const handleApproveAllJobs = () => {
    setJobs(prev => prev.map(j => ({
      ...j,
      status: 'Approved & Applied'
    })));
  };

  return (
    <div className="min-h-screen bg-[#06070a] text-gray-100 flex flex-col font-sans">
      
      {/* Navigation & Header Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSession={userSession}
        setUserSession={setUserSession}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {activeTab === 'dashboard' && (
          <DashboardTab
            jobs={jobs}
            hrContacts={hrContacts}
            userSession={userSession}
            onOpenApproval={() => setIsApprovalModalOpen(true)}
            onSelectJob={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'jobs' && (
          <JobDiscoveryTab
            jobs={jobs}
            userSession={userSession}
            onOpenLatexModal={handleOpenLatexModal}
            onOpenApproval={() => setIsApprovalModalOpen(true)}
          />
        )}

        {activeTab === 'outreach' && (
          <ColdOutreachTab
            hrContacts={hrContacts}
            onSendOutreach={() => alert("Outreach triggered")}
          />
        )}

        {activeTab === 'learning' && (
          <SelfLearningTab />
        )}

        {activeTab === 'settings' && (
          <SettingsPortalTab
            userSession={userSession}
            setUserSession={setUserSession}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

      </main>

      {/* Global Footer */}
      <footer className="border-t border-white/10 py-4 px-8 text-center text-xs text-gray-500 bg-[#06070a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AuraCareer Autonomous Job Automation Agent • <span className="text-purple-400 font-mono">Overleaf LaTeX Tailoring Engine</span>
          </div>
          <div className="font-mono text-[11px] text-gray-400">
            JWT Session Active • Token exp: {new Date(userSession.tokenExpiresAt).toLocaleTimeString()}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAuthModalOpen && (
        <AuthModal
          userSession={userSession}
          setUserSession={setUserSession}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {isLatexModalOpen && (
        <LaTeXPreviewModal
          latexCode={activeLatexCode}
          onClose={() => setIsLatexModalOpen(false)}
        />
      )}

      {isApprovalModalOpen && (
        <ApprovalModal
          pendingJobs={jobs.filter(j => j.status !== 'Approved & Applied')}
          onClose={() => setIsApprovalModalOpen(false)}
          onApproveAll={handleApproveAllJobs}
        />
      )}

    </div>
  );
}
