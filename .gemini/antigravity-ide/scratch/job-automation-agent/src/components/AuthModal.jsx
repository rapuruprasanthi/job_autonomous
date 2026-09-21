import React, { useState } from 'react';
import { ShieldCheck, Key, RefreshCw, X, Lock, CheckCircle, Copy, AlertTriangle } from 'lucide-react';
import { inspectJwtToken, generateMockJwtToken } from '../utils/jwtAuth';

export default function AuthModal({ userSession, setUserSession, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tokenDetails = inspectJwtToken(userSession.jwtToken);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(userSession.jwtToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshToken = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const newToken = generateMockJwtToken(userSession.user, 24);
      setUserSession(prev => ({
        ...prev,
        jwtToken: newToken,
        tokenExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      }));
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel glass-panel-glow w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative rounded-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                JWT Authentication & OAuth2 Session
                <span className="badge badge-emerald text-xs font-mono">HS256 Verified</span>
              </h3>
              <p className="text-xs text-gray-400">
                Secure JSON Web Token issued to agent for cross-portal API requests & rate-limit signing.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Bar */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={userSession.user.avatar} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border border-purple-500/40"
            />
            <div>
              <div className="text-sm font-semibold text-white">{userSession.user.fullName}</div>
              <div className="text-xs text-gray-400 font-mono">{userSession.user.email} • {userSession.user.role}</div>
            </div>
          </div>
          <button
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className="btn-secondary text-xs font-mono flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-400' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Rotate Token'}
          </button>
        </div>

        {/* Decoded JWT Inspector */}
        {tokenDetails.valid ? (
          <div className="space-y-4">
            
            {/* Header & Signature Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                <div className="text-xs font-mono text-purple-400 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> Token Header
                </div>
                <pre className="text-xs text-gray-300 font-mono">
                  {JSON.stringify(tokenDetails.header, null, 2)}
                </pre>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-xl p-3">
                <div className="text-xs font-mono text-emerald-400 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Signature Verification
                </div>
                <div className="text-xs text-gray-300 font-mono space-y-1">
                  <div>Algorithm: <span className="text-white">HMAC SHA-256</span></div>
                  <div>Expiry: <span className="text-emerald-300">{tokenDetails.expiresInFormatted}</span></div>
                  <div>Status: <span className="badge badge-emerald py-0.5 text-[10px]">ACTIVE & VALID</span></div>
                </div>
              </div>
            </div>

            {/* Decoded Claims Payload */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Decoded JWT Claims Payload
                </span>
                <span className="text-[11px] text-gray-400 font-mono">sub: {tokenDetails.payload.sub}</span>
              </div>
              <pre className="text-xs text-emerald-300 font-mono bg-black/80 p-3 rounded-lg overflow-x-auto border border-white/5">
                {JSON.stringify(tokenDetails.payload, null, 2)}
              </pre>
            </div>

            {/* Raw Token String */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Raw Bearer Token String</span>
                <button 
                  onClick={handleCopyToken}
                  className="text-purple-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Bearer String'}
                </button>
              </div>
              <div className="text-[11px] font-mono text-gray-400 bg-black/70 p-2.5 rounded-lg border border-white/10 break-all select-all">
                {userSession.jwtToken}
              </div>
            </div>

            {/* Granted Scopes */}
            <div>
              <div className="text-xs font-semibold text-gray-300 mb-2">Agent API Permissions (Granted Scopes):</div>
              <div className="flex flex-wrap gap-2">
                {tokenDetails.payload.scopes?.map((scope, idx) => (
                  <span key={idx} className="badge badge-purple font-mono text-[11px]">
                    ✓ {scope}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 mb-1 text-rose-400" />
            Unable to parse JWT token. Please rotate token or re-authenticate.
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-primary text-xs">
            Close Session Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
