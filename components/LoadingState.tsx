import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoadingStateProps {
  fileCount: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ fileCount }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-24 h-24 sm:w-32 h-32 border-4 border-blue-600/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-2 sm:space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Auditing Network...</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-[250px] sm:max-w-sm">Comparing {fileCount} configurations for inter-device compatibility.</p>
      </div>
    </div>
  );
};

export default LoadingState;