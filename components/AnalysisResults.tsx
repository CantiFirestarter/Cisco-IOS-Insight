
import React, { useState, useMemo } from 'react';
import { AnalysisResult, Severity, AnalysisIssue, SuccessfulCheck, BestPractice, ConfigFile, VerificationStep, ChatMessage } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Copy, ChevronDown, ChevronUp, Network, Server, ShieldCheck, Terminal, Layers, Filter, X, Check, Lightbulb, Eye, EyeOff, Cpu, HelpCircle, Globe, ClipboardList, Square, CheckSquare, MessageSquare, Download, ClipboardCheck, Activity, Zap, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfigChat from './ConfigChat';

interface Props {
  result: AnalysisResult;
  files: ConfigFile[];
  chatHistory: ChatMessage[];
  chatDraft: string;
  onUpdateChatHistory: (messages: ChatMessage[]) => void;
  onUpdateChatDraft: (draft: string) => void;
}

interface RemediationItem {
  title: string;
  command: string;
  id: string;
}

const AnalysisResults: React.FC<Props> = ({ 
  result, 
  files,
  chatHistory,
  chatDraft,
  onUpdateChatHistory,
  onUpdateChatDraft
}) => {
  const [activeTab, setActiveTab] = useState<'network' | 'device' | 'compliant' | 'bestPractices' | 'remediation' | 'verify' | 'chat'>('network');
  const [showTooltip, setShowTooltip] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  
  // Filter states
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Stats for the Verify tab cards
  const verifyStats = useMemo(() => {
    let connectivity = 0;
    let operational = 0;
    
    result.verificationSteps.forEach(step => {
      const cmd = step.command.toLowerCase();
      if (cmd.includes('ping') || cmd.includes('trace') || step.category.toLowerCase().includes('connectivity') || step.category.toLowerCase().includes('reachability')) {
        connectivity++;
      } else {
        operational++;
      }
    });
    
    return { connectivity, operational };
  }, [result.verificationSteps]);

  // Group Best Practices by Category
  const groupedBestPractices = useMemo(() => {
    const groups: Record<string, BestPractice[]> = {};
    result.bestPractices.forEach(bp => {
      const cat = bp.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(bp);
    });
    return groups;
  }, [result.bestPractices]);

  // Group Remediation by Category with linked titles and commands
  const groupedRemediation = useMemo(() => {
    const groups: Record<string, RemediationItem[]> = {};
    const allIssues = [...result.issues, ...result.networkWideIssues];
    
    allIssues.forEach((issue, index) => {
      const cat = issue.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({
        id: `${cat}-${index}`,
        title: issue.title,
        command: issue.remediation
      });
    });
    
    return groups;
  }, [result.issues, result.networkWideIssues]);

  const remediationCategories = Object.keys(groupedRemediation).sort();

  // Filtering Logic for Issues and Conflicts
  const filteredItems = useMemo(() => {
    const items = activeTab === 'network' ? result.networkWideIssues : result.issues;
    if (activeTab === 'network' || activeTab === 'device') {
      return items.filter(item => {
        const severityMatch = severityFilter === 'ALL' || item.severity === severityFilter;
        const categoryMatch = categoryFilter === 'ALL' || item.category === categoryFilter;
        return severityMatch && categoryMatch;
      });
    }
    return [];
  }, [activeTab, result.issues, result.networkWideIssues, severityFilter, categoryFilter]);

  // Extract unique categories for filtering
  const availableCategories = useMemo(() => {
    const items = activeTab === 'network' ? result.networkWideIssues : result.issues;
    const cats = new Set<string>();
    items.forEach(i => cats.add(i.category));
    return Array.from(cats).sort();
  }, [activeTab, result.issues, result.networkWideIssues]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSeverityFilter('ALL');
    setCategoryFilter('ALL');
  };

  const toggleStep = (idx: number) => {
    const next = new Set(checkedSteps);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedSteps(next);
  };

  const handleDownloadChecklist = () => {
    const content = result.verificationSteps.map((step, i) => {
      return `[${checkedSteps.has(i) ? 'X' : ' '}] STEP ${i + 1}: ${step.title}\nDEVICE: ${step.affectedDevices.join(', ')}\nCOMMAND: ${step.command}\nEXPECTED: ${step.expectedResult}\n\n`;
    }).join('---\n\n');
    
    const blob = new Blob([`CISCO NETWORK VERIFICATION CHECKLIST\nGenerated: ${new Date().toLocaleString()}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cisco-Verification-Checklist.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFilterActive = severityFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Platform Summary Banner */}
      {result.detectedPlatforms && result.detectedPlatforms.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm dark:shadow-xl dark:shadow-blue-500/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/10 p-2 rounded-xl border border-blue-500/20">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Environment OS Intelligence</h4>
              <div className="flex flex-wrap gap-2">
                {result.detectedPlatforms.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition-all hover:border-blue-500/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <div 
              className="flex items-center gap-2 text-slate-400 dark:text-slate-500 group cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
               <span className="text-[9px] font-bold uppercase tracking-widest group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">OS Detection Logic</span>
               <HelpCircle className="w-3.5 h-3.5" />
            </div>
            {showTooltip && (
              <div className="absolute right-0 top-6 w-56 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  Identified by cross-referencing system version strings, boot images, and kernel-specific features found in the provided configurations.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 px-2 sm:px-4 rounded-t-xl sm:rounded-t-2xl overflow-x-auto no-scrollbar scroll-smooth transition-colors">
        <button
          onClick={() => handleTabChange('network')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'network' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Network className="w-3 h-3" />
          Conflicts ({result.networkWideIssues.length})
          {activeTab === 'network' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('device')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'device' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Server className="w-3 h-3" />
          Issues ({result.issues.length})
          {activeTab === 'device' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('remediation')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'remediation' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Terminal className="w-3 h-3" />
          Fix Plan
          {activeTab === 'remediation' && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-600 dark:bg-amber-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('verify')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'verify' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <ClipboardCheck className="w-3 h-3" />
          Verify ({result.verificationSteps.length})
          {activeTab === 'verify' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('compliant')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'compliant' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          Cisco OK ({result.successfulChecks.length})
          {activeTab === 'compliant' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 dark:bg-emerald-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('bestPractices')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'bestPractices' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          Advisory ({result.bestPractices.length})
          {activeTab === 'bestPractices' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
        <button
          onClick={() => handleTabChange('chat')}
          className={`px-3 py-3 sm:px-6 sm:py-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all relative flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ${
            activeTab === 'chat' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Assistant
          {activeTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {activeTab === 'chat' && (
          <ConfigChat 
            files={files} 
            messages={chatHistory}
            input={chatDraft}
            onUpdateMessages={onUpdateChatHistory}
            onUpdateInput={onUpdateChatDraft}
          />
        )}

        {/* Conflicts & Issues Tab Content */}
        {(activeTab === 'network' || activeTab === 'device') && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-colors">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Filter className="w-3 h-3" />
                Filter:
              </div>
              <select 
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Severities</option>
                {Object.values(Severity).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {isFilterActive && (
                <button 
                  onClick={() => { setSeverityFilter('ALL'); setCategoryFilter('ALL'); }}
                  className="text-[9px] font-black uppercase text-red-600 hover:text-red-500 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.severity === Severity.CRITICAL ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500' :
                          item.severity === Severity.WARNING ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500' :
                          'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.affectedDevices?.map(d => (
                          <span key={d} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-mono text-slate-700 dark:text-slate-300">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{item.title}</h4>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      <ReactMarkdown>{item.description}</ReactMarkdown>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-sm italic">No items found matching the current filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Remediation Fix Plan Content */}
        {activeTab === 'remediation' && (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-5 rounded-2xl flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase tracking-tight">CCIE Architectural Remediation</h4>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-200/60 leading-relaxed italic">
                  Apply commands in a staging environment first. Always use 'checkpoint' or 'archive config' before bulk application.
                </p>
              </div>
            </div>
            {remediationCategories.map(cat => (
              <div key={cat} className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">{cat}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {groupedRemediation[cat].map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.title}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(item.command); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <pre className="p-5 font-mono text-[11px] sm:text-xs text-blue-700 dark:text-blue-400/90 overflow-x-auto custom-scrollbar bg-slate-50 dark:bg-slate-950/30">
                        {item.command}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Tab Content */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-600/5 border border-blue-500/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors">
                 <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                    <Activity className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{verifyStats.connectivity}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Connectivity Checks</div>
                 </div>
              </div>
              <div className="bg-emerald-600/5 border border-emerald-500/10 p-5 rounded-2xl flex items-center gap-4 shadow-sm transition-colors">
                 <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                    <Terminal className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{verifyStats.operational}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operational State</div>
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedural Validation Steps</h3>
               <button 
                onClick={handleDownloadChecklist}
                className="flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-widest"
               >
                 <Download className="w-3 h-3" />
                 Export Checklist
               </button>
            </div>

            <div className="space-y-3">
              {result.verificationSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleStep(idx)}
                  className={`group bg-white dark:bg-slate-900 border transition-all cursor-pointer p-4 sm:p-5 rounded-2xl shadow-sm ${
                    checkedSteps.has(idx) ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 transition-colors ${checkedSteps.has(idx) ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`}>
                      {checkedSteps.has(idx) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                         <span className={`text-sm font-bold transition-colors ${checkedSteps.has(idx) ? 'text-emerald-600 dark:text-emerald-500 line-through opacity-50' : 'text-slate-900 dark:text-white'}`}>
                           {step.title}
                         </span>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                           {step.category}
                         </span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[9px] font-black text-blue-600/60 dark:text-blue-500/60 uppercase tracking-widest">Validation CLI</span>
                           <div className="flex gap-1.5">
                             {step.affectedDevices.map(d => (
                               <span key={d} className="text-[9px] font-mono font-bold text-slate-400">{d}</span>
                             ))}
                           </div>
                        </div>
                        <code className="block text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-3">{step.command}</code>
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 transition-colors">
                           <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">Expected: {step.expectedResult}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cisco OK (Compliant) Tab Content */}
        {activeTab === 'compliant' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.successfulChecks.map((check, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-emerald-500/30 transition-all group animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{check.category}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-emerald-600 transition-colors">{check.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{check.description}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Validated CLI Snippet:</span>
                   </div>
                   <pre className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors overflow-x-auto">
                     {check.validatedConfig}
                   </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Advisory (Best Practices) Tab Content */}
        {activeTab === 'bestPractices' && (
          <div className="space-y-8">
            {Object.keys(groupedBestPractices).map(cat => (
              <div key={cat} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 transition-colors"></div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{cat}</h3>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 transition-colors"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedBestPractices[cat].map((bp, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col h-full animate-in fade-in duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600/10 rounded-xl">
                           <Lightbulb className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight">{bp.title}</h4>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 transition-colors">
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Architectural Rationale:</p>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed italic">{bp.rationale}</p>
                        </div>
                        <div className="pt-2">
                           <p className="text-[11px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-2">Recommendation:</p>
                           <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{bp.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
