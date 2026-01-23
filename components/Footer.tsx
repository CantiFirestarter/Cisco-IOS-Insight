
import React from 'react';
import { ShieldCheck, FileText, Lock, BookOpen } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/30 py-4 sm:py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2.5 sm:space-y-4">
        <div className="flex items-center justify-center space-x-2 text-slate-500">
          <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-bold tracking-widest text-[9px] sm:text-xs uppercase">Cisco IOS Insight</span>
        </div>
        
        <p className="text-[9px] sm:text-xs text-slate-500/60 max-w-2xl mx-auto italic px-4 leading-tight">
          Cisco IOS Insight provides suggestions based on Cisco technical documentation. Operator assumes all responsibility for network changes.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
          <a href="/docs/PRIVACY_POLICY.html" target="_blank" className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Privacy Policy
          </a>
          <a href="/docs/TERMS_OF_SERVICE.html" target="_blank" className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Terms of Service
          </a>
          <a href="/docs/README.html" target="_blank" className="text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            Docs
          </a>
        </div>

        <div className="space-y-0.5">
          <p className="text-[8px] sm:text-[10px] text-slate-600 font-medium tracking-widest">
            &copy; 2026 Firestarter Forge
          </p>
          <p className="text-[8px] sm:text-[9px] text-slate-700">
            Developed by <a href="https://firestarterforge.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500/50 hover:text-blue-400 transition-colors">Canti Firestarter</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
