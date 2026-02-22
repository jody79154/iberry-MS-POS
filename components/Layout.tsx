import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Wrench, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  ClipboardList, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  AlertCircle,
  Apple
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, theme, toggleTheme, cart, isCloudConnected, supabaseConfigured } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: Wrench, label: 'Repairs', path: '/repairs' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: ShoppingCart, label: 'Checkout', path: '/checkout', count: cart.length },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: ClipboardList, label: 'Stock Orders', path: '/stock-orders' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (!currentUser) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/20">
            <Apple className="w-6 h-6 fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-red-500">iBerry MS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`
              }
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${item.path === window.location.pathname ? 'scale-110' : ''}`} />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.count ? (
                <span className="bg-white text-red-600 text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                  {item.count}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 px-3 py-3 bg-zinc-800/30 rounded-2xl mb-3">
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-xl border border-zinc-700 shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-zinc-100">{currentUser.username}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!supabaseConfigured ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20">
                <AlertCircle className="w-3 h-3" />
                Supabase Setup Required
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCloudConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                {isCloudConnected ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                {isCloudConnected ? 'Cloud Sync Online' : 'Cloud Sync Offline'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-red-500" />}
            </button>
          </div>
        </header>
        <div className="p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;