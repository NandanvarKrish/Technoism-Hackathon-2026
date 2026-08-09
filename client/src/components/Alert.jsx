import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Alert({ type = 'info', title, message }) {
  const styles = {
    info: {
      bg: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
      icon: Info,
      iconColor: 'text-indigo-400'
    },
    success: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-emerald-400'
    },
    warning: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400'
    }
  };

  const current = styles[type] || styles.info;
  const IconComponent = current.icon;

  return (
    <div className={`p-4 rounded-xl border ${current.bg} flex items-start gap-3 my-4`}>
      <IconComponent className={`h-5 w-5 ${current.iconColor} shrink-0 mt-0.5`} />
      <div>
        {title && <h4 className="text-sm font-semibold text-white mb-0.5">{title}</h4>}
        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
