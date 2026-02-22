import React from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, FileSpreadsheet, TrendingUp, ShoppingBag, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics: React.FC = () => {
  const { sales, storeInfo, currentUser } = useApp();

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const averageSale = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const chartData = sales.slice(-10).map(s => ({
    id: s.id.substring(4),
    amount: s.total
  }));

  const stats = [
    { label: 'Total Revenue', value: `R ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Total Invoices', value: totalSalesCount, icon: FileSpreadsheet, color: 'text-blue-500' },
    { label: 'Average Transaction', value: `R ${averageSale.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Total Items Sold', value: sales.reduce((acc, s) => acc + s.items.length, 0), icon: ShoppingBag, color: 'text-orange-500' },
  ];

  const handleReprint = (sale: any) => {
    const doc = new jsPDF();
    
    // Header Style
    doc.setFillColor(59, 130, 246);
    doc.roundedRect(10, 10, 20, 20, 3, 3, 'F');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(storeInfo.name.charAt(0), 20, 23, { align: 'center' });

    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text(storeInfo.name, 35, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(storeInfo.address, 35, 27);
    doc.text(`Phone: ${storeInfo.phone} | Email: ${storeInfo.email}`, 35, 32);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(10, 40, 200, 40);

    // Invoice Info
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text('DUPLICATE INVOICE TO:', 10, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(sale.customerName, 10, 58);
    
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE INFO:', 140, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${sale.id}`, 140, 58);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`, 140, 64);

    const tableData = sale.items.map((item: any) => [
      item.type.toUpperCase(),
      item.name,
      `R ${item.price.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['TYPE', 'DESCRIPTION', 'PRICE']],
      body: tableData,
      headStyles: { fillColor: [31, 41, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
      foot: [['', 'TOTAL AMOUNT', `R ${sale.total.toFixed(2)}`]],
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 80 }
    });

    const finalY = (doc as any).lastAutoTable.cursor.y || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Reprinted on ${new Date().toLocaleString()} by ${currentUser?.username}`, 105, finalY + 20, { align: 'center' });

    doc.save(`Reprint_${sale.id}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Financials</h1>
        <p className="text-zinc-500">Track your repair workshop performance and sales history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-500">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Recent Sales Volume</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="id" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/50">
            <h3 className="text-lg font-bold">Invoices Log</h3>
            <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full font-bold">{sales.length} Total</span>
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800 text-left text-[10px] font-bold text-zinc-500 uppercase z-10">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3 text-right">Total</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {sales.slice().reverse().map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">{sale.id}</td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{sale.customerName}</p>
                       <p className="text-[10px] text-zinc-500">{new Date(sale.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">R {sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleReprint(sale)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        title="Reprint Receipt"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden group-hover:inline">Reprint</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-zinc-500 italic">No sales have been processed yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;