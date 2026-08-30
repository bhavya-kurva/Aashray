import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Helper component to center and zoom map dynamically when selection changes
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 13, { animate: true, duration: 0.8 });
    }
  }, [center, map, zoom]);
  return null;
};

// SVG Icon Creator for visual richness
const createCustomIcon = (color, type) => {
  let svgContent = '';
  if (type === 'incident') {
    svgContent = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="6" fill="${color}" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.2"/>
        <circle cx="12" cy="12" r="2.5" fill="#ffffff"/>
      </svg>
    `;
  } else if (type === 'team') {
    svgContent = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#0f172a; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 8px rgb(0 0 0 / 0.5)">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.5L18.5 10H14"/>
        <circle cx="7" cy="18" r="2"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    `;
  } else if (type === 'shelter') {
    svgContent = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#0f172a; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 8px rgb(0 0 0 / 0.5)">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `;
  } else if (type === 'depot') {
    svgContent = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#0f172a; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 8px rgb(0 0 0 / 0.5)">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    `;
  }

  return L.divIcon({
    html: `<div style="display:flex; justify-content:center; align-items:center; width:100%; height:100%;">${svgContent}</div>`,
    className: 'custom-svg-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -10]
  });
};

const DEFAULT_LAYER_TOGGLES = {
  incidents: true,
  teams: true,
  shelters: true,
  depots: true,
  alerts: true
};

