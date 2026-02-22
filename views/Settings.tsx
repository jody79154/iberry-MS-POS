import React from 'react';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Shield, User, Palette, Mail, MapPin, Phone, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, toggleTheme, currentUser, storeInfo, updateStoreInfo, seedDatabase } = useApp();

  const handleStoreUpdate = (field: keyof typeof storeInfo, value: string) => {
    updateStoreInfo({ ...storeInfo, [field]: value });
  };

  const mockUsers = [
    { username: 'admin', role: 'Admin', avatar: 'https://picsum.photos/seed/admin/100' },
    { username: 'tech1', role: 'Technician', avatar: 'https://picsum.photos/seed/tech1/100' },
    { username: 'tech2', role: 'Technician', avatar: 'https://picsum.photos/seed/tech2/100' },
    { username: 'sales1', role: 'Sales', avatar: 'https://picsum.photos/seed/sales1/100' },
  ];

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-zinc-500">Customize the application and manage accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-xs text-zinc-500">Switch between light and dark themes</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all flex items-center justify-center shadow-sm ${theme === 'dark' ? 'left-7' : 'left-1'}`}>
                  {theme === 'dark' ? <Moon className="w-3 h-3 text-blue-600" /> : <Sun className="w-3 h-3 text-orange-500" />}
                </div>
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Shield className="w-5 h-5 text-blue-500" />
              Business Profile (Receipt Branding)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Business Name</label>
                <input 
                  type="text" 
                  value={storeInfo.name} 
                  onChange={(e) => handleStoreUpdate('name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</label>
                <input 
                  type="text" 
                  value={storeInfo.address} 
                  onChange={(e) => handleStoreUpdate('address', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                  <input 
                    type="text" 
                    value={storeInfo.phone} 
                    onChange={(e) => handleStoreUpdate('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                  <input 
                    type="text" 
                    value={storeInfo.email} 
                    onChange={(e) => handleStoreUpdate('email', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Data Management
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-zinc-500">Populate your local storage with sample inventory and customers to explore the system.</p>
              <button 
                onClick={seedDatabase}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" />
                Seed Local Storage
              </button>
            </div>
          </section>
        </div>

        <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Manage User Accounts
          </h3>
          <p className="text-xs text-zinc-500">The application supports distinct roles for security.</p>
          <div className="space-y-4">
            {mockUsers.map(user => (
              <div key={user.username} className="flex items-center gap-4 p-3 border border-gray-100 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <img src={user.avatar} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-700" alt="" />
                <div className="flex-1">
                  <p className="font-bold text-sm">{user.username}</p>
                  <p className="text-[10px] text-zinc-500 uppercase font-black">{user.role}</p>
                </div>
                {currentUser?.username === user.username ? (
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold">Active Now</span>
                ) : (
                  <button className="text-xs font-bold text-blue-500 hover:underline">Manage</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;