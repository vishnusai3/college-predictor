import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Phone, Lock } from 'lucide-react';

const StudentLogin = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', mobile_number: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const switchMode = (mode) => {
    setIsSignup(mode === 'signup');
    setError('');
    setForm({ name: '', mobile_number: '', password: '', confirm: '' });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const mobile_number = form.mobile_number.trim();
    const password = form.password;
    const confirm = form.confirm;

    if (!name || !mobile_number || !password) {
      return setError('Please complete all fields');
    }
    if (password !== confirm) return setError('Passwords do not match');

    try {
      const { data } = await api.post('/auth/student-signup', { name, mobile_number, password });
      login(data.student, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const mobile_number = form.mobile_number.trim();
    const password = form.password;

    if (!mobile_number || !password) {
      return setError('Please enter mobile number and password');
    }

    try {
      const { data } = await api.post('/auth/student-login', { mobile_number, password });
      login(data.student, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.08),_transparent_30%),linear-gradient(180deg,#f8fafc,#f1f5f9)] flex items-center justify-center p-6 text-slate-800">
      <div className="relative max-w-xl w-full overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{isSignup ? 'Create Account' : 'Student Login'}</h2>
              <p className="mt-2 text-slate-500">Access personalized college predictions in a premium experience.</p>
            </div>
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-3 text-cyan-600">
              <User size={30} />
            </div>
          </div>

          <div className="flex gap-3 rounded-full border border-slate-200 bg-slate-100 p-1 mb-6">
            <button onClick={() => switchMode('login')} className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${!isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-855'}`}>
              Log In
            </button>
            <button onClick={() => switchMode('signup')} className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${isSignup ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-855'}`}>
              Sign Up
            </button>
          </div>

          {error && <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} type="text" placeholder="Full Name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none" required />
              </div>
            )}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={form.mobile_number} onChange={e => setForm({...form, mobile_number: e.target.value})} type="tel" placeholder="Mobile Number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" placeholder="Password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none" required />
            </div>
            {isSignup && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} type="password" placeholder="Confirm Password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none" required />
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-4 text-lg justify-center">{isSignup ? 'Create Account' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
