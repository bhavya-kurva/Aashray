import React, { useState, useEffect } from 'react';
import { getResources } from '../services/api';
import ShelterCard from '../components/ShelterCard';
import MapView from '../components/MapView';
import { Home, Search, ShieldCheck, Filter, RefreshCw, AlertCircle, Navigation } from 'lucide-react';
import { IMAGES } from '../assets/images';

const ShelterFinder = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRouteShelter, setSelectedRouteShelter] = useState(null);

  const fetchShelterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResources();
      setShelters(data.shelters || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch live shelter data from network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelterData();
  }, []);

  const filteredShelters = shelters.filter((s) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Default fallback shelters if API empty
  const displayShelters = filteredShelters.length > 0 ? filteredShelters : [
    {
      id: 1,
      name: 'Aashray Relief Center - Cuttack',
      location_name: 'Cuttack, Odisha',
      current_occupancy: 420,
      max_capacity: 500,
      latitude: 20.4625,
      longitude: 85.8828,
    },
    {
      id: 2,
      name: 'Bhubaneswar High School Cyclone Shelter',
      location_name: 'Bhubaneswar, Odisha',
      current_occupancy: 180,
      max_capacity: 350,
      latitude: 20.2961,
      longitude: 85.8245,
    },
    {
      id: 3,
      name: 'Puri Coastal Relief Camp',
      location_name: 'Puri Beach Road, Odisha',
      current_occupancy: 290,
      max_capacity: 300,
      latitude: 19.8135,
      longitude: 85.8312,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Banner with Nature Background Overlay */}
      <div className="relative py-12 px-6 border-b border-slate-800 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-40 saturate-120 opacity-30"
          style={{ backgroundImage: `url(${IMAGES.shelter})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Evacuation Network</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Relief Shelters & Safe Routes
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium mt-1">
              Locate nearby relief camps, check real-time bed capacity, available food/medical supplies, and plot safe evacuation routes avoiding high-risk hazard zones.
            </p>
          </div>

          <button
            onClick={fetchShelterData}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shelter Cards List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shelter by name or district..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Updating live shelter capacities...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={fetchShelterData} className="underline font-bold">Retry</button>
            </div>
          ) : (
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {displayShelters.map((shelter) => (
                <ShelterCard
                  key={shelter.id}
                  shelter={shelter}
                  onSelectRoute={(s) => setSelectedRouteShelter(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Safe Route Map (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Evacuation Navigation Map</span>
            </div>

            {selectedRouteShelter && (
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Route Active: {selectedRouteShelter.name}
              </span>
            )}
          </div>

          <div className="flex-1 relative">
            <MapView
              resources={{ shelters: displayShelters }}
              highlightedResource={selectedRouteShelter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelterFinder;
