import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const SeverityBadge = ({ severity = 'Moderate', size = 'normal' }) => {
  const norm = String(severity).toUpperCase();

  let bgClass = 'bg-slate-700/60 text-slate-300 border-slate-600/50';
  let Icon = Info;

  if (norm.includes('CRITICAL') || norm.includes('RED')) {
    bgClass = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
    Icon = AlertOctagon;
  } else if (norm.includes('HIGH') || norm.includes('ORANGE') || norm.includes('SEVERE')) {
    bgClass = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    Icon = AlertTriangle;
  } else if (norm.includes('MODERATE') || norm.includes('YELLOW') || norm.includes('MEDIUM')) {
    bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    Icon = ShieldAlert;
  } else if (norm.includes('LOW') || norm.includes('GREEN')) {
    bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    Icon = Info;
  }

  const isSmall = size === 'small';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border text-xs shadow-sm ${bgClass}`}>
      <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{severity}</span>
    </span>
  );
};

export default SeverityBadge;
