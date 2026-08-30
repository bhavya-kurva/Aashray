import React from 'react';
import { Home, MapPin, Users, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';

const ShelterCard = ({ shelter, onSelectRoute }) => {
  const name = shelter.name || 'Aashray Relief Center';
  const location = shelter.location_name || shelter.address || 'Cuttack, Odisha';
  const current = shelter.current_occupancy ?? shelter.occupied ?? 420;
  const capacity = shelter.max_capacity ?? shelter.capacity ?? 500;
  const percentage = Math.min(100, Math.round((current / capacity) * 100));

  const isFull = percentage >= 95;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:shadow-emerald-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">{name}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
          isFull ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          {isFull ? 'Full' : 'Open'}
        </span>
      </div>

      {/* Capacity Progress Bar */}
      <div className="mt-4 bg-slate-800/80 rounded-xl p-3 border border-slate-700/50">
        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-400" /> Occupancy Level
          </span>
          <span className="text-white font-mono">{current} / {capacity} <span className="text-slate-400">({percentage}%)</span></span>
        </div>
        <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Amenities & Safe Route Action */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Food & Water
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-blue-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Medical Aid
          </span>
        </div>

        {onSelectRoute && (
          <button
            onClick={() => onSelectRoute(shelter)}
            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Safe Route</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ShelterCard;
