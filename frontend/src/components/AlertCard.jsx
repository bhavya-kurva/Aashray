import React from 'react';
import { Bell, MapPin, Clock, ArrowRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const AlertCard = ({ alert, onAction }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-red-500/30 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:shadow-red-500/10">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <Bell className="w-4 h-4 animate-bounce" />
              </span>
              <h3 className="text-base font-extrabold text-white tracking-wide">{alert.alert_type || 'Weather Emergency'}</h3>
            </div>
            <SeverityBadge severity={alert.severity || 'Critical'} size="small" />
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
            {alert.description || 'Severe weather advisory issued. Follow official evacuation procedures.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-semibold border-t border-slate-800 pt-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{alert.affected_area || 'Cuttack & Coastal Odisha'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{alert.issued_at ? new Date(alert.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
            </div>
          </div>
        </div>

        {onAction && (
          <button
            onClick={() => onAction(alert)}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>View Advisory & Safe Route</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;
