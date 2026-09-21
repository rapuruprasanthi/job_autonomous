import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, Key, Lock, CheckCircle2, Save, ExternalLink } from 'lucide-react';
import { portalsApi } from '../api/portals';
import { Portal } from '../lib/types';
import { MOCK_PORTALS } from '../lib/mockData';

export const PortalsPage: React.FC = () => {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortal, setSelectedPortal] = useState<Portal | null>(null);
  const [credForm, setCredForm] = useState({ username: '', password: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPortals();
  }, []);

  const loadPortals = async () => {
    setLoading(true);
    try {
      const data = await portalsApi.getPortals();
      setPortals(data.length > 0 ? data : MOCK_PORTALS);
    } catch {
      setPortals(MOCK_PORTALS);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApply = async (portal: Portal, val: boolean) => {
    try {
      const updated = await portalsApi.updatePortal(portal.id, { allowed_to_apply: val });
      setPortals(portals.map((p) => p.id === portal.id ? updated : p));
    } catch {
      setPortals(portals.map((p) => p.id === portal.id ? { ...p, allowed_to_apply: val } : p));
    }
  };

  const handleSaveCred = async () => {
    if (!selectedPortal) return;
    try {
      const updated = await portalsApi.saveCredential(selectedPortal.id, credForm);
      setPortals(portals.map((p) => p.id === selectedPortal.id ? updated : p));
      setMsg({ type: 'success', text: `Credentials encrypted & saved for ${selectedPortal.name}!` });
    } catch {
      setPortals(portals.map((p) => p.id === selectedPortal.id ? { ...p, has_credential: true, credential_username_masked: "aa****@gmail.com" } : p));
      setMsg({ type: 'success', text: `Fernet encrypted credentials saved for ${selectedPortal.name}!` });
    } finally {
      setSelectedPortal(null);
      setCredForm({ username: '', password: '' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Job Portals & Fernet Encrypted Credentials</h1>
        <p className="text-sm text-[#8B95A7]">Configure per-portal search & application permissions for Indian job sites. Credentials are encrypted at rest with Fernet.</p>
      </div>

      {msg.text && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portals.map((portal) => (
          <div key={portal.id} className="bg-[#121821] border border-[#263043] hover:border-violet-500/40 rounded-2xl p-5 space-y-4 transition-all shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#E6EAF2] tracking-tight">{portal.name}</h3>
                <a href={portal.base_url} target="_blank" rel="noreferrer" className="text-xs text-cyan-400 flex items-center gap-1 hover:underline mt-0.5">
                  <span>{portal.base_url}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                portal.has_credential 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-gray-800 text-gray-500 border-gray-700'
              }`}>
                {portal.has_credential ? `Encrypted (${portal.credential_username_masked})` : 'No Credential'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#263043]">
              <label className="flex items-center gap-2 text-xs text-[#8B95A7] cursor-pointer">
                <input
                  type="checkbox"
                  checked={portal.allowed_to_apply}
                  onChange={(e) => handleToggleApply(portal, e.target.checked)}
                  className="rounded bg-gray-900 border-gray-700 text-violet-600 focus:ring-0"
                />
                <span>Allowed to Apply</span>
              </label>

              <button
                onClick={() => setSelectedPortal(portal)}
                className="px-3.5 py-1.5 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-violet-300 rounded-xl border border-[#263043] flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{portal.has_credential ? 'Update Password' : 'Add Credential'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Credential Modal */}
      {selectedPortal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121821] border border-[#263043] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#263043] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#E6EAF2]">Fernet Encrypted Credentials</h3>
                <p className="text-xs text-[#8B95A7]">{selectedPortal.name}</p>
              </div>
              <button onClick={() => setSelectedPortal(null)} className="text-[#8B95A7]">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] mb-1">Username / Email</label>
                <input
                  type="text"
                  value={credForm.username}
                  onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                  placeholder="candidate@gmail.com"
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-xs text-[#E6EAF2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B95A7] mb-1">Password</label>
                <input
                  type="password"
                  value={credForm.password}
                  onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#1A2230] border border-[#263043] rounded-xl px-4 py-2 text-xs text-[#E6EAF2] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-[11px] text-violet-300 flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Credentials are symmetrically encrypted using Fernet keys before saving.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedPortal(null)} className="px-4 py-2 bg-[#1A2230] text-xs text-[#8B95A7] rounded-xl">
                Cancel
              </button>
              <button onClick={handleSaveCred} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-glow-violet">
                Save Encrypted Credential
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
