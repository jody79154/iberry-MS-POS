import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Customer, Repair, Sale, StockOrder, User } from '../types';

interface StoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface AppContextType {
  products: Product[];
  customers: Customer[];
  repairs: Repair[];
  sales: Sale[];
  stockOrders: StockOrder[];
  storeInfo: StoreInfo;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  cart: any[];
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isCloudConnected: boolean;
  supabaseConfigured: boolean;
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  saveRepair: (repair: Repair) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  saveStockOrder: (order: StockOrder) => Promise<void>;
  deleteStockOrder: (id: string) => Promise<void>;
  updateStoreInfo: (info: StoreInfo) => Promise<void>;
  seedDatabase: () => Promise<void>;
  getSmartDiagnosis: (model: string, fault: string) => Promise<string>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const supabaseUrl = 'https://djntlqdkipwoowogzofv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqbnRscWRraXB3b293b2d6b2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzU5NjEsImV4cCI6MjA4NjkxMTk2MX0.YFSojKvQGrW2-vWoDjvPZlIEXGizxhEuZyS5WTVdxtY';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockOrders, setStockOrders] = useState<StockOrder[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: 'IBERRY POS REPAIRS',
    address: '39 Orient Drive',
    phone: '0826664296',
    email: 'info@iberryms.co.za'
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');

  const supabaseConfigured = true;

  // Sync Data Helper
  const fetchData = async () => {
    try {
      const fetchTable = async (table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        return data;
      };

      const [p, c, r, s, so, conf] = await Promise.allSettled([
        fetchTable('products'),
        fetchTable('customers'),
        supabase.from('repairs').select('*').order('dateAdded', { ascending: false }),
        supabase.from('sales').select('*').order('date', { ascending: false }),
        supabase.from('stock_orders').select('*').order('date', { ascending: false }),
        supabase.from('config').select('*').eq('id', 'store').maybeSingle()
      ]);

      if (p.status === 'fulfilled' && p.value) setProducts(p.value);
      if (c.status === 'fulfilled' && c.value) setCustomers(c.value);
      if (r.status === 'fulfilled' && r.value.data) setRepairs(r.value.data);
      if (s.status === 'fulfilled' && s.value.data) setSales(s.value.data);
      if (so.status === 'fulfilled' && so.value.data) setStockOrders(so.value.data);
      if (conf.status === 'fulfilled' && conf.value?.data?.data) setStoreInfo(conf.value.data.data);
      
      setIsCloudConnected(true);
    } catch (err) {
      console.error("Supabase Sync Error:", err);
      setIsCloudConnected(false);
    }
  };

  // Auth & Initial Data Load
  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setCurrentUser({
          id: session.user.id,
          username: metadata.username || session.user.email?.split('@')[0] || 'User',
          role: metadata.role || 'Sales',
          avatar: metadata.avatar || `https://ui-avatars.com/api/?name=${session.user.email}&background=random`
        });
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata;
        setCurrentUser({
          id: session.user.id,
          username: metadata.username || session.user.email?.split('@')[0] || 'User',
          role: metadata.role || 'Sales',
          avatar: metadata.avatar || `https://ui-avatars.com/api/?name=${session.user.email}&background=random`
        });
      } else {
        setCurrentUser(null);
      }
    });

    fetchData();

    // 3. Realtime subscriptions
    const channels = [
      supabase.channel('db-changes').on('postgres_changes', { event: '*', schema: 'public' }, fetchData).subscribe()
    ];

    return () => {
      subscription.unsubscribe();
      channels.forEach(ch => ch.unsubscribe());
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    clearCart();
  };

  const seedDatabase = async () => {
    const dummyProducts: Product[] = [
      { id: 'p1', title: 'iPhone 13 Screen (OEM)', price: 1850, model: 'iPhone 13', category: 'Accessories', stock: 15, image: 'https://picsum.photos/seed/iphone/200' },
      { id: 'p2', title: 'Type-C Braided Cable', price: 120, model: 'Universal', category: 'Cables', stock: 50, image: 'https://picsum.photos/seed/cable/200' },
    ];
    try {
      await supabase.from('products').upsert(dummyProducts);
      alert("Database seeded!");
      fetchData();
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  const getSmartDiagnosis = async (model: string, fault: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze the device model "${model}" and the reported fault "${fault}". Provide a professional diagnosis and suggested repair steps in under 80 words.`,
      });
      return response.text || "No diagnosis available.";
    } catch (error) {
      return "AI diagnostic service currently unavailable.";
    }
  };

  const saveProduct = async (product: Product) => { await supabase.from('products').upsert(product); };
  const deleteProduct = async (id: string) => { await supabase.from('products').delete().eq('id', id); };
  const saveCustomer = async (customer: Customer) => { await supabase.from('customers').upsert(customer); };
  const deleteCustomer = async (id: string) => { await supabase.from('customers').delete().eq('id', id); };
  const saveRepair = async (repair: Repair) => { await supabase.from('repairs').upsert(repair); };
  const deleteRepair = async (id: string) => { await supabase.from('repairs').delete().eq('id', id); };
  const addSale = async (sale: Sale) => { await supabase.from('sales').insert(sale); };
  const saveStockOrder = async (order: StockOrder) => { await supabase.from('stock_orders').upsert(order); };
  const deleteStockOrder = async (id: string) => { await supabase.from('stock_orders').delete().eq('id', id); };
  const updateStoreInfo = async (info: StoreInfo) => { 
    await supabase.from('config').upsert({ id: 'store', data: info });
    setStoreInfo(info);
  };

  const addToCart = (item: any) => {
    setCart(prev => [...prev, { ...item, cartId: Math.random().toString(36).substr(2, 9) }]);
  };
  const removeFromCart = (cartId: string) => setCart(prev => prev.filter(item => item.cartId !== cartId));
  const clearCart = () => setCart([]);
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <AppContext.Provider value={{
      products, customers, repairs, sales, stockOrders, storeInfo,
      currentUser, setCurrentUser,
      cart, addToCart, removeFromCart, clearCart,
      theme, toggleTheme, isCloudConnected, supabaseConfigured,
      saveProduct, deleteProduct, saveCustomer, deleteCustomer,
      saveRepair, deleteRepair, addSale, saveStockOrder, deleteStockOrder,
      updateStoreInfo, seedDatabase, getSmartDiagnosis, logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};