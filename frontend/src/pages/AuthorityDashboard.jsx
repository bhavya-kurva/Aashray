import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getIncidents, getResources, getAlerts, getAssignments 
} from '../services/api';
import { initWebSocket, subscribeToEvents } from '../services/socket';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import IncidentDetails from '../components/IncidentDetails';
import SimulationPanel from '../components/SimulationPanel';
import { 
  Terminal, ShieldCheck, Layers, RefreshCw, X, ChevronUp, ChevronDown 
} from 'lucide-react';

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
  const [showSimPanel, setShowSimPanel] = useState(false); // Developer simulation drawer toggle

  // Stats Counters
  const [stats, setStats] = useState({
    incidents: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    teams: { total: 0, available: 0, assigned: 0 },
    shelters: { total: 0, open: 0, full: 0 },
    depots: { total: 0 }
  });

  const loadAllData = async () => {
    try {
      const incData = await getIncidents();
      const resData = await getResources();
      const alertData = await getAlerts();
      const asgData = await getAssignments();

      setIncidents(incData);
      setResources(resData);
      setAlerts(alertData);
      setAssignments(asgData);
      
      calculateStats(incData, resData);
    } catch (e) {
      console.error("Failed to load operations dashboard data", e);
    }
  };

  const calculateStats = (incList, resList) => {
    // 1. Incidents
    const activeInc = incList.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED');
    const critical = activeInc.filter(i => i.severity === 'Critical').length;
    const high = activeInc.filter(i => i.severity === 'High').length;
    const medium = activeInc.filter(i => i.severity === 'Medium').length;
    const low = activeInc.filter(i => i.severity === 'Low').length;

    // 2. Teams
    const teams = resList.rescue_teams || [];
    const availableTeams = teams.filter(t => t.status === 'AVAILABLE').length;
    const assignedTeams = teams.filter(t => t.status === 'ASSIGNED' || t.status === 'EN_ROUTE' || t.status === 'RESCUING').length;

    // 3. Shelters
    const shelters = resList.shelters || [];
    const openShelters = shelters.filter(s => s.status === 'OPEN').length;
    const fullShelters = shelters.filter(s => s.status === 'FULL').length;

    // 4. Depots
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

    // Subscribe to WebSocket events
    const unsubscribe = subscribeToEvents((payload) => {
      console.log("WebSocket event received: ", payload);
      // Reload on updates
      loadAllData();

      // If selected incident is updated, sync its local details view
      if (selectedIncident && payload.data && payload.data.id === selectedIncident.id) {
        // Refetch incident
        getIncidents().then((list) => {
          const fresh = list.find(i => i.id === selectedIncident.id);
          if (fresh) setSelectedIncident(fresh);
        });
      }
    });

    return () => unsubscribe();
  }, [selectedIncident]);

  // Click handler from Alerts Banner in sidebar
  const handleAlertClick = (alert) => {
    setRecenterCoords([alert.latitude, alert.longitude]);
  };

  // Filter list items displayed on Map
  const filteredIncidents = incidents.filter((inc) => {
    // Hide closed/rejected by default on map unless filter requested
    if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return false;
    
    if (activeFilter.category === 'incident') {
      if (activeFilter.value === 'all') return true;
      return inc.severity === activeFilter.value;
    }
    return true;
  });

  const filteredTeams = resources.rescue_teams.filter((team) => {
    if (activeFilter.category === 'team') {
      return team.status === activeFilter.value;
    }
    return true;
  });

  const filteredShelters = resources.shelters.filter((shelter) => {
    if (activeFilter.category === 'shelter') {
      return shelter.status === activeFilter.value;
    }
    return true;
  });

  const filteredDepots = resources.supply_depots.filter((depot) => {
    if (activeFilter.category === 'depot') {
      return depot.status === activeFilter.value;
    }
    return true;
  });

  return (
    <div className="flex-1 flex min-h-0 relative h-full w-full">

        
        {/* Left Control Sidebar */}
        <div className="w-80 shrink-0">
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


        {/* Center Map Work Area */}
        <div className="flex-1 flex flex-col relative h-full min-w-0 bg-slate-50">
          
          {/* Map Layer Option Toggles bar */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs shrink-0 select-none shadow-sm">
            <div className="flex items-center space-x-5">
              <span className="text-slate-500 font-bold flex items-center space-x-1.5">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>Toggle Layers:</span>
              </span>
              
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 font-semibold hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={layerToggles.incidents}
                  onChange={(e) => setLayerToggles({ ...layerToggles, incidents: e.target.checked })}
                  className="rounded bg-slate-50 border-slate-350 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Citizen Reports</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 font-semibold hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={layerToggles.teams}
                  onChange={(e) => setLayerToggles({ ...layerToggles, teams: e.target.checked })}
                  className="rounded bg-slate-50 border-slate-350 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Rescue Teams</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 font-semibold hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={layerToggles.shelters}
                  onChange={(e) => setLayerToggles({ ...layerToggles, shelters: e.target.checked })}
                  className="rounded bg-slate-50 border-slate-350 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Shelters</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 font-semibold hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={layerToggles.depots}
                  onChange={(e) => setLayerToggles({ ...layerToggles, depots: e.target.checked })}
                  className="rounded bg-slate-50 border-slate-350 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Relief Depots</span>
              </label>
            </div>

            {/* Heatmap Toggle */}
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                showHeatmap 
                  ? 'bg-red-50 text-red-650 text-red-650 text-red-600 border-red-200' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Show Incident Heatmap
            </button>
          </div>

          {/* Interactive Leaflet Map */}
          <div className="flex-1 min-h-0 bg-slate-50 p-2">

            <MapView 
              incidents={filteredIncidents}
              teams={filteredTeams}
              shelters={filteredShelters}
              depots={filteredDepots}
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
          </div>

          {/* SIMULATION DRAWER COLLAPSIBLE CONTAINER */}
          <div className="absolute bottom-4 left-4 z-[1000] w-[340px]">
            <button
              onClick={() => setShowSimPanel(!showSimPanel)}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg flex items-center justify-between text-xs font-bold shadow-md w-full hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Terminal className="h-4.5 w-4.5 text-blue-600" />
                <span>Simulation Command Tools</span>
              </div>
              {showSimPanel ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            
            {showSimPanel && (
              <div className="mt-2 max-h-[380px] overflow-y-auto rounded-xl shadow-lg border border-slate-200">
                <SimulationPanel onSimulationTriggered={loadAllData} />
              </div>
            )}
          </div>

        </div>

        {/* Right Selection details panel */}
        {selectedIncident && (
          <div className="w-[360px] shrink-0 border-l border-slate-200 h-full relative bg-white shadow-sm">
            {/* Close details selector button */}
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-4 right-4 z-50 p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 shadow-sm transition-colors"
            >
              <X className="h-4 w-4" />
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
  );
};

export default AuthorityDashboard;

