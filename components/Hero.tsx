
import React from 'react';
import { Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto mb-8 sm:mb-12">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-4">
        <Zap className="w-3 h-3" />
        Cisco Validated Knowledge
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
        IOS Config <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4 sm:underline-offset-8">Insight.</span>
      </h2>
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed px-4">
        Auditing configurations against Cisco Validated Designs (CVD) and CCIE-level architectural standards to identify security vulnerabilities and inter-device inconsistencies.
      </p>
    </div>
  );
};

export default Hero;
