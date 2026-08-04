import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AppWindow,
  UploadCloud,
  Users,
  Smartphone,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { toast } from 'sonner';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app', label: 'Manage App', icon: AppWindow },
  { to: '/uploads', label: 'Uploads', icon: UploadCloud },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const admin = useAuthStore((s) => s.admin);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-bg-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-bg-600 bg-bg-800 fixed h-screen">
        <div className="flex items-center gap-3 p-6 border-b border-bg-600">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center shadow-glow">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">MirrorPro</p>
            <p className="text-xs text-white/40">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-accent-600 text-white shadow-lg shadow-accent-600/30'
                    : 'text-white/60 hover:text-white hover:bg-bg-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-bg-600">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center text-xs font-bold">
              {(admin?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-white/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-bg-800 border-b border-bg-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-purple-500 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">MirrorPro</span>
        </div>
        <button onClick={handleLogout} className="btn-ghost px-2 py-1.5">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-800 border-t border-bg-600 flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? 'text-accent-400' : 'text-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
