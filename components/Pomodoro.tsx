import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, CheckCircle, Circle, Coffee, Brain, Armchair } from 'lucide-react';
import { Task } from '../types.ts';

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

const MODES: Record<TimerMode, { label: string; minutes: number; color: string; darkColor: string; icon: React.FC<any> }> = {
  FOCUS: { label: 'Focus', minutes: 25, color: 'text-rose-600', darkColor: 'text-rose-400', icon: Brain },
  SHORT_BREAK: { label: 'Short Break', minutes: 5, color: 'text-teal-600', darkColor: 'text-teal-400', icon: Coffee },
  LONG_BREAK: { label: 'Long Break', minutes: 15, color: 'text-indigo-600', darkColor: 'text-indigo-400', icon: Armchair },
};

const Pomodoro: React.FC = () => {
  // Timer State
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES['FOCUS'].minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Play sound here
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalSeconds = MODES[mode].minutes * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Task Logic
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskInput.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setTasks([newTask, ...tasks]);
    setNewTaskInput('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="h-full w-full bg-gray-50 dark:bg-gray-950 p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden transition-colors">
      
      {/* Timer Section */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors">
        {/* Background Progress Bar */}
        <div 
          className="absolute bottom-0 left-0 h-2 bg-gray-100 dark:bg-gray-800 w-full"
        >
          <div 
             className={`h-full transition-all duration-1000 ease-linear ${mode === 'FOCUS' ? 'bg-rose-500' : mode === 'SHORT_BREAK' ? 'bg-teal-500' : 'bg-indigo-500'}`}
             style={{ width: `${getProgress()}%` }}
          />
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-12 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl transition-colors">
          {(Object.keys(MODES) as TimerMode[]).map((m) => {
            const Icon = MODES[m].icon;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{MODES[m].label}</span>
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div className={`text-9xl font-bold tabular-nums tracking-tighter mb-12 ${MODES[mode].color} dark:${MODES[mode].darkColor}`}>
          {formatTime(timeLeft)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg transition-transform active:scale-95 ${
               isActive ? 'bg-gray-900 dark:bg-gray-100 dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-8 text-gray-400 dark:text-gray-500 font-medium">
          {isActive ? 'Stay focused, you got this!' : 'Ready to start?'}
        </p>
      </div>

      {/* Task List Section */}
      <div className="w-full md:w-[400px] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tasks</h2>
             <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
               {activeTaskCount} Remaining
             </span>
          </div>
          
          <form onSubmit={addTask} className="relative">
            <input
              type="text"
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              placeholder="What are you working on?"
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!newTaskInput.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 p-8 text-center">
               <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 transition-colors">
                 <CheckCircle className="w-8 h-8 text-gray-200 dark:text-gray-700" />
               </div>
               <p>No tasks yet. Add one to get started!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  task.completed 
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-75' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`flex-shrink-0 transition-colors ${
                    task.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <span className={`flex-1 text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200 font-medium'}`}>
                  {task.text}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;