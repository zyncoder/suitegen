import React, { useState } from 'react';
import { Braces, Copy, Minimize, Maximize, Trash2, Check, FileJson } from 'lucide-react';

const JsonBeautifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatJson = (space: number | string) => {
    try {
      if (!input.trim()) {
          setOutput('');
          setError(null);
          return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
      setOutput('');
    }
  };

  const handleBeautify = () => formatJson(2);
  const handleMinify = () => formatJson(0);

  const handleCopy = () => {
    if(!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
      setInput('');
      setOutput('');
      setError(null);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4 md:p-6 gap-6 overflow-hidden transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
           <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
             <FileJson className="w-5 h-5 text-blue-600 dark:text-blue-400" />
             <span>JSON Formatter</span>
           </div>
           
           <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBeautify}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-sm font-medium transition-colors"
              >
                <Maximize className="w-4 h-4" />
                Beautify
              </button>
              <button
                onClick={handleMinify}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Minimize className="w-4 h-4" />
                Minify
              </button>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
           </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
             {/* Input */}
             <div className="flex-1 flex flex-col min-h-[300px] relative group">
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center pointer-events-none">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-white dark:bg-gray-900 px-2 rounded">Input</span>
                </div>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 w-full p-6 pt-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors shadow-sm focus:shadow-md"
                    placeholder="Paste your raw JSON here..."
                    spellCheck={false}
                />
             </div>

             {/* Output */}
             <div className="flex-1 flex flex-col min-h-[300px] relative">
                 <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center pointer-events-none z-10">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-[#151b23] px-2 rounded">Output</span>
                    {error && (
                        <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                            {error}
                        </span>
                    )}
                </div>
                <textarea
                    readOnly
                    value={output}
                    className={`flex-1 w-full p-6 pt-10 rounded-xl border ${
                        error ? 'border-red-300 dark:border-red-900' : 'border-gray-200 dark:border-gray-800'
                    } bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-blue-100 font-mono text-xs md:text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors shadow-inner`}
                    placeholder="Formatted result will appear here..."
                    spellCheck={false}
                />
             </div>
        </div>
    </div>
  );
};

export default JsonBeautifier;