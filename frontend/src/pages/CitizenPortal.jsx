import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getIncidents, createIncidentForm, getAlerts 
} from '../services/api';
import { subscribeToEvents, initWebSocket } from '../services/socket';
import { 
  AlertTriangle, Navigation, Upload, Image as ImageIcon,
  Compass, History, AlertCircle, Bell, User, CheckCircle2 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Inner component to capture clicks on citizen map picker
const LocationPicker = ({ onLocationSelected }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

const CitizenPortal = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState('report');
  
  // Form states
  const [type, setType] = useState('Flood');
  const [severity, setSeverity] = useState('Medium');
  const [affected, setAffected] = useState(1);
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // UI States
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch Lists
  const [myIncidents, setMyIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const loadData = async () => {
    try {
      const allIncidents = await getIncidents();
      // For demo, filter incidents where source is APP/SMS/IVR, or show all reported
      // Since we don't store citizen relation directly, we can show APP/SMS/IVR reports
      setMyIncidents(allIncidents.filter(inc => inc.source === 'APP' || inc.phone === user?.phone));
      
      const allAlerts = await getAlerts();
      setAlerts(allAlerts);
    } catch (e) {
      console.error("Failed to load citizen data", e);
    }
  };

  useEffect(() => {
    loadData();
    initWebSocket();
    
    // Subscribe to WS updates
    const unsubscribe = subscribeToEvents((payload) => {
      if (['NEW_INCIDENT', 'INCIDENT_UPDATED'].includes(payload.event)) {
        loadData();
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported by browser.');
      setShowMapPicker(true);
      return;
    }
    
    setGpsLoading(true);
    setGpsStatus('Acquiring satellite signal...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setGpsStatus(t('locationCaptured'));
        setGpsLoading(false);
        setError('');
      },
      (err) => {
        console.error("GPS Error", err);
        setGpsStatus(t('locationDenied'));
        setGpsLoading(false);
        setShowMapPicker(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG, JPEG, and PNG images are supported.');
      return;
    }

    setPhoto(file);
    setError('');

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitSuccess('');
    
    if (!latitude || !longitude) {
      setError('Please capture geolocation or double-click the map picker.');
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('incident_type', type);
      formData.append('severity', severity);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('people_affected', affected);
      formData.append('description', description);
      formData.append('location', locality || 'Bhubaneswar Area');
      formData.append('source', 'APP');
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await createIncidentForm(formData);
      setSubmitSuccess(`Report submitted successfully! Ticket ID: ${res.id}`);
      
      // Reset Form
      setDescription('');
      setLocality('');
      setPhoto(null);
      setPhotoPreview(null);
      setLatitude(null);
      setLongitude(null);
      setGpsStatus('');
      setShowMapPicker(false);
      
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit incident. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (statusVal) => {
    switch (statusVal) {
      case 'REPORTED': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'VERIFIED': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
      case 'RESOURCE_ASSIGNED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'RESCUE_IN_PROGRESS': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'DUPLICATE': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[calc(100vh-80px)] bg-white text-slate-800 flex flex-col shadow-lg relative border-x border-slate-200">
      
      {/* Tab Selectors */}
      <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-2.5 gap-2 shrink-0 shadow-sm">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex flex-col items-center py-2.5 rounded-lg transition-all text-xs font-bold ${
            activeTab === 'report' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Compass className="h-4 w-4 mb-1" />
          <span>{t('emergencyReport')}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-2.5 rounded-lg transition-all text-xs font-bold ${
            activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <History className="h-4 w-4 mb-1" />
          <span>{t('myReports')}</span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center py-2.5 rounded-lg transition-all text-xs font-bold relative ${
            activeTab === 'alerts' ? 'bg-blue-600 text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <Bell className="h-4 w-4 mb-1" />
          <span>{t('alerts')}</span>
          {alerts.length > 0 && (
            <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-red-500 animate-ping" />
          )}
        </button>
      </div>


      {/* Main Tab Views */}
      <div className="flex-1 overflow-y-auto p-5 pb-8 min-h-0 bg-white">
        
        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs shadow-sm">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <strong className="text-red-655 text-red-600 block font-bold uppercase text-[11px] tracking-wide">EMERGENCY HOTLINE FALLBACK</strong>
                <span className="text-slate-700 font-medium">No internet? SMS <strong className="text-slate-900 font-bold font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">HELP [TYPE] [SEVERITY] [PEOPLE] NEAR [PLACE]</strong> to <strong className="text-slate-900 font-bold font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">+91 99999 99999</strong>.</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-600 font-semibold flex items-start space-x-2 shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-700 font-bold flex items-start space-x-2 shadow-sm">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {/* Disaster Type */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('disasterType')}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold cursor-pointer"
                >
                  <option value="Flood">Flood</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Fire">Fire</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Severity Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('severity')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Critical', 'High', 'Medium', 'Low'].map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                        severity === sev 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm font-semibold'
                      }`}
                    >
                      {t(sev.toLowerCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Affected People & Locality */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">{t('affectedPeople')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={affected}
                    onChange={(e) => setAffected(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500">{t('locality')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Patia Chowk"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500">{t('description')}</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Trapped on first floor, water entering houses..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 outline-none text-slate-700 focus:border-blue-500 shadow-sm font-semibold"
                />
              </div>

              {/* Geolocation Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">Geo-tag Coordinates</span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(!showMapPicker)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        showMapPicker 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white hover:bg-slate-50 text-blue-600 border border-slate-300'
                      }`}
                    >
                      <span>Map Pin</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCaptureLocation}
                      disabled={gpsLoading}
                      className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-blue-600 border border-slate-300 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                    >
                      <Navigation className={`h-3.5 w-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                      <span>{gpsLoading ? 'Locating...' : 'GPS Lock'}</span>
                    </button>
                  </div>
                </div>

                {gpsStatus && (
                  <p className="text-[11px] text-slate-600 flex items-center leading-tight font-semibold">
                    <AlertCircle className="h-3.5 w-3.5 text-blue-600 mr-1.5 shrink-0" />
                    {gpsStatus}
                  </p>
                )}

                {latitude && longitude && (
                  <div className="text-[10px] font-mono text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg border border-emerald-250 border-emerald-200 shadow-inner font-bold">
                    LAT: {latitude.toFixed(6)}°N | LON: {longitude.toFixed(6)}°E
                  </div>
                )}

                {showMapPicker && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-semibold block">
                      {t('selectLocationOnMap')}
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <MapContainer center={[20.2961, 85.8245]} zoom={12} className="h-full w-full">
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        {latitude && longitude && (
                          <Marker 
                            position={[latitude, longitude]} 
                            draggable={true}
                            eventHandlers={{
                              dragend: (e) => {
                                const marker = e.target;
                                const position = marker.getLatLng();
                                setLatitude(position.lat);
                                setLongitude(position.lng);
                                setGpsStatus('Map Pin Location Updated');
                              }
                            }}
                          />
                        )}
                        <LocationPicker onLocationSelected={(lat, lon) => {
                          setLatitude(lat);
                          setLongitude(lon);
                          setGpsStatus('Map Pin Coordinate Loaded');
                        }} />
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">{t('photoUpload')}</label>
                <div className="flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-500/50 rounded-xl p-4 bg-white text-slate-550 text-slate-500 transition-colors cursor-pointer relative shadow-inner">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {photoPreview ? (
                    <div className="flex flex-col items-center space-y-2 w-full">
                      <img src={photoPreview} alt="Preview" className="h-28 object-contain rounded-lg border border-slate-200 shadow-sm" />
                      <span className="text-[10px] text-slate-500 font-bold truncate max-w-[200px]">{photo.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-xs font-semibold">
                      <Upload className="h-6 w-6 text-slate-400 animate-bounce" />
                      <span>Click to upload emergency snapshot</span>
                      <span className="text-[9px] text-slate-450">JPEG/PNG max 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-750 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    <span>{t('submitting')}</span>
                  </>
                ) : (
                  <span>{t('submit')}</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Submitted Incident Reports
            </h2>
            {myIncidents.length === 0 ? (
              <div className="text-center py-12 text-slate-550 text-slate-500 text-xs italic bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                No reports submitted from this application yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myIncidents.map((inc) => (
                  <div key={inc.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-sm text-xs text-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-mono font-bold text-blue-600">{inc.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${getStatusBadge(inc.status)}`}>
                        {t(inc.status?.toLowerCase()) || inc.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-slate-900 text-sm font-extrabold">{inc.incident_type}</strong>
                        <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">Locality: <strong className="text-slate-700">{inc.location}</strong></span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-600 italic leading-relaxed">"{inc.description}"</p>
                    
                    <div className="flex justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200 font-semibold">
                      <span>Affected Count: <strong className="text-slate-750 text-slate-700">{inc.people_affected}</strong></span>
                      <span>Source: <strong className="text-slate-750 text-slate-700">{inc.source}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('alerts')}
            </h2>
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-slate-550 text-slate-550 text-slate-500 text-xs italic bg-slate-50 border border-slate-200 rounded-xl shadow-inner">
                No warnings active at this moment.
              </div>
            ) : (
              <div className="space-y-3.5">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`border rounded-xl p-4 space-y-2.5 text-xs shadow-sm ${
                      alert.severity.toLowerCase() === 'critical'
                        ? 'bg-red-50 border-red-200 text-slate-800'
                        : alert.severity.toLowerCase() === 'high'
                        ? 'bg-orange-50 border-orange-200 text-slate-800'
                        : 'bg-yellow-50/50 border-yellow-200 text-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-slate-900 text-sm flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1.5 text-blue-600" />
                        {alert.alert_type} Warning
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold border ${
                        alert.severity.toLowerCase() === 'critical' ? 'border-red-300 text-red-650 text-red-600' : 'border-orange-300 text-orange-600'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-650 text-slate-600 font-medium leading-relaxed">
                      {alert.description}
                    </p>

                    <div className="text-[10px] text-slate-500 font-bold grid grid-cols-2 gap-2 pt-2 border-t border-slate-100/60">
                      <div>Area: <strong className="text-slate-700">{alert.affected_area}</strong></div>
                      <div className="text-right">Issued: <strong className="text-slate-700">{new Date(alert.issued_at).toLocaleDateString()}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
};

export default CitizenPortal;

