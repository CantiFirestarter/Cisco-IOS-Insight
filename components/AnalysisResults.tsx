
import React, { useState, useMemo } from 'react';
import { AnalysisResult, Severity, AnalysisIssue, SuccessfulCheck, BestPractice, ConfigFile } from '../types';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, Copy, ChevronDown, ChevronUp, Network, Server, ShieldCheck, Terminal, Layers, Filter, X, Check, Lightbulb, Eye, EyeOff, Cpu, HelpCircle, Globe, ClipboardList, Square, CheckSquare, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ConfigChat from './ConfigChat';

interface Props {
  result: AnalysisResult;
  files: ConfigFile[];
}

interface RemediationItem {
  title: string;
  command: string;
  id: string;
}

const AnalysisResults: React.FC<Props> = ({ result, files }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'device' | 'compliant' | 'bestPractices' | 'remediation' | 'chat'>('network');
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Filter states
  const [severityFilter, setSeverityFilter] = useState<Severity | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

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

  const bestPracticeCategories = Object.keys(groupedBestPractices);

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

  const isFilterActive = severityFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Platform Summary Banner - Theme Responsive */}
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
            activeTab === 'chat' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3 h-3" />
          Assistant
          {activeTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full"></div>}
        </button>
      </div>

      {/* Filter Bar (Only for specific tabs) */}
      {(activeTab === 'network' || activeTab === 'device') && (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex flex-wrap items-center gap-3 sm:gap-6 shadow-sm dark:shadow-none transition-colors">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Filter By</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value={Severity.CRITICAL}>Critical</option>
              <option value={Severity.WARNING}>Warning</option>
              <option value={Severity.INFO}>Info</option>
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Domains</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {isFilterActive && (
            <button 
              onClick={() => { setSeverityFilter('ALL'); setCategoryFilter('ALL'); }}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ml-auto"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {activeTab === 'chat' && (
          <ConfigChat files={files} />
        )}

        {activeTab === 'network' && (
          filteredItems.length > 0 ? (
            filteredItems.map((issue, idx) => (
              <IssueCard key={`net-${idx}`} issue={issue as AnalysisIssue} isNetworkWide={true} />
            ))
          ) : (
            <EmptyState message={isFilterActive ? "No conflicts match the selected filters." : "No inter-device architectural conflicts detected."} />
          )
        )}

        {activeTab === 'device' && (
          filteredItems.length > 0 ? (
            filteredItems.map((issue, idx) => (
              <IssueCard key={`dev-${idx}`} issue={issue as AnalysisIssue} />
            ))
          ) : (
            <EmptyState message={isFilterActive ? "No issues match the selected filters." : "No device-level issues detected."} />
          )
        )}

        {activeTab === 'remediation' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm dark:shadow-none transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-600/10 p-2.5 rounded-xl border border-amber-600/20">
                  <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Consolidated Implementation Plan</h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Selectively aggregate CLI remediation grouped by domain.</p>
                </div>
              </div>

              {remediationCategories.length > 0 ? (
                <div className="space-y-8">
                  {remediationCategories.map(category => (
                    <RemediationGroup key={category} category={category} items={groupedRemediation[category]} />
                  ))}
                </div>
              ) : (
                <EmptyState message="No remediation steps required for this environment." />
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliant' && (
          result.successfulChecks.length > 0 ? (
            result.successfulChecks.map((check, idx) => (
              <SuccessCard key={`success-${idx}`} check={check} />
            ))
          ) : (
            <EmptyState message="No Cisco compliance benchmarks identified." />
          )
        )}

        {activeTab === 'bestPractices' && (
          <div className="space-y-8">
            {bestPracticeCategories.length > 0 && (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 mb-4">
                   <Layers className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                   <h5 className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest">Architectural Advisory Distribution</h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {bestPracticeCategories.map(cat => (
                    <div key={cat} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
                       <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white tracking-tight">{cat}</span>
                       <span className="bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-black">{groupedBestPractices[cat].length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bestPracticeCategories.length > 0 ? (
              bestPracticeCategories.map(category => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{category}</h3>
                    <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {groupedBestPractices[category].map((bp, idx) => (
                      <BestPracticeCard key={`${category}-${idx}`} bp={bp} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="No architectural advisories were generated for this environment." />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-white dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl py-12 sm:py-20 px-4 sm:px-8 text-center flex flex-col items-center">
    <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-700 mb-3 sm:mb-4" />
    <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-[200px] sm:max-w-xs">{message}</p>
  </div>
);

const RemediationGroup: React.FC<{ category: string; items: RemediationItem[] }> = ({ category, items }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(items.map(i => i.id)));
  const [copied, setCopied] = useState(false);
  
  const toggleItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };

  const selectedCommands = useMemo(() => {
    return items
      .filter(i => selectedIds.has(i.id))
      .map(i => i.command)
      .join('\n\n');
  }, [items, selectedIds]);

  const handleCopySelected = async () => {
    if (!selectedCommands) return;
    try {
      await navigator.clipboard.writeText(selectedCommands);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy CLI commands:', err);
    }
  };

  return (
    <div className="space-y-4 border-l-2 border-slate-100 dark:border-slate-800 pl-4 sm:pl-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {category}
          </h4>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleAll}
              className="text-[9px] font-black text-blue-600 dark:text-blue-500 hover:text-blue-700 uppercase tracking-widest transition-colors"
            >
              {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">• {selectedIds.size} / {items.length} Selected</span>
          </div>
        </div>
        <button 
          onClick={handleCopySelected}
          disabled={selectedIds.size === 0}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
            copied 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
            : selectedIds.size === 0 
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-50'
              : 'bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied Selected!' : `Copy Selected ${category}`}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div 
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-500/40 text-blue-900 dark:text-blue-200' 
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold leading-tight tracking-tight uppercase">{item.title}</span>
            </div>
          );
        })}
      </div>

      <div className="relative group">
        <div className={`bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-[10px] sm:text-[13px] whitespace-pre overflow-x-auto custom-scrollbar shadow-inner max-h-[400px] transition-all duration-300 ${
          selectedIds.size === 0 ? 'opacity-30 blur-[2px]' : 'text-emerald-700 dark:text-emerald-400/90'
        }`}>
          {selectedCommands || "# No issues selected for remediation."}
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Terminal className="w-4 h-4 text-slate-400 dark:text-slate-700" />
        </div>
      </div>
    </div>
  );
};

const BestPracticeCard: React.FC<{ bp: BestPractice }> = ({ bp }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl border-l-4 border-l-blue-600 dark:border-l-blue-500 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-lg ${isOpen ? 'ring-1 ring-blue-500/10 dark:ring-blue-900/30 shadow-blue-500/5' : ''}`}>
      <div 
        className="p-4 sm:p-6 flex items-start justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex space-x-3 sm:space-x-6 items-start overflow-hidden flex-1">
          <div className="bg-blue-600/5 dark:bg-blue-500/10 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-blue-600/10 dark:border-blue-500/20 shrink-0">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="space-y-1 sm:space-y-2 overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-2">
               <span className="text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 rounded sm:rounded-lg uppercase tracking-widest bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/10 dark:border-blue-500/20">
                 Advisory
               </span>
               <span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                 {bp.category}
               </span>
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-xl tracking-tight truncate">{bp.title}</h4>
            {!isOpen && <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm line-clamp-1 italic">Explore the rationale and recommendation...</p>}
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-600 self-center ml-2 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-6 sm:h-6" /> : <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-1 sm:pt-2 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Context & Rationale</h5>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed prose dark:prose-invert max-w-none bg-slate-50 dark:bg-slate-950/40 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 italic">
                <ReactMarkdown components={{
                  strong: ({children}) => <strong className="font-bold text-blue-600 dark:text-blue-400">{children}</strong>
                }}>
                  {bp.rationale}
                </ReactMarkdown>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Implementation Guidance</h5>
              </div>
              <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed prose dark:prose-invert max-w-none p-1">
                <ReactMarkdown components={{
                  strong: ({children}) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
                }}>
                  {bp.recommendation}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SuccessCard: React.FC<{ check: SuccessfulCheck }> = ({ check }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(check.validatedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy validated CLI:', err);
    }
  };

  const isMultiPlatform = (check.iosVersions?.length || 0) > 1;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl border-l-4 border-l-emerald-600 dark:border-l-emerald-500 overflow-hidden transition-all duration-300 shadow-sm dark:shadow-lg ${isOpen ? 'ring-1 ring-emerald-500/10 dark:ring-emerald-900/30' : ''}`}>
      <div 
        className="p-4 sm:p-6 flex items-start justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex space-x-3 sm:space-x-6 items-start overflow-hidden flex-1">
          <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-600/5 dark:bg-emerald-500/10 border border-emerald-600/10 dark:border-emerald-500/20 shrink-0">
            <ShieldCheck className="text-emerald-600 dark:text-emerald-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-1 sm:space-y-2 overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-lg uppercase tracking-widest bg-emerald-600/10 text-emerald-600 dark:text-emerald-500 border border-emerald-600/10 dark:border-emerald-500/20">
                Validated
              </span>
              
              {/* Platform Versions Badges */}
              <div className="flex flex-wrap items-center gap-1">
                {isMultiPlatform && (
                  <span className="text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-blue-600 text-white flex items-center gap-1">
                    <Globe className="w-2 h-2" />
                    Multi-Platform
                  </span>
                )}
                {check.iosVersions?.map((v, i) => (
                  <span key={i} className="text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                    <Cpu className="w-2 h-2 text-blue-500" />
                    {v}
                  </span>
                ))}
              </div>

              <span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest truncate">
                {check.category}
              </span>
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-xl tracking-tight truncate">{check.title}</h4>
            {!isOpen && <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm line-clamp-1">{check.description}</p>}
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-600 self-center ml-2 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-6 sm:h-6" /> : <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-1 sm:pt-2 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1 sm:space-y-2">
            <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Validation & Benefit</h5>
            <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-base leading-relaxed prose dark:prose-invert prose-emerald max-w-none bg-slate-50 dark:bg-slate-950/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
              <ReactMarkdown components={{
                strong: ({children}) => <strong className="font-bold text-emerald-600 dark:text-emerald-400">{children}</strong>
              }}>
                {check.description}
              </ReactMarkdown>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Cisco Nodes</h5>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {check.affectedDevices.map(dev => (
                <div key={dev} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors">
                  <div className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-500"></div>
                  <span className="text-[10px] sm:text-xs font-mono text-emerald-700 dark:text-emerald-300/80">{dev}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Validated CLI</h5>
              <button 
                onClick={handleCopy}
                className={`flex items-center justify-center space-x-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
                  copied 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                  : 'bg-emerald-600/5 text-emerald-600 dark:text-emerald-500 border-emerald-600/10 dark:border-emerald-500/10 hover:bg-emerald-600/10 transition-colors'
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy snippet'}</span>
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[10px] sm:text-sm text-emerald-700 dark:text-emerald-400/90 whitespace-pre overflow-x-auto custom-scrollbar transition-colors">
              {check.validatedConfig}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IssueCard: React.FC<{ issue: AnalysisIssue; isNetworkWide?: boolean }> = ({ issue, isNetworkWide }) => {
  const [isOpen, setIsOpen] = useState(isNetworkWide || false);
  const [copiedRemediation, setCopiedRemediation] = useState(false);
  const [copiedAffected, setCopiedAffected] = useState(false);
  const [isFullAffectedExpanded, setIsFullAffectedExpanded] = useState(false);

  const TRUNCATION_THRESHOLD = 8; // lines

  const handleCopy = async (text: string, type: 'remediation' | 'affected') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'remediation') {
        setCopiedRemediation(true);
        setTimeout(() => setCopiedRemediation(false), 2000);
      } else {
        setCopiedAffected(true);
        setTimeout(() => setCopiedAffected(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy CLI commands:', err);
    }
  };

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL:
        return { icon: <ShieldAlert className="text-red-600 dark:text-red-500" />, border: 'border-l-red-600 dark:border-l-red-500', bg: 'bg-red-600/5 dark:bg-red-500/10', label: 'Critical', text: 'text-red-700 dark:text-red-400' };
      case Severity.WARNING:
        return { icon: <AlertTriangle className="text-amber-600 dark:text-amber-500" />, border: 'border-l-amber-600 dark:border-l-amber-500', bg: 'bg-amber-600/5 dark:bg-amber-500/10', label: 'Warning', text: 'text-amber-700 dark:text-amber-400' };
      default:
        return { icon: <Info className="text-blue-600 dark:text-blue-500" />, border: 'border-l-blue-600 dark:border-l-blue-500', bg: 'bg-blue-600/5 dark:bg-blue-500/10', label: 'Info', text: 'text-blue-700 dark:text-blue-400' };
    }
  };

  const styles = getSeverityStyles(issue.severity);

  const affectedLines = issue.affectedConfig ? issue.affectedConfig.split('\n') : [];
  const lineCount = affectedLines.length;
  const needsTruncation = lineCount > TRUNCATION_THRESHOLD;
  const displayedAffectedConfig = (needsTruncation && !isFullAffectedExpanded) 
    ? affectedLines.slice(0, TRUNCATION_THRESHOLD).join('\n') + '\n...' 
    : issue.affectedConfig;

  const isMultiPlatform = (issue.iosVersions?.length || 0) > 1;

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl border-l-4 ${styles.border} overflow-hidden transition-all duration-300 shadow-sm dark:shadow-lg ${isOpen ? 'ring-1 ring-slate-200 dark:ring-slate-800' : ''}`}>
      <div 
        className="p-4 sm:p-6 flex items-start justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex space-x-3 sm:space-x-6 items-start overflow-hidden flex-1">
          <div className={`p-2 sm:p-4 rounded-lg sm:rounded-xl ${styles.bg} border border-slate-200 dark:border-white/5 shrink-0 transition-colors`}>
            {React.cloneElement(styles.icon as React.ReactElement<any>, { className: `${(styles.icon as any).props.className} w-5 h-5 sm:w-6 sm:h-6` })}
          </div>
          <div className="space-y-1 sm:space-y-2 overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className={`text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-lg uppercase tracking-widest ${styles.bg} ${styles.text} border border-slate-200 dark:border-white/5`}>
                {styles.label}
              </span>

              {/* Platform Versions Badges */}
              <div className="flex flex-wrap items-center gap-1">
                {isMultiPlatform && (
                  <span className="text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-blue-600 text-white flex items-center gap-1">
                    <Globe className="w-2 h-2" />
                    Multi-Platform
                  </span>
                )}
                {issue.iosVersions?.map((v, i) => (
                  <span key={i} className="text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-sm">
                    <Cpu className="w-2.5 h-2.5 text-blue-500" />
                    {v}
                  </span>
                ))}
              </div>

              <span className="text-[8px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest flex items-center gap-1 sm:gap-1.5">
                {isNetworkWide ? <Network className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Server className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {issue.category}
              </span>
            </div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm sm:text-xl tracking-tight truncate">{issue.title}</h4>
            {!isOpen && <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-sm line-clamp-1">{issue.description}</p>}
          </div>
        </div>
        <div className="text-slate-400 dark:text-slate-600 self-center ml-2 shrink-0">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-6 sm:h-6" /> : <ChevronDown className="w-4 h-4 sm:w-6 sm:h-6" />}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 sm:pb-8 pt-1 sm:pt-2 space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1 sm:space-y-2">
            <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact</h5>
            <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-base leading-relaxed prose dark:prose-invert max-w-none transition-colors">
              <ReactMarkdown components={{
                strong: ({children}) => <strong className={`font-bold ${styles.text}`}>{children}</strong>
              }}>
                {issue.description}
              </ReactMarkdown>
            </div>
          </div>

          {issue.affectedDevices && issue.affectedDevices.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Involved Nodes</h5>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {issue.affectedDevices.map(dev => (
                  <div key={dev} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors">
                    <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] sm:text-xs font-mono text-blue-700 dark:text-blue-300">{dev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.affectedConfig && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Violating Snippet</h5>
                  <span className="bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    {lineCount} {lineCount === 1 ? 'line' : 'lines'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {needsTruncation && (
                    <button 
                      onClick={() => setIsFullAffectedExpanded(!isFullAffectedExpanded)}
                      className="flex items-center gap-1 text-[8px] sm:text-[9px] font-black text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
                    >
                      {isFullAffectedExpanded ? <><EyeOff className="w-3 h-3" /> Show Less</> : <><Eye className="w-3 h-3" /> Show All</>}
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCopy(issue.affectedConfig!, 'affected'); }}
                    className={`flex items-center justify-center space-x-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
                      copiedAffected 
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                      : 'bg-blue-600/5 text-blue-600 dark:text-blue-500 border-blue-600/10 dark:border-blue-500/10 hover:bg-blue-600/10 transition-colors'
                    }`}
                  >
                    {copiedAffected ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedAffected ? 'Copied!' : 'Copy snippet'}</span>
                  </button>
                </div>
              </div>
              <div className={`bg-slate-50 dark:bg-slate-950 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[10px] sm:text-sm text-blue-700 dark:text-blue-400/90 whitespace-pre overflow-x-auto custom-scrollbar transition-all duration-300 ${isFullAffectedExpanded ? 'max-h-[1000px]' : 'max-h-[300px]'}`}>
                {displayedAffectedConfig}
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <h5 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Remediation CLI</h5>
                <div className="flex items-center gap-1 bg-amber-600/5 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-600/10 dark:border-amber-500/20 transition-colors">
                  <AlertTriangle className="w-2 h-2 text-amber-600 dark:text-amber-500" />
                  <span className="text-[7px] sm:text-[8px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight">Vet first</span>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleCopy(issue.remediation, 'remediation'); }}
                className={`flex items-center justify-center space-x-1.5 text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
                  copiedRemediation 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
                  : 'bg-emerald-600/5 text-emerald-600 dark:text-emerald-500 border-emerald-600/10 dark:border-emerald-500/10 hover:bg-emerald-600/10 transition-colors'
                }`}
              >
                {copiedRemediation ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRemediation ? 'Copied!' : 'Copy commands'}</span>
              </button>
            </div>
            <div className="group relative">
               <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[10px] sm:text-sm text-emerald-700 dark:text-emerald-400 whitespace-pre overflow-x-auto shadow-inner transition-colors custom-scrollbar">
                {issue.remediation}
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                <Terminal className="w-3 h-3 text-slate-300 dark:text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
