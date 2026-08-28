import React, { useState, useEffect } from 'react';
import { 
  getRecommendation, assignResource, updateIncidentStatus 
} from '../services/api';
import { 
  AlertOctagon, Users, MapPin, Calendar, CheckCircle2, ShieldAlert,
  ChevronRight, RefreshCw, Warehouse, HelpCircle, Truck, PackageCheck 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const IncidentDetails = ({ incident, onActionCompleted, assignments = [], allResources = {} }) => {
  const { t } = useLanguage();
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
        // 1. Fetch Rescue Team
        const teamData = await getRecommendation(incident.id, 'RESCUE_TEAM');
        setRecommendation(teamData);
        if (teamData && !teamData.error) {
          setSelectedTeamId(teamData.recommended_resource_id);
        } else if (teamData && teamData.alternatives?.length > 0) {
          setSelectedTeamId(teamData.alternatives[0].id);
        }

        // 2. Fetch Shelter
        const shelterData = await getRecommendation(incident.id, 'SHELTER');
        setShelterRec(shelterData);
        if (shelterData && !shelterData.error) {
          setSelectedShelterId(shelterData.recommended_resource_id);
        } else if (shelterData && shelterData.alternatives?.length > 0) {
          setSelectedShelterId(shelterData.alternatives[0].id);
        }

        // 3. Fetch Supply
        const supplyData = await getRecommendation(incident.id, 'SUPPLY_DEPOT', supplyType);
        setSupplyRec(supplyData);
        if (supplyData && !supplyData.error) {
          setSelectedDepotId(supplyData.recommended_resource_id);
        }
      }
    } catch (error) {
      console.error("Error fetching simultaneous recommendations", error);
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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 shadow-sm">
        <HelpCircle className="h-10 w-10 mx-auto text-slate-400 mb-2 animate-bounce" />
        <p className="text-xs font-semibold">Select an incident pin on the map or from the list to view allocation details</p>
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
      // 1. Assign Rescue Team
      await assignResource(incident.id, 'RESCUE_TEAM', selectedTeamId);
      // 2. Assign Shelter
      await assignResource(incident.id, 'SHELTER', selectedShelterId);
      // 3. Optionally Assign Supply Depot
      if (distributeSupplies && selectedDepotId) {
        await assignResource(incident.id, 'SUPPLY_DEPOT', selectedDepotId);
      }
      
      // Update local state and trigger refresh
      if (onActionCompleted) onActionCompleted();
    } catch (e) {
      alert("Allocation failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setAssigning(false);
    }
  };

  const getAssignedResource = (resType) => {
    const asg = assignments?.find(a => a.incident_id === incident.id && a.resource_type === resType);
    if (!asg) return null;
    
    if (resType === 'RESCUE_TEAM') {
      const team = allResources?.rescue_teams?.find(t => t.id === asg.resource_id);
      return team ? { name: team.name, id: team.id, status: team.status } : { name: `Team ID: ${asg.resource_id}`, id: asg.resource_id };
    }
    if (resType === 'SHELTER') {
      const shelter = allResources?.shelters?.find(s => s.id === asg.resource_id);
      return shelter ? { name: shelter.name, id: shelter.id, occupancy: `${shelter.occupied_capacity}/${shelter.total_capacity}` } : { name: `Shelter ID: ${asg.resource_id}`, id: asg.resource_id };
    }
    if (resType === 'SUPPLY_DEPOT') {
      const depot = allResources?.supply_depots?.find(d => d.id === asg.resource_id);
      return depot ? { name: depot.name, id: depot.id } : { name: `Depot ID: ${asg.resource_id}`, id: asg.resource_id };
    }
    return null;
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

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'bg-red-50 text-red-650 text-red-650 text-red-655 text-red-600 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-655 text-orange-600 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-650 text-yellow-600 border-yellow-250 border-yellow-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const getStatusColor = (stat) => {
    switch (stat?.toUpperCase()) {
      case 'REPORTED': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'VERIFIED': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'AWAITING_ALLOCATION': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'RESOURCE_ASSIGNED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'RESCUE_IN_PROGRESS': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'DUPLICATE': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden text-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50/80 p-4 border-b border-slate-200 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-500 font-bold">{incident.id}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityColor(incident.severity)}`}>
              {t(incident.severity?.toLowerCase())}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(incident.status)}`}>
              {t(incident.status?.toLowerCase()) || incident.status}
            </span>
          </div>
          <h2 className="text-sm font-extrabold mt-1 text-slate-900">{incident.incident_type} Incident</h2>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center font-semibold">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {incident.photo_url && (
          <div className="relative rounded-lg overflow-hidden border border-slate-200 h-36 bg-slate-50 shadow-sm">
            <img 
              src={incident.photo_url.startsWith('/') ? `http://localhost:8000${incident.photo_url}` : incident.photo_url} 
              alt="Disaster" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-slate-400 mr-2 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-700">Locality: </span>
              <span className="text-slate-600 font-semibold">{incident.location || 'Bhubaneswar Area'}</span>
              <span className="block text-[10px] text-slate-400 font-mono mt-0.5">({incident.latitude.toFixed(4)}°N, {incident.longitude.toFixed(4)}°E)</span>
            </div>
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <div>
              <span className="font-bold text-slate-700">Affected Citizens: </span>
              <span className="text-slate-650 text-slate-600 font-semibold">{incident.people_affected} people</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-650 text-slate-700 italic shadow-inner">
            "{incident.description || 'No description provided.'}"
          </div>
          <div className="text-[10px] text-slate-500 font-medium">Report Source: <strong className="text-slate-750 text-slate-700">{incident.source}</strong></div>
        </div>

        {/* Status Actions */}
        <div className="border-t border-slate-200 pt-3">
          <label className="block text-xs font-bold text-slate-500 mb-2">Manage Incident Status</label>
          <div className="grid grid-cols-2 gap-1.5">
            {['VERIFIED', 'RESCUE_IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE'].map((st) => (
              <button
                key={st}
                disabled={statusLoading || incident.status === st}
                onClick={() => handleStatusChange(st)}
                className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all shadow-sm ${
                  incident.status === st 
                    ? 'bg-blue-600 text-white border-blue-600 cursor-not-allowed shadow-none font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>        {/* Allocation Engine Container */}
        <div className="border-t border-slate-200 pt-3">

          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-slate-400 space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              <span>Analyzing available resources...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scenario 1: Rescue & Shelter Allocation Needed */}
              {['REPORTED', 'VERIFIED', 'AWAITING_ALLOCATION'].includes(incident.status) && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center mb-1">
                    <AlertOctagon className="h-4 w-4 mr-1.5 text-blue-600 shrink-0" />
                    <span>Coordinate Emergency Dispatch</span>
                  </h3>

                  {/* 1. Rescue Team Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Rescue Team</label>
                    {recommendation?.error === 'NO_SUITABLE_RESOURCE_AVAILABLE' ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-650 text-red-600 font-semibold mb-2">
                        Warning: {recommendation.message}
                      </div>
                    ) : recommendation ? (
                      <div className="bg-blue-50/40 border border-blue-200 p-2.5 rounded-xl text-xs text-slate-700 font-semibold leading-relaxed mb-2">
                        Recommended: <strong className="text-slate-900">{recommendation.name}</strong> ({recommendation.distance_km} km, Cap: {recommendation.capacity} pax)
                      </div>
                    ) : null}
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none text-slate-700 text-xs font-semibold focus:border-blue-500 shadow-sm cursor-pointer"
                    >
                      <option value="">-- Choose Rescue Team --</option>
                      {(allResources?.rescue_teams?.filter(t => t.status === 'AVAILABLE') || []).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Personnel: {t.personnel_count}, Cap: {t.capacity} pax)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Shelter Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Shelter</label>
                    {shelterRec?.error === 'NO_SUITABLE_RESOURCE_AVAILABLE' ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-650 text-red-600 font-semibold mb-2">
                        Warning: {shelterRec.message}
                      </div>
                    ) : shelterRec ? (
                      <div className="bg-teal-50/40 border border-teal-200 p-2.5 rounded-xl text-xs text-slate-700 font-semibold leading-relaxed mb-2">
                        Recommended: <strong className="text-slate-900">{shelterRec.name}</strong> ({shelterRec.distance_km} km)
                      </div>
                    ) : null}
                    <select
                      value={selectedShelterId}
                      onChange={(e) => setSelectedShelterId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none text-slate-700 text-xs font-semibold focus:border-blue-500 shadow-sm cursor-pointer"
                    >
                      <option value="">-- Choose Shelter --</option>
                      {(allResources?.shelters?.filter(s => s.status === 'OPEN' && (s.total_capacity - s.occupied_capacity) > 0) || []).map(s => {
                        const avail = s.total_capacity - s.occupied_capacity;
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name} (Available: {avail}/{s.total_capacity} spots)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* 3. Optional Supplies Allocation */}
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-705 text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={distributeSupplies}
                        onChange={(e) => setDistributeSupplies(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span>Distribute Relief Supplies</span>
                    </label>
                    
                    {distributeSupplies && (
                      <div className="space-y-3 pt-2.5 border-t border-slate-200 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Supply Bundle Type</span>
                          <select 
                            value={supplyType}
                            onChange={(e) => setSupplyType(e.target.value)}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 font-bold outline-none shadow-sm cursor-pointer"
                          >
                            <option value="water">Water</option>
                            <option value="food">Food</option>
                            <option value="medical">Medical</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Supply Depot</label>
                          {supplyRec ? (
                            <div className="bg-emerald-50/40 border border-emerald-250 border-emerald-200 p-2 rounded-lg text-[10px] text-slate-700 font-semibold mb-1.5">
                              Recommended: <strong className="text-slate-900">{supplyRec.name}</strong> ({supplyRec.distance_km} km)
                            </div>
                          ) : null}
                          <select
                            value={selectedDepotId}
                            onChange={(e) => setSelectedDepotId(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none text-slate-700 text-xs font-bold focus:border-blue-500 shadow-sm cursor-pointer"
                          >
                            <option value="">-- Choose Supply Depot --</option>
                            {(allResources?.supply_depots?.filter(d => d.status !== 'OUT_OF_STOCK') || []).map(d => {
                              let stockStr = `Water: ${d.water_stock}L, Food: ${d.food_stock}p, Med: ${d.medical_stock}k`;
                              return (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({stockStr})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Allocation submit trigger button */}
                  <button
                    disabled={assigning || !selectedTeamId || !selectedShelterId}
                    onClick={handleAssignAll}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-lg text-xs transition-all shadow-sm hover:shadow-md flex items-center justify-center disabled:opacity-40"
                  >
                    {assigning && <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                    <span>Dispatch & Coordinate Resources</span>
                  </button>
                </div>
              )}

              {/* Scenario 2: Already Dispatched - Display Summary details */}
              {['RESOURCE_ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESOLVED'].includes(incident.status) && (
                <div className="space-y-3.5 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-xs text-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <PackageCheck className="h-4 w-4 mr-1.5 text-blue-600" />
                    <span>Assigned Dispatch Details</span>
                  </h3>
                  
                  <div className="space-y-2 pt-1">
                    {getAssignedResource('RESCUE_TEAM') && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                        <div>
                          <strong className="text-slate-900 block font-extrabold">{getAssignedResource('RESCUE_TEAM').name}</strong>
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase font-mono mt-0.5">Rescue Team • {getAssignedResource('RESCUE_TEAM').id}</span>
                        </div>
                        {getAssignedResource('RESCUE_TEAM').status && (
                          <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">{getAssignedResource('RESCUE_TEAM').status}</span>
                        )}
                      </div>
                    )}

                    {getAssignedResource('SHELTER') && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                        <div>
                          <strong className="text-slate-900 block font-extrabold">{getAssignedResource('SHELTER').name}</strong>
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase font-mono mt-0.5">Allocated Shelter • {getAssignedResource('SHELTER').id}</span>
                        </div>
                        {getAssignedResource('SHELTER').occupancy && (
                          <span className="bg-teal-50 text-teal-605 text-teal-600 border border-teal-100 px-2 py-0.5 rounded text-[9px] font-extrabold">{getAssignedResource('SHELTER').occupancy} spots</span>
                        )}
                      </div>
                    )}

                    {getAssignedResource('SUPPLY_DEPOT') && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                        <div>
                          <strong className="text-slate-900 block font-extrabold">{getAssignedResource('SUPPLY_DEPOT').name}</strong>
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase font-mono mt-0.5">Relief Supplies Dispatched • {getAssignedResource('SUPPLY_DEPOT').id}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Dispatched</span>
                      </div>
                    )}

                    {!getAssignedResource('RESCUE_TEAM') && !getAssignedResource('SHELTER') && !getAssignedResource('SUPPLY_DEPOT') && (
                      <p className="text-[10px] text-slate-400 italic">No resources currently assigned to this incident.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetails;
