import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Users, 
  Package, 
  BarChart3, 
  ClipboardList, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  AlertCircle,
  Apple,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Menu
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout, theme, toggleTheme, cart, isCloudConnected, supabaseConfigured, fetchData } = useApp();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebarCollapsed', String(newState));
      return newState;
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await fetchData();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wrench, label: 'Repairs', path: '/repairs' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: ClipboardList, label: 'Stock Orders', path: '/stock-orders' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (!currentUser) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-zinc-900 text-white flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ease-in-out border-r border-zinc-800`}
      >
        <div className={`p-6 border-b border-zinc-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/20 shrink-0">
            <Apple className="w-6 h-6 fill-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-red-500 truncate animate-in fade-in slide-in-from-left-2 duration-300">
              iBerry Solutions
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : ''}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-red-600 text-white shadow-xl shadow-red-600/20 font-semibold' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`
              }
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${item.path === window.location.pathname ? 'scale-110' : ''}`} />
              {!isCollapsed && (
                <span className="flex-1 text-sm truncate animate-in fade-in slide-in-from-left-2 duration-300">
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800 bg-zinc-900/50">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2 py-3 bg-zinc-800/30 rounded-2xl mb-3`}>
            <img src={currentUser.avatar} alt="User" className="w-10 h-10 rounded-xl border border-zinc-700 shadow-sm shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-sm font-bold truncate text-zinc-100">{currentUser.username}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest truncate">{currentUser.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-300`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-semibold animate-in fade-in slide-in-from-left-2 duration-300">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} min-h-screen flex flex-col transition-all duration-300 ease-in-out`}
      >
        <header className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
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
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors border border-gray-200 dark:border-zinc-700"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-zinc-500" /> : <Maximize className="w-5 h-5 text-zinc-500" />}
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all border border-gray-200 dark:border-zinc-700 ${isSyncing ? 'animate-spin' : ''}`}
              title="Sync Data"
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'text-blue-500' : 'text-zinc-500'}`} />
            </button>
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