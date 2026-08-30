import React, { useState, useEffect } from 'react';
import { createIncidentForm, getIncidents } from '../services/api';
import { AlertOctagon, MapPin, Phone, CheckCircle2, MessageSquare, AlertCircle, RefreshCw, Send } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { IMAGES } from '../assets/images';

const CitizenPortal = () => {
  const [formData, setFormData] = useState({
    disaster_type: 'Flood',
    severity: 'Critical',
    people_affected: 15,
    location_name: 'Rasulgarh, Cuttack Road',
    description: '',
    latitude: 20.4625,
    longitude: 85.8828,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);
  const [formError, setFormError] = useState(null);
  const [myIncidents, setMyIncidents] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchMyIncidents = async () => {
    try {
      setLoadingHistory(true);
      const data = await getIncidents();
      setMyIncidents(data.slice(0, 4));
    } catch (e) {
      console.error('Fetch incidents error:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  const handleGPSLock = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
          }));
        },
        (err) => {
          console.warn('GPS location error:', err);
          alert('Could not access device GPS. Defaulting to regional coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      // Build FormData payload matching FastAPI /api/incidents route parameters
      const data = new FormData();
      data.append('incident_type', formData.disaster_type);
      data.append('severity', formData.severity);
      data.append('people_affected', formData.people_affected.toString());
      data.append('location', formData.location_name);
      data.append('description', formData.description || 'Emergency assistance requested.');
      data.append('latitude', formData.latitude.toString());
      data.append('longitude', formData.longitude.toString());
      data.append('source', 'APP');
      if (file) {
        data.append('photo', file);
      }

      const response = await createIncidentForm(data);

      const incidentId = response.id || `ASH-${Math.floor(1000 + Math.random() * 9000)}`;
      const resultObj = {
        ...response,
        id: incidentId,
        disaster_type: formData.disaster_type,
        severity: formData.severity,
        people_affected: formData.people_affected,
        location_name: formData.location_name,
        status: response.status || 'REPORTED',
        created_at: new Date().toISOString(),
      };

      setSubmittedIncident(resultObj);
      setMyIncidents((prev) => [resultObj, ...prev]);
    } catch (err) {
      console.error('Incident creation error:', err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setFormError(detail.map((d) => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', '));
      } else if (typeof detail === 'string') {
        setFormError(detail);
      } else {
        setFormError('Failed to transmit emergency report. Check connectivity or use SMS fallback.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Banner */}
      <div className="relative py-10 px-6 border-b border-slate-800 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter brightness-40 saturate-120 opacity-30"
          style={{ backgroundImage: `url(${IMAGES.rescue})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Citizen Emergency Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Report Emergency & Track Response
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl font-medium mt-1">
              Geotagged distress signaling with immediate dispatch tracking (`ASH-2048`). All submissions sync in real-time with the Authority Command Board.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Helpline Hotlines</div>
              <div className="text-xs font-black text-white font-mono">+91 99999 99999 / 112</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form / Submitted Success Card (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {submittedIncident ? (
            /* SUCCESS CONFIRMATION CARD */
            <div className="bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Report Transmitted Successfully</span>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>Incident ID:</span>
                    <span className="font-mono text-emerald-300 bg-emerald-500/10 px-3 py-0.5 rounded-lg border border-emerald-500/30">
                      {submittedIncident.id}
                    </span>
                  </h2>
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live Response Timeline</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-[10.5px] font-bold">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">✓ Reported</div>
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">Rescue Assigned</div>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700">En Route</div>
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700">Resolved / Safe</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Disaster Type</span>
                  <span className="text-white font-bold">{submittedIncident.disaster_type}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Severity Level</span>
                  <SeverityBadge severity={submittedIncident.severity} size="small" />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">People Affected</span>
                  <span className="text-amber-400 font-extrabold">{submittedIncident.people_affected} citizens</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmittedIncident(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
                >
                  File Another Report
                </button>
              </div>
            </div>
          ) : (
            /* EMERGENCY FORM */
            <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-red-500" />
                  <span>Emergency Distress Report</span>
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold">* GPS Geotagged</span>
              </div>

              {formError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Disaster Category</label>
                  <select
                    value={formData.disaster_type}
                    onChange={(e) => setFormData({ ...formData, disaster_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="Flood">Flood Emergency</option>
                    <option value="Cyclone">Cyclone Warning</option>
                    <option value="Landslide">Landslide Collapse</option>
                    <option value="Fire">Fire / Wildfire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Severity Impact</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate Rescue Needed)</option>
                    <option value="High">High (Urgent Medical/Shelter)</option>
                    <option value="Moderate">Moderate (Supply Request)</option>
                    <option value="Low">Low (Advisory Notice)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">People Trapped / Affected</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.people_affected}
                    onChange={(e) => setFormData({ ...formData, people_affected: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Locality / Landmark</label>
                  <input
                    type="text"
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="e.g. Rasulgarh Square, Cuttack Road"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span>Geotag Coordinates</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGPSLock}
                    className="py-1 px-3 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-[11px] flex items-center gap-1 transition-all"
                  >
                    <span>Auto GPS Lock</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300">Lat: {formData.latitude}</div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-300">Lng: {formData.longitude}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Additional Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe flood depth, medical condition, special needs..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Photo Verification (&lt;5MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting Emergency Report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Emergency Signal Now</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-3">
              <span>Active Citizen Reports</span>
              <span className="text-xs text-slate-400 font-mono">Live Sync</span>
            </h3>

            {loadingHistory ? (
              <p className="text-xs text-slate-500 text-center py-4">Fetching active incidents...</p>
            ) : myIncidents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No active distress reports in this area.</p>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {myIncidents.map((inc) => (
                  <div key={inc.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-white font-mono">{inc.id}</span>
                      <SeverityBadge severity={inc.severity} size="small" />
                    </div>
                    <div className="text-slate-300 font-bold">{inc.disaster_type || inc.incident_type} • {inc.location_name || inc.location}</div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-900">
                      <span>Affected: {inc.people_affected} citizens</span>
                      <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">{inc.status || 'REPORTED'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Offline SMS / IVR Emergency Hotline</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              If mobile data or internet connection fails during cyclones/floods, send a text message or dial our voice hotline:
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono font-extrabold text-xs text-amber-300">
              HELP [TYPE] [SEVERITY] [PEOPLE] NEAR [PLACE]
            </div>
            <div className="text-[11px] text-slate-400 font-semibold">
              Example: <span className="font-mono text-slate-200">HELP FLOOD HIGH 15 NEAR RASULGARH</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs font-bold">
              <span className="text-slate-400">SMS Hotline Number:</span>
              <span className="font-mono text-emerald-400">+91 99999 99999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;
