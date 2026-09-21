import React from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound
} from 'lucide-react';

export default function SettingsPortalTab({ userSession, setUserSession, onOpenAuthModal }) {
  const { permissions, quotas, activeMode, user } = userSession;

  const handlePortalToggle = (portalKey) => {
    setUserSession(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [portalKey]: !prev.permissions[portalKey]
      }
    }));
  };

  const portalList = [
    { key: "linkedin", name: "LinkedIn Jobs", logo: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png" },
    { key: "naukri", name: "Naukri.com", logo: "https://static.naukimg.com/s/4/100/i/naukri_Logo.png" },
    { key: "indeed", name: "Indeed", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Indeed_logo.png" },
    { key: "glassdoor", name: "Glassdoor", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Glassdoor_logo.svg" },
    { key: "wellfound", name: "Wellfound (AngelList)", logo: "https://photos.wellfound.com/investors/pixels/default_logo.png" },
    { key: "cutshort", name: "Cutshort", logo: "https://cutshort.io/assets/images/cutshort_logo.png" },
    { key: "instahyre", name: "Instahyre", logo: "https://www.instahyre.com/static/images/instahyre_logo.png" },
    { key: "hirist", name: "Hirist", logo: "https://www.hirist.com/images/hirist-logo.png" },
    { key: "shine", name: "Shine.com", logo: "https://www.shine.com/next/static/images/shine-logo.png" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" /> Agent Operating Governance & Portal Permissions
          </h2>
          <p className="text-xs text-gray-400">
            Control allowed job portals, daily quotas, operating modes, and JWT security tokens.
          </p>
        </div>

        <button 
          onClick={onOpenAuthModal}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <KeyRound className="w-4 h-4 text-emerald-400" /> Manage JWT Token & OAuth Keys
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Operating Modes & Quotas (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Operating Mode Selector Card */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Agent Operating Mode
            </h3>

            <div className="space-y-3">
              {/* Fully Autonomous */}
              <label className={`block border p-3.5 rounded-xl cursor-pointer transition-all ${
                activeMode === 'Autonomous' 
                  ? 'border-purple-500 bg-purple-900/30' 
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="operatingMode" 
                      value="Autonomous"
                      checked={activeMode === 'Autonomous'}
                      onChange={() => setUserSession(prev => ({ ...prev, activeMode: 'Autonomous' }))}
                    />
                    Fully Autonomous Mode
                  </span>
                  <span className="badge badge-purple text-[10px]">MAX SPEED</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 pl-5">
                  Agent automatically discovers, tailors LaTeX resumes, submits applications, and sends recruiter emails without asking.
                </p>
              </label>

              {/* Approval Mode */}
              <label className={`block border p-3.5 rounded-xl cursor-pointer transition-all ${
                activeMode === 'Approval' 
                  ? 'border-amber-500 bg-amber-900/30' 
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="operatingMode" 
                      value="Approval"
                      checked={activeMode === 'Approval'}
                      onChange={() => setUserSession(prev => ({ ...prev, activeMode: 'Approval' }))}
                    />
                    Approval Mode (Recommended)
                  </span>
                  <span className="badge badge-gold text-[10px]">BALANCED SAFETY</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 pl-5">
                  Agent prepares tailored resumes & cold emails, but stages them for your 1-click approval before sending.
                </p>
              </label>

              {/* Assisted Mode */}
              <label className={`block border p-3.5 rounded-xl cursor-pointer transition-all ${
                activeMode === 'Assisted' 
                  ? 'border-cyan-500 bg-cyan-900/30' 
                  : 'border-white/10 bg-black/40 hover:border-white/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="operatingMode" 
                      value="Assisted"
                      checked={activeMode === 'Assisted'}
                      onChange={() => setUserSession(prev => ({ ...prev, activeMode: 'Assisted' }))}
                    />
                    Assisted Mode
                  </span>
                  <span className="badge badge-cyan text-[10px]">RESEARCH ONLY</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 pl-5">
                  Agent performs research and presents custom materials; candidate performs all manual submissions.
                </p>
              </label>
            </div>
          </div>

          {/* Daily Quotas & Guardrails */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Daily Quota Limits & Safety Guardrails
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Max Applications Per Day</span>
                <span className="font-mono text-emerald-300 font-bold">{quotas.maxPerDay} Apps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Max Per Portal / Day</span>
                <span className="font-mono text-cyan-300 font-bold">{quotas.maxPerPortal} Apps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Min Salary Target Filter</span>
                <span className="font-mono text-amber-300 font-bold">{user.minSalary}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Portal Access Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" /> Portal Access & Permission Governance
                </h3>
                <p className="text-xs text-gray-400">Toggle which job portals the agent is authorized to search and apply through</p>
              </div>
              <span className="badge badge-emerald text-xs font-mono">JWT Scoped</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portalList.map(portal => {
                const isEnabled = permissions[portal.key];
                return (
                  <div key={portal.key} className="bg-black/50 border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                        {portal.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{portal.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {isEnabled ? 'Authorized & Connected' : 'Access Restricted'}
                        </div>
                      </div>
                    </div>

                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={!!isEnabled}
                        onChange={() => handlePortalToggle(portal.key)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
