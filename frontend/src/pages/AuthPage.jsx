import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ShieldCheck, User, Phone, Key, Sparkles, Radio } from 'lucide-react';
import { IMAGES } from '../assets/images';

const AuthPage = () => {
  const { login, register, user } = useAuth();
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
    const mode = searchParams.get('mode');
    setIsRegister(mode === 'register');
  }, [searchParams]);

  useEffect(() => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter brightness-30 saturate-120 opacity-20"
        style={{ backgroundImage: `url(${IMAGES.coastline})` }}
      />
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        {/* Banner header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30 text-red-400 animate-pulse shadow-lg shadow-red-600/10">
            <Radio className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {isRegister ? 'Create Aashray Account' : 'Portal Sign In'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isRegister
              ? 'Register to file emergency reports and receive alerts.'
              : 'Enter credentials to access citizen reporting or authority command.'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-start gap-2 text-xs text-red-300 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-white text-xs font-semibold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="9999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-white text-xs font-semibold"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 outline-none text-white text-xs font-semibold"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password *</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 outline-none text-white text-xs font-semibold"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 outline-none text-white text-xs font-semibold cursor-pointer"
              >
                <option value="Citizen">Citizen (Reporting & View alerts)</option>
                <option value="Authority">Authority (Operations Dashboard)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{isRegister ? 'Complete Registration' : 'Secure Sign In'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 text-xs text-slate-400 font-medium">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/login?mode=register')}
                className="text-blue-400 hover:underline font-bold"
              >
                Register here
              </button>
            </p>
          )}
        </div>

        {/* Demo Accounts Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-400">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Seeded Demo Credentials</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
            <div>
              <strong className="text-amber-400 font-bold">Authority:</strong><br />
              9999999999<br />
              adminpassword
            </div>
            <div>
              <strong className="text-blue-400 font-bold">Citizen:</strong><br />
              8888888888<br />
              password
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
