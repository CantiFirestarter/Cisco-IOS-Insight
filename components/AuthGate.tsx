
import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Zap, Info, Server } from 'lucide-react';

interface AuthGateProps {
  onSelectKey: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSelectKey }) => {
  const [isAiStudio, setIsAiStudio] = useState(false);

  useEffect(() => {
    // Check if we are in the specialized AI Studio environment
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
            <Key className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Access Control</h1>
          
          {isAiStudio ? (
            <>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cisco IOS Insight requires a paid Gemini API Key to perform advanced architectural audits.
              </p>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-left space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requirements</p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Select a project with <strong>Billing Enabled</strong>.</li>
                  <li>Ensure the <strong>Gemini API</strong> is enabled in the GCP Console.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                This deployment is currently missing a valid API configuration.
              </p>
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-left space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Server className="w-4 h-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Environment Setup</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To use this application on a standalone host (like Vercel), you must provide the <code className="text-blue-400 bg-blue-400/10 px-1 rounded font-mono">API_KEY</code> environment variable in your deployment settings.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-lg text-left">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-tight">
                  If you are using this inside Google AI Studio, please ensure the preview environment is correctly initialized.
                </p>
              </div>
            </div>
          )}
          
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Billing Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {isAiStudio && (
          <button
            onClick={onSelectKey}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            Authenticate Command Center
            <Zap className="w-4 h-4 group-hover:animate-pulse" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthGate;
