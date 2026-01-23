import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 py-6 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
        {/* Top Row: Branding and Links combined on desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
          <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3 h-3 sm:w-4 h-4" />
            <span className="font-bold tracking-widest text-[9px] sm:text-xs uppercase">Cisco IOS Insight</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <a href="/docs/README.html" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">Documentation</a>
            <a href="/docs/USER_GUIDE.html" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">User Guide</a>
            <a href="/docs/PRIVACY_POLICY.html" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">Privacy</a>
            <a href="/docs/TERMS_OF_SERVICE.html" className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">Terms</a>
          </div>
        </div>

        {/* Bottom Section: Legal and Credits tightly stacked */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-[9px] sm:text-xs text-slate-400 dark:text-slate-500/60 max-w-2xl mx-auto italic px-4 leading-relaxed">
            Cisco IOS Insight provides suggestions based on Cisco technical documentation. Operator assumes all responsibility for network changes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <p className="text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-600 font-medium tracking-widest">
              &copy; 2026 Firestarter Forge
            </p>
            <span className="hidden sm:block text-slate-200 dark:text-slate-800">•</span>
            <p className="text-[8px] sm:text-[9px] text-slate-400 dark:text-slate-700">
              Developed by <a href="https://firestarterforge.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500/60 hover:text-blue-500 transition-colors">Canti Firestarter</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;