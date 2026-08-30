import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Radio, Shield, User, BarChart2, Home, AlertOctagon, Bot, Navigation, LogOut, Menu, X, Globe } from 'lucide-react';
import AIChat from './AIChat';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-slate-950/95 border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl shadow-2xl">
        {/* Brand & Ticker */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="bg-red-600/20 text-red-500 p-2 rounded-xl border border-red-500/30 group-hover:scale-105 transition-transform shadow-lg shadow-red-500/10">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-black">AASHRAY</span>
                <span className="text-red-500 font-extrabold text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 uppercase tracking-widest">LIVE</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Disaster Management & Relief Platform</p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => navigate('/')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive('/') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/citizen')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive('/citizen') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Report Emergency</span>
          </button>

          <button
            onClick={() => navigate('/shelters')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive('/shelters') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Find Shelter</span>
          </button>

          {user?.role === 'Authority' && (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => navigate('/analytics')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/analytics') ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Analytics</span>
              </button>
            </>
          )}
        </div>

        {/* Action Controls & User Identity */}
        <div className="hidden md:flex items-center gap-3">
          {/* AI Assistant Launcher Button */}
          <button
            onClick={() => setAiChatOpen(true)}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>Aashray AI</span>
          </button>

          {/* Quick SOS Trigger */}
          <button
            onClick={() => navigate('/citizen')}
            className="py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all animate-pulse"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>SOS Report</span>
          </button>

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-blue-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-extrabold text-white leading-tight">{user.name}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login?mode=register')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-md transition-all"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3 animate-in fade-in duration-200 sticky top-[60px] z-40">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="p-3 bg-slate-900 rounded-xl text-xs font-bold text-left text-slate-200 border border-slate-800 flex items-center gap-2"
            >
              <Home className="w-4 h-4 text-blue-400" /> Home
            </button>
            <button
              onClick={() => { navigate('/citizen'); setMobileMenuOpen(false); }}
              className="p-3 bg-slate-900 rounded-xl text-xs font-bold text-left text-slate-200 border border-slate-800 flex items-center gap-2"
            >
              <AlertOctagon className="w-4 h-4 text-red-400" /> Report Emergency
            </button>
            <button
              onClick={() => { navigate('/shelters'); setMobileMenuOpen(false); }}
              className="p-3 bg-slate-900 rounded-xl text-xs font-bold text-left text-slate-200 border border-slate-800 flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-emerald-400" /> Find Shelter
            </button>
            <button
              onClick={() => { setAiChatOpen(true); setMobileMenuOpen(false); }}
              className="p-3 bg-indigo-900/40 border border-indigo-500/30 rounded-xl text-xs font-bold text-left text-indigo-300 flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-amber-300" /> Aashray AI
            </button>
          </div>

          {user && (
            <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs">
              <div className="text-slate-300">Logged in as <strong className="text-white">{user.name}</strong></div>
              <button onClick={handleLogout} className="text-red-400 font-bold">Logout</button>
            </div>
          )}
        </div>
      )}

      {/* Floating AI Chat Assistant Drawer */}
      <AIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
    </>
  );
};

export default Navbar;
