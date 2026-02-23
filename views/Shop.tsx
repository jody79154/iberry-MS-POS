
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ShoppingCart, Package, Camera, Tag, DollarSign, Edit, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category, Product } from '../types';
import { useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const Shop: React.FC = () => {
  const { products, addToCart, saveProduct, deleteProduct } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [isManageMode, setIsManageMode] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    model: '',
    category: 'Covers' as Category,
    stock: 0,
    image: ''
  });

  useEffect(() => {
    if (location.state && (location.state as any).openAddStock) {
      setIsModalOpen(true);
      setEditingProduct(null);
      setFormData({ title: '', price: '', model: '', category: 'Covers', stock: 0, image: '' });
    }
  }, [location.state]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: (Category | 'All')[] = ['All', 'Covers', 'Screenguards', 'Cables', 'Earphones', 'Chargers', 'Speakers', 'Accessories', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      title: formData.title,
      price: parseFloat(formData.price) || 0,
      model: formData.model,
      category: formData.category,
      stock: Number(formData.stock),
      image: formData.image || `https://picsum.photos/seed/${formData.title}/200`
    };

    await saveProduct(productData);

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ title: '', price: '', model: '', category: 'Covers', stock: 0, image: '' });
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price.toString(),
      model: product.model,
      category: product.category,
      stock: product.stock,
      image: product.image
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    console.log("UI: confirmDelete (Product) called for ID:", id);
    try {
      await deleteProduct(id);
      console.log("UI: deleteProduct call completed");
    } catch (err) {
      console.error("UI: Error calling deleteProduct:", err);
      alert("UI Error: " + (err as any).message);
    }
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Shop</h1>
          <p className="text-zinc-500">Browse and add products to checkout.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsManageMode(!isManageMode)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all border ${
              isManageMode 
              ? 'bg-zinc-800 border-zinc-800 text-white' 
              : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-zinc-600'
            }`}
          >
            {isManageMode ? 'Exit Manage' : 'Manage Stock'}
          </button>
          <button 
            onClick={() => { setIsModalOpen(true); setEditingProduct(null); setFormData({ title: '', price: '', model: '', category: 'Covers', stock: 0, image: '' }); }}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search products, models..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-zinc-500 hover:border-red-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="aspect-square relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                  product.stock > 10 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {product.stock} in stock
                </span>
                {isManageMode && (
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(product)} className="p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg text-zinc-600 hover:text-blue-500 shadow-sm">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteItem(product.id)} className="p-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-lg text-red-500 hover:bg-red-50 shadow-sm">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="text-[10px] font-bold uppercase text-red-500 tracking-wider">
                {product.category}
              </div>
              <h3 className="font-bold text-sm truncate" title={product.title}>{product.title}</h3>
              <p className="text-xs text-zinc-500">{product.model}</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold">R{product.price.toFixed(2)}</span>
                <button 
                  onClick={() => addToCart({ ...product, type: 'product', name: product.title })}
                  className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="text-zinc-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingProduct ? 'Update Stock' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Product Title</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input required type="text" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Price (ZAR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    required 
                    type="text" 
                    placeholder="0.00" 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none no-spinner" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value.replace(/[^0-9.]/g, '')})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Stock Quantity</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input required type="number" min="0" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Device Model</label>
                <input required type="text" placeholder="e.g. S22, iPhone 11" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Category</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Product Image</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Image URL or capture photo..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" 
                      value={formData.image} 
                      onChange={e => setFormData({...formData, image: e.target.value})} 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={triggerCamera}
                    disabled={isCapturing}
                    className="px-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                    {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span className="text-xs font-bold">Capture</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment" 
                    onChange={handleCapture} 
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-600/20">
                  {editingProduct ? 'Update Stock' : 'Add to Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product from inventory? This action cannot be undone."
      />
    </div>
  );
};

export default Shop;
