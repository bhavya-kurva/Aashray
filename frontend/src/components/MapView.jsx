import React, { useEffect } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Home, Package, Info, AlertTriangle } from 'lucide-react';

// Fix Vite asset loader issues for default icons
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
    if (center) {
      map.setView(center, zoom || 13, { animate: true, duration: 0.8 });
    }
  }, [center, map, zoom]);
  return null;
};

// SVG Icon Creator for visual richness
const createCustomIcon = (color, type, badgeCount = 0) => {
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
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#ffffff; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 5px rgb(0 0 0 / 0.15)">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.5L18.5 10H14"/>
        <circle cx="7" cy="18" r="2"/>
        <circle cx="17" cy="18" r="2"/>
      </svg>
    `;
  } else if (type === 'shelter') {
    svgContent = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#ffffff; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 5px rgb(0 0 0 / 0.15)">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `;
  } else if (type === 'depot') {
    svgContent = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="background:#ffffff; border-radius:50%; padding:5px; border:2px solid ${color}; box-shadow: 0 2px 5px rgb(0 0 0 / 0.15)">
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

const MapView = ({ 
  incidents, 
  teams, 
  shelters, 
  depots, 
  alerts,
  assignments,
  selectedIncident, 
  onSelectIncident,
  recenterCoords,
  layerToggles,
  showHeatmap
}) => {
  const { t } = useLanguage();

  // Helper colors
  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#ef4444'; // red-500
      case 'High': return '#f97316';     // orange-500
      case 'Medium': return '#eab308';   // yellow-500
      case 'Low': return '#3b82f6';       // blue-500
      default: return '#94a3b8';
    }
  };

  const getTeamStatusColor = (stat) => {
    switch (stat) {
      case 'AVAILABLE': return '#10b981'; // emerald-500
      case 'ASSIGNED': return '#3b82f6';  // blue-500
      case 'EN_ROUTE': return '#9333ea';  // purple-600
      case 'RESCUING': return '#ec4899';  // pink-500
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

  // Center on Bhubaneswar by default
  const defaultCenter = [20.2961, 85.8245];
  const mapCenter = recenterCoords || (selectedIncident ? [selectedIncident.latitude, selectedIncident.longitude] : defaultCenter);

  return (
    <div className="w-full h-full relative border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50">
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Clean Light Mode Positron CartoDB Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapRecenter center={mapCenter} />

        {/* ================= HEATMAP LAYER ================= */}
        {showHeatmap && layerToggles.incidents && incidents.map((inc) => {
          if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') return null;
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
              radius={350 * weight} // Radius expands with severity weighting
            />
          );
        })}

        {/* ================= DISASTER ALERTS ZONES ================= */}
        {layerToggles.alerts && alerts.map((alert) => {
          const color = alert.severity === 'Critical' ? '#ef4444' : (alert.severity === 'High' ? '#f97316' : '#eab308');
          return (
            <React.Fragment key={`alert-zone-${alert.id}`}>
              {/* Outer boundary advisory circle */}
              <Circle
                center={[alert.latitude, alert.longitude]}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.02,
                  dashArray: "5, 10",
                  weight: 1.5
                }}
                radius={8000} // 8 km zone
              />
            </React.Fragment>
          );
        })}

        {/* ================= CITIZEN INCIDENTS MARKERS ================= */}
        {layerToggles.incidents && incidents.map((inc) => {
          // If active filter restricts it, or it is resolved/rejected, we don't display
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
                <div className="text-xs space-y-1.5 min-w-[200px] text-slate-800">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                    <span className="font-bold text-blue-600 font-mono">{inc.id}</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-650 font-semibold text-slate-600 capitalize">{inc.status}</span>
                  </div>
                  <div className="text-slate-900 font-bold">{inc.incident_type} Emergency</div>
                  <p className="text-slate-600 text-[10px] line-clamp-2 italic">"{inc.description}"</p>
                  <div className="text-[10px] text-slate-500 font-medium">Affected Count: <strong className="text-slate-800">{inc.people_affected}</strong></div>
                  <button 
                    onClick={() => onSelectIncident(inc)}
                    className="w-full mt-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] py-1.5 rounded-lg font-bold shadow-sm transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ================= RESCUE TEAMS MARKERS ================= */}
        {layerToggles.teams && teams.map((team) => {
          const color = getTeamStatusColor(team.status);
          return (
            <Marker
              key={team.id}
              position={[team.latitude, team.longitude]}
              icon={createCustomIcon(color, 'team')}
            >
              <Popup>
                <div className="text-xs space-y-1.5 text-slate-850">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between items-center">
                    <span>{team.name}</span>
                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600 font-semibold">{team.id}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">Personnel: {team.personnel_count} | Cap: {team.capacity}</div>
                  <div className="text-[10px] text-slate-650 text-slate-605 text-slate-600 font-medium">Equipment: {team.equipment || 'Standard Gear'}</div>
                  <div className="text-[10px] font-semibold text-slate-700">
                    Status: <strong style={{ color: color }} className="uppercase">{team.status}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ================= SHELTERS MARKERS ================= */}
        {layerToggles.shelters && shelters.map((shelter) => {
          // Open = Teal, Near_Capacity = Yellow, Full = Red
          const color = shelter.status === 'FULL' ? '#ef4444' : (shelter.status === 'NEAR_CAPACITY' ? '#eab308' : '#14b8a6');
          return (
            <Marker
              key={shelter.id}
              position={[shelter.latitude, shelter.longitude]}
              icon={createCustomIcon(color, 'shelter')}
            >
              <Popup>
                <div className="text-xs space-y-1.5 text-slate-800">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{shelter.name}</div>
                  <div className="text-[10px] text-slate-600 font-medium">Occupancy: {shelter.occupied_capacity} / {shelter.total_capacity} people</div>
                  <div className="text-[10px] text-slate-600 font-medium truncate max-w-[200px]">Facilities: {shelter.facilities}</div>
                  <div className="text-[10px] font-semibold text-slate-700">
                    Status: <strong style={{ color: color }}>{shelter.status}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ================= SUPPLY DEPOTS MARKERS ================= */}
        {layerToggles.depots && depots.map((depot) => {
          const color = depot.status === 'OUT_OF_STOCK' ? '#ef4444' : (depot.status === 'LOW_STOCK' ? '#f97316' : '#9333ea');
          return (
            <Marker
              key={depot.id}
              position={[depot.latitude, depot.longitude]}
              icon={createCustomIcon(color, 'depot')}
            >
              <Popup>
                <div className="text-xs space-y-1.5 text-slate-800">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">{depot.name}</div>
                  <div className="text-[10px] text-slate-600 font-medium">Water stock: {depot.water_stock} L</div>
                  <div className="text-[10px] text-slate-600 font-medium">Food stock: {depot.food_stock} packs</div>
                  <div className="text-[10px] text-slate-605 text-slate-600 font-medium">Medical kits: {depot.medical_stock} kits</div>
                  <div className="text-[10px] font-semibold text-slate-700">
                    Status: <strong style={{ color: color }}>{depot.status}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}


        {/* ================= ASSIGNMENT CONNECTION PATH LINES ================= */}
        {assignments && assignments.map((asg) => {
          // We only draw connection lines for active assignments
          if (asg.status !== 'ACTIVE') return null;

          // Find the incident coordinates
          const inc = incidents.find(i => i.id === asg.incident_id);
          if (!inc) return null;

          // Find resource coordinates depending on resource_type
          let resCoords = null;
          if (asg.resource_type === 'RESCUE_TEAM') {
            const team = teams.find(t => t.id === asg.resource_id);
            if (team) resCoords = [team.latitude, team.longitude];
          } else if (asg.resource_type === 'SHELTER') {
            const shelter = shelters.find(s => s.id === asg.resource_id);
            if (shelter) resCoords = [shelter.latitude, shelter.longitude];
          } else if (asg.resource_type === 'SUPPLY_DEPOT') {
            const depot = depots.find(d => d.id === asg.resource_id);
            if (depot) resCoords = [depot.latitude, depot.longitude];
          }

          if (!resCoords) return null;

          // Choose color based on resource type
          const lineColor = asg.resource_type === 'RESCUE_TEAM' ? '#ef4444' : (asg.resource_type === 'SHELTER' ? '#3b82f6' : '#10b981');

          return (
            <Polyline
              key={`line-${asg.id}`}
              positions={[
                [inc.latitude, inc.longitude],
                resCoords
              ]}
              pathOptions={{
                color: lineColor,
                weight: 3,
                dashArray: "8, 12",
                opacity: 0.8,
                lineJoin: 'round'
              }}
            />
          );
        })}

      </MapContainer>
    </div>
  );
};

export default MapView;
