
import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onReset: () => void;
  onSelectKey: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onReset, onSelectKey }) => {
  return (
    <div className="bg-red-900/20 border border-red-500/50 p-4 sm:p-6 rounded-2xl flex items-start space-x-3 sm:space-x-4 text-red-200 mt-4 sm:mt-6 max-w-2xl mx-auto">
      <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-bold text-base sm:text-lg mb-1">Audit Failed</p>
        <p className="text-xs sm:text-sm opacity-90">{error}</p>
        <div className="flex gap-4 mt-6">
          <button 
            onClick={onReset}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-red-400 transition-colors shadow-lg shadow-red-500/20"
          >
            Reset & Try Again
          </button>
          <button 
            onClick={onSelectKey}
            className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-slate-700 transition-colors"
          >
            Change API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
