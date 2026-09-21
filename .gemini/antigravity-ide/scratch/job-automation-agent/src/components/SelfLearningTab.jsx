import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  HelpCircle,
  Plus,
  ShieldAlert
} from 'lucide-react';
import { mockKnowledgeBaseData, mockConfirmationQueue } from '../data/mockKnowledgeBase';
import { mockLearningAnalyticsData } from '../data/mockLearningAnalytics';

export default function SelfLearningTab() {
  const [kbItems, setKbItems] = useState(mockKnowledgeBaseData);
  const [confirmationQueue, setConfirmationQueue] = useState(mockConfirmationQueue);

  const handleResolveQuestion = (id, answerApproved) => {
    setConfirmationQueue(prev => prev.filter(item => item.id !== id));
    if (answerApproved) {
      alert("Answer confirmed by candidate and safely added to Verified Candidate Knowledge Base!");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" /> Self-Learning & Candidate Knowledge Base
          </h2>
          <p className="text-xs text-gray-400">
            Continuously analyzes application outcomes, resume format conversion, and email response rates to optimize future applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-extrabold text-emerald-400">{mockLearningAnalyticsData.overallConversionRate}</div>
            <div className="text-[10px] text-gray-400 font-mono">Recruiter Conversion Rate</div>
          </div>
          <div className="text-right pl-3 border-l border-white/10">
            <div className="text-lg font-extrabold text-purple-300">{mockLearningAnalyticsData.interviewRateGain}</div>
            <div className="text-[10px] text-gray-400 font-mono">Performance Boost</div>
          </div>
        </div>
      </div>

      {/* Confirmation Queue Banner if Sensitive Questions Pending */}
      {confirmationQueue.length > 0 && (
        <div className="glass-panel border-amber-500/40 bg-amber-500/10 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Candidate Verification Queue (Sensitive Application Questions)
          </div>
          <p className="text-xs text-amber-200/80">
            The agent detected an uncertain/sensitive question and requires your explicit confirmation before answering.
          </p>

          {confirmationQueue.map(item => (
            <div key={item.id} className="bg-black/60 border border-amber-500/30 p-4 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-purple-300">{item.jobTitle}</div>
              <div className="text-xs text-white font-medium">Q: {item.question}</div>
              <div className="text-xs text-gray-300 font-mono bg-white/[0.03] p-2 rounded-lg border border-white/5">
                Suggested AI Response: <span className="text-amber-300">{item.suggestedAnswer}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button 
                  onClick={() => handleResolveQuestion(item.id, false)}
                  className="btn-secondary text-xs py-1 px-3 text-rose-300 hover:bg-rose-500/10"
                >
                  Reject Response
                </button>
                <button 
                  onClick={() => handleResolveQuestion(item.id, true)}
                  className="btn-gold text-xs py-1 px-3"
                >
                  Confirm & Save to KB
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid: Learning Insights & Verified Knowledge Base */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: A/B Analytics & Insights (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Overleaf LaTeX Template Conversion Performance */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Overleaf LaTeX Template Performance Comparison
            </h3>

            <div className="space-y-2.5">
              {mockLearningAnalyticsData.resumeFormatComparison.map((fmt, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-gray-200">{fmt.format}</div>
                    <div className="text-[11px] text-gray-400">{fmt.applied} Applications • {fmt.interviewInvites} Invites</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">{fmt.conversionRate}</span>
                    <div className="text-[10px] text-gray-400">Conversion</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Converted Keywords */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> High-Impact ATS Keywords Identified
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mockLearningAnalyticsData.topConvertedKeywords.map((kw, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-purple-300 font-medium">{kw.keyword}</span>
                  <span className="badge badge-emerald text-[10px] font-mono">{kw.conversionImpact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Continuous Agent Insights */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Autonomous Learning Takeaways
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {mockLearningAnalyticsData.learningInsights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Column: Verified Candidate Knowledge Base Store (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" /> Verified Candidate Knowledge Base
                </h3>
                <p className="text-xs text-gray-400">Reusable answers automatically populated into portal application forms</p>
              </div>
              <button 
                onClick={() => alert("New Knowledge Base item dialog")}
                className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Fact
              </button>
            </div>

            <div className="space-y-3">
              {kbItems.map((item) => (
                <div key={item.id} className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-purple text-[10px] font-mono">{item.category}</span>
                    <span className="badge badge-emerald text-[10px]">VERIFIED FACT</span>
                  </div>
                  <div className="text-xs font-bold text-white">{item.question}</div>
                  <div className="text-xs text-gray-300 font-mono bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                    {item.answer}
                  </div>
                  <div className="text-[10px] text-gray-400 text-right">Last Used: {item.lastUsed}</div>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
