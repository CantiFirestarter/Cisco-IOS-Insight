
import React, { useState, useEffect } from 'react';
import { analyzeCiscoConfigs } from './services/geminiService';
import { AppState, ConfigFile } from './types';
import Dashboard from './components/Dashboard';
import ConfigUploader from './components/ConfigUploader';
import AnalysisResults from './components/AnalysisResults';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthGate from './components/AuthGate';
import Hero from './components/Hero';
import SafetyNotice from './components/SafetyNotice';
import FeatureGrid from './components/FeatureGrid';
import LoadingState from './components/LoadingState';
import ErrorDisplay from './components/ErrorDisplay';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [state, setState] = useState<AppState>({
    files: [],
    isAnalyzing: false,
    result: null,
    error: null,
  });

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          // If we are in AI Studio, force the user to have explicitly selected a key
          // This ensures they are using their own billing project/account.
          // @ts-ignore
          const exists = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(exists);
        } else if (process.env.API_KEY) {
          // Standalone fallback for other deployment types
          setHasApiKey(true);
        } else {
          setHasApiKey(false);
        }
      } catch (err) {
        setHasApiKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        // Rule: Assume success after triggering the dialog to avoid race conditions
        setHasApiKey(true);
      }
    } catch (err) {
      console.error("Failed to open key selection dialog", err);
    }
  };

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
      if (err.message === 'API_KEY_NOT_FOUND') {
        setHasApiKey(false);
        setState(prev => ({ 
          ...prev, 
          isAnalyzing: false, 
          error: "API credentials invalid. Please select a valid project with billing enabled." 
        }));
      } else {
        setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
      }
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

  if (hasApiKey === false) {
    return <AuthGate onSelectKey={handleSelectKey} />;
  }

  if (hasApiKey === null) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <Header 
        onReset={handleReset} 
        onSelectKey={handleSelectKey} 
        hasResult={!!state.result} 
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
        {!state.result && !state.isAnalyzing && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            <Hero />
            <ConfigUploader onAnalyze={handleAnalyze} />
            <SafetyNotice />
            <FeatureGrid />
          </div>
        )}

        {state.isAnalyzing && (
          <LoadingState fileCount={state.files.length} />
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
          <ErrorDisplay 
            error={state.error} 
            onReset={handleReset} 
            onSelectKey={handleSelectKey} 
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
