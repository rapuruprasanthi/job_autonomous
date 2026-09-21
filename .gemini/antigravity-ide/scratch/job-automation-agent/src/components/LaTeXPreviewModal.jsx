import React, { useState } from 'react';
import { FileCode, Eye, Copy, CheckCircle, ExternalLink, X, Download } from 'lucide-react';

export default function LaTeXPreviewModal({ latexCode, onClose }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code' | 'rendered'

  const handleCopy = () => {
    navigator.clipboard.writeText(latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-panel glass-panel-glow w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Overleaf LaTeX Customized Resume
                <span className="badge badge-purple text-xs font-mono">Compiles Clean</span>
              </h3>
              <p className="text-xs text-gray-400">
                Tailored dynamically by AI agent for ATS pass-through and targeted skill highlights.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex items-center gap-1">
              <button 
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === 'code' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                LaTeX Source
              </button>
              <button 
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  viewMode === 'rendered' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Visual Resume
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'code' ? (
            <pre className="code-block h-full text-xs font-mono">
              {latexCode}
            </pre>
          ) : (
            <div className="bg-white text-black p-8 rounded-xl min-h-[500px] font-sans text-xs space-y-4 shadow-2xl">
              <div className="text-center border-b pb-3 border-gray-300">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">PRASANTHI RAPURU</h1>
                <p className="text-xs text-gray-600 mt-1">Senior Full Stack & Cloud Security Engineer | Bengaluru, IN</p>
                <p className="text-[11px] text-gray-500 font-mono">rapuruprasanthi@gmail.com • github.com/rapuruprasanthi • +91 98765 43210</p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-0.5 text-purple-900">Professional Summary</h2>
                <p className="text-gray-700 mt-1 leading-relaxed">
                  Accomplished Full Stack & Cloud Security Engineer with 5+ years of experience building scalable web architectures, securing containerized workloads, and developing AI-powered automation agents. Specialized in Overleaf LaTeX tailoring, JWT security microservices, and high-concurrency Node.js/React applications.
                </p>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-0.5 text-purple-900">Technical Skills</h2>
                <div className="grid grid-cols-2 gap-2 mt-1 text-gray-800">
                  <div><strong>Frontend:</strong> React.js, TypeScript, Next.js, TailwindCSS</div>
                  <div><strong>Backend:</strong> Node.js, Python, FastAPI, GraphQL, REST</div>
                  <div><strong>Cloud & Security:</strong> AWS IAM, Kubernetes, Docker, DevSecOps, JWT, OAuth2</div>
                  <div><strong>Tools:</strong> Overleaf, LaTeX, Git, CI/CD Actions, Vector DBs</div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-0.5 text-purple-900">Highlighted Projects</h2>
                <div className="mt-1 space-y-2">
                  <div>
                    <strong className="text-gray-900">Autonomous Job Automation Agent Platform:</strong>
                    <span className="text-gray-700"> Designed end-to-end autonomous agent system automating job search across 12+ portals, real-time Overleaf LaTeX resume tailoring, and recruiter cold outreach with JWT security.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="btn-secondary text-xs flex items-center gap-1 font-mono">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy LaTeX Code'}
            </button>
            <a 
              href="https://overleaf.com" 
              target="_blank" 
              rel="noreferrer"
              className="btn-secondary text-xs flex items-center gap-1 font-mono text-cyan-300"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Sync to Overleaf
            </a>
          </div>

          <button onClick={onClose} className="btn-primary text-xs">
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
