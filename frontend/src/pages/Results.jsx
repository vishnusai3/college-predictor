import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Info, MapPin, Building2, BookOpen, ExternalLink, Award, ChevronRight, Search as SearchIcon, Filter, LogOut } from 'lucide-react';

const Results = () => {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [districtOptions, setDistrictOptions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: new URLSearchParams(location.search).get('search') || '',
    district: new URLSearchParams(location.search).get('district') || '',
    branch_code: new URLSearchParams(location.search).get('branch_code') || ''
  });

  const [profileSummary, setProfileSummary] = useState({
    rank: new URLSearchParams(location.search).get('rank') || '',
    category: new URLSearchParams(location.search).get('category') || '',
    gender: new URLSearchParams(location.search).get('gender') || ''
  });

  // Sync activeTab with URL chance param and keep filters/profile summary in sync
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const c = p.get('chance');
    if (c) setActiveTab(c.toUpperCase());

    setFilters(prev => ({
      ...prev,
      search: p.get('search') || '',
      district: p.get('district') || '',
      branch_code: p.get('branch_code') || ''
    }));

    setProfileSummary({
      rank: p.get('rank') || '',
      category: p.get('category') || '',
      gender: p.get('gender') || ''
    });
  }, [location.search]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const currentParams = new URLSearchParams(location.search);
      // Keep the current chance filter when fetching results
      if (activeTab && activeTab !== 'ALL') {
        currentParams.set('chance', activeTab);
      } else {
        currentParams.delete('chance');
      }
      // Append local filters if they exist
      if (filters.search) currentParams.set('search', filters.search);
      if (filters.district) currentParams.set('district', filters.district);
      
      const { data } = await api.get(`/predict?${currentParams.toString()}`);
      setResults(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch results', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistrictOptions = async () => {
    try {
      const { data } = await api.get('/predict/districts');
      setDistrictOptions(data.data || []);
    } catch (err) {
      console.error('Failed to load districts', err);
      setDistrictOptions(['HYD', 'RR', 'WGL']);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [location.search, filters.district, activeTab]);

  // Sync branch dropdown when URL parameters change
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const branch = params.get('branch_code') || '';
    setFilters(prev => ({ ...prev, branch_code: branch }));
  }, [location.search]);

  useEffect(() => {
    fetchDistrictOptions();
  }, []);

  const handleBranchChange = (newBranch) => {
    const currentParams = new URLSearchParams(location.search);
    if (newBranch) {
      currentParams.set('branch_code', newBranch);
    } else {
      currentParams.delete('branch_code');
    }
    currentParams.delete('page'); // Reset to page 1
    navigate(`/results?${currentParams.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set('page', newPage);
    navigate(`/results?${currentParams.toString()}`);
  };

  const getChanceStyle = (chance) => {
    switch(chance) {
      case 'ALL': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'SAFE': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MODERATE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DREAM': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getChanceDescription = (chance) => {
    switch(chance) {
      case 'SAFE':
        return 'Safe colleges are those where your rank is comfortably within the cutoff range, meaning you have a strong chance of admission if other profile factors match.';
      case 'MODERATE':
        return 'Moderate colleges are reachable options where your rank is close to the cutoff; admission is possible but not guaranteed, so they are worth considering with a backup plan.';
      case 'DREAM':
        return 'Dream colleges are aspirational choices with cutoffs better than your rank; they may be difficult to get, but they show the best-case possibilities if things go very well.';
      default:
        return 'Showing all available colleges. Use the categories above to understand what Safe, Moderate, and Dream predictions mean for your profile.';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.06),_transparent_24%),linear-gradient(180deg,#f8fafc,#f1f5f9)] flex flex-col text-slate-800">
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
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="card mb-8 border-slate-200/80 p-8 shadow-[0_15px_50px_rgba(15,23,42,0.02)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link to="/predict" className="flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition-colors group text-sm font-bold uppercase tracking-widest">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Adjust Profile
                </Link>
                <Link to="/predict" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition">
                  Home
                </Link>
              </div>
              <h1 className="text-4xl font-black text-slate-900">Your Predictions</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                {profileSummary.rank && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">Rank: {profileSummary.rank}</span>}
                {profileSummary.category && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">Category: {profileSummary.category}</span>}
                {profileSummary.gender && <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold">Gender: {profileSummary.gender}</span>}
              </div>
              <p className="text-slate-500 mt-2">Found {pagination.total || 0} colleges matching your profile</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['ALL', 'SAFE', 'MODERATE', 'DREAM'].map(type => (
                <button key={type} onClick={() => setActiveTab(type)} className={`relative group rounded-2xl border px-4 py-3 text-[10px] font-black uppercase flex items-center gap-2 ${getChanceStyle(type)} ${activeTab===type ? 'scale-105 ring-2 ring-offset-2 ring-cyan-500/10 shadow-sm' : 'hover:bg-slate-100/50'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${type === 'ALL' ? 'bg-slate-400' : type === 'SAFE' ? 'bg-emerald-500' : type === 'MODERATE' ? 'bg-amber-500' : 'bg-purple-500'}`}></div>
                  {type}
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-72 -translate-x-1/2 rounded-3xl border border-slate-200 bg-white p-4 text-left text-[11px] text-slate-700 shadow-xl opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-1.5">
                    <p className="font-semibold text-slate-950 mb-2">{type === 'ALL' ? 'All Colleges' : `${type.charAt(0) + type.slice(1).toLowerCase()} Colleges`}</p>
                    <p>{getChanceDescription(type)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <div className="md:col-span-2 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search college name..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white outline-none shadow-sm"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && fetchResults()}
              />
           </div>
           
           <select 
             className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 focus:border-blue-500 focus:bg-white outline-none appearance-none shadow-sm"
             value={filters.district}
             onChange={e => setFilters({...filters, district: e.target.value})}
           >
             <option value="">All Districts</option>
             {districtOptions.map((code) => (
               <option key={code} value={code}>{code}</option>
             ))}
           </select>

           <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-1">
             <select 
               className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 focus:border-blue-500 focus:bg-white outline-none appearance-none shadow-sm font-semibold"
               value={filters.branch_code}
               onChange={e => handleBranchChange(e.target.value)}
             >
               <option value="">All Branches</option>
               <option value="CSE">CSE</option>
               <option value="CSM">CSE-AI</option>
               <option value="CSD">CSE-DS</option>
               <option value="INF">IT</option>
               <option value="ECE">ECE</option>
               <option value="EEE">EEE</option>
               <option value="MEC">MEC</option>
               <option value="CIV">CIV</option>
             </select>
             <button
               onClick={() => navigate('/ask-question')}
               className="rounded-2xl bg-cyan-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-700"
             >
               Ask a Question
             </button>
           </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 card animate-pulse rounded-[2.5rem] border border-slate-200 bg-white"></div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="card text-center py-20 rounded-[3rem] border border-slate-200 bg-white">
            <Info size={48} className="text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-855">No results found</h2>
            <p className="text-slate-500">Try adjusting your filters or rank.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {results.map((item) => (
                <div key={item.id} className="card rounded-[2rem] border border-slate-200 bg-white hover:border-blue-500/40 hover:shadow-md transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl border-l border-b ${getChanceStyle(item.chance)} text-[9px] font-black uppercase`}>
                    {item.chance}
                  </div>

                  <div className="p-7">
                    <div className="flex items-center gap-2 text-blue-600 mb-4 font-black text-[10px] tracking-widest uppercase">
                      <Award size={14} />
                      {item.institute_code} {item.is_autonomous && <span className="bg-blue-50 text-blue-700 border border-blue-200/50 text-[8px] px-1.5 rounded ml-1">AUTONOMOUS</span>}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 group-hover:text-blue-600">
                      {item.institute_name}
                    </h3>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <BookOpen size={14} />
                        <span className="text-slate-700">{item.branch_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin size={14} />
                        <span>{item.place}, {item.district_code}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-5 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Cutoff</div>
                        <div className="text-xl font-black text-slate-900">{item.closing_rank.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-8">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="text-slate-500 font-bold">
                  Page <span className="text-slate-800">{pagination.page}</span> of {pagination.totalPages}
                </div>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-700 disabled:opacity-30 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);
};

export default Results;
