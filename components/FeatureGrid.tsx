
import React from 'react';
import { Activity, Terminal, ShieldAlert } from 'lucide-react';

const FeatureGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
      <FeatureCard 
        icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />}
        title="Cross-Device Sync"
        description="Detect MTU mismatches and routing inconsistencies between connected nodes."
      />
      <FeatureCard 
        icon={<Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />}
        title="Bulk Auditing"
        description="Analyze dozens of device configurations in one single operation."
      />
      <FeatureCard 
        icon={<ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />}
        title="Conflict Detection"
        description="Identify duplicate IP addresses or VLAN pruning errors instantly."
      />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl hover:border-blue-500/30 transition-all hover:-translate-y-1">
    <div className="bg-slate-950 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-inner border border-slate-800">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-xs sm:text-sm">{description}</p>
  </div>
);

export default FeatureGrid;
