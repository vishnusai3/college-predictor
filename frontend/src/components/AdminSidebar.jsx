import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileUp, MessageSquare, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { name: 'Student Questions', icon: <MessageSquare size={20} />, path: '/admin/chat' },
    { name: 'Students List', icon: <Users size={20} />, path: '/admin/students' },
    { name: 'Upload Cutoffs', icon: <FileUp size={20} />, path: '/admin/upload' },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shadow-[10px_0_40px_rgba(15,23,42,0.01)]">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-xl uppercase tracking-[0.18em]">
          <div className="grid h-10 w-10 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-lg shadow-cyan-500/20">E</div>
          <div>
            <div className="text-sm text-slate-500">EAMCET</div>
            <div className="text-base text-slate-800">Admin Hub</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-3 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </div>
            {location.pathname === item.path && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full rounded-2xl bg-red-50 px-4 py-3 text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
