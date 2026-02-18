
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, ExternalLink, Info, Key } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 p-4 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        {/* Top Branding Section */}
        <div className="pt-12 px-8 sm:pt-14 sm:px-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-inner flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tighter sm:text-4xl">
              Cisco IOS <span className="text-blue-500">Insight</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto font-medium opacity-80">
              CCIE-Grade Network Auditing & Inter-Device Conflict Detection.
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div className="px-8 py-10 sm:px-12 sm:pb-14 space-y-8">
          <div className="space-y-4">
            <button 
              onClick={handleStudioKey}
              className="w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 active:scale-[0.98] group"
            >
              <Zap className="w-4 h-4 fill-white animate-pulse group-hover:scale-110 transition-transform" />
              Initialize Engine
            </button>
            
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <Key className="w-3 h-3" />
                Secure API Handshake Required
              </div>
              
              <div className="h-px w-12 bg-slate-800"></div>

              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-black uppercase tracking-widest transition-colors"
              >
                Get Free API Key 
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Reasoning & Footer */}
          <div className="space-y-6">
            <div className="pt-8 border-t border-slate-800/50 flex flex-col items-center gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <Lock className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-[0.1em]">Encrypted Session</span>
              </div>
              <p className="text-[10px] text-slate-500/80 leading-relaxed italic max-w-xs">
                Your credentials never leave Google's secure environment. Analysis is performed using ephemeral in-memory processing.
              </p>
              
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] text-slate-600 hover:text-slate-400 font-bold underline underline-offset-4 transition-colors"
              >
                Project Billing Requirements
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Version stamp */}
      <div className="absolute bottom-8 text-slate-800 text-[10px] font-black tracking-[0.5em] uppercase pointer-events-none">
        Insight Engine v1.0.0
      </div>
    </div>
  );
};

export default AuthGate;
