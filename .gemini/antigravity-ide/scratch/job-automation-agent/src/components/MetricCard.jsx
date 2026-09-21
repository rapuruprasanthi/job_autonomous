import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, color = 'purple', trend }) {
  const colorMap = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-purple-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 shadow-cyan-500/10',
    gold: 'text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-rose-500/10'
  };

  return (
    <div className="glass-panel p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-white mt-1 font-sans">{value}</div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.purple}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">{subtext}</span>
        {trend && (
          <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {/* Glow highlight */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-xl pointer-events-none group-hover:scale-150 transition-transform"></div>
    </div>
  );
}
