import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, LogOut, Globe, User, BarChart2, Radio } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 text-slate-800 px-6 py-3.5 flex items-center justify-between shadow-sm relative z-50">
      <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => navigate('/')}>
        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100 shadow-sm">
          <Radio className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center space-x-1.5">
            <span className="text-blue-600 font-extrabold">Aashray</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-700">{t('title')}</span>
          </h1>
          <p className="text-[10px] text-slate-500 tracking-wide font-medium">{t('subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Navigation Tabs */}
        {user && (
          <div className="flex space-x-1.5 bg-slate-100 p-1 rounded-lg">
            {user.role !== 'Authority' && (
              <button
                onClick={() => navigate('/citizen')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive('/citizen')
                    ? 'bg-white text-blue-600 shadow-sm border-l-0'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {t('citizenPortal')}
              </button>
            )}
            
            {user.role === 'Authority' && (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
                    isActive('/dashboard')
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>{t('dashboard')}</span>
                </button>
                
                <button
                  onClick={() => navigate('/analytics')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1 ${
                    isActive('/analytics')
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>{t('analytics')}</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-50 text-blue-600 p-1.5 rounded-full border border-blue-100">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-[9px] text-slate-500 font-semibold uppercase">{user.role}</div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-all p-2 rounded-lg"
              title={t('logout')}
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-900 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              {t('login')}
            </button>
            <button
              onClick={() => navigate('/login?mode=register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              {t('register')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
