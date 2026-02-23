import React, { useState } from 'react';
import { Search, Plus, Trash2, Mail, Phone, MapPin, User as UserIcon, Users, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const Customers: React.FC = () => {
  const { customers, saveCustomer, deleteCustomer, repairs, saveRepair } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address || ''
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', email: '', address: '' });
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (location.state && (location.state as any).openModal) {
      handleOpenModal();
    }
  }, [location.state]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerData: Customer = {
      id: editingCustomer ? editingCustomer.id : Math.random().toString(36).substr(2, 9),
      ...formData
    };

    await saveCustomer(customerData);
    
    // If name changed, update history
    if (editingCustomer && editingCustomer.name !== formData.name) {
      const affectedRepairs = repairs.filter(r => r.customerId === editingCustomer.id);
      for (const repair of affectedRepairs) {
        await saveRepair({ ...repair, customerName: formData.name });
      }
    }
    
    setIsModalOpen(false);
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', email: '', address: '' });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    console.log("UI: confirmDelete (Customer) called for ID:", id);
    try {
      await deleteCustomer(id);
      console.log("UI: deleteCustomer call completed");
    } catch (err) {
      console.error("UI: Error calling deleteCustomer:", err);
      alert("UI Error: " + (err as any).message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-zinc-500">Manage your client database.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by name, phone, email..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => handleOpenModal(customer)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg" title="Edit Customer">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(customer.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg" title="Delete Customer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{customer.name}</h3>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 uppercase tracking-widest font-bold">ID: {customer.id}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <Phone className="w-4 h-4 text-zinc-400" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-2">
              <button className="flex-1 text-xs font-bold py-2 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 rounded-lg transition-colors">
                View History
              </button>
              <button 
                onClick={() => handleOpenModal(customer)}
                className="flex-1 text-xs font-bold py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No customers found</h3>
            <p className="text-zinc-500">Add some customers to your database.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">&times;</button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Phone Number</label>
                <input 
                  required
                  type="tel"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address (Optional)</label>
                <input 
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Address (Optional)</label>
                <input 
                  type="text"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl outline-none"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20">
                  {editingCustomer ? 'Update Profile' : 'Save Customer'}
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer? Historical repairs will remain, but the customer profile will be removed."
      />
    </div>
  );
};

export default Customers;