
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Moon, Sun, ChevronLeft, KeyRound, Lock } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasResult: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, hasResult, theme, onToggleTheme }) => {
  const [canResetKey, setCanResetKey] = useState(false);

  useEffect(() => {
    // Check if the platform's key selection tool is available
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setCanResetKey(true);
    }
  }, []);

  const handleResetKey = async () => {
    if (!canResetKey) return;
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={onReset}>
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent leading-none">
              Cisco IOS Insight
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center">
            <button
              onClick={handleResetKey}
              disabled={!canResetKey}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all border group relative ${
                canResetKey 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700' 
                  : 'bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 cursor-default'
              }`}
              title={canResetKey ? "Change Personal API Key" : "Secure System Connection Active"}
              aria-label={canResetKey ? "Change API Key" : "Connection Secure"}
            >
              <div className="relative">
                <KeyRound className={`w-3.5 h-3.5 sm:w-4 h-4 transition-transform ${canResetKey ? 'group-hover:rotate-12' : ''}`} />
                {!canResetKey && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse border border-white dark:border-slate-900"></div>
                )}
              </div>
              
              <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">
                {canResetKey ? 'Switch Key' : 'Secure'}
              </span>

              {!canResetKey && (
                <Lock className="w-2.5 h-2.5 opacity-50 hidden sm:block" />
              )}
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-700"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 sm:w-4 h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 h-4" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

          {hasResult && (
            <button 
              onClick={onReset}
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 h-4" />
              <span>New Audit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
