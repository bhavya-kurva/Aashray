import React, { useState, useEffect } from 'react';
import { getRecommendation, assignResource, updateIncidentStatus } from '../services/api';
import { AlertOctagon, Users, MapPin, Calendar, CheckCircle2, ShieldAlert, ChevronRight, RefreshCw, Warehouse, HelpCircle, Truck, PackageCheck } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const IncidentDetails = ({ incident, onActionCompleted, assignments = [], allResources = {} }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Simultaneous Allocation States
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedShelterId, setSelectedShelterId] = useState('');
  const [distributeSupplies, setDistributeSupplies] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState('');
  const [supplyType, setSupplyType] = useState('water');

  const [shelterRec, setShelterRec] = useState(null);
  const [supplyRec, setSupplyRec] = useState(null);

  const fetchRecommendations = async () => {
    if (!incident) return;
    setLoading(true);
    setRecommendation(null);
    setShelterRec(null);
    setSupplyRec(null);
    try {
      if (['REPORTED', 'VERIFIED', 'AWAITING_ALLOCATION'].includes(incident.status)) {
        // 1. Rescue Team Recommendation
        const teamData = await getRecommendation(incident.id, 'RESCUE_TEAM');
        setRecommendation(teamData);
        if (teamData && !teamData.error) {
          setSelectedTeamId(teamData.recommended_resource_id);
        } else if (teamData && teamData.alternatives?.length > 0) {
          setSelectedTeamId(teamData.alternatives[0].id);
        }

        // 2. Shelter Recommendation
        const shelterData = await getRecommendation(incident.id, 'SHELTER');
        setShelterRec(shelterData);
        if (shelterData && !shelterData.error) {
          setSelectedShelterId(shelterData.recommended_resource_id);
        } else if (shelterData && shelterData.alternatives?.length > 0) {
          setSelectedShelterId(shelterData.alternatives[0].id);
        }

        // 3. Supply Recommendation
        const supplyData = await getRecommendation(incident.id, 'SUPPLY_DEPOT', supplyType);
        setSupplyRec(supplyData);
        if (supplyData && !supplyData.error) {
          setSelectedDepotId(supplyData.recommended_resource_id);
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    setDistributeSupplies(false);
    setSelectedTeamId('');
    setSelectedShelterId('');
    setSelectedDepotId('');
  }, [incident, supplyType]);

  if (!incident) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <HelpCircle className="w-8 h-8 mx-auto text-slate-500 mb-2 animate-bounce" />
        <p className="text-xs font-semibold">Select an incident pin on the map to view allocation & decision engine recommendations.</p>
      </div>
    );
  }

  const handleAssignAll = async () => {
    if (!selectedTeamId || !selectedShelterId) {
      alert("Please select both a rescue team and a shelter.");
      return;
    }
    setAssigning(true);
    try {
      await assignResource(incident.id, 'RESCUE_TEAM', selectedTeamId);
      await assignResource(incident.id, 'SHELTER', selectedShelterId);
      if (distributeSupplies && selectedDepotId) {
        await assignResource(incident.id, 'SUPPLY_DEPOT', selectedDepotId);
      }
      if (onActionCompleted) onActionCompleted();
    } catch (e) {
      alert("Allocation failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await updateIncidentStatus(incident.id, newStatus);
      if (onActionCompleted) onActionCompleted();
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 flex flex-col h-full overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-blue-400 font-extrabold">{incident.id}</span>
            <SeverityBadge severity={incident.severity} size="small" />
          </div>
          <h2 className="text-base font-black text-white">{incident.disaster_type || incident.incident_type} Incident</h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {new Date(incident.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        <div className="space-y-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">{incident.location_name || incident.location}</span>
              <span className="text-[10px] font-mono text-slate-400">({incident.latitude?.toFixed(4)}°N, {incident.longitude?.toFixed(4)}°E)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>People Affected: <strong className="text-amber-300 font-extrabold">{incident.people_affected} citizens</strong></span>
          </div>

          <p className="text-slate-300 italic pt-1 border-t border-slate-800 leading-relaxed">
            "{incident.description || 'No additional description provided.'}"
          </p>
        </div>

        {/* Status Actions */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Update Incident Status</label>
          <div className="grid grid-cols-2 gap-1.5">
            {['VERIFIED', 'RESCUE_IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                disabled={statusLoading || incident.status === st}
                onClick={() => handleStatusChange(st)}
                className={`py-2 px-2.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                  incident.status === st
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Decision Engine Recommendation Box */}
        <div className="border-t border-slate-800 pt-3 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Running automated allocation engine...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-blue-400" />
                <span>Automated Asset Allocation</span>
              </h3>

              {/* Rescue Team Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Recommended Rescue Team</label>
                {recommendation && !recommendation.error && (
                  <div className="bg-blue-500/10 border border-blue-500/30 p-2.5 rounded-xl text-[11px] text-blue-300 font-medium">
                    Optimal Match: <strong className="text-white">{recommendation.name}</strong> ({recommendation.distance_km} km away)
                  </div>
                )}
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value="">-- Select Rescue Team --</option>
                  {(allResources?.rescue_teams?.filter(t => t.status === 'AVAILABLE') || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Capacity: {t.capacity})</option>
                  ))}
                </select>
              </div>

              {/* Shelter Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Recommended Shelter</label>
                {shelterRec && !shelterRec.error && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-[11px] text-emerald-300 font-medium">
                    Optimal Match: <strong className="text-white">{shelterRec.name}</strong> ({shelterRec.distance_km} km away)
                  </div>
                )}
                <select
                  value={selectedShelterId}
                  onChange={(e) => setSelectedShelterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                >
                  <option value="">-- Select Shelter --</option>
                  {(allResources?.shelters?.filter(s => (s.max_capacity || s.total_capacity || 500) > (s.current_occupancy || s.occupied_capacity || 0)) || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.current_occupancy || s.occupied_capacity || 0} / {s.max_capacity || s.total_capacity || 500})</option>
                  ))}
                </select>
              </div>

              {/* Dispatch Action */}
              <button
                disabled={assigning || !selectedTeamId || !selectedShelterId}
                onClick={handleAssignAll}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {assigning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                <span>Dispatch & Coordinate Assets</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;
