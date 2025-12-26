import React, { useState, useRef } from 'react';
import { Plus, Trash2, Printer, Loader2 } from 'lucide-react';
import { InvoiceData, InvoiceItem, DEFAULT_INVOICE } from '../types.ts';
import html2pdf from 'html2pdf.js';

const InvoiceGenerator: React.FC = () => {
  const [data, setData] = useState<InvoiceData>(DEFAULT_INVOICE);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const calculateSubtotal = () => data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const calculateTax = () => calculateSubtotal() * (data.taxRate / 100);
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setData({ ...data, items: newItems });
  };

  const addItem = () => {
    setData({
      ...data,
      items: [...data.items, { description: 'New Item', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);
    setData({ ...data, items: newItems });
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    
    const element = printRef.current;
    // For invoice, we want precise A4 rendering
    const opt = {
      margin: 0,
      filename: `Invoice-${data.invoiceNumber}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // Handle potential ESM import variations where default export is wrapped
        const html2pdfLib = (html2pdf as any).default || html2pdf;
        
        if (typeof html2pdfLib !== 'function') {
           throw new Error("html2pdf library is not a function");
        }

        await html2pdfLib().set(opt).from(element).save();
    } catch (error) {
        console.error("PDF Generation failed:", error);
        alert("Could not generate PDF. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  // Shared input class styles for reuse
  const inputClass = "w-full p-2 border border-gray-200 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors";
  const labelClass = "text-xs font-medium text-gray-500 dark:text-gray-400 uppercase";

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden relative">
      
      {/* Input Sidebar - Hidden on Print */}
      <div className="w-full lg:w-[400px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-y-auto no-print z-10 transition-colors">
        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Number</label>
                <input
                  type="text"
                  value={data.invoiceNumber}
                  onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">From</h3>
            <input
              placeholder="Business Name"
              value={data.fromName}
              onChange={(e) => setData({ ...data, fromName: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Email"
              value={data.fromEmail}
              onChange={(e) => setData({ ...data, fromEmail: e.target.value })}
              className={inputClass}
            />
             <textarea
              placeholder="Address"
              value={data.fromAddress}
              onChange={(e) => setData({ ...data, fromAddress: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">To</h3>
            <input
              placeholder="Client Name"
              value={data.toName}
              onChange={(e) => setData({ ...data, toName: e.target.value })}
              className={inputClass}
            />
             <textarea
              placeholder="Client Address"
              value={data.toAddress}
              onChange={(e) => setData({ ...data, toAddress: e.target.value })}
              className={`${inputClass} h-20 resize-none`}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Line Items</h3>
              <button onClick={addItem} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-blue-600 dark:text-blue-400">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {data.items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 group transition-colors">
                <div className="flex gap-2">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    placeholder="Description"
                    className={`${inputClass} flex-1`}
                  />
                  <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className={`${labelClass} text-[10px]`}>Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`${labelClass} text-[10px]`}>Price</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pb-10">
             <h3 className="font-semibold text-gray-900 dark:text-white border-b dark:border-gray-800 pb-2">Settings</h3>
             <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Tax Rate %</label>
                   <input
                      type="number"
                      value={data.taxRate}
                      onChange={(e) => setData({ ...data, taxRate: parseFloat(e.target.value) || 0 })}
                      className={`${inputClass} mt-1`}
                    />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Currency</label>
                   <input
                      type="text"
                      value={data.currency}
                      onChange={(e) => setData({ ...data, currency: e.target.value })}
                      className={`${inputClass} mt-1`}
                    />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex flex-col h-full overflow-hidden transition-colors">
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center px-6 no-print shadow-sm z-10 transition-colors">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Live Preview</span>
           <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
            {/* The Invoice Paper - Stays white for print accuracy */}
            <div ref={printRef} className="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm] print-container text-sm md:text-base text-gray-800 flex flex-col">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-12">
                 <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">INVOICE</h1>
                    <p className="text-gray-500 font-medium">#{data.invoiceNumber}</p>
                 </div>
                 <div className="text-right">
                    <h2 className="font-bold text-xl text-gray-900 mb-1">{data.fromName}</h2>
                    <div className="text-gray-500 whitespace-pre-line text-sm">{data.fromAddress}</div>
                    <div className="text-gray-500 text-sm mt-1">{data.fromEmail}</div>
                 </div>
              </div>

              {/* Bill To & Dates */}
              <div className="flex justify-between mb-12">
                 <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
                    <div className="font-bold text-gray-900 text-lg">{data.toName}</div>
                    <div className="text-gray-600 whitespace-pre-line mt-1">{data.toAddress}</div>
                    <div className="text-gray-600 mt-1">{data.toEmail}</div>
                 </div>
                 <div className="text-right">
                    <div className="mb-4">
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date Issued</h3>
                       <div className="font-medium text-gray-900">{data.date}</div>
                    </div>
                    <div>
                       <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Due Date</h3>
                       <div className="font-medium text-gray-900">{data.dueDate}</div>
                    </div>
                 </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8">
                 <thead>
                    <tr className="border-b-2 border-gray-900">
                       <th className="text-left py-3 font-bold text-gray-900 uppercase text-xs">Description</th>
                       <th className="text-right py-3 font-bold text-gray-900 uppercase text-xs">Qty</th>
                       <th className="text-right py-3 font-bold text-gray-900 uppercase text-xs">Price</th>
                       <th className="text-right py-3 font-bold text-gray-900 uppercase text-xs">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {data.items.map((item, i) => (
                       <tr key={i}>
                          <td className="py-4 text-gray-700 font-medium">{item.description}</td>
                          <td className="py-4 text-right text-gray-600">{item.quantity}</td>
                          <td className="py-4 text-right text-gray-600">{data.currency} {item.price.toFixed(2)}</td>
                          <td className="py-4 text-right font-semibold text-gray-900">{data.currency} {(item.quantity * item.price).toFixed(2)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-12">
                 <div className="w-1/2 md:w-1/3 space-y-3">
                    <div className="flex justify-between text-gray-600">
                       <span>Subtotal</span>
                       <span>{data.currency} {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                       <span>Tax ({data.taxRate}%)</span>
                       <span>{data.currency} {calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
                       <span>Total</span>
                       <span>{data.currency} {calculateTotal().toFixed(2)}</span>
                    </div>
                 </div>
              </div>

              {/* Notes */}
              <div className="mt-auto border-t border-gray-100 pt-8">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                 <p className="text-gray-600 text-sm leading-relaxed">{data.notes}</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;