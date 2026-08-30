import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = 'blue' }) => {
  const colorStyles = {
    blue: 'border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-950/40 text-blue-400',
    red: 'border-red-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-red-950/40 text-red-400',
    amber: 'border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-amber-950/40 text-amber-400',
    emerald: 'border-emerald-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/40 text-emerald-400',
    purple: 'border-purple-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-purple-950/40 text-purple-400',
  };

  const selectedStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`relative p-5 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-[1.02] ${selectedStyle}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-white">{value}</span>
        {trend && <span className="text-xs font-extrabold text-emerald-400">{trend}</span>}
      </div>
      {subtext && <p className="mt-1 text-xs font-medium text-slate-400">{subtext}</p>}
    </div>
  );
};

export default StatCard;
