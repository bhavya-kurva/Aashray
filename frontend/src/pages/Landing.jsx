import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getAlerts } from '../services/api';
import { AlertTriangle, Shield, User, FileText, ChevronRight, Bell } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getAlerts();
        setRecentAlerts(data.slice(0, 3)); // show top 3
      } catch (e) {
        console.error(e);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Hero Header */}
      <div className="flex-1 max-w-5xl mx-auto px-6 py-12 flex flex-col justify-center items-center text-center space-y-6">
        <div className="bg-blue-50 text-blue-600 border border-blue-100 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 animate-pulse shadow-sm">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Active Response Coordination System</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Real-Time Disaster Management &<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Resource Allocation Platform
          </span>
        </h1>

        <p className="max-w-2xl text-slate-600 text-sm md:text-base font-semibold leading-relaxed">
          Connecting citizens, disaster management authorities, and relief teams during floods, cyclones, and landslides. Report incidents instantly with GPS tracking and let our automated allocation engine coordinate the nearest available assets.
        </p>

        {/* Portals Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl pt-6">
          {/* Citizen App */}
          <div 
            onClick={() => navigate('/citizen')}
            className="group bg-white border border-slate-250 border-slate-200 rounded-2xl p-6 text-left cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100 w-fit group-hover:scale-105 transition-transform shadow-sm">
              <User className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold mt-4 text-slate-900 flex items-center justify-between">
              <span>{t('citizenPortal')}</span>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed">
              Submit emergency reports with automatically detected GPS locations and pictures. Check response status and receive critical evacuation advisories. Optimized for mobile/low-bandwidth.
            </p>
          </div>

          {/* Admin Command */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="group bg-white border border-slate-250 border-slate-200 rounded-2xl p-6 text-left cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl border border-blue-100 w-fit group-hover:scale-105 transition-transform shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold mt-4 text-slate-900 flex items-center justify-between">
              <span>{t('dashboard')}</span>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-2 leading-relaxed">
              For Command Center operators. Access the map-centric operations board displaying live incident markers, rescue teams tracker, shelter lists, supply stocks, and automated matching algorithms.
            </p>
          </div>
        </div>

        {/* Live Weather Advisory Alerts Banner */}
        {recentAlerts.length > 0 && (
          <div className="w-full max-w-3xl pt-8 text-left">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 flex items-center">
              <Bell className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
              <span>Evacuation advisories & Alerts</span>
            </h3>
            
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs flex justify-between items-start shadow-sm"
                >
                  <div className="space-y-1">
                    <span className="font-extrabold text-red-600">{alert.alert_type} Warning</span>
                    <p className="text-slate-600 font-semibold text-[11px] leading-relaxed pr-6 mt-0.5">{alert.description}</p>
                    <div className="text-[10px] text-slate-550 text-slate-500 font-bold">Affected: {alert.affected_area}</div>
                  </div>
                  <span className="bg-slate-100 text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0">
                    {new Date(alert.issued_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500 font-bold shadow-inner">
        Disaster Management & Rescue Coordination System • Powered by Google DeepMind Advanced Agentic Coding
      </footer>
    </div>
  );
};

export default Landing;


