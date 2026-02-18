
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, ExternalLink, Info, CreditCard } from 'lucide-react';

interface AuthGateProps {
  onSelectKey: () => void;
  onKeyValidated: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSelectKey, onKeyValidated }) => {
  const [isAiStudio, setIsAiStudio] = useState(false);

  useEffect(() => {
    // Check if the secure platform selection tool is available
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsAiStudio(true);
    }
  }, []);

  const handleStudioKey = async () => {
    onSelectKey();
    // Proceed immediately as per race condition instructions in guidelines
    onKeyValidated();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        
        {/* Top Branding Section */}
        <div className="pt-10 px-8 sm:pt-12 sm:px-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-blue-600/10 p-4 rounded-3xl border border-blue-500/20 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Cisco IOS Insight</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              Advanced Cisco architectural auditing powered by Gemini 3 Pro.
              To use this tool, you must select your own Google Cloud API key from a project with billing enabled.
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="px-8 py-8 sm:px-12 sm:pb-12 space-y-6">
          <div className="space-y-4">
            <button 
              onClick={handleStudioKey}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              Use Your Own API Key
            </button>
            
            <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Billing Required</p>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  The Gemini 3 Pro model requires a paid Google Cloud project. You will only be charged based on your personal usage.
                </p>
              </div>
            </div>
          </div>

          {/* Action Links & Footer Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest transition-colors"
              >
                View Billing Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed italic text-center w-full">
                Your keys are handled securely by Google AI Studio. Cisco IOS Insight never sees or stores your raw credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
