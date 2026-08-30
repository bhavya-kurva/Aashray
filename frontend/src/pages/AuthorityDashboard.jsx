import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getIncidents, getResources, getAlerts, getAssignments } from '../services/api';
import { initWebSocket, subscribeToEvents } from '../services/socket';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import IncidentDetails from '../components/IncidentDetails';
import SimulationPanel from '../components/SimulationPanel';
import { Terminal, Shield, Layers, RefreshCw, X, ChevronUp, ChevronDown, Radio, Activity } from 'lucide-react';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not Authority
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'Authority') {
      navigate('/citizen');
    }
  }, [user, navigate]);

  // Main lists states
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState({ rescue_teams: [], shelters: [], supply_depots: [] });
  const [alerts, setAlerts] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Selected incident details
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [recenterCoords, setRecenterCoords] = useState(null);

  // Filters & Map Display States
  const [activeFilter, setActiveFilter] = useState({ category: 'incident', value: 'all' });
  const [layerToggles, setLayerToggles] = useState({
    incidents: true,
    teams: true,
    shelters: true,
    depots: true,
    alerts: true
  });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(false);

  // Stats Counters
  const [stats, setStats] = useState({
    incidents: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    teams: { total: 0, available: 0, assigned: 0 },
    shelters: { total: 0, open: 0, full: 0 },
    depots: { total: 0 }
  });

  const loadAllData = async () => {
    try {
      const [incData, resData, alertData, asgData] = await Promise.all([
        getIncidents(),
        getResources(),
        getAlerts(),
        getAssignments()
      ]);

      setIncidents(incData || []);
      setResources(resData || { rescue_teams: [], shelters: [], supply_depots: [] });
      setAlerts(alertData || []);
      setAssignments(asgData || []);

      calculateStats(incData || [], resData || { rescue_teams: [], shelters: [], supply_depots: [] });
    } catch (e) {
      console.error("Failed to load operations dashboard data", e);
    }
  };

  const calculateStats = (incList, resList) => {
    const activeInc = incList.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
    const critical = activeInc.filter(i => i.severity === 'Critical').length;
    const high = activeInc.filter(i => i.severity === 'High').length;
    const medium = activeInc.filter(i => i.severity === 'Medium').length;
    const low = activeInc.filter(i => i.severity === 'Low').length;

    const teams = resList.rescue_teams || [];
    const availableTeams = teams.filter(t => t.status === 'AVAILABLE').length;
    const assignedTeams = teams.filter(t => t.status === 'ASSIGNED' || t.status === 'EN_ROUTE' || t.status === 'RESCUING').length;

    const shelters = resList.shelters || [];
    const openShelters = shelters.filter(s => s.status === 'OPEN').length;
    const fullShelters = shelters.filter(s => s.status === 'FULL').length;

    const depots = resList.supply_depots || [];

    setStats({
      incidents: { total: activeInc.length, critical, high, medium, low },
      teams: { total: teams.length, available: availableTeams, assigned: assignedTeams },
      shelters: { total: shelters.length, open: openShelters, full: fullShelters },
      depots: { total: depots.length }
    });
  };

  useEffect(() => {
    loadAllData();
    initWebSocket();

    const unsubscribe = subscribeToEvents((payload) => {
      loadAllData();
      if (selectedIncident && payload.data && payload.data.id === selectedIncident.id) {
        getIncidents().then((list) => {
          const fresh = list.find(i => i.id === selectedIncident.id);
          if (fresh) setSelectedIncident(fresh);
        });
      }
    });

    return () => unsubscribe();
  }, [selectedIncident]);

  const handleAlertClick = (alert) => {
    setRecenterCoords([alert.latitude, alert.longitude]);
  };

  const filteredIncidents = incidents.filter((inc) => {
    if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
    if (activeFilter.category === 'incident') {
      if (activeFilter.value === 'all') return true;
      return inc.severity === activeFilter.value;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Operations Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs shrink-0 select-none shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-extrabold text-amber-400">
            <Shield className="w-4 h-4" />
            <span>Command Operations Center</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-slate-400 font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layerToggles.incidents}
                onChange={(e) => setLayerToggles({ ...layerToggles, incidents: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-500"
              />
              <span>Incidents</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layerToggles.teams}
                onChange={(e) => setLayerToggles({ ...layerToggles, teams: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-500"
              />
              <span>Rescue Units</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={layerToggles.shelters}
                onChange={(e) => setLayerToggles({ ...layerToggles, shelters: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-blue-500"
              />
              <span>Shelters</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
              showHeatmap
                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {showHeatmap ? '🔥 Heatmap Active' : 'Heatmap Overlay'}
          </button>

          <button
            onClick={loadAllData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Operations Board"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Command Dashboard Layout */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Operations Control Sidebar */}
        <div className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/90 h-full overflow-y-auto">
          <Sidebar
            stats={stats}
            alerts={alerts}
            incidents={incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED')}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onAlertClick={handleAlertClick}
            onIncidentClick={(inc) => {
              setSelectedIncident(inc);
              setRecenterCoords([inc.latitude, inc.longitude]);
            }}
          />
        </div>

        {/* Center Interactive Map */}
        <div className="flex-1 relative h-full bg-slate-950">
          <MapView
            incidents={filteredIncidents}
            teams={resources.rescue_teams}
            shelters={resources.shelters}
            depots={resources.supply_depots}
            alerts={alerts}
            assignments={assignments}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setRecenterCoords([inc.latitude, inc.longitude]);
            }}
            recenterCoords={recenterCoords}
            layerToggles={layerToggles}
            showHeatmap={showHeatmap}
          />

          {/* Simulation Tools Drawer */}
          <div className="absolute bottom-4 left-4 z-[1000] w-80">
            <button
              onClick={() => setShowSimPanel(!showSimPanel)}
              className="bg-slate-900/95 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold shadow-2xl w-full hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Simulation Command Tools</span>
              </div>
              {showSimPanel ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            {showSimPanel && (
              <div className="mt-2 max-h-[380px] overflow-y-auto rounded-2xl shadow-2xl border border-slate-800 bg-slate-900">
                <SimulationPanel onSimulationTriggered={loadAllData} />
              </div>
            )}
          </div>
        </div>

        {/* Right Incident Details & Allocation Panel */}
        {selectedIncident && (
          <div className="w-96 shrink-0 border-l border-slate-800 h-full relative bg-slate-900/95 overflow-y-auto shadow-2xl">
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-4 right-4 z-50 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 shadow-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <IncidentDetails
              incident={selectedIncident}
              onActionCompleted={loadAllData}
              assignments={assignments}
              allResources={resources}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
