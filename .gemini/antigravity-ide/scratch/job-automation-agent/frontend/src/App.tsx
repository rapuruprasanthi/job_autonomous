import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import { DashboardPage } from './pages/Dashboard';
import { JobsPage } from './pages/Jobs';
import { ApplicationsPage } from './pages/Applications';
import { ApprovalsPage } from './pages/Approvals';
import { OutreachPage } from './pages/Outreach';
import { TimelinePage } from './pages/Timeline';
import { KnowledgeBasePage } from './pages/KnowledgeBase';
import { PortalsPage } from './pages/Portals';
import { SettingsPage } from './pages/Settings';
import { OnboardingPage } from './pages/Onboarding';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Agent Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout mode="APPROVAL" />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/outreach" element={<OutreachPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/knowledge" element={<KnowledgeBasePage />} />
                <Route path="/portals" element={<PortalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>
            </Route>

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
