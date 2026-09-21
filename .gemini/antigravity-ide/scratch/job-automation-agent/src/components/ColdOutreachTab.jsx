import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  UserCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MessageSquare,
  FileText,
  Filter,
  Plus
} from 'lucide-react';

export default function ColdOutreachTab({ hrContacts, onSendOutreach }) {
  const [selectedContact, setSelectedContact] = useState(hrContacts[0]);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Replied - Positive', 'Delivered - Pending Reply', 'Staged for Approval'];

  const filteredContacts = activeFilter === 'All'
    ? hrContacts
    : hrContacts.filter(c => c.outreachStatus.includes(activeFilter));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" /> HR Contact Discovery & Automated Cold Email Engine
          </h2>
          <p className="text-xs text-gray-400">
            Identifies TA specialists, hiring managers, and sends concise human-like cold emails with tailored resume & portfolio links.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === f 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Outreach Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: HR Contacts List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredContacts.map((contact) => {
            const isSelected = selectedContact.id === contact.id;
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`glass-panel p-4 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-cyan-500/60 bg-cyan-900/20 shadow-lg shadow-cyan-500/10' 
                    : 'hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                    <div className="text-xs text-purple-300 font-medium">{contact.title}</div>
                    <div className="text-[11px] text-gray-400">{contact.company}</div>
                  </div>
                  <span className={`badge text-[10px] ${
                    contact.outreachStatus.includes('Positive') ? 'badge-emerald' :
                    contact.outreachStatus.includes('Delivered') ? 'badge-cyan' : 'badge-gold'
                  }`}>
                    {contact.outreachStatus}
                  </span>
                </div>

                <div className="mt-2 text-[11px] text-gray-400 font-mono truncate">
                  {contact.email}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Email Workspace & Inbox Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            
            {/* Header Details */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="badge badge-cyan text-xs font-mono mb-1">{selectedContact.company}</span>
                <h3 className="text-xl font-bold text-white">{selectedContact.name}</h3>
                <p className="text-xs text-purple-300 font-semibold">{selectedContact.title}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedContact.email} • {selectedContact.linkedIn}</p>
              </div>

              <div className="text-right">
                <span className={`badge text-xs font-semibold ${
                  selectedContact.outreachStatus.includes('Positive') ? 'badge-emerald' : 'badge-cyan'
                }`}>
                  {selectedContact.outreachStatus}
                </span>
                {selectedContact.followUpScheduled && (
                  <div className="text-[10px] text-amber-400 font-mono mt-1 flex items-center justify-end gap-1">
                    <Clock className="w-3 h-3" /> Follow-up: {selectedContact.followUpScheduled}
                  </div>
                )}
              </div>
            </div>

            {/* Email Subject & Body View */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <FileText className="w-4 h-4" /> Subject Line:
                </span>
                <span className="text-[11px] text-gray-400 font-mono">Sent: {selectedContact.sentDate}</span>
              </div>
              <div className="text-xs font-semibold text-white font-mono bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                {selectedContact.subject}
              </div>

              <div className="text-xs font-bold text-gray-300 mt-2">Personalized Body Content:</div>
              <div className="text-xs text-gray-200 font-sans leading-relaxed bg-black/80 p-4 rounded-lg border border-white/5 whitespace-pre-line">
                {selectedContact.body}
              </div>
            </div>

            {/* Recruiter Reply Card (if any) */}
            {selectedContact.lastResponse && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" /> Recruiter Reply Received
                  </span>
                  <span className="badge badge-emerald text-[10px]">POSITIVE INTERVIEW INVITE</span>
                </div>
                <p className="text-xs text-emerald-200 italic font-sans bg-black/40 p-3 rounded-lg border border-emerald-500/20">
                  "{selectedContact.lastResponse}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-gray-400 font-mono">
                Auto Follow-up Engine: <strong className="text-emerald-400">Active</strong>
              </span>

              <button 
                onClick={() => alert(`Re-sent outreach email to ${selectedContact.name}`)}
                className="btn-primary text-xs"
              >
                <Send className="w-3.5 h-3.5" /> Send Instant Follow-up Email
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
