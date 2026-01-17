
import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/30 py-8 sm:py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
        <div className="flex items-center justify-center space-x-2 text-slate-500">
          <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="font-bold tracking-widest text-[9px] sm:text-xs uppercase">Cisco IOS Insight</span>
        </div>
        <p className="text-[9px] sm:text-xs text-slate-500/60 max-w-2xl mx-auto italic px-4">
          Cisco IOS Insight provides suggestions based on Cisco technical documentation. Operator assumes all responsibility for network changes.
        </p>
        <div className="space-y-1">
          <p className="text-[8px] sm:text-[10px] text-slate-600 font-medium tracking-widest">
            &copy; 2026 Firestarter Forge.
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
