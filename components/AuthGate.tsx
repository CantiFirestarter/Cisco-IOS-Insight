import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Zap, ExternalLink, KeyRound, Check, Info, AlertCircle } from 'lucide-react';
import { validateApiKey } from '../services/geminiService';

interface AuthGateProps {
  onSelectKey: () => void;
  onKeyValidated: () => void;
}

const AuthGate: React.FC<AuthGateProps> = ({ onSelectKey, onKeyValidated }) => {
  const [isAiStudio, setIsAiStudio] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Check if the secure platform selection tool is available
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      setIsAiStudio(true);
    }
  }, []);

  const handleVerifyAndSave = async () => {
    if (!apiKeyInput.trim()) return;
    setValidationStatus('checking');
    setValidationError('');
    
    const result = await validateApiKey(apiKeyInput.trim());
    if (result.success) {
      setValidationStatus('success');
      setTimeout(() => {
        localStorage.setItem('cisco_insight_api_key', apiKeyInput.trim());
        onKeyValidated();
      }, 800);
    } else {
      setValidationStatus('error');
      setValidationError(result.message);
    }
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
                <KeyRound className={`w-4 h-4 transition-colors ${validationStatus === 'error' ? 'text-red-500' : validationStatus === 'success' ? 'text-emerald-500' : 'text-slate-500'}`} />
              </div>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  if (validationStatus !== 'idle') setValidationStatus('idle');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndSave()}
                placeholder="Paste Gemini API Key (sk-...)"
                className={`w-full bg-slate-950 border py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all font-mono placeholder:text-slate-700 ${
                  validationStatus === 'error' ? 'border-red-500/50' : 
                  validationStatus === 'success' ? 'border-emerald-500/50' : 
                  'border-slate-800 hover:border-slate-700'
                }`}
              />
            </div>

            {validationStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold uppercase tracking-tight animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-3 h-3" />
                {validationError || "Invalid Credentials"}
              </div>
            )}
            
            {validationStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                <Check className="w-3 h-3" />
                Uplink Established
              </div>
            )}

            <button 
              onClick={handleVerifyAndSave}
              disabled={!apiKeyInput.trim() || validationStatus === 'checking'}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
                validationStatus === 'checking' ? 'bg-slate-800 text-slate-500' :
                validationStatus === 'success' ? 'bg-emerald-600 text-white' :
                'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              } disabled:opacity-50 active:scale-[0.98]`}
            >
              {validationStatus === 'checking' ? (
                <><div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>Verifying...</>
              ) : validationStatus === 'success' ? (
                <><Check className="w-4 h-4" />Connection Ready</>
              ) : (
                <><Zap className="w-4 h-4 fill-white" />Initialize Engine</>
              )}
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