const MapView = ({ 
  incidents = [], 
  teams = [], 
  shelters = [], 
  depots = [], 
  alerts = [],
  assignments = [],
  selectedIncident = null, 
  onSelectIncident = () => {},
  recenterCoords = null,
  layerToggles = DEFAULT_LAYER_TOGGLES,
  showHeatmap = false,
  resources = null,
  highlightedResource = null
}) => {
  const [tileErrorCount, setTileErrorCount] = useState(0);

  // Extract shelter/team/depot lists if resources bundle prop was passed
  const activeShelters = shelters.length > 0 ? shelters : (resources?.shelters || []);
  const activeTeams = teams.length > 0 ? teams : (resources?.rescue_teams || []);
  const activeDepots = depots.length > 0 ? depots : (resources?.supply_depots || []);

  const safeLayerToggles = { ...DEFAULT_LAYER_TOGGLES, ...(layerToggles || {}) };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#3b82f6';
      default: return '#94a3b8';
    }
  };

  const getTeamStatusColor = (stat) => {
    switch (stat) {
      case 'AVAILABLE': return '#10b981';
      case 'ASSIGNED': return '#3b82f6';
      case 'EN_ROUTE': return '#9333ea';
      case 'RESCUING': return '#ec4899';
      default: return '#64748b';
    }
  };

  const getSeverityWeight = (sev) => {
    switch (sev) {
      case 'Critical': return 4;
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 1;
    }
  };

  const defaultCenter = [20.2961, 85.8245];
  const targetCenter = recenterCoords || 
    (selectedIncident ? [selectedIncident.latitude, selectedIncident.longitude] : 
    (highlightedResource ? [highlightedResource.latitude, highlightedResource.longitude] : defaultCenter));

  return (
    <div className="w-full h-full relative border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
      {tileErrorCount > 15 && (
        <div className="absolute top-2 left-2 right-2 z-[1000] bg-slate-900/90 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md flex justify-between items-center">
          <span>Map Tile Notice: Operating on cached/offline OpenStreetMap layer.</span>
          <button onClick={() => setTileErrorCount(0)} className="underline text-[10px] font-bold">Dismiss</button>
        </div>
      )}

      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* OpenStreetMap Standard Tile Layer (Zero API keys required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => {
              setTileErrorCount((prev) => prev + 1);
            }
          }}
        />

        <MapRecenter center={targetCenter} />

        {/* Heatmap Layer */}
        {showHeatmap && safeLayerToggles.incidents && (incidents || []).map((inc) => {
          if (!inc || inc.status === 'RESOLVED' || inc.status === 'REJECTED') return null;
          const color = getSeverityColor(inc.severity);
          const weight = getSeverityWeight(inc.severity);
          return (
            <Circle
              key={`heat-${inc.id}`}
              center={[inc.latitude, inc.longitude]}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.08 * weight,
                stroke: false
              }}
              radius={350 * weight}
            />
          );
        })}

        {/* Disaster Alert Zones */}
        {safeLayerToggles.alerts && (alerts || []).map((alert) => {
          if (!alert || !alert.latitude || !alert.longitude) return null;
          const color = alert.severity === 'Critical' ? '#ef4444' : (alert.severity === 'High' ? '#f97316' : '#eab308');
          return (
            <Circle
              key={`alert-zone-${alert.id}`}
              center={[alert.latitude, alert.longitude]}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.03,
                dashArray: "6, 12",
                weight: 1.8
              }}
              radius={8000}
            />
          );
        })}

        {/* Citizen Incidents Markers */}
        {safeLayerToggles.incidents && (incidents || []).map((inc) => {
          if (!inc || inc.status === 'RESOLVED' || inc.status === 'REJECTED') return null;
          const color = getSeverityColor(inc.severity);
          return (
            <Marker
              key={inc.id}
              position={[inc.latitude, inc.longitude]}
              icon={createCustomIcon(color, 'incident')}
              eventHandlers={{
                click: () => onSelectIncident(inc)
              }}
            >
              <Popup>
                <div className="text-xs space-y-1.5 min-w-[200px] text-slate-100">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                    <span className="font-bold text-blue-400 font-mono">{inc.id}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-semibold uppercase">{inc.status}</span>
                  </div>
                  <div className="text-white font-bold">{inc.disaster_type || inc.incident_type} Emergency</div>
                  <p className="text-slate-300 text-[10px] line-clamp-2 italic">"{inc.description}"</p>
                  <div className="text-[10px] text-slate-400 font-medium">Affected: <strong className="text-white">{inc.people_affected} citizens</strong></div>
                  <button 
                    onClick={() => onSelectIncident(inc)}
                    className="w-full mt-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1.5 rounded-lg font-bold shadow-md transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Rescue Teams Markers */}
        {safeLayerToggles.teams && (activeTeams || []).map((team) => {
          if (!team || !team.latitude || !team.longitude) return null;
          const color = getTeamStatusColor(team.status);
          return (
            <Marker
              key={team.id}
              position={[team.latitude, team.longitude]}
              icon={createCustomIcon(color, 'team')}
            >
              <Popup>
                <div className="text-xs space-y-1 text-slate-100">
                  <div className="font-bold text-white border-b border-slate-700 pb-1 flex justify-between items-center">
                    <span>{team.name}</span>
                    <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">{team.id}</span>
                  </div>
                  <div className="text-[10px] text-slate-300">Personnel: {team.personnel_count} | Capacity: {team.capacity}</div>
                  <div className="text-[10px] font-semibold">
                    Status: <strong style={{ color: color }} className="uppercase">{team.status}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shelters Markers */}
        {safeLayerToggles.shelters && (activeShelters || []).map((shelter) => {
          if (!shelter || !shelter.latitude || !shelter.longitude) return null;
          const isHighlighted = highlightedResource && (highlightedResource.id === shelter.id);
          const color = isHighlighted ? '#10b981' : (shelter.status === 'FULL' ? '#ef4444' : '#14b8a6');
          return (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={createCustomIcon(color, 'shelter')}
            >
              <Popup>
                <div className="text-xs space-y-1 text-slate-100">
                  <div className="font-bold text-white border-b border-slate-700 pb-1">{shelter.name}</div>
                  <div className="text-[10px] text-slate-300">Occupancy: {shelter.current_occupancy || shelter.occupied_capacity || 0} / {shelter.max_capacity || shelter.total_capacity || 500}</div>
                  <div className="text-[10px] font-semibold">
                    Status: <strong style={{ color: color }}>{shelter.status || 'OPEN'}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Supply Depots Markers */}
        {safeLayerToggles.depots && (activeDepots || []).map((depot) => {
          if (!depot || !depot.latitude || !depot.longitude) return null;
          const color = depot.status === 'OUT_OF_STOCK' ? '#ef4444' : '#9333ea';
          return (
            <Marker
              key={depot.id}
              position={[depot.latitude, depot.longitude]}
              icon={createCustomIcon(color, 'depot')}
            >
              <Popup>
                <div className="text-xs space-y-1 text-slate-100">
                  <div className="font-bold text-white border-b border-slate-700 pb-1">{depot.name}</div>
                  <div className="text-[10px] text-slate-300">Water: {depot.water_stock}L | Food: {depot.food_stock} packs</div>
                  <div className="text-[10px] font-semibold">
                    Status: <strong style={{ color: color }}>{depot.status || 'AVAILABLE'}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Dotted Safe Route Polyline when highlightedResource shelter is selected */}
        {highlightedResource && (
          <Polyline
            positions={[
              defaultCenter,
              [highlightedResource.latitude, highlightedResource.longitude]
            ]}
            pathOptions={{
              color: '#10b981',
              weight: 4,
              dashArray: "10, 10",
              opacity: 0.9,
              lineJoin: 'round'
            }}
          />
        )}

        {/* Assignment Connections */}
        {(assignments || []).map((asg) => {
          if (asg.status !== 'ACTIVE') return null;
          const inc = incidents.find(i => i.id === asg.incident_id);
          if (!inc) return null;

          let resCoords = null;
          if (asg.resource_type === 'RESCUE_TEAM') {
            const team = activeTeams.find(t => t.id === asg.resource_id);
            if (team) resCoords = [team.latitude, team.longitude];
          } else if (asg.resource_type === 'SHELTER') {
            const shelter = activeShelters.find(s => s.id === asg.resource_id);
            if (shelter) resCoords = [shelter.latitude, shelter.longitude];
          }

          if (!resCoords) return null;

          return (
            <Polyline
              key={`line-${asg.id}`}
              positions={[
                [inc.latitude, inc.longitude],
                resCoords
              ]}
              pathOptions={{
                color: asg.resource_type === 'RESCUE_TEAM' ? '#ef4444' : '#3b82f6',
                weight: 3,
                dashArray: "8, 12",
                opacity: 0.8
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
