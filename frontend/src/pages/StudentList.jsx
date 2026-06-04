import { useState, useEffect } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import { Search, User, Calendar, Trash2 } from 'lucide-react';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.get(`/admin/students?search=${encodeURIComponent(searchTerm)}`);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
      setStudents([]);
      setError('Unable to load student records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm]);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.04),_transparent_24%),linear-gradient(180deg,#f8fafc,#f1f5f9)] text-slate-800">
      <AdminSidebar />
      
      <main className="flex-1 p-12">
        <header className="mb-12">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">Registered Students</h1>
              <p className="text-slate-500 max-w-2xl">Monitor and manage all candidate lookups through a polished admin interface.</p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search candidate name..."
                className="w-full rounded-2xl border border-slate-200 bg-white px-16 py-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-cyan-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="card overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.02)]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                  <th className="px-10 py-6">Basic Info</th>
                  <th className="px-10 py-6">Contact</th>
                  <th className="px-10 py-6">Merit (Rank)</th>
                  <th className="px-10 py-6">Registered On</th>
                  <th className="px-10 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400">Retrieving student records...</td></tr>
              ) : error ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center text-red-500">{error}</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="5" className="px-10 py-20 text-center text-slate-400">No matching records found.</td></tr>
              ) : (
                students.map((student) => {
                  const displayRank = student.rank != null ? student.rank.toLocaleString() : 'N/A';
                  const loginDate = student.login_timestamp ? new Date(student.login_timestamp) : null;

                  return (
                    <tr key={student.id || student.mobile_number} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-650 group-hover:text-purple-600 transition-all">
                            <User size={24} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-lg">{student.name || 'Unknown Student'}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                               <span className="bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest">{student.gender || 'N/A'}</span>
                               <span>•</span>
                               <span className="text-purple-600 font-bold">{student.category || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="text-slate-800 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          {student.mobile_number || '—'}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="text-[10px] text-slate-400 font-black uppercase mb-1">State Rank</div>
                          <div className="text-xl font-black text-slate-900">{displayRank}</div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="text-slate-600 text-sm flex items-center gap-2">
                          <Calendar size={16} className="text-slate-400" />
                          {loginDate ? loginDate.toLocaleDateString() : 'Unknown Date'}
                          <span className="text-[10px] opacity-60">{loginDate ? loginDate.toLocaleTimeString() : ''}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <button onClick={async () => {
                            if (!confirm('Delete this student?')) return;
                            try {
                              await api.delete(`/admin/students/${student.id}`);
                              fetchStudents();
                            } catch (err) {
                              console.error('Delete failed', err);
                              alert('Failed to delete student');
                            }
                          }} className="p-3 rounded-2xl bg-red-50 text-red-500 transition hover:bg-red-100"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentList;
