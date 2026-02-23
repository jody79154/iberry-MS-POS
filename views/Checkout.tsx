import React, { useState } from 'react';
import { ShoppingCart, Trash2, Printer, CheckCircle, User, CreditCard, Banknote, Wrench, Package, Minus, Plus, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '../types';
import InvoiceModal from '../src/components/InvoiceModal';
import { BUSINESS_INFO } from '../src/constants';

const Checkout: React.FC = () => {
  const { cart, removeFromCart, clearCart, currentUser, customers, addSale, saveProduct, products, storeInfo } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Card');
  const [isSuccess, setIsSuccess] = useState(false);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const getQuantity = (cartId: string) => cartQuantities[cartId] || 1;

  const updateQuantity = (cartId: string, delta: number) => {
    setCartQuantities(prev => ({
      ...prev,
      [cartId]: Math.max(1, (prev[cartId] || 1) + delta)
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * getQuantity(item.cartId)), 0);
  };

  const generatePDF = (saleData: any) => {
    const doc = new jsPDF();
    
    // Header - Logo
    try {
      doc.addImage(BUSINESS_INFO.logo, 'PNG', 10, 10, 40, 15);
    } catch (e) {
      // Fallback if image fails
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(10, 10, 20, 20, 3, 3, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('i', 20, 23, { align: 'center' });
    }

    doc.setFontSize(22);
    doc.setTextColor(239, 68, 68); // Brand Red
    doc.text('iBerry Mobile Solutions', 55, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(storeInfo.address, 55, 27);
    doc.text(`Phone: ${storeInfo.phone} | Email: ${storeInfo.email}`, 55, 32);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(10, 40, 200, 40);

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE TO:', 10, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(saleData.customerName, 10, 58);
    
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE INFO:', 140, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${saleData.id}`, 140, 58);
    doc.text(`Date: ${new Date(saleData.date).toLocaleString()}`, 140, 64);
    doc.text(`Payment: ${paymentMethod}`, 140, 70);

    const tableData = saleData.items.map((item: any) => [
      item.type.toUpperCase(),
      item.name,
      getQuantity(item.cartId),
      `ZAR ${item.price.toFixed(2)}`,
      `ZAR ${(item.price * getQuantity(item.cartId)).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['TYPE', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'SUBTOTAL']],
      body: tableData,
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold' },
      foot: [['', '', '', 'TOTAL AMOUNT', `ZAR ${saleData.total.toFixed(2)}`]],
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 80 }
    });

    const finalY = (doc as any).lastAutoTable.cursor.y || 150;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Thank you for choosing iBerry Mobile Solutions!', 105, finalY + 20, { align: 'center' });
    doc.text('Terms: Standard 3-month warranty applies to all repair labor and parts replaced.', 105, finalY + 26, { align: 'center' });

    doc.save(`Invoice_${saleData.id}.pdf`);
  };

  const handlePreview = () => {
    if (cart.length === 0) return;
    const total = calculateTotal();
    const customer = customers.find(c => c.id === selectedCustomer);
    
    const data = {
      invoiceNumber: 'PREVIEW-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
      date: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      customer: customer || { name: 'Walk-in Customer' },
      items: cart.map(item => ({
        name: item.name,
        description: item.type.toUpperCase(),
        quantity: getQuantity(item.cartId),
        unitPrice: item.price
      })),
      status: 'PENDING' as const
    };
    
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const total = calculateTotal();
    const customer = customers.find(c => c.id === selectedCustomer);
    
    const saleId = 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newSale: Sale = {
      id: saleId,
      items: cart,
      total,
      date: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      customerName: customer ? customer.name : 'Walk-in Customer'
    };

    await addSale(newSale);
    
    for (const item of cart) {
      const qty = getQuantity(item.cartId);
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await saveProduct({ ...product, stock: Math.max(0, product.stock - qty) });
        }
      }
    }

    generatePDF(newSale);
    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
      setCartQuantities({});
      setIsSuccess(false);
      setSelectedCustomer('');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-green-500/20">
          <CheckCircle className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Sale Confirmed!</h2>
        <p className="text-zinc-500 mb-8 text-center max-w-sm">The iBerry branded invoice has been generated. Stock levels updated.</p>
        <div className="animate-pulse flex gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-zinc-500">Confirm payment and generate your branded receipt.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-500" />
                Your Cart ({cart.length} items)
              </h3>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
              )}
            </div>
            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {cart.map((item) => (
                <div key={item.cartId} className="p-6 flex items-center gap-4 group hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'repair' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-100 text-zinc-500'}`}>
                    {item.type === 'repair' ? <Wrench className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-zinc-500 uppercase font-medium">{item.type}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mr-4">
                    <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Minus className="w-3 h-3" /></button>
                    <span className="font-mono font-bold w-4 text-center">{getQuantity(item.cartId)}</span>
                    <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Plus className="w-3 h-3" /></button>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-bold whitespace-nowrap">ZAR {(item.price * getQuantity(item.cartId)).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-bold text-lg">Payment Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Customer</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod('Card')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${paymentMethod === 'Card' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-red-500'}`}><CreditCard className="w-4 h-4" /> Card</button>
                  <button onClick={() => setPaymentMethod('Cash')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold transition-all ${paymentMethod === 'Cash' ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/20' : 'bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:border-red-500'}`}><Banknote className="w-4 h-4" /> Cash</button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-3">
              <div className="flex justify-between text-2xl font-black pt-2 text-zinc-900 dark:text-zinc-100">
                <span>Total</span>
                <span className="text-red-600">ZAR {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                disabled={cart.length === 0} 
                onClick={handlePreview} 
                className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Preview Invoice
              </button>
              
              <button 
                disabled={cart.length === 0} 
                onClick={handleCheckout} 
                className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2 text-lg"
              >
                <Printer className="w-6 h-6" />
                Process & Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {isPreviewOpen && previewData && (
        <InvoiceModal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          data={previewData} 
        />
      )}
    </div>
  );
};

export default Checkout;