import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Trophy, Users, UserCircle, Sparkles, LogOut } from 'lucide-react';

const Predictor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rank: user?.rank || '',
    category: user?.category || '',
    gender: user?.gender || '',
  });
  const [selectedBranch, setSelectedBranch] = useState(user?.preferred_branches ? user.preferred_branches.split(',')[0] || '' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, branch_code: selectedBranch };

    // Persist profile fields for the student (best-effort)
    try {
      if (user?.id) {
        await api.put('/auth/update-profile', {
          studentId: user.id,
          rank: payload.rank,
          category: payload.category,
          gender: payload.gender
        });
      }
    } catch (err) {
      console.warn('Profile update failed', err);
    }

    const queryParams = new URLSearchParams({ ...payload }).toString();
    navigate(`/results?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.06),_transparent_18%),linear-gradient(180deg,#f8fafc,#f1f5f9)] flex flex-col text-slate-800">
      {/* Student Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-slate-800 uppercase tracking-widest text-sm">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-cyan-500 text-white shadow-md shadow-cyan-500/20 text-xs">P</div>
            <span>EAMCET Matcher</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:inline">Welcome, <span className="font-semibold text-slate-800">{user?.name}</span></span>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-700 mb-4 uppercase tracking-[0.24em]">
            <Sparkles size={16} />
            Premium College Predictor
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Your smartest EAMCET college match starts here.</h1>
          <p className="mx-auto max-w-2xl text-slate-500 text-lg">Enter your rank, category, gender, and preferred branch to see premium recommendations tailored for your profile.</p>
        </div>

        <div className="card overflow-hidden p-8 md:p-10 border-slate-200/80 shadow-[0_20px_60px_rgba(15,23,42,0.03)] relative">
          <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl -mr-16 -mt-16" />
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rank Input */}
              <div className="space-y-2">
                <label className="text-slate-600 text-sm font-semibold ml-1">EAMCET State Rank</label>
                <div className="relative">
                  <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                  <input 
                    type="number" 
                    value={formData.rank}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all text-xl font-bold"
                    required
                    onChange={e => setFormData({...formData, rank: e.target.value})}
                  />
                </div>
              </div>

              {/* Branch Selection */}
              <div className="space-y-2">
                <label className="text-slate-600 text-sm font-semibold ml-1">Preferred Branch</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {[
                    {code: 'CSE', label: 'CSE'},
                    {code: 'CSM', label: 'CSE-AI'},
                    {code: 'CSD', label: 'CSE-DS'},
                    {code: 'INF', label: 'IT'},
                    {code: 'ECE', label: 'ECE'},
                    {code: 'EEE', label: 'EEE'},
                    {code: 'MEC', label: 'MEC'},
                    {code: 'CIV', label: 'CIV'}
                  ].map(b => {
                    const active = selectedBranch === b.code;
                    return (
                      <button key={b.code} type="button" onClick={() => {
                        setSelectedBranch(prev => prev === b.code ? '' : b.code);
                      }} className={`py-2 px-3 text-sm rounded-xl border transition-all ${active ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{b.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-slate-600 text-sm font-semibold ml-1">Reservation Category</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500 focus:bg-white outline-none appearance-none font-semibold"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {['OC', 'BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'EWS', 'SC', 'ST'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-slate-600 text-sm font-semibold ml-1">Gender</label>
                <div className="relative">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-12 pr-4 py-4 rounded-2xl focus:border-blue-500 focus:bg-white outline-none appearance-none font-semibold"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3"
            >
              <Sparkles size={24} />
              Show Results
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
);
};

export default Predictor;
