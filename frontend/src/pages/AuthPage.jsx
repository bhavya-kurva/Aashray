import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, ShieldCheck, User, Phone, Key, Sparkles } from 'lucide-react';

const AuthPage = () => {
  const { login, register, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Citizen');
  const [email, setEmail] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check url search parameter to switch mode
    const mode = searchParams.get('mode');
    setIsRegister(mode === 'register');
  }, [searchParams]);

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      if (user.role === 'Authority') {
        navigate('/dashboard');
      } else {
        navigate('/citizen');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!phone || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(name, phone, password, role, email);
        // Automatically log in after registration
        await login(phone, password);
      } else {
        await login(phone, password);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-md space-y-6">
        
        {/* Banner header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600 animate-pulse">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isRegister ? 'Create Account' : 'Portal Sign In'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {isRegister 
              ? 'Register to file emergency reports and receive alerts.' 
              : 'Enter credentials to access citizen reporting or authority command.'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start space-x-2 text-xs text-red-655 text-red-600 font-semibold shadow-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-350 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 outline-none text-slate-800 text-sm transition-all shadow-sm font-semibold"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="9999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-355 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 outline-none text-slate-800 text-sm transition-all shadow-sm font-semibold"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-355 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 outline-none text-slate-800 text-sm transition-all shadow-sm font-semibold"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Password *</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-355 border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-4 py-2.5 outline-none text-slate-800 text-sm transition-all shadow-sm font-semibold"
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600">Select Portal Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-slate-355 border-slate-300 rounded-lg px-4 py-2.5 outline-none text-slate-700 text-sm transition-colors shadow-sm font-semibold cursor-pointer"
              >
                <option value="Citizen">Citizen (Reporting & View alerts)</option>
                <option value="Authority">Authority (Operations Dashboard)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{isRegister ? 'Complete Registration' : 'Secure Login'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 text-xs text-slate-500 font-semibold">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/login?mode=register')}
                className="text-blue-600 hover:underline font-bold"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
      
      {/* Dev helper credentials card */}
      <div className="w-full max-w-md bg-slate-100 border border-slate-200 rounded-xl p-4 mt-6 text-xs text-slate-600 space-y-2.5 shadow-sm">
        <h4 className="font-bold text-slate-800 flex items-center space-x-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Demo Accounts (Seeded)</span>
        </h4>
        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono leading-tight bg-white p-2.5 rounded-lg border border-slate-200 shadow-inner text-slate-600 font-medium">
          <div>
            <strong className="text-blue-600 font-bold">Authority/Admin:</strong><br />
            Phone: 9999999999<br />
            Pass: adminpassword
          </div>
          <div>
            <strong className="text-blue-600 font-bold">Citizen:</strong><br />
            Phone: 8888888888<br />
            Pass: password
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

