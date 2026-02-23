import React from 'react';
import { 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ShoppingCart, 
  PackagePlus, 
  Users, 
  FileText 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Mon', sales: 4200 },
  { name: 'Tue', sales: 3800 },
  { name: 'Wed', sales: 2500 },
  { name: 'Thu', sales: 4780 },
  { name: 'Fri', sales: 3890 },
  { name: 'Sat', sales: 5390 },
  { name: 'Sun', sales: 6490 },
];

const Dashboard: React.FC = () => {
  const { sales, repairs, products } = useApp();
  const navigate = useNavigate();

  const activeRepairsCount = repairs.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled').length;
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const todayRevenue = sales.reduce((acc, curr) => {
    const isToday = new Date(curr.date).toDateString() === new Date().toDateString();
    return isToday ? acc + curr.total : acc;
  }, 0);
  const completedToday = repairs.filter(r => 
    r.status === 'Completed' && new Date(r.dateAdded).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    { label: "Today's Revenue", value: `R${todayRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: "Active Repairs", value: activeRepairsCount, icon: Wrench, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: "Low Stock Items", value: lowStockCount, icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: "Completed Today", value: completedToday, icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const quickActions = [
    { label: 'New Sale', icon: ShoppingCart, onClick: () => navigate('/shop'), color: 'bg-red-600' },
    { label: 'New Repair', icon: Wrench, onClick: () => navigate('/repairs', { state: { openModal: true } }), color: 'bg-zinc-800' },
    { label: 'Add New Stock', icon: PackagePlus, onClick: () => navigate('/shop', { state: { openAddStock: true } }), color: 'bg-red-500' },
    { label: 'Add Customer', icon: Users, onClick: () => navigate('/customers', { state: { openModal: true } }), color: 'bg-zinc-900' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 mt-1 text-sm font-medium">iBerry Mobile Solutions Operational Suite.</p>
        </div>
        <button 
          onClick={() => navigate('/repairs')}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Repair Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm group hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-black tracking-tight mb-6 text-red-600">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.onClick}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 hover:border-red-500 hover:bg-red-500/5 transition-all group active:scale-95"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/5 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-red-500">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              Live Activity
            </h4>
            <div className="space-y-5">
              {sales.slice(-5).reverse().map((sale, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50 p-2 -m-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[120px]">{sale.customerName}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-red-600">R{sale.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-black tracking-tight mb-6">Recent Repairs</h3>
            <div className="space-y-4">
              {repairs.slice(-5).reverse().map((repair, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate max-w-[100px]">{repair.model}</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">{repair.status}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-red-600">R{repair.price.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;