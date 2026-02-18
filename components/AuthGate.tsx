import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, ExternalLink, KeyRound, Check } from 'lucide-react';

interface AuthGateProps {
  onSelectKey: () => void;
  onKeyValidated: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSelectKey, onKeyValidated }) => {
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    // Check if the secure platform selection tool is available
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsAiStudio(true);
    }
  }, []);

  const handleSaveAndProceed = () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) return;
    
    localStorage.setItem('cisco_insight_api_key', trimmedKey);
    onKeyValidated();
  };

  const handleStudioKey = async () => {
    onSelectKey();
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
              Your keys and configurations remain local and secure.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8 sm:px-12 sm:pb-12 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAndProceed()}
                placeholder="Paste Gemini API Key (sk-...)"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500/50 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all font-mono placeholder:text-slate-700"
              />
            </div>

            <button 
              onClick={handleSaveAndProceed}
              disabled={!apiKeyInput.trim()}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              Initialize Engine
            </button>
          </div>

          {/* Action Links & Footer Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest transition-colors"
              >
                Get Free API Key <ExternalLink className="w-3 h-3" />
              </a>
              
              {isAiStudio && (
                <button 
                  onClick={handleStudioKey}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-black uppercase tracking-widest border-b border-dotted border-slate-800 transition-colors"
                >
                  Use Studio Key
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-start gap-3">
              <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                Cisco IOS Insight uses high-availability CCIE reasoning logic. Your keys are persisted securely in local storage and never leave your browser context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;