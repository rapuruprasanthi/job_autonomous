import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Briefcase, Sliders, ShieldCheck, CheckCircle2, 
  ArrowRight, ArrowLeft, Upload, Plus, X, Sparkles, Key, AlertCircle, Play, FileUp
} from 'lucide-react';
import { profileApi } from '../api/profile';
import { settingsApi } from '../api/settings';
import { portalsApi } from '../api/portals';
import { orchestratorApi } from '../api/orchestrator';
import { OperatingMode, Portal } from '../lib/types';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Master Resume
  const [resumeText, setResumeText] = useState(
    `Prasanthi - Senior Full Stack Engineer\nEmail: prasanthi@example.com | Phone: +91 98765 43210 | Bengaluru, Karnataka\nLinkedIn: linkedin.com/in/prasanthi\n\nPROFESSIONAL SUMMARY:\nSenior Full Stack Engineer with 5+ years of experience building high-performance web applications, microservices, and React dashboards using Python, FastAPI, React, TypeScript, and SQL.\n\nCORE SKILLS:\nPython, FastAPI, React, TypeScript, SQL, PostgreSQL, Redis, Docker, AWS`
  );
  const [parsedSkills, setParsedSkills] = useState<string[]>(['Python', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'AWS']);
  const [resumeParsed, setResumeParsed] = useState(true);

  // Step 2: Preferences (Max 3 target titles enforced!)
  const [targetTitles, setTargetTitles] = useState<string[]>(['Senior Full Stack Engineer', 'Backend Software Engineer', 'SDE-2 Python Developer']);
  const [newTitle, setNewTitle] = useState('');
  const [locations, setLocations] = useState<string[]>(['Bengaluru', 'Hyderabad', 'Remote (India)']);
  const [newLoc, setNewLoc] = useState('');
  const [minSalary, setMinSalary] = useState<number>(2000000);
  const [workModes, setWorkModes] = useState<string[]>(['Remote', 'Hybrid']);

  // Step 3: Operating Mode & Limits
  const [operatingMode, setOperatingMode] = useState<OperatingMode>('APPROVAL');
  const [maxDaily, setMaxDaily] = useState(15);
  const [maxPerPortal, setMaxPerPortal] = useState(5);

  // Step 4: Portals
  const [portals, setPortals] = useState<Portal[]>([]);

  useEffect(() => {
    portalsApi.getPortals().then(setPortals).catch(() => {});
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        setResumeText(text);
        try {
          const res = await profileApi.pasteResume(text);
          if (res.structured_json?.skills) {
            setParsedSkills(res.structured_json.skills);
          }
          setResumeParsed(true);
        } catch {
          setError('Failed to parse uploaded resume file');
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await profileApi.pasteResume(resumeText);
      if (res.structured_json?.skills) {
        setParsedSkills(res.structured_json.skills);
      }
      setResumeParsed(true);
    } catch (err: any) {
      setError('Failed to parse resume text');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndStartAuto = async () => {
    setLoading(true);
    setError('');
    try {
      if (resumeText) {
        await profileApi.pasteResume(resumeText);
      }
      await profileApi.updatePreferences({
        target_titles: targetTitles.slice(0, 3),
        target_locations: locations,
        min_salary: minSalary,
        preferred_work_modes: workModes,
      });
      await settingsApi.updateSettings({
        mode: operatingMode,
        max_apps_per_day: maxDaily,
        max_apps_per_portal: maxPerPortal,
      });
      await orchestratorApi.runNow();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initialize master resume and start agent.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTitle = () => {
    if (!newTitle.trim()) return;
    if (targetTitles.length >= 3) {
      setError('Maximum 3 target job titles allowed!');
      return;
    }
    setError('');
    setTargetTitles([...targetTitles, newTitle.trim()]);
    setNewTitle('');
  };

  const handleRemoveTitle = (idx: number) => {
    setTargetTitles(targetTitles.filter((_, i) => i !== idx));
    setError('');
  };

  const handleAddLocation = () => {
    if (!newLoc.trim()) return;
    setLocations([...locations, newLoc.trim()]);
    setNewLoc('');
  };

  const handleNextStep = async () => {
    setError('');
    if (step === 1 && !resumeParsed && resumeText) {
      await handleParseResume();
    }

    if (step === 2) {
      if (targetTitles.length === 0) {
        setError('Please specify at least 1 target job title (max 3).');
        return;
      }
      if (targetTitles.length > 3) {
        setError('Maximum 3 target job titles allowed.');
        return;
      }
      try {
        await profileApi.updatePreferences({
          target_titles: targetTitles,
          target_locations: locations,
          min_salary: minSalary,
          preferred_work_modes: workModes,
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to save preferences');
        return;
      }
    }

    if (step === 3) {
      try {
        await settingsApi.updateSettings({
          mode: operatingMode,
          max_apps_per_day: maxDaily,
          max_apps_per_portal: maxPerPortal,
        });
      } catch (err: any) {
        setError('Failed to save agent settings');
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      await orchestratorApi.runNow().catch(() => {});
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Wizard Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[
            { num: 1, label: 'Master Resume Upload', icon: FileText },
            { num: 2, label: 'Indian Job Preferences', icon: Briefcase },
            { num: 3, label: 'Agent Mode & Limits', icon: Sliders },
            { num: 4, label: 'Portal Permissions', icon: ShieldCheck },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  isDone 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : isCurrent 
                    ? 'bg-violet-600 text-white shadow-glow-violet'
                    : 'bg-[#1A2230] text-[#8B95A7] border border-[#263043]'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                </div>
                <span className={`text-xs font-semibold hidden md:block ${isCurrent ? 'text-[#E6EAF2]' : 'text-[#8B95A7]'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-[#1A2230] h-2 rounded-full overflow-hidden border border-[#263043]">
          <div 
            className="bg-gradient-to-r from-violet-600 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="bg-[#121821] border border-[#263043] rounded-2xl p-8 shadow-2xl space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#E6EAF2]">Upload Master Candidate Resume</h2>
                <p className="text-sm text-[#8B95A7] mt-1">
                  Upload or paste your Master Resume for candidate <strong className="text-violet-400">Prasanthi</strong>. The agent will extract skills and automatically kickstart Indian job discovery, LaTeX tailoring, and recruiter outreach.
                </p>
              </div>

              <button
                onClick={handleUploadAndStartAuto}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-glow-emerald shrink-0"
              >
                <Play className="w-4 h-4" />
                <span>Upload & Start Agent Automatically</span>
              </button>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="border-2 border-dashed border-violet-500/40 hover:border-violet-400 rounded-2xl p-6 bg-violet-500/5 transition-all text-center space-y-3">
              <FileUp className="w-10 h-10 text-violet-400 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-[#E6EAF2]">Click to upload Master Resume File</p>
                <p className="text-xs text-[#8B95A7]">Supports .pdf, .txt, .tex, .json file formats</p>
              </div>
              <input
                type="file"
                accept=".pdf,.txt,.tex,.json,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-file-input"
              />
              <label
                htmlFor="resume-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2230] hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Select File
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                Or Edit Master Resume Text
              </label>
              <textarea
                rows={9}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full bg-[#1A2230] border border-[#263043] focus:border-violet-500 rounded-xl p-4 text-sm text-[#E6EAF2] outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleParseResume}
                disabled={loading || !resumeText.trim()}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-glow-violet"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Parsing Resume...' : 'Parse Master Resume'}</span>
              </button>

              {resumeParsed && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Resume Parsed & Verified!
                </span>
              )}
            </div>

            {parsedSkills.length > 0 && (
              <div className="p-4 rounded-xl bg-[#1A2230] border border-[#263043]">
                <p className="text-xs font-semibold text-[#8B95A7] mb-2 uppercase">Extracted Key Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((sk) => (
                    <span key={sk} className="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-xs font-medium border border-violet-500/30">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#E6EAF2]">Job Target & Preferences</h2>
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs font-bold">
                  {targetTitles.length} / 3 Titles Allowed
                </span>
              </div>
              <p className="text-sm text-[#8B95A7] mt-1">
                Select up to <strong className="text-[#E6EAF2]">3 target job titles</strong> for automated search and matching.
              </p>
            </div>

            {/* Target Titles Input */}
            <div>
              <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                Target Job Titles (Max 3)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  disabled={targetTitles.length >= 3}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={targetTitles.length >= 3 ? "3 titles limit reached" : "e.g. Backend Engineer"}
                  className="flex-1 bg-[#1A2230] border border-[#263043] focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleAddTitle}
                  disabled={targetTitles.length >= 3 || !newTitle.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {targetTitles.map((t, idx) => (
                  <span key={t} className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold flex items-center gap-2">
                    {t}
                    <button onClick={() => handleRemoveTitle(idx)} className="hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Salary & Work Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                  Minimum Base Salary ($ / Year)
                </label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  className="w-full bg-[#1A2230] border border-[#263043] focus:border-violet-500 rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                  Preferred Work Modes
                </label>
                <div className="flex gap-2">
                  {['Remote', 'Hybrid', 'Onsite'].map((wm) => {
                    const isSel = workModes.includes(wm);
                    return (
                      <button
                        key={wm}
                        type="button"
                        onClick={() => {
                          if (isSel) setWorkModes(workModes.filter((m) => m !== wm));
                          else setWorkModes([...workModes, wm]);
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSel
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold'
                            : 'bg-[#1A2230] border-[#263043] text-[#8B95A7]'
                        }`}
                      >
                        {wm}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#E6EAF2]">Agent Operating Mode & Limits</h2>
              <p className="text-sm text-[#8B95A7] mt-1">
                Choose how much autonomy you grant the agent and enforce daily safety limits.
              </p>
            </div>

            {/* Mode selection cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'APPROVAL',
                  name: 'Human Approval (Recommended)',
                  desc: 'Agent prepares applications and queues them for your review, edit, or 1-click approval.',
                  badgeColor: 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                },
                {
                  id: 'AUTONOMOUS',
                  name: 'Full Autonomous',
                  desc: 'Agent searches, scores, builds tailored LaTeX resumes, and submits applications automatically within daily limits.',
                  badgeColor: 'border-purple-500/50 bg-purple-500/10 text-purple-400'
                },
                {
                  id: 'ASSISTED',
                  name: 'Assisted Mode',
                  desc: 'Agent prepares tailored resumes and screening Q&A answers, then gives you the direct portal application link.',
                  badgeColor: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                }
              ].map((m) => {
                const isSelected = operatingMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setOperatingMode(m.id as OperatingMode)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? `${m.badgeColor} shadow-xl scale-[1.02]`
                        : 'bg-[#1A2230] border-[#263043] hover:border-gray-600'
                    }`}
                  >
                    <h3 className="font-bold text-sm mb-2 text-[#E6EAF2]">{m.name}</h3>
                    <p className="text-xs text-[#8B95A7] leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#263043]">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                  Max Applications Per Day
                </label>
                <input
                  type="number"
                  value={maxDaily}
                  onChange={(e) => setMaxDaily(Number(e.target.value))}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] uppercase mb-2">
                  Max Applications Per Portal Per Day
                </label>
                <input
                  type="number"
                  value={maxPerPortal}
                  onChange={(e) => setMaxPerPortal(Number(e.target.value))}
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-sm text-[#E6EAF2] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#E6EAF2]">Portal Permissions & Fernet Encrypted Credentials</h2>
              <p className="text-sm text-[#8B95A7] mt-1">
                Configure allowed portals for automated search and application. Credentials are encrypted at rest with Fernet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
              {portals.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-[#1A2230] border border-[#263043] flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-[#E6EAF2]">{p.name}</h4>
                    <p className="text-[11px] text-[#8B95A7]">{p.base_url}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-[#8B95A7] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.allowed_to_apply}
                        onChange={async (e) => {
                          const updated = await portalsApi.updatePortal(p.id, { allowed_to_apply: e.target.checked });
                          setPortals(portals.map((pt) => pt.id === p.id ? updated : pt));
                        }}
                        className="rounded bg-gray-900 border-gray-700 text-violet-600 focus:ring-0"
                      />
                      <span>Apply</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[#263043]">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 bg-[#1A2230] hover:bg-gray-800 text-[#E6EAF2] border border-[#263043] rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-glow-violet"
          >
            <span>{step === 4 ? 'Complete Onboarding' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
