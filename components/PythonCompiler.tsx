import React, { useState, useEffect, useRef } from 'react';
import { Play, Trash2, Terminal, Loader2, Code2 } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

const DEFAULT_CODE = `# Write your Python code here
import sys

def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))
print(f"Python version: {sys.version}")

# Calculations
squares = [x**2 for x in range(5)]
print(f"Squares: {squares}")
`;

const PythonCompiler: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        if ((window as any).loadPyodide) {
           const pyodide = await (window as any).loadPyodide();
           pyodideRef.current = pyodide;
           setIsLoading(false);
        } else {
           setError("Could not load Python runtime. Please check your internet connection.");
           setIsLoading(false);
        }
      } catch (e) {
        console.error("Pyodide init error:", e);
        setError("Failed to initialize Python runtime.");
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodideRef.current) return;
    
    setIsRunning(true);
    setOutput([]); // Clear previous output
    setError(null);

    try {
        // Redirect stdout to capture print statements
        pyodideRef.current.setStdout({
            batched: (msg: string) => {
                setOutput(prev => [...prev, msg]);
            }
        });

        // Run the code
        await pyodideRef.current.runPythonAsync(code);
        
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 p-4 md:p-6 gap-6 overflow-hidden transition-colors">
      
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
         <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
           <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
           <span>Python Compiler</span>
         </div>
         
         <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${isLoading ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30'}`}>
                {isLoading ? "Loading Runtime..." : "Ready"}
            </span>

            <button
              onClick={runCode}
              disabled={isLoading || isRunning}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Run
            </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
         
         {/* Code Editor */}
         <div className="flex-1 flex flex-col min-h-[300px] relative group bg-[#2d2d2d] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-2 bg-[#1e1e1e] border-b border-[#444]">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">main.py</span>
            </div>
            
            <div className="flex-1 relative overflow-auto custom-scrollbar">
                <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.python, 'python')}
                    padding={24}
                    className="font-mono"
                    style={{
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '100%',
                    }}
                    textareaClassName="focus:outline-none"
                />
            </div>
         </div>

         {/* Output Console */}
         <div className="flex-1 flex flex-col min-h-[300px] relative">
             <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center z-10 bg-gray-900/5 dark:bg-gray-900/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Console</span>
                </div>
                <button 
                    onClick={clearOutput}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title="Clear Console"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 w-full p-6 pt-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#1e1e1e] text-gray-300 font-mono text-xs md:text-sm overflow-auto shadow-inner">
                {output.length === 0 && !error && (
                    <div className="text-gray-600 italic">Output will appear here...</div>
                )}
                
                {output.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap border-b border-gray-800/50 last:border-0 pb-0.5 mb-0.5">{line}</div>
                ))}

                {error && (
                    <div className="text-red-400 mt-2 whitespace-pre-wrap border-t border-red-900/50 pt-2">
                        Traceback (most recent call last):<br/>
                        {error}
                    </div>
                )}
                
                {isRunning && (
                    <div className="mt-2 text-blue-400 animate-pulse">Running...</div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default PythonCompiler;