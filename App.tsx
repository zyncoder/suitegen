import React, { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Menu, Command, Timer, Moon, Sun, Braces, Link, Code2 } from 'lucide-react';
import MarkdownToPdf from './components/MarkdownToPdf';
import InvoiceGenerator from './components/InvoiceGenerator';
import Pomodoro from './components/Pomodoro';
import JsonBeautifier from './components/JsonBeautifier';
import SharedClipboard from './components/SharedClipboard';
import PythonCompiler from './components/PythonCompiler';
import { AppTool } from './types';

const App: React.FC = () => {
  // Initialize state based on URL
  const [activeTool, setActiveTool] = useState<AppTool>(() => {
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const toolParam = params.get('tool');
        if (toolParam === 'clipboard') return AppTool.SHARED_CLIPBOARD;
        if (toolParam === 'python') return AppTool.PYTHON_COMPILER;
    }
    return AppTool.MD_TO_PDF;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Auto-close sidebar on mobile selection & Update URL
  const handleToolChange = (tool: AppTool) => {
    setActiveTool(tool);
    setIsSidebarOpen(false);
    
    // Clean URL when switching away from specific tools to avoid confusion
    if (window.location.search.includes('room=')) {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('room');
            url.searchParams.delete('tool');
            window.history.pushState({}, '', url.pathname); 
        } catch (e) {
            console.warn("Could not update history (likely sandbox environment):", e);
        }
    }
  };

  const getHeaderTitle = () => {
    switch (activeTool) {
      case AppTool.MD_TO_PDF: return 'MD to PDF';
      case AppTool.INVOICE_GENERATOR: return 'Invoice Gen';
      case AppTool.POMODORO: return 'Focus Timer';
      case AppTool.JSON_BEAUTIFIER: return 'JSON Beautifier';
      case AppTool.SHARED_CLIPBOARD: return 'Shared Clipboard';
      case AppTool.PYTHON_COMPILER: return 'Python Compiler';
      default: return 'SuiteGen';
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          no-print
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Command className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              SuiteGen
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Tools</div>
            
            <button
              onClick={() => handleToolChange(AppTool.MD_TO_PDF)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.MD_TO_PDF 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <FileText className={`w-5 h-5 ${activeTool === AppTool.MD_TO_PDF ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              Markdown to PDF
            </button>

            <button
              onClick={() => handleToolChange(AppTool.INVOICE_GENERATOR)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.INVOICE_GENERATOR
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <FileSpreadsheet className={`w-5 h-5 ${activeTool === AppTool.INVOICE_GENERATOR ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              Invoice Generator
            </button>

            <button
              onClick={() => handleToolChange(AppTool.POMODORO)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.POMODORO
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <Timer className={`w-5 h-5 ${activeTool === AppTool.POMODORO ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              Focus Timer
            </button>

            <button
              onClick={() => handleToolChange(AppTool.JSON_BEAUTIFIER)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.JSON_BEAUTIFIER
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <Braces className={`w-5 h-5 ${activeTool === AppTool.JSON_BEAUTIFIER ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              JSON Beautifier
            </button>
            
            <button
              onClick={() => handleToolChange(AppTool.PYTHON_COMPILER)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.PYTHON_COMPILER
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <Code2 className={`w-5 h-5 ${activeTool === AppTool.PYTHON_COMPILER ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              Python Compiler
            </button>

            <button
              onClick={() => handleToolChange(AppTool.SHARED_CLIPBOARD)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTool === AppTool.SHARED_CLIPBOARD
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm border border-blue-100 dark:border-blue-900/30' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <Link className={`w-5 h-5 ${activeTool === AppTool.SHARED_CLIPBOARD ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
              Shared Clipboard
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
            
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

             <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 text-white shadow-lg">
                <p className="text-xs font-medium text-gray-300 mb-1">Pro Tip</p>
                <p className="text-xs leading-relaxed text-gray-400">Save your documents as PDF using the built-in print functionality.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between no-print z-10 transition-colors">
           <div className="flex items-center gap-3">
             <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
             >
               <Menu className="w-5 h-5" />
             </button>
             <span className="font-semibold text-gray-900 dark:text-white">
                {getHeaderTitle()}
             </span>
           </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-hidden relative">
          {activeTool === AppTool.MD_TO_PDF && <MarkdownToPdf />}
          {activeTool === AppTool.INVOICE_GENERATOR && <InvoiceGenerator />}
          {activeTool === AppTool.POMODORO && <Pomodoro />}
          {activeTool === AppTool.JSON_BEAUTIFIER && <JsonBeautifier />}
          {activeTool === AppTool.SHARED_CLIPBOARD && <SharedClipboard />}
          {activeTool === AppTool.PYTHON_COMPILER && <PythonCompiler />}
        </div>

      </main>
    </div>
  );
};

export default App;