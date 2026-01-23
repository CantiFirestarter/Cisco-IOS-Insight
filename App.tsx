
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('cisco_insight_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [state, setState] = useState<AppState>({
    files: [],
    isAnalyzing: false,
    result: null,
    error: null,
  });

  useEffect(() => {
    // Synchronize document class for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('cisco_insight_theme', theme);
  }, [theme]);

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem('cisco_expert_api_key');
      if (storedKey) {
        setHasApiKey(true);
        return;
      }
      try {
        // @ts-ignore
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          // @ts-ignore
          const exists = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(exists);
        } else if (process.env.API_KEY) {
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

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } catch (err) {
      console.error("Failed to open key selection dialog", err);
    }
  };

  const handleAnalyze = async (stagedFiles: ConfigFile[]) => {
    if (stagedFiles.length === 0) return;
    setState(prev => ({ ...prev, isAnalyzing: true, error: null, files: stagedFiles }));
    try {
      const result = await analyzeCiscoConfigs(stagedFiles);
      setState(prev => ({ ...prev, isAnalyzing: false, result }));
    } catch (err: any) {
      if (err.message === 'API_KEY_NOT_FOUND') {
        setHasApiKey(false);
        setState(prev => ({ ...prev, isAnalyzing: false, error: "API credentials invalid. Please provide a valid Gemini API key." }));
      } else {
        setState(prev => ({ ...prev, isAnalyzing: false, error: err.message }));
      }
    }
  };

  const handleReset = () => {
    setState({ files: [], isAnalyzing: false, result: null, error: null });
  };

  if (hasApiKey === false) {
    return <AuthGate onSelectKey={handleSelectKey} onKeyValidated={() => setHasApiKey(true)} />;
  }

  if (hasApiKey === null) return null;

  return (
    <div className="min-h-screen flex flex-col text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Header 
        onReset={handleReset} 
        onSelectKey={() => setHasApiKey(false)} 
        hasResult={!!state.result}
        theme={theme}
        onToggleTheme={toggleTheme}
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

        {state.isAnalyzing && <LoadingState fileCount={state.files.length} />}

        {state.result && (
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-amber-500/10 border border-amber-500/20 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3">
              <AlertTriangle className="w-3 h-3 sm:w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span className="text-[9px] sm:text-xs font-bold text-amber-700 dark:text-amber-200 uppercase tracking-widest">Verify all CLI commands before application</span>
            </div>
            <Dashboard result={state.result} />
            <AnalysisResults result={state.result} />
          </div>
        )}

        {state.error && (
          <ErrorDisplay error={state.error} onReset={handleReset} onSelectKey={() => setHasApiKey(false)} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
