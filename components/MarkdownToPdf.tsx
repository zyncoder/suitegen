import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Printer, FileText, Loader2 } from 'lucide-react';
import { DEFAULT_MARKDOWN } from '../types';
import html2pdf from 'html2pdf.js';

const MarkdownToPdf: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    const element = printRef.current;
    const opt = {
      margin: 10,
      filename: 'document.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
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

  return (
    <div className="flex h-full flex-col md:flex-row gap-6 p-6 overflow-hidden">
      {/* Editor Pane - Hidden on Print */}
      <div className="flex-1 flex flex-col min-h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 no-print transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl transition-colors">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Markdown Editor</span>
          </div>
        </div>

        <textarea
          className="flex-1 w-full p-6 resize-none focus:outline-none font-mono text-sm text-gray-800 dark:text-gray-300 bg-transparent placeholder-gray-400 dark:placeholder-gray-600"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="# Start typing your markdown here..."
        />
      </div>

      {/* Preview Pane */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative transition-colors">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 no-print transition-colors">
          <span className="font-medium text-gray-700 dark:text-gray-200">Preview</span>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : 'Save as PDF'}
          </button>
        </div>
        
        {/* Note: The preview container inside stays white to simulate paper/PDF output accurately */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-4 md:p-8 transition-colors">
          {/* We ref this specific container for PDF generation */}
          <div ref={printRef} className="bg-white min-h-full shadow-sm p-8 md:p-12 mx-auto max-w-3xl print-container">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-blue-600 text-gray-900">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownToPdf;