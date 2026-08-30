import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAlerts, getIncidents, getResources } from '../services/api';
import { IMAGES, DISASTER_TYPES } from '../assets/images';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import { AlertTriangle, Shield, User, ChevronRight, Bell, Radio, Activity, Navigation, Bot, ArrowUpRight, CheckCircle, HeartPulse, LifeBuoy } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [stats, setStats] = useState({
    activeIncidents: 14,
    deployedTeams: 8,
    availableShelters: 12,
    rescuedCitizens: 2430,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [alertsData, incidentsData, resourcesData] = await Promise.allSettled([
          getAlerts(),
          getIncidents(),
          getResources(),
        ]);

        if (alertsData.status === 'fulfilled' && Array.isArray(alertsData.value)) {
          setRecentAlerts(alertsData.value.slice(0, 3));
        }
        if (incidentsData.status === 'fulfilled' && Array.isArray(incidentsData.value)) {
          setStats((prev) => ({ ...prev, activeIncidents: incidentsData.value.length || prev.activeIncidents }));
        }
        if (resourcesData.status === 'fulfilled' && resourcesData.value) {
          const rescueTeams = resourcesData.value.rescue_teams || [];
          const shelters = resourcesData.value.shelters || [];
          setStats((prev) => ({
            ...prev,
            deployedTeams: rescueTeams.filter((t) => t.status === 'ASSIGNED' || t.status === 'BUSY').length || prev.deployedTeams,
            availableShelters: shelters.filter((s) => (s.current_occupancy || 0) < (s.max_capacity || 500)).length || prev.availableShelters,
          }));
        }
      } catch (e) {
        console.error('Landing page fetch error:', e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* HERO SECTION with High-Res Disaster Photography */}
      <div className="relative min-h-[640px] flex items-center justify-center px-6 py-16 overflow-hidden border-b border-slate-800">
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-50 saturate-110 transform scale-105 transition-transform duration-10000"
          style={{ backgroundImage: `url(${IMAGES.hero})` }}
        />
        {/* Dark Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" />
        <div className="absolute inset-0 bg-radial-vignette opacity-70" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest animate-pulse shadow-xl shadow-red-950/50">
            <Radio className="h-4 w-4 text-red-500" />
            <span>Real-Time Disaster Management & Resource Coordination</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-2xl">
            Rapid Response & Rescue Operations for <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Floods, Cyclones & Landslides
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-sm md:text-base font-medium leading-relaxed drop-shadow">
            Aashray connects citizens in distress, disaster management authorities, and field rescue teams across Odisha and Indian coastal belts with automated resource allocation, geotagged emergency reporting, and real-time shelter capacity tracking.
          </p>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/citizen')}
              className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-2xl shadow-red-600/30 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Report Emergency (SOS)</span>
            </button>

            <button
              onClick={() => navigate('/shelters')}
              className="py-3.5 px-7 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl flex items-center gap-2 transition-all backdrop-blur-md"
            >
              <Navigation className="w-5 h-5 text-emerald-400" />
              <span>Find Safe Shelters</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIVE TELEMETRY KPI STATS BAR */}
      <div className="max-w-7xl w-full mx-auto px-6 -mt-10 relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Emergencies"
          value={stats.activeIncidents}
          subtext="Geotagged & Tracked Live"
          icon={Activity}
          color="red"
        />
        <StatCard
          title="Deployed Rescue Teams"
          value={stats.deployedTeams}
          subtext="Active Field Dispatch"
          icon={LifeBuoy}
          color="amber"
        />
        <StatCard
          title="Available Shelters"
          value={stats.availableShelters}
          subtext="Bed & Relief Capacity Open"
          icon={Navigation}
          color="emerald"
        />
        <StatCard
          title="Citizens Rescued"
          value={stats.rescuedCitizens}
          subtext="Checked In & Safe"
          icon={HeartPulse}
          color="blue"
        />
      </div>

      {/* DISASTER TYPES & HAZARD MONITORING */}
      <div className="max-w-7xl w-full mx-auto px-6 py-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Hazard Assessment</span>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-1">Disaster Monitoring Categories</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md font-medium">
            Real-time telemetry feeds connected to IMD storm radars, coastal surge sensors, and geotagged citizen alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISASTER_TYPES.map((disaster) => (
            <div
              key={disaster.id}
              onClick={() => navigate('/citizen')}
              className="group relative h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer shadow-xl transition-all duration-300 hover:border-slate-600 hover:shadow-2xl"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center filter brightness-60 group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${disaster.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              <div className="relative h-full p-5 flex flex-col justify-between z-10">
                <span className={`self-start px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border backdrop-blur-md ${disaster.badge}`}>
                  {disaster.name}
                </span>

                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
                    <span>{disaster.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    {disaster.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PORTALS SELECTORS & COMMAND CENTER ACCESS */}
      <div className="bg-slate-900/60 border-y border-slate-800/80 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Citizen Emergency Reporting Portal */}
          <div 
            onClick={() => navigate('/citizen')}
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all" />

            <div className="relative z-10 space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit">
                <User className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors flex items-center justify-between">
                <span>Citizen Emergency Portal</span>
                <ChevronRight className="w-6 h-6 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </h2>

              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                Submit high-priority emergency reports with automatic GPS lock (`navigator.geolocation`) and picture uploads. Receive instant tracking IDs (`ASH-2048`) and view live response progress.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-extrabold text-blue-400">
                <span>Report Incident</span>
                <span>•</span>
                <span>Track Status</span>
                <span>•</span>
                <span>Offline SMS Hotline</span>
              </div>
            </div>
          </div>

          {/* Authority Command Center Board */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl cursor-pointer hover:border-amber-500/50 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-all" />

            <div className="relative z-10 space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
                <Shield className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Authority Command Center</span>
                <ChevronRight className="w-6 h-6 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </h2>

              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                For disaster coordinators and response leads. Features interactive Leaflet maps, WebSockets real-time push synchronization, automated resource allocation matching algorithms, and IMD simulation feeds.
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs font-extrabold text-amber-400">
                <span>Map Operations</span>
                <span>•</span>
                <span>Resource Allocation</span>
                <span>•</span>
                <span>Dispatch Teams</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE ADVISORIES & WEATHER ALERTS */}
      {recentAlerts.length > 0 && (
        <div className="max-w-7xl w-full mx-auto px-6 py-16 space-y-6">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500 animate-bounce" />
            <h2 className="text-xl font-black text-white">Active Evacuation Advisories & Warnings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={() => navigate('/shelters')}
              />
            ))}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 font-medium space-y-2">
        <p>Aashray Real-Time Disaster Management & Resource Coordination Platform</p>
        <p className="text-[11px] text-slate-600">Built with React, Leaflet, FastAPI, WebSockets & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default Landing;
