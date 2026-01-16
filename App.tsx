
import React, { useState } from 'react';
import { analyzeCiscoConfigs } from './services/geminiService';
import { AnalysisResult, AppState, ConfigFile } from './types';
import Dashboard from './components/Dashboard';
import ConfigUploader from './components/ConfigUploader';
import AnalysisResults from './components/AnalysisResults';
import { ShieldAlert, Terminal, Activity, Network, ChevronLeft, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    files: [],
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const handleAnalyze = async (stagedFiles: ConfigFile[]) => {
    if (stagedFiles.length === 0) return;

    setState(prev => ({ 
      ...prev, 
      isAnalyzing: true, 
      error: null, 
      files: stagedFiles 
    }));

    try {
      const result = await analyzeCiscoConfigs(stagedFiles);
      setState(prev => ({ ...prev, isAnalyzing: false, result }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
    }
  };

  const handleReset = () => {
    setState({
      files: [],
      isAnalyzing: false,
      result: null,
      error: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={handleReset}>
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Cisco IOS Insight
            </h1>
          </div>
          
          {state.result && (
            <button 
              onClick={handleReset}
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>New Audit</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
        {!state.result && !state.isAnalyzing && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
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

            <ConfigUploader onAnalyze={handleAnalyze} />

            {/* Safety Warning Section - Mobile Optimized */}
            <div className="max-w-4xl mx-auto bg-amber-500/5 border border-amber-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 my-6 sm:my-8">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-amber-500/10 rounded-xl sm:rounded-2xl">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-amber-500 font-bold text-base sm:text-lg flex items-center gap-2 uppercase tracking-tight">
                    Professional Safety Notice
                  </h3>
                  <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed">
                    Designed for <span className="font-bold text-amber-200">CCIE/CCNP level Professionals</span>. Do not apply commands without expert verification. 
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 pt-1 sm:pt-2">
                    <ul className="space-y-1 text-[10px] sm:text-[11px] text-slate-400 font-medium list-disc pl-4">
                      <li><span className="text-slate-300">Outage Risk:</span> L2/L3 changes can trigger outages.</li>
                      <li><span className="text-slate-300">Hallucination:</span> AI may output invalid syntax.</li>
                    </ul>
                    <ul className="space-y-1 text-[10px] sm:text-[11px] text-slate-400 font-medium list-disc pl-4">
                      <li><span className="text-slate-300">Context:</span> AI lacks physical site awareness.</li>
                      <li><span className="text-slate-300">Security:</span> Hardening may block management.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
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
          </div>
        )}

        {state.isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-6 sm:space-y-8">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 h-32 border-4 border-blue-600/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 border-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Auditing Network...</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-[250px] sm:max-w-sm">Comparing {state.files.length} configurations for inter-device compatibility.</p>
            </div>
          </div>
        )}

        {state.result && (
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-amber-500/10 border border-amber-500/20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3">
              <AlertTriangle className="w-3 h-3 sm:w-4 h-4 text-amber-500" />
              <span className="text-[9px] sm:text-xs font-bold text-amber-200 uppercase tracking-widest">Verify all CLI commands before application</span>
            </div>
            <Dashboard result={state.result} />
            <AnalysisResults result={state.result} />
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 sm:p-6 rounded-2xl flex items-start space-x-3 sm:space-x-4 text-red-200 mt-4 sm:mt-6 max-w-2xl mx-auto">
            <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-base sm:text-lg mb-1">Audit Failed</p>
              <p className="text-xs sm:text-sm opacity-90">{state.error}</p>
              <button 
                onClick={handleReset}
                className="mt-4 sm:mt-6 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-red-500 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-red-400 transition-colors shadow-lg shadow-red-500/20"
              >
                Reset & Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/30 py-8 sm:py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-bold tracking-widest text-[9px] sm:text-xs uppercase">Cisco IOS Insight</span>
          </div>
          <p className="text-[9px] sm:text-xs text-slate-500/60 max-w-2xl mx-auto italic px-4">
            Cisco IOS Insight provides suggestions based on Cisco technical documentation. Operator assumes all responsibility for network changes.
          </p>
          <p className="text-[8px] sm:text-[10px] text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} Firestarter Forge.
          </p>
        </div>
      </footer>
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

export default App;
