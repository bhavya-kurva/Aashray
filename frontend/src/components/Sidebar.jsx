import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  AlertTriangle, ShieldAlert, Heart, Home, Package, 
  ChevronRight, RefreshCw, ListFilter, BellDot 
} from 'lucide-react';

const Sidebar = ({ 
  stats, 
  alerts, 
  incidents, // new prop
  activeFilter, 
  onFilterChange, 
  onAlertClick,
  onIncidentClick // new prop
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'alerts'

  const getSeverityBadgeColor = (sev) => {
    switch (sev) {
      case 'Critical': return 'text-red-400 border-red-500/20 bg-red-950/20';
      case 'High': return 'text-orange-405 text-orange-400 border-orange-500/20 bg-orange-950/20';
      case 'Medium': return 'text-yellow-400 border-yellow-500/20 bg-yellow-950/20';
      default: return 'text-blue-400 border-blue-500/20 bg-blue-950/20';
    }
  };

  return (
    <div className="bg-white border-r border-slate-200 text-slate-800 flex flex-col h-full overflow-hidden shadow-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Disaster Command Centre
        </h2>
      </div>

      {/* Incident Categories Filters */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-none">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {t('activeIncidents')}
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'all' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'all'
                  ? 'bg-blue-50/80 text-blue-600 font-bold border-blue-200 border-l-4 border-l-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                <span>All Reports</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono border border-slate-200/50 shadow-sm font-semibold">
                {stats.incidents.total}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'Critical' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'Critical'
                  ? 'bg-red-50 text-red-600 font-bold border-red-200 border-l-4 border-l-red-500 shadow-sm'
                  : 'bg-slate-50 text-red-600/80 border-slate-200/60 hover:bg-red-50/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>{t('critical')}</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-red-600 font-mono font-bold border border-red-200/40 shadow-sm">
                {stats.incidents.critical}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'High' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'High'
                  ? 'bg-orange-50 text-orange-600 font-bold border-orange-200 border-l-4 border-l-orange-500 shadow-sm'
                  : 'bg-slate-50 text-orange-600/80 border-slate-200/60 hover:bg-orange-50/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                <span>{t('high')}</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-orange-600 font-mono font-bold border border-orange-200/40 shadow-sm">
                {stats.incidents.high}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'Medium' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'Medium'
                  ? 'bg-yellow-50 text-yellow-600 font-bold border-yellow-200 border-l-4 border-l-yellow-500 shadow-sm'
                  : 'bg-slate-50 text-yellow-600/80 border-slate-200/60 hover:bg-yellow-50/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
                <span>{t('medium')}</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-yellow-650 text-yellow-600 font-mono font-bold border border-yellow-200/40 shadow-sm">
                {stats.incidents.medium}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'incident', value: 'Low' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'incident' && activeFilter.value === 'Low'
                  ? 'bg-blue-50 text-blue-600 font-bold border-blue-200 border-l-4 border-l-blue-550 border-l-blue-600 shadow-sm'
                  : 'bg-slate-50 text-blue-600/85 border-slate-200/60 hover:bg-blue-50/50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                <span>{t('low')}</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-blue-600 font-mono font-bold border border-blue-200/40 shadow-sm">
                {stats.incidents.low}
              </span>
            </button>
          </div>
        </div>

        {/* Resource Categories Filters */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Resource States
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange({ category: 'team', value: 'AVAILABLE' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'team' && activeFilter.value === 'AVAILABLE'
                  ? 'bg-emerald-50 text-emerald-600 font-bold border-emerald-200 border-l-4 border-l-emerald-500 shadow-sm'
                  : 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Heart className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Available Teams</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-emerald-600 font-mono border border-slate-200/40 shadow-sm font-bold">
                {stats.teams.available}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'team', value: 'ASSIGNED' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'team' && activeFilter.value === 'ASSIGNED'
                  ? 'bg-blue-50 text-blue-600 font-bold border-blue-200 border-l-4 border-l-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Heart className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Assigned/Active Teams</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-blue-600 font-mono border border-slate-200/40 shadow-sm font-bold">
                {stats.teams.assigned}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'shelter', value: 'OPEN' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'shelter' && activeFilter.value === 'OPEN'
                  ? 'bg-teal-50 text-teal-650 text-teal-600 font-bold border-teal-200 border-l-4 border-l-teal-500 shadow-sm'
                  : 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Home className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                <span>Available Shelters</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-teal-600 font-mono border border-slate-200/40 shadow-sm font-bold">
                {stats.shelters.open}
              </span>
            </button>

            <button
              onClick={() => onFilterChange({ category: 'depot', value: 'AVAILABLE' })}
              className={`w-full flex justify-between items-center px-3 py-1.5 rounded-lg text-xs transition-all border ${
                activeFilter.category === 'depot' && activeFilter.value === 'AVAILABLE'
                  ? 'bg-purple-50 text-purple-650 text-purple-650 text-purple-600 font-bold border-purple-200 border-l-4 border-l-purple-500 shadow-sm'
                  : 'bg-slate-50 text-slate-650 text-slate-600 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Package className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span>Active Supply Depots</span>
              </span>
              <span className="bg-white px-2 py-0.5 rounded text-[10px] text-purple-600 font-mono border border-slate-200/40 shadow-sm font-bold">
                {stats.depots.total}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section for Incident Logs vs. Alerts */}
      <div className="border-t border-slate-200 flex-1 flex flex-col min-h-0 bg-slate-50/50">
        <div className="flex border-b border-slate-200 text-xs shrink-0 select-none bg-slate-100/60">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-all ${
              activeTab === 'feed'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
            }`}
          >
            Incident Feed ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-all flex items-center justify-center space-x-1 ${
              activeTab === 'alerts'
                ? 'border-red-500 text-red-650 text-red-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/30'
            }`}
          >
            <BellDot className="h-3 w-3 text-red-500 shrink-0" />
            <span>Advisories ({alerts.length})</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0 bg-white">
          {activeTab === 'feed' ? (
            incidents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No active incidents reported.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => onIncidentClick && onIncidentClick(inc)}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-350 hover:border-slate-300 cursor-pointer transition-all shadow-sm space-y-1.5 text-xs text-slate-800"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-blue-600">{inc.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold border ${getSeverityBadgeColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="text-slate-905 text-slate-900 font-bold">{inc.incident_type}</div>
                  <p className="text-slate-550 text-slate-500 text-[10px] line-clamp-2 italic leading-relaxed">
                    "{inc.description || 'No description provided.'}"
                  </p>
                  <div className="text-[9px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="font-medium">Locality: <strong className="text-slate-700">{inc.location}</strong></span>
                    <span className="text-[8px] bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded text-slate-500 font-semibold uppercase">{inc.status}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                No weather advisories reported.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer hover:shadow-md transition-all flex flex-col space-y-1.5 ${
                    alert.severity.toLowerCase() === 'critical'
                      ? 'bg-red-50/50 border-red-200 hover:border-red-300 hover:bg-red-50 text-slate-800'
                      : alert.severity.toLowerCase() === 'high'
                      ? 'bg-orange-50/50 border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800'
                      : 'bg-yellow-50/50 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-[11px] flex items-center">
                      <ShieldAlert className="h-3.5 w-3.5 mr-1 text-slate-500" />
                      {alert.alert_type} Advisory
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold border ${
                      alert.severity.toLowerCase() === 'critical' ? 'border-red-300 text-red-650 text-red-600' : 'border-orange-300 text-orange-600'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="text-[9px] text-slate-500 pt-1 flex justify-between items-center border-t border-slate-100/50">
                    <span>Region: <strong className="text-slate-700">{alert.affected_area.split(' (')[0]}</strong></span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
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
