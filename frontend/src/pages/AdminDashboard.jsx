import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import { Users, GraduationCap, Building2, TrendingUp, Sparkles, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/admin/analytics');
        setAnalytics(data.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <AdminSidebar />
      <div className="flex-1 flex items-center justify-center text-slate-500">Initializing Analytics Engine...</div>
    </div>
  );

  // Safety fallbacks to prevent "Black Screen" crashes
  const summary = analytics?.summary || { totalStudents: 0, totalCutoffs: 0 };
  const catDist = analytics?.categoryDistribution || [];
  const dailyReg = analytics?.dailyRegistrations || [];

  const statCards = [
    { name: 'Total Students', value: summary.totalStudents, icon: <Users />, color: 'bg-blue-500' },
    { name: 'Total Cutoffs', value: summary.totalCutoffs, icon: <Building2 />, color: 'bg-purple-500' },
    { name: 'Avg. Rank', value: '0', icon: <GraduationCap />, color: 'bg-emerald-500' },
    { name: 'Active Sessions', value: '1', icon: <TrendingUp />, color: 'bg-amber-500' },
  ];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.04),_transparent_24%),linear-gradient(180deg,#f8fafc,#f1f5f9)] text-slate-800">
      <AdminSidebar />
      
      <main className="flex-1 p-12">
        <header className="mb-12">
          <div className="card p-8 border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.02)]">
            <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Decision Intelligence</h1>
            <p className="text-slate-500">Advanced analytics for TG EAPCET 2025 candidate behavior, now delivered in a deluxe dashboard.</p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {statCards.map((stat, i) => (
            <div key={i} className="card p-8 rounded-[2rem] border border-slate-200 relative overflow-hidden group bg-white shadow-[0_10px_35px_rgba(15,23,42,0.01)]">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/10`}>
                {stat.icon}
              </div>
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.name}</h3>
              <p className="text-3xl font-black text-slate-900">{stat.value.toLocaleString()}</p>
              <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color} opacity-5 blur-3xl -mr-12 -mt-12`}></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Trend */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarIcon size={20}/></div>
               <h3 className="text-slate-800 font-bold text-xl">Daily Registrations</h3>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyReg}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                     <XAxis 
                       dataKey="date" 
                       stroke="#64748b" 
                       fontSize={12} 
                       tickFormatter={(str) => str ? new Date(str).toLocaleDateString(undefined, {day: 'numeric', month: 'short'}) : ''}
                     />
                     <YAxis stroke="#64748b" fontSize={12} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                        itemStyle={{ color: '#0f172a' }}
                     />
                     <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><PieIcon size={20}/></div>
               <h3 className="text-slate-800 font-bold text-xl">Category Distribution</h3>
            </div>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={catDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="category"
                     >
                        {catDist.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                        itemStyle={{ color: '#0f172a' }}
                     />
                     <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 bg-gradient-to-r from-blue-600/5 to-purple-600/5 p-1 rounded-[2.5rem] border border-slate-200">
           <div className="bg-white p-8 rounded-[2.3rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                    <Sparkles className="text-blue-500" />
                 </div>
                 <div>
                    <h4 className="text-slate-800 font-bold">Heuristic Engine Status</h4>
                    <p className="text-slate-500 text-sm">Synchronized with TSCHE 2025 raw data feeds.</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-center">
                    <div className="text-emerald-600 font-black">99.9%</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Uptime</div>
                 </div>
                 <div className="text-center">
                    <div className="text-blue-600 font-black">~240ms</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Latency</div>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
