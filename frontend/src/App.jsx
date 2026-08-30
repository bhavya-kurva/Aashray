import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { WifiOff, Phone, MessageSquare } from 'lucide-react';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import CitizenPortal from './pages/CitizenPortal';
import ShelterFinder from './pages/ShelterFinder';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Analytics from './pages/Analytics';
import Navbar from './components/Navbar';

// Offline fallback checker component
const OfflineGate = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center border border-red-500/30 text-red-400 animate-bounce">
              <WifiOff className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold text-white">No Internet Connection</h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Your device is currently offline. You can still report emergencies and coordinate rescue using our offline SMS/IVR hotline services.
            </p>
          </div>

          <div className="space-y-4">
            {/* SMS Fallback Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <h3 className="text-xs font-bold text-blue-400 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>SMS Emergency Report</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                Send a text message in the following format to report your emergency coordinates:
              </p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-amber-400 font-mono font-bold text-[11px] tracking-wide text-center">
                HELP [TYPE] [SEVERITY] [PEOPLE] NEAR [PLACE]
              </div>
              <div className="text-[10px] text-slate-400 font-bold leading-normal">
                Example: <span className="font-mono text-slate-200">HELP FLOOD HIGH 15 NEAR RASULGARH</span>
              </div>
              <div className="text-[10.5px] text-slate-300 font-bold flex justify-between border-t border-slate-800 pt-2">
                <span>SMS Hotline:</span>
                <span className="font-mono text-blue-400 font-extrabold">+91 99999 99999</span>
              </div>
            </div>

            {/* IVR Voice Hotline Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 shadow-inner">
              <h3 className="text-xs font-bold text-emerald-400 flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>IVR Call-In Hotline</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                Call the automated voice coordination line and follow the dial pad prompts:
              </p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-slate-300 text-[10.5px] font-semibold space-y-1 shadow-sm">
                <div>• Press <strong className="text-white font-bold">1</strong> for Flood | <strong className="text-white font-bold">2</strong> for Cyclone</div>
                <div>• Press <strong className="text-white font-bold">3</strong> for Landslide | <strong className="text-white font-bold">4</strong> for Fire</div>
              </div>
              <div className="text-[10.5px] text-slate-300 font-bold flex justify-between border-t border-slate-800 pt-2">
                <span>IVR Voice Number:</span>
                <span className="font-mono text-emerald-400 font-extrabold">+91 99999 99999</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col justify-center items-center">
        <span className="h-8 w-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-2" />
        <span className="text-xs font-bold">Verifying access credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'Authority' ? '/dashboard' : '/citizen'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <OfflineGate>
            <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
              <Navbar />
              <div className="flex-1 min-h-0">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/shelters" element={<ShelterFinder />} />

                  {/* Citizen Portal */}
                  <Route 
                    path="/citizen" 
                    element={
                      <ProtectedRoute allowedRoles={['Citizen', 'Authority', 'Rescue Team', 'Resource Manager']}>
                        <CitizenPortal />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Authority Command Center Dashboard */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute allowedRoles={['Authority']}>
                        <AuthorityDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Response Analytics Metrics */}
                  <Route 
                    path="/analytics" 
                    element={
                      <ProtectedRoute allowedRoles={['Authority']}>
                        <Analytics />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Fallback Catch-All */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </OfflineGate>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
