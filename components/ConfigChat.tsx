
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, Terminal, ShieldQuestion, Search, HelpCircle, X } from 'lucide-react';
import { ConfigFile, ChatMessage } from '../types';
import { askConfigQuestion } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface Props {
  files: ConfigFile[];
  messages: ChatMessage[];
  input: string;
  onUpdateMessages: (messages: ChatMessage[]) => void;
  onUpdateInput: (input: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "What routing protocols are configured?",
  "Check for security vulnerabilities in management access.",
  "Are there any duplicate IP addresses?",
  "List all interfaces with MTU over 1500.",
  "What is the STP root bridge configuration?",
  "Are there any SNMPv2 communities?"
];

const ConfigChat: React.FC<Props> = ({ 
  files, 
  messages, 
  input, 
  onUpdateMessages, 
  onUpdateInput 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: query };
    const newMessages = [...messages, userMessage];
    onUpdateMessages(newMessages);
    onUpdateInput('');
    setIsLoading(true);

    try {
      const answer = await askConfigQuestion(files, messages, query);
      const assistantMessage: ChatMessage = { role: 'model', text: answer };
      onUpdateMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      onUpdateMessages([...newMessages, { role: 'model', text: `**Error:** ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-bottom-4 duration-500 transition-colors">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-xl">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Cisco Architect Assistant</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Context-Aware Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">{files.length} Nodes Loaded</span>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent)]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
            <div className="relative">
               <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full animate-pulse"></div>
               <ShieldQuestion className="w-16 h-16 text-slate-200 dark:text-slate-800 relative z-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Ask anything about the configuration</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Probe specific devices, audit protocols, or ask for CLI syntax for specific architectural changes.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
               {SUGGESTED_QUESTIONS.map((q, i) => (
                 <button 
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 bg-white dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                 >
                   {q}
                 </button>
               ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`p-2 rounded-xl shrink-0 ${m.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10' 
                : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm transition-colors'
            }`}>
              <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-blue-400 prose-code:text-blue-500">
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in duration-300">
            <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-none p-5 flex items-center gap-3">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Architect is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1 group">
            <input 
              type="text"
              value={input}
              onChange={(e) => onUpdateInput(e.target.value)}
              placeholder="Ask a question about your configs..."
              disabled={isLoading}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-2xl bg-blue-600 text-white transition-all shadow-lg active:scale-95 flex items-center justify-center ${
              !input.trim() || isLoading ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-blue-500 shadow-blue-500/20'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between px-2">
           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
             <Terminal className="w-3 h-3" />
             AI may hallucinate CLI syntax. Verify before application.
           </div>
           {messages.length > 0 && (
             <button 
              onClick={() => onUpdateMessages([])}
              className="text-[9px] font-black text-red-600 hover:text-red-500 uppercase tracking-widest"
             >
               Clear History
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConfigChat;
