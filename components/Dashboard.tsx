
import React from 'react';
import { AnalysisResult, Severity } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Server, Network, Activity, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  result: AnalysisResult;
}

const Dashboard: React.FC<Props> = ({ result }) => {
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

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 50) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Network Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-none transition-colors duration-300">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 sm:mb-6 uppercase tracking-widest font-black">
            <Network className="w-3 h-3" />
            <span>Node Health</span>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Pass Rate</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-500">{passedCount}</h3>
                  <span className="text-slate-500 text-[10px] font-medium">checks passed</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-2">Hostnames</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {result.detectedDevices.map(d => (
                  <span key={d} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 transition-colors">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-sm italic leading-relaxed prose dark:prose-invert max-w-none">
            <ReactMarkdown components={{ 
              p: ({children}) => <span>"{children}"</span>,
              strong: ({children}) => <strong className="font-black text-slate-900 dark:text-slate-200">{children}</strong>
            }}>
              {result.summary}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Health Score */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 sm:mb-8 uppercase tracking-widest font-black">
          <Shield className="w-3 h-3" />
          <span>Audit Index</span>
        </div>
        <div className="relative">
          <svg className="w-28 h-28 sm:w-40 sm:h-40 transform -rotate-90">
            <circle
              className="text-slate-100 dark:text-slate-800 transition-colors"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="56"
              cy="56"
              style={{ r: 'calc(50% - 6px)', cx: '50%', cy: '50%' }}
            />
            <circle
              className={getScoreColor(result.securityScore)}
              strokeWidth="8"
              strokeDasharray={314} 
              strokeDashoffset={314 * (1 - result.securityScore / 100)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="50"
              cx="56"
              cy="56"
              style={{ r: 'calc(50% - 6px)', cx: '50%', cy: '50%', strokeDasharray: 314, strokeDashoffset: 314 * (1 - result.securityScore / 100) }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl sm:text-4xl font-black ${getScoreColor(result.securityScore)}`}>{result.securityScore}%</span>
            <span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">Score</span>
          </div>
        </div>
        <p className="mt-6 sm:mt-8 text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed px-2">
          {result.securityScore >= 80 ? 'Excellent hygiene.' : result.securityScore >= 50 ? 'Requires alignment.' : 'High risk detection.'}
        </p>
      </div>

      {/* Issues Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm dark:shadow-none transition-colors duration-300">
        <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-[9px] sm:text-[10px] mb-4 uppercase tracking-widest font-black">
          <Activity className="w-3 h-3" />
          <span>Findings Breakdown</span>
        </div>
        <div className="h-40 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={6}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--tw-slate-950)', border: '1px solid var(--tw-slate-800)', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                itemStyle={{ color: '#fff', padding: '2px 0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-2 sm:mt-4">
          {severityData.map((d) => (
            <div key={d.name} className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full mb-0.5 sm:mb-1" style={{ backgroundColor: d.color }}></div>
              <span className="text-[8px] sm:text-[10px] text-slate-500 uppercase font-black">{d.name}</span>
              <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
