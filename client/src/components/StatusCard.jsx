import React from 'react';

export default function StatusCard({ title, value, subtitle, icon: Icon, color = "indigo" }) {
  const colorStyles = {
    indigo: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-400",
    emerald: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-400",
    amber: "from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400"
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br border ${colorStyles[color]} flex items-start justify-between shadow-xl`}>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-white mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
