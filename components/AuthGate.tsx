
import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Zap, Info, ShieldCheck, CreditCard, Lock } from 'lucide-react';

interface AuthGateProps {
  onSelectKey: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSelectKey }) => {
  const [isAiStudio, setIsAiStudio] = useState(false);

  useEffect(() => {
    // Check if the secure platform selection tool is available
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsAiStudio(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4">
      <div className="max-w-md w-full space-y-8 text-center bg-slate-900/50 border border-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/30">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cisco IOS Insight</h1>
          <p className="text-slate-400 text-sm leading-relaxed px-4">
            To perform CCIE-level architectural audits, you must authenticate using your own Google Cloud project.
          </p>
          
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-left space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <Lock className="w-5 h-5" />
              <h2 className="text-xs font-black uppercase tracking-widest">Bring Your Own Key</h2>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              This application is designed for private auditing. By selecting your own project, all costs and configuration data stay within your secure Google Cloud boundary.
            </p>

            <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-tight">
                {isAiStudio 
                  ? "Click the button below to 'apply' your own key by selecting a billing-enabled project." 
                  : "Automatic project selection is not available in this environment. Please ensure the API_KEY is set in your environment variables."}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Billing Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {isAiStudio ? (
          <button
            onClick={onSelectKey}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            Authenticate with My Project
            <Zap className="w-4 h-4 group-hover:animate-pulse" />
          </button>
        ) : (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-medium">
            Platform Project Selector not detected. 
            <p className="mt-2 text-slate-500 font-normal">If running locally, set the API_KEY environment variable.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthGate;
