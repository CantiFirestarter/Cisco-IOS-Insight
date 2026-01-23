
import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onSelectKey: () => void;
  hasResult: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, hasResult }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={onReset}>
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">
              Cisco IOS Insight
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {hasResult && (
            <button 
              onClick={onReset}
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>New Audit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
