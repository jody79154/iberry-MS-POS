import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { BUSINESS_INFO } from '../constants';
import { Customer, Product, Repair } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customer: Partial<Customer>;
    items: Array<{
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    notes?: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
  };
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, data, title = 'Invoice' }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const vatAmount = (subtotal * BUSINESS_INFO.vatRate) / 100;
  const grandTotal = subtotal + vatAmount;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${data.invoiceNumber}</title>
          <style>
            ${document.querySelector('style')?.innerHTML || ''}
            @page { size: auto; margin: 0mm; }
            body { padding: 20px; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-4xl shadow-2xl border border-zinc-200 dark:border-zinc-800 my-8">
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title} Preview</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              data.status === 'PAID' ? 'bg-green-100 text-green-700' : 
              data.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {data.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-2 px-4"
            >
              <Printer className="w-5 h-5" />
              <span className="font-semibold">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content (The Template) */}
        <div className="p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 overflow-x-auto">
          <div ref={printRef} className="invoice-wrapper mx-auto" style={{ 
            fontFamily: "'Segoe UI', Arial, sans-serif", 
            background: "#fff", 
            color: "#333",
            width: "100%",
            maxWidth: "860px",
            minWidth: "600px",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)"
          }}>
            {/* Inline styles for the print content to ensure it looks right in the popup */}
            <style dangerouslySetInnerHTML={{ __html: `
              .invoice-wrapper * { margin: 0; padding: 0; box-sizing: border-box; }
              .invoice-header { background: #cc0000; padding: 30px 40px; display: flex; justify-content: space-between; align-items: center; }
              .invoice-header img.logo { height: 60px; background: #fff; padding: 6px 12px; border-radius: 6px; }
              .header-right { text-align: right; color: #fff; }
              .header-right h1 { font-size: 32px; letter-spacing: 4px; font-weight: 300; text-transform: uppercase; }
              .header-right .inv-number { font-size: 14px; opacity: 0.85; margin-top: 4px; }
              .header-right .inv-number span { font-weight: bold; font-size: 16px; }
              .meta-strip { background: #1a1a1a; display: flex; justify-content: flex-end; gap: 40px; padding: 12px 40px; font-size: 13px; color: #ccc; }
              .meta-strip .meta-item label { color: #cc0000; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; }
              .meta-strip .meta-item span { color: #fff; font-size: 14px; }
              .invoice-body { padding: 36px 40px; background: #fff; }
              .parties { display: flex; justify-content: space-between; margin-bottom: 36px; gap: 20px; }
              .party-box { flex: 1; }
              .party-box .party-label { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #cc0000; font-weight: 700; border-bottom: 2px solid #cc0000; padding-bottom: 4px; margin-bottom: 10px; }
              .party-box .party-name { font-weight: 700; font-size: 16px; color: #111; margin-bottom: 4px; }
              .party-box p { font-size: 13px; color: #555; line-height: 1.6; }
              .items-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
              .items-table thead tr { background: #cc0000; color: #fff; }
              .items-table thead th { padding: 12px 14px; text-align: left; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
              .items-table thead th:last-child, .items-table thead th:nth-child(3), .items-table thead th:nth-child(4) { text-align: right; }
              .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
              .items-table tbody tr:nth-child(even) { background: #fafafa; }
              .items-table tbody td { padding: 12px 14px; font-size: 14px; color: #333; }
              .items-table tbody td:last-child, .items-table tbody td:nth-child(3), .items-table tbody td:nth-child(4) { text-align: right; }
              .item-desc { color: #666; font-size: 12px; }
              .totals-section { display: flex; justify-content: flex-end; margin-bottom: 36px; }
              .totals-box { width: 300px; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; }
              .totals-row { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
              .totals-row label { color: #666; }
              .totals-row.grand-total { background: #cc0000; color: #fff; font-size: 16px; font-weight: 700; }
              .footer-grid { display: flex; gap: 24px; margin-bottom: 30px; }
              .footer-box { flex: 1; background: #fafafa; border-radius: 8px; padding: 18px 20px; border: 1px solid #f0f0f0; }
              .footer-box h4 { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #cc0000; font-weight: 700; margin-bottom: 10px; }
              .footer-box p { font-size: 13px; color: #555; line-height: 1.6; }
              .status-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
              .status-paid { background: #e6f9f0; color: #1a8a4a; }
              .status-pending { background: #fff3cd; color: #856404; }
              .status-overdue { background: #fde8e8; color: #cc0000; }
              .footer-bar { background: #1a1a1a; padding: 18px 40px; display: flex; justify-content: space-between; align-items: center; }
              .footer-bar p { color: #888; font-size: 12px; }
              .footer-bar .tagline { color: #cc0000; font-weight: 600; font-size: 13px; }
            `}} />

            {/* HEADER */}
            <div className="invoice-header">
              <img className="logo" src={BUSINESS_INFO.logo} alt="Logo" />
              <div className="header-right">
                <h1>{title}</h1>
                <div className="inv-number">{title} No: <span>{data.invoiceNumber}</span></div>
              </div>
            </div>

            {/* META STRIP */}
            <div className="meta-strip">
              <div className="meta-item">
                <label>Issue Date</label>
                <span>{data.date}</span>
              </div>
              <div className="meta-item">
                <label>Due Date</label>
                <span>{data.dueDate}</span>
              </div>
              <div className="meta-item">
                <label>Status</label>
                <span className={`status-badge ${
                  data.status === 'PAID' ? 'status-paid' : 
                  data.status === 'PENDING' ? 'status-pending' : 
                  'status-overdue'
                }`}>{data.status}</span>
              </div>
            </div>

            {/* BODY */}
            <div className="invoice-body">
              {/* PARTIES */}
              <div className="parties">
                <div className="party-box">
                  <div className="party-label">From</div>
                  <div className="party-name">{BUSINESS_INFO.name}</div>
                  <p>
                    {BUSINESS_INFO.addressLine1}<br />
                    {BUSINESS_INFO.addressLine2}<br />
                    Tel: {BUSINESS_INFO.phone}<br />
                    Email: {BUSINESS_INFO.email}<br />
                    VAT No: {BUSINESS_INFO.vatNumber}
                  </p>
                </div>
                <div className="party-box">
                  <div className="party-label">Bill To</div>
                  <div className="party-name">{data.customer.name || 'N/A'}</div>
                  <p>
                    {data.customer.address || 'N/A'}<br />
                    Tel: {data.customer.phone || 'N/A'}<br />
                    Email: {data.customer.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <table className="items-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {item.name}<br />
                        <span className="item-desc">{item.description || 'N/A'}</span>
                      </td>
                      <td>{item.quantity}</td>
                      <td>R {item.unitPrice.toFixed(2)}</td>
                      <td>R {(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TOTALS */}
              <div className="totals-section">
                <div className="totals-box">
                  <div className="totals-row">
                    <label>Subtotal</label>
                    <span>R {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="totals-row">
                    <label>Discount</label>
                    <span>R 0.00</span>
                  </div>
                  <div className="totals-row">
                    <label>VAT ({BUSINESS_INFO.vatRate}%)</label>
                    <span>R {vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="totals-row grand-total">
                    <label>Total Due</label>
                    <span>R {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* NOTES & PAYMENT INFO */}
              <div className="footer-grid">
                <div className="footer-box">
                  <h4>Payment Details</h4>
                  <p>
                    Bank: {BUSINESS_INFO.bankName}<br />
                    Account Name: {BUSINESS_INFO.name}<br />
                    Account No: {BUSINESS_INFO.accountNumber}<br />
                    Branch Code: {BUSINESS_INFO.branchCode}<br />
                    Reference: {data.invoiceNumber}
                  </p>
                </div>
                <div className="footer-box">
                  <h4>Notes</h4>
                  <p>{data.notes || 'N/A'}</p>
                </div>
                <div className="footer-box">
                  <h4>Terms &amp; Conditions</h4>
                  <p>Payment due within 14 days. Warranty: 90 days on parts.</p>
                </div>
              </div>
            </div>

            {/* FOOTER BAR */}
            <div className="footer-bar">
              <p>Thank you for your business!</p>
              <span className="tagline">iBerry Mobile Solutions &mdash; Your Mobile Experts</span>
              <p>{BUSINESS_INFO.website}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
