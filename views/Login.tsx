import React, { useState } from 'react';
import { useApp, supabase } from '../context/AppContext';
import { Mail, Lock, ArrowRight, ShieldCheck, Loader2, Apple } from 'lucide-react';

const Login: React.FC = () => {
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) throw authError;

      if (data.user) {
        const metadata = data.user.user_metadata;
        setCurrentUser({
          id: data.user.id,
          username: metadata.username || data.user.email?.split('@')[0] || 'User',
          role: metadata.role || 'Sales',
          avatar: metadata.avatar || `https://ui-avatars.com/api/?name=${data.user.email}&background=random`
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-red-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-2xl shadow-red-500/30">
            <Apple className="w-12 h-12 fill-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-red-600">iBerry Solutions</h1>
          <p className="text-zinc-500">Mobile Solutions - Management Suite</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-xl shadow-black/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="staff@iberryms.co.za"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 hover:bg-red-700 flex items-center justify-center gap-2 group transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 dark:border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Secure Session - iBerry Cloud</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;