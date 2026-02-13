
import React, { useState } from 'react';
import { AnalysisResult, Severity } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Network, Activity, Cpu, HelpCircle } from 'lucide-react';
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
    { name: 'Info', value: allIssues.filter(i => i.severity === Severity.INFO).length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-500';
    if (score >= 50) return 'text-amber-600 dark:text-amber-500';
    return 'text-red-600 dark:text-red-500';
  };

  // SVG Circumference for radius 40: 2 * PI * 40 = ~251.32
  const circumference = 2 * Math.PI * 40;
  const score = result.securityScore ?? 0;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Network Overview (Inventory) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black">
          <Network className="w-3 h-3" />
          <span>Inventory</span>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-2">Active Hostnames</p>
            <div className="flex flex-wrap gap-1.5">
              {result.detectedDevices.map(d => (
                <span key={d} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono text-slate-700 dark:text-slate-300">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-slate-600 dark:text-slate-400 text-[10px] italic leading-relaxed line-clamp-3">
              <ReactMarkdown components={{ 
                p: ({children}) => <span>"{children}"</span>,
                strong: ({children}) => <strong className="font-black text-slate-900 dark:text-slate-200">{children}</strong>
              }}>
                {result.summary}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* OS Intelligence (Platform Intelligence) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col shadow-sm dark:shadow-none transition-colors duration-300">
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
                <p className="font-bold mb-1 uppercase tracking-widest text-blue-400">Detection Logic</p>
                <p className="opacity-80 leading-relaxed">
                  The AI identifies Cisco OS type (IOS, XE, XR) and version by parsing configuration headers, software images, and kernel-specific CLI syntax.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-3">Detected Architectures</p>
          <div className="space-y-2">
            {result.detectedPlatforms && result.detectedPlatforms.length > 0 ? (
              result.detectedPlatforms.map((platform, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-blue-600/5 dark:bg-blue-500/10 border border-blue-600/10 dark:border-blue-500/20 p-2 rounded-xl">
                  <Cpu className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{platform}</span>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-[10px] italic">No specific version headers detected.</div>
            )}
          </div>
        </div>
      </div>

      {/* Health Score (Audit Index) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black w-full text-left">
          <Shield className="w-3 h-3" />
          <span>Audit Index</span>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle 
              className="text-slate-100 dark:text-slate-800" 
              strokeWidth="8" 
              stroke="currentColor" 
              fill="transparent" 
              r="40" 
              cx="50" 
              cy="50" 
            />
            {/* Progress Circle */}
            <circle
              className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-black leading-none ${getScoreColor(score)}`}>{score}%</span>
            <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Health</span>
          </div>
        </div>
      </div>

      {/* Findings Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-2 uppercase tracking-widest font-black">
          <Activity className="w-3 h-3" />
          <span>Findings Breakdown</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={severityData} innerRadius={28} outerRadius={40} paddingAngle={4} dataKey="value">
                {severityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '9px', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center px-2">
            <div className="text-center">
               <div className="text-[10px] font-black text-red-500">{allIssues.filter(i => i.severity === Severity.CRITICAL).length}</div>
               <div className="text-[7px] text-slate-500 uppercase font-bold">Crit</div>
            </div>
            <div className="text-center">
               <div className="text-[10px] font-black text-amber-500">{allIssues.filter(i => i.severity === Severity.WARNING).length}</div>
               <div className="text-[7px] text-slate-500 uppercase font-bold">Warn</div>
            </div>
            <div className="text-center">
               <div className="text-[10px] font-black text-emerald-500">{passedCount}</div>
               <div className="text-[7px] text-slate-500 uppercase font-bold">Pass</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
