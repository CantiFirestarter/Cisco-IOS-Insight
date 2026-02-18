
import React, { useState, useMemo } from 'react';
import { AnalysisResult, Severity } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Shield, Network, Activity, Cpu, HelpCircle, Server, Globe, Box } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  result: AnalysisResult;
}

const Dashboard: React.FC<Props> = ({ result }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const allIssues = [...result.issues, ...result.networkWideIssues];
  const passedCount = result.successfulChecks.length;
  
  const severityData = [
    { name: 'Critical', value: allIssues.filter(i => i.severity === Severity.CRITICAL).length, color: '#ef4444' },
    { name: 'Warning', value: allIssues.filter(i => i.severity === Severity.WARNING).length, color: '#f59e0b' },
    { name: 'Pass', value: passedCount, color: '#10b981' },
    { name: 'Info', value: allIssues.filter(i => i.severity === Severity.INFO).length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (score >= 50) return 'text-amber-600 dark:text-amber-500';
    return 'text-red-600 dark:text-red-500';
  };

  // Helper to categorize platforms for the Intelligence card
  const platformCategories = useMemo(() => {
    const families: Record<string, { count: number, label: string, color: string }> = {
      'XE': { count: 0, label: 'IOS XE', color: 'bg-blue-600 text-white' },
      'XR': { count: 0, label: 'IOS XR', color: 'bg-indigo-600 text-white' },
      'Classic': { count: 0, label: 'Legacy IOS', color: 'bg-slate-600 text-white' },
      'NXOS': { count: 0, label: 'NX-OS', color: 'bg-emerald-600 text-white' },
      'Other': { count: 0, label: 'Unspecified', color: 'bg-slate-200 text-slate-800' }
    };

    result.detectedPlatforms.forEach(p => {
      const lower = p.toLowerCase();
      if (lower.includes('xe')) families['XE'].count++;
      else if (lower.includes('xr')) families['XR'].count++;
      else if (lower.includes('nx-os') || lower.includes('nexus')) families['NXOS'].count++;
      else if (lower.includes('ios')) families['Classic'].count++;
      else families['Other'].count++;
    });

    return Object.entries(families).filter(([_, data]) => data.count > 0);
  }, [result.detectedPlatforms]);

  // SVG Circumference for radius 40: 2 * PI * 40 = ~251.32
  const circumference = 2 * Math.PI * 40;
  const score = result.securityScore ?? 0;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch">
      {/* TOP ROW: Network Overview (Inventory) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300 md:col-span-12">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black">
          <Network className="w-3 h-3" />
          <span>Inventory & Connectivity Summary</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-full">
           <div className="sm:col-span-1 sm:border-r border-slate-100 dark:border-slate-800 pr-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-600/10 rounded-lg">
                   <Server className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{result.deviceCount}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Nodes</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                {result.detectedDevices.map(d => (
                  <span key={d} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono text-slate-700 dark:text-slate-300">
                    {d}
                  </span>
                ))}
              </div>
           </div>
           <div className="sm:col-span-2">
              <div className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown components={{ 
                  p: ({children}) => <p className="mb-2 italic">"{children}"</p>,
                  strong: ({children}) => <strong className="font-black text-slate-900 dark:text-slate-200">{children}</strong>
                }}>
                  {result.summary}
                </ReactMarkdown>
              </div>
           </div>
        </div>
      </div>

      {/* BOTTOM ROW START */}
      
      {/* Platform Intelligence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300 md:col-span-12 lg:col-span-4 min-h-[220px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-widest font-black">
            <Cpu className="w-3 h-3" />
            <span>Platform Intelligence</span>
          </div>
          <div className="relative">
            <HelpCircle 
              className="w-3 h-3 text-slate-300 dark:text-slate-700 cursor-help hover:text-blue-500 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute right-0 top-5 w-48 p-3 bg-slate-900 text-white text-[9px] rounded-xl border border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <p className="font-bold mb-1 uppercase tracking-widest text-blue-400">Detection Heuristics</p>
                <p className="opacity-80 leading-relaxed italic">
                  Determined by parsing hardware fingerprints (e.g., Slot/Subslot syntax) and system image headers found in the provided configurations.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {/* Visual Distribution Summary */}
          {platformCategories.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                {platformCategories.map(([family, data]) => (
                  <div 
                    key={family} 
                    className={`${data.color.split(' ')[0]} transition-all`} 
                    style={{ width: `${(data.count / result.detectedPlatforms.length) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {platformCategories.map(([family, data]) => (
                  <div key={family} className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${data.color.split(' ')[0]}`}></div>
                    <span className="text-[8px] font-black uppercase text-slate-400">{data.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[140px] overflow-y-auto no-scrollbar">
            {result.detectedPlatforms && result.detectedPlatforms.length > 0 ? (
              result.detectedPlatforms.map((platform, idx) => {
                const isXE = platform.toLowerCase().includes('xe');
                const isXR = platform.toLowerCase().includes('xr');
                const isClassic = platform.toLowerCase().includes('ios') && !isXE && !isXR;
                
                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl transition-all hover:border-blue-500/30">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isXE ? 'bg-blue-600/10 text-blue-600' : isXR ? 'bg-indigo-600/10 text-indigo-600' : isClassic ? 'bg-slate-600/10 text-slate-600' : 'bg-emerald-600/10 text-emerald-600'}`}>
                        {isXR ? <Globe className="w-3 h-3" /> : isXE ? <Box className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{platform}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-[10px] italic">No platform markers detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Index (Health Score) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300 md:col-span-6 lg:col-span-4 min-h-[220px]">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black">
          <Shield className="w-3 h-3" />
          <span>Audit Index</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-slate-100 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              <circle className={`${getScoreColor(score)} transition-all duration-1000 ease-out`} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black leading-none ${getScoreColor(score)}`}>{score}%</span>
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">Health</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats (Findings Breakdown) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300 md:col-span-6 lg:col-span-4 min-h-[220px]">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black">
          <Activity className="w-3 h-3" />
          <span>Findings Breakdown</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie 
                  data={severityData} 
                  innerRadius="65%" 
                  outerRadius="90%" 
                  paddingAngle={4} 
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  stroke="none"
                >
                  {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '9px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 px-1 w-full mt-4">
              <div className="text-center">
                 <div className="text-[11px] font-black text-red-500">{allIssues.filter(i => i.severity === Severity.CRITICAL).length}</div>
                 <div className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">Crit</div>
              </div>
              <div className="text-center">
                 <div className="text-[11px] font-black text-amber-500">{allIssues.filter(i => i.severity === Severity.WARNING).length}</div>
                 <div className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">Warn</div>
              </div>
              <div className="text-center">
                 <div className="text-[11px] font-black text-emerald-500">{passedCount}</div>
                 <div className="text-[7px] text-slate-500 uppercase font-bold tracking-tighter">Pass</div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
