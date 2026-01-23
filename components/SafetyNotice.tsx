import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SafetyNotice: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 my-6 sm:my-8 shadow-sm dark:shadow-none transition-colors">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-amber-500/10 rounded-xl sm:rounded-2xl shrink-0">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-500" />
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-amber-700 dark:text-amber-500 font-bold text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
            Professional Safety Notice
          </h3>
          <p className="text-slate-700 dark:text-amber-200/70 text-xs sm:text-sm leading-relaxed">
            Designed for <span className="font-bold text-amber-800 dark:text-amber-200 underline decoration-amber-500/30 underline-offset-2">CCIE/CCNP level Professionals</span>. Do not apply commands without expert verification. 
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-1 sm:pt-2">
            <ul className="space-y-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium list-disc pl-4">
              <li><span className="text-slate-900 dark:text-slate-300 font-bold">Outage Risk:</span> L2/L3 changes can trigger outages.</li>
              <li><span className="text-slate-900 dark:text-slate-300 font-bold">Hallucination:</span> AI may output invalid syntax.</li>
            </ul>
            <ul className="space-y-1 text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium list-disc pl-4">
              <li><span className="text-slate-900 dark:text-slate-300 font-bold">Context:</span> AI lacks physical site awareness.</li>
              <li><span className="text-slate-900 dark:text-slate-300 font-bold">Security:</span> Hardening may block management.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyNotice;