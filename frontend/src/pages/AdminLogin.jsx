import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Phone, Key } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    pin: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/admin-login', formData);
      login(data.admin, data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Admin authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.08),_transparent_25%),linear-gradient(180deg,#f8fafc,#f1f5f9)] flex items-center justify-center p-6 text-slate-800">
      <div className="relative max-w-lg w-full overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-[0_20px_50px_rgba(15,23,42,0.04)]">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-purple-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-purple-600">
              <Key size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">Admin Login</h2>
            <p className="mt-2 text-slate-500">Secure access to the premium analytics console.</p>
          </div>

          {error && <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { icon: <User size={18} />, placeholder: 'Admin Name', field: 'name', type: 'text' },
              { icon: <Phone size={18} />, placeholder: 'Mobile Number', field: 'mobile_number', type: 'tel' },
              { icon: <Key size={18} />, placeholder: 'Secret Admin PIN', field: 'pin', type: 'password' }
            ].map((item) => (
              <div key={item.field} className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{item.icon}</div>
                <input
                  type={item.type}
                  placeholder={item.placeholder}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 pl-12 text-slate-800 placeholder:text-slate-400 focus:bg-white outline-none"
                  required
                  value={formData[item.field]}
                  onChange={e => setFormData({...formData, [item.field]: e.target.value})}
                />
              </div>
            ))}

            <button 
              type="submit"
              className="btn-primary w-full py-4 text-lg justify-center animate-none"
            >
              Authorize Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
