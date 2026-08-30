import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Heart, Home, Package, ChevronRight, BellDot, Activity } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const Sidebar = ({
  stats,
  alerts,
  incidents,
  activeFilter,
  onFilterChange,
  onAlertClick,
  onIncidentClick
}) => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="bg-slate-900 text-slate-100 flex flex-col h-full overflow-hidden font-sans border-r border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-red-400" />
          <span>Operations Dispatch Filter</span>
        </h2>
      </div>

      {/* Incident Categories Filters */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-none border-b border-slate-800">
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Active Emergency Reports</h3>
          <div className="space-y-1 text-xs">
            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'all' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-xl font-bold transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'all'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-400" />
                <span>All Active Reports</span>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700 text-white font-bold">
                {stats.incidents.total}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'Critical' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-xl font-bold transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'Critical'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Critical Severity</span>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700 text-red-400 font-extrabold">
                {stats.incidents.critical}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'High' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-xl font-bold transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'High'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>High Severity</span>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700 text-orange-400 font-extrabold">
                {stats.incidents.high}
              </span>
            </button>
          </div>
        </div>

        {/* Resource States Filters */}
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Resource Assets</h3>
          <div className="space-y-1 text-xs">
            <button
              onClick={() => onFilterChange({ category: 'team', value: 'AVAILABLE' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-xl font-bold transition-all border ${
                activeFilter.category === 'team' && activeFilter.value === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Available Units</span>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700 text-emerald-400 font-bold">
                {stats.teams.available}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'shelter', value: 'OPEN' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-xl font-bold transition-all border ${
                activeFilter.category === 'shelter' && activeFilter.value === 'OPEN'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Shelters</span>
              </span>
              <span className="bg-slate-900 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-slate-700 text-cyan-400 font-bold">
                {stats.shelters.open}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section for Incidents vs Alerts */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950">
        <div className="flex border-b border-slate-800 text-xs shrink-0 select-none bg-slate-900">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2.5 font-extrabold text-center border-b-2 transition-all ${
              activeTab === 'feed'
                ? 'border-blue-500 text-white bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Feed ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2.5 font-extrabold text-center border-b-2 transition-all flex items-center justify-center gap-1 ${
              activeTab === 'alerts'
                ? 'border-red-500 text-red-400 bg-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BellDot className="w-3.5 h-3.5 text-red-500" />
            <span>Advisories ({alerts.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
          {activeTab === 'feed' ? (
            incidents.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs italic">No active incidents reported.</p>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onIncidentClick && onIncidentClick(inc)}
                  className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-400">{inc.id}</span>
                    <SeverityBadge severity={inc.severity} size="small" />
                  </div>
                  <div className="text-white font-black">{inc.disaster_type || inc.incident_type} Emergency</div>
                  <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                    "{inc.description || 'No description provided.'}"
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold flex justify-between items-center pt-1 border-t border-slate-800">
                    <span>{inc.location_name || inc.location}</span>
                    <span className="text-slate-400 uppercase font-mono">{inc.status || 'REPORTED'}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            alerts.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs italic">No weather advisories active.</p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                  className="p-3.5 rounded-2xl border border-red-500/30 bg-slate-900 hover:bg-slate-800 cursor-pointer transition-all space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-white flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      {alert.alert_type} Warning
                    </span>
                    <SeverityBadge severity={alert.severity} size="small" />
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="text-[10px] text-slate-500 font-semibold flex justify-between items-center pt-1 border-t border-slate-800">
                    <span>{alert.affected_area}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
