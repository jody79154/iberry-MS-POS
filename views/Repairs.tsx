
import React, { useState, useEffect } from 'react';
import { Search, Plus, Wrench, Calendar, User as UserIcon, ShoppingCart, Edit, Trash2, Sparkles, Loader2, FileText, UserPlus, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Repair, RepairStatus, Customer } from '../types';
import { useLocation } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import { generateQuotationPDF } from '../services/QuotationService';
import InvoiceModal from '../src/components/InvoiceModal';

const Repairs: React.FC = () => {
  const { repairs, saveRepair, deleteRepair, customers, saveCustomer, addToCart, getSmartDiagnosis, storeInfo } = useApp();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: '' });

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const [quickCustomerData, setQuickCustomerData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: quickCustomerData.name,
      phone: quickCustomerData.phone,
      email: quickCustomerData.email
    };
    await saveCustomer(newCustomer);
    setFormData(prev => ({ ...prev, customerId: newCustomer.id }));
    setIsQuickCustomerModalOpen(false);
    setQuickCustomerData({ name: '', phone: '', email: '' });
  };

  const [formData, setFormData] = useState({
    customerId: '',
    model: '',
    imei: '',
    fault: '',
    price: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      customerId: '',
      model: '',
      imei: '',
      fault: '',
      price: '',
      notes: ''
    });
  };

  useEffect(() => {
    if (location.state && (location.state as any).openModal) {
      setIsModalOpen(true);
      setEditingRepair(null);
      setAiSuggestion(null);
      resetForm();
    }
  }, [location.state]);

  const handleAddRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === formData.customerId);
    if (!customer) return alert('Select a customer');

    const repairData: Repair = {
      id: editingRepair ? editingRepair.id : Math.random().toString(36).substr(2, 9),
      customerId: customer.id,
      customerName: customer.name,
      model: formData.model,
      imei: formData.imei,
      fault: formData.fault,
      status: editingRepair ? editingRepair.status : RepairStatus.PENDING,
      price: parseFloat(formData.price) || 0,
      dateAdded: editingRepair ? editingRepair.dateAdded : new Date().toISOString(),
      notes: formData.notes
    };

    await saveRepair(repairData);
    
    setIsModalOpen(false);
    setEditingRepair(null);
    setAiSuggestion(null);
    resetForm();
  };

  const handleSmartDiagnosis = async () => {
    if (!formData.model || !formData.fault) {
      alert("Please provide the model and fault description first.");
      return;
    }
    setIsDiagnosing(true);
    const suggestion = await getSmartDiagnosis(formData.model, formData.fault);
    setAiSuggestion(suggestion);
    setIsDiagnosing(false);
  };

  const updateStatus = async (repair: Repair, status: RepairStatus) => {
    await saveRepair({ ...repair, status });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = deleteConfirm.id;
    console.log("UI: confirmDelete called for ID:", id);
    try {
      await deleteRepair(id);
      console.log("UI: deleteRepair call completed successfully");
    } catch (err) {
      console.error("UI: Error calling deleteRepair:", err);
      alert("UI Error: " + (err as any).message);
    }
  };

  const openEditModal = (repair: Repair) => {
    setEditingRepair(repair);
    setAiSuggestion(null);
    setFormData({
      customerId: repair.customerId,
      model: repair.model,
      imei: repair.imei,
      fault: repair.fault,
      price: repair.price.toString(),
      notes: repair.notes || ''
    });
    setIsModalOpen(true);
  };

  const handlePrintQuotation = (repair: Repair) => {
    const customer = customers.find(c => c.id === repair.customerId);
    if (customer) {
      generateQuotationPDF(repair, customer, storeInfo);
    } else {
      alert("Customer details not found for this repair.");
    }
  };

  const handlePreviewQuotation = (repair: Repair) => {
    const customer = customers.find(c => c.id === repair.customerId);
    if (!customer) return alert("Customer details not found.");
    
    const data = {
      invoiceNumber: repair.id.toUpperCase(),
      date: new Date(repair.dateAdded).toLocaleDateString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: customer,
      items: [{
        name: `${repair.model} Repair`,
        description: repair.fault,
        quantity: 1,
        unitPrice: repair.price
      }],
      status: 'PENDING' as const
    };
    
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const filteredRepairs = repairs.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.imei.includes(searchTerm)
  );

  const getStatusColor = (status: RepairStatus) => {
    switch (status) {
      case RepairStatus.PENDING: return 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-sm shadow-orange-500/5';
      case RepairStatus.IN_PROGRESS: return 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-sm shadow-blue-500/5';
      case RepairStatus.READY: return 'bg-green-500/10 text-green-500 border-green-500/20 shadow-sm shadow-green-500/5';
      case RepairStatus.COMPLETED: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      case RepairStatus.CANCELLED: return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Workshop Tracker</h1>
          <p className="text-zinc-500">Monitor device lifecycle from check-in to completion.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingRepair(null); setAiSuggestion(null); resetForm(); }}
          className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Register New Job</span>
        </button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          type="text"
          placeholder="Search repair orders by customer, model, or imei..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/50 text-left border-b border-gray-100 dark:border-zinc-800">
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Entry Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Device Asset</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status Lifecycle</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quote</th>
                <th className="px-6 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-semibold">{new Date(repair.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold text-xs">
                        {repair.customerName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold">{repair.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{repair.model}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter">IMEI: {repair.imei}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <select 
                      value={repair.status}
                      onChange={(e) => updateStatus(repair, e.target.value as RepairStatus)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all ${getStatusColor(repair.status)}`}
                    >
                      {Object.values(RepairStatus).map(s => (
                        <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black whitespace-nowrap text-zinc-900 dark:text-zinc-100">ZAR {repair.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handlePreviewQuotation(repair)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors" title="Preview Quotation"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handlePrintQuotation(repair)} className="p-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl text-blue-600 transition-colors" title="Print Quotation"><FileText className="w-4 h-4" /></button>
                      <button onClick={() => openEditModal(repair)} className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors" title="Edit Order"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => addToCart({ ...repair, type: 'repair', name: `${repair.model} - ${repair.fault}` })} className="p-2.5 hover:bg-blue-600 hover:text-white rounded-xl text-blue-500 transition-colors shadow-blue-500/20" title="Add to Checkout"><ShoppingCart className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(repair.id)} className="p-2.5 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-colors" title="Delete Order"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRepairs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Wrench className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                    <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest italic">No active repair orders matched your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">{editingRepair ? 'Edit Repair Order' : 'Check-in New Device'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors font-bold text-2xl">&times;</button>
            </div>
            <form onSubmit={handleAddRepair} className="p-8 space-y-5 overflow-y-auto max-h-[75vh] no-scrollbar">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assign Customer</label>
                    <button 
                      type="button"
                      onClick={() => setIsQuickCustomerModalOpen(true)}
                      className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      Quick Add
                    </button>
                  </div>
                  <select required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}>
                    <option value="">Select an existing customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Device Model</label>
                  <input required type="text" placeholder="e.g. iPhone 14 Pro" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">IMEI / SN</label>
                  <input required type="text" placeholder="15-digit number" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.imei} onChange={(e) => setFormData({ ...formData, imei: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fault Diagnosis</label>
                    <button 
                      type="button" 
                      onClick={handleSmartDiagnosis}
                      disabled={isDiagnosing}
                      className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest disabled:opacity-50 transition-colors"
                    >
                      {isDiagnosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Smart Diagnose
                    </button>
                  </div>
                  <textarea required rows={2} placeholder="Describe the symptoms or required repair..." className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.fault} onChange={(e) => setFormData({ ...formData, fault: e.target.value })} />
                  
                  {aiSuggestion && (
                    <div className="mt-4 p-5 bg-blue-600/5 dark:bg-blue-400/5 border border-blue-600/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">AI Recommendation</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {aiSuggestion}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Service Fee (ZAR)</label>
                  <input required type="number" step="0.01" className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Internal Notes</label>
                  <input type="text" placeholder="Optional details..." className="w-full px-5 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-zinc-800 font-bold rounded-2xl transition-all active:scale-95">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95">Save Repair Order</button>
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
        title="Delete Repair Order"
        message="Are you sure you want to permanently delete this repair order? This action cannot be undone."
      />

      {/* Quick Add Customer Modal */}
      {isQuickCustomerModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Quick Add Customer</h2>
              <button onClick={() => setIsQuickCustomerModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleQuickAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Full Name</label>
                <input required type="text" placeholder="Customer Name" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={quickCustomerData.name} onChange={(e) => setQuickCustomerData({ ...quickCustomerData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Phone Number</label>
                <input required type="text" placeholder="e.g. 082 123 4567" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={quickCustomerData.phone} onChange={(e) => setQuickCustomerData({ ...quickCustomerData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Email Address (Optional)</label>
                <input type="email" placeholder="customer@example.com" className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" value={quickCustomerData.email} onChange={(e) => setQuickCustomerData({ ...quickCustomerData, email: e.target.value })} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsQuickCustomerModalOpen(false)} className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 font-bold rounded-xl transition-all active:scale-95">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95">Add Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && previewData && (
        <InvoiceModal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          data={previewData} 
          title="Quotation"
        />
      )}
    </div>
  );
};

export default Repairs;
