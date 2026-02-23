import React, { useState } from 'react';
import { Plus, Clock, PackageCheck, Truck, ClipboardList, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StockOrder } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const StockOrders: React.FC = () => {
  const { stockOrders, saveStockOrder, deleteStockOrder } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [formData, setFormData] = useState({ itemDescription: '', requestedBy: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: StockOrder = {
      id: Math.random().toString(36).substr(2, 9),
      itemDescription: formData.itemDescription,
      requestedBy: formData.requestedBy,
      date: new Date().toISOString(),
      status: 'Requested'
    };
    await saveStockOrder(newOrder);
    setIsModalOpen(false);
    setFormData({ itemDescription: '', requestedBy: '' });
  };

  const updateStatus = async (order: StockOrder, status: 'Requested' | 'Ordered' | 'Received') => {
    await saveStockOrder({ ...order, status });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    console.log("UI: confirmDelete (StockOrder) called for ID:", id);
    try {
      await deleteStockOrder(id);
      console.log("UI: deleteStockOrder call completed");
    } catch (err) {
      console.error("UI: Error calling deleteStockOrder:", err);
      alert("UI Error: " + (err as any).message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Requested': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'Ordered': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'Received': return <PackageCheck className="w-4 h-4 text-green-500" />;
      default: return <ClipboardList className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Orders</h1>
          <p className="text-zinc-500">Requests for parts or stock from customers/techs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2.5 rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stockOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${
                  order.status === 'Requested' ? 'bg-orange-500/10' : 
                  order.status === 'Ordered' ? 'bg-blue-500/10' : 'bg-green-500/10'
                }`}>
                  {getStatusIcon(order.status)}
                </div>
                <button onClick={() => handleDelete(order.id)} className="text-zinc-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{order.itemDescription}</h3>
                <p className="text-xs text-zinc-500 mt-1">Requested by: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{order.requestedBy}</span></p>
                <p className="text-[10px] text-zinc-400 font-mono mt-1">{new Date(order.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <select 
                value={order.status}
                onChange={(e) => updateStatus(order, e.target.value as any)}
                className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold py-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="Requested">Mark as Requested</option>
                <option value="Ordered">Mark as Ordered</option>
                <option value="Received">Mark as Received</option>
              </select>
            </div>
          </div>
        ))}

        {stockOrders.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <ClipboardList className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No stock requests</h3>
            <p className="text-zinc-500">Track parts needed for repairs here.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold">New Stock Request</h2>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Item Description</label>
                <textarea 
                  required
                  placeholder="e.g. S21 Ultra Original Battery, 3 pieces"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.itemDescription}
                  onChange={e => setFormData({...formData, itemDescription: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Requested By</label>
                <input 
                  required
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.requestedBy}
                  onChange={e => setFormData({...formData, requestedBy: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Submit Request</button>
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
        title="Delete Stock Request"
        message="Are you sure you want to delete this stock request? This action cannot be undone."
      />
    </div>
  );
};

export default StockOrders;