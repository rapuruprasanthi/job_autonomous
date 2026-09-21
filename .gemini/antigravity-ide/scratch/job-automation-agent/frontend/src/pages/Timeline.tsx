import React, { useState, useEffect } from 'react';
import { 
  Clock, Download, Filter, Search, CheckCircle2, Briefcase, Mail, MessageSquare, AlertCircle, FileText, Sparkles
} from 'lucide-react';
import { activityApi } from '../api/activity';
import { ActivityLog } from '../lib/types';

export const TimelinePage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    loadTimeline();
  }, [eventTypeFilter]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const data = await activityApi.getTimeline(eventTypeFilter || undefined);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes('JOB')) return <Briefcase className="w-4 h-4 text-violet-400" />;
    if (type.includes('RESUME')) return <FileText className="w-4 h-4 text-cyan-400" />;
    if (type.includes('APPLICATION')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (type.includes('CONTACT') || type.includes('EMAIL')) return <Mail className="w-4 h-4 text-purple-400" />;
    if (type.includes('RESPONSE') || type.includes('REPLY')) return <MessageSquare className="w-4 h-4 text-amber-400" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EAF2] tracking-tight">Activity Timeline & Audit Feed</h1>
          <p className="text-sm text-[#8B95A7]">Chronological immutable log of every agent action, discovery, resume build, and outreach</p>
        </div>

        <a
          href={activityApi.getCsvExportUrl()}
          download
          className="px-4 py-2.5 bg-[#1A2230] hover:bg-gray-800 text-xs font-semibold text-cyan-400 rounded-xl border border-[#263043] flex items-center gap-2 shadow-xl"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit CSV</span>
        </a>
      </div>

      {/* Timeline Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#121821] border border-[#263043] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[#121821] border border-[#263043] rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-12 h-12 text-[#8B95A7] mx-auto" />
          <h3 className="text-base font-bold text-[#E6EAF2]">No Activity Logged Yet</h3>
          <p className="text-xs text-[#8B95A7]">Run the agent loop to start recording automated events.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-[#263043] ml-4 space-y-6 pl-6 py-2">
          {logs.map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="bg-[#121821] border border-[#263043] hover:border-violet-500/40 rounded-2xl p-5 space-y-2 cursor-pointer transition-all relative shadow-xl group"
            >
              {/* Point icon */}
              <div className="absolute -left-[35px] top-5 w-8 h-8 rounded-full bg-[#1A2230] border-2 border-violet-500 flex items-center justify-center">
                {getEventIcon(log.event_type)}
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {log.event_type}
                </span>
                <span className="text-[11px] text-[#8B95A7]">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#E6EAF2] group-hover:text-violet-300 transition-colors">
                {log.title}
              </h4>
              
              {log.description && (
                <p className="text-xs text-[#8B95A7] leading-relaxed line-clamp-2">
                  {log.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121821] border border-[#263043] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#263043] pb-3">
              <h3 className="text-base font-bold text-[#E6EAF2]">Activity Event Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-[#8B95A7] hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#8B95A7] font-semibold uppercase">Event Type:</span>
                <p className="text-violet-400 font-bold">{selectedLog.event_type}</p>
              </div>
              <div>
                <span className="text-[#8B95A7] font-semibold uppercase">Title:</span>
                <p className="text-[#E6EAF2] font-semibold">{selectedLog.title}</p>
              </div>
              {selectedLog.description && (
                <div>
                  <span className="text-[#8B95A7] font-semibold uppercase">Description:</span>
                  <p className="text-[#8B95A7] bg-[#1A2230] p-3 rounded-xl border border-[#263043] mt-1">{selectedLog.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
