
import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Send, Plus, Network, Layers, ClipboardPaste, Info } from 'lucide-react';
import { ConfigFile } from '../types';

interface Props {
  onAnalyze: (files: ConfigFile[]) => void;
}

const ConfigUploader: React.FC<Props> = ({ onAnalyze }) => {
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [pastedConfig, setPastedConfig] = useState('');
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFileList = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFiles(prev => [
          ...prev,
          { 
            id: Math.random().toString(36).substr(2, 9),
            name: file.name, 
            content 
          }
        ]);
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    processFileList(uploadedFiles);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsPasteMode(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFileList(droppedFiles);
      setIsPasteMode(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAnalyzeClick = () => {
    if (isPasteMode && pastedConfig.trim()) {
      onAnalyze([{
        id: 'pasted',
        name: 'Pasted-Config.cfg',
        content: pastedConfig
      }]);
    } else {
      onAnalyze(files);
    }
  };

  const addSampleFiles = () => {
    const samples = [
      {
        id: 's1',
        name: 'Core-Switch.cfg',
        content: 'hostname CORE-01\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan 10,20\n spanning-tree priority 4096\ninterface Vlan10\n ip address 10.0.10.1 255.255.255.0'
      },
      {
        id: 's2',
        name: 'Access-Switch.cfg',
        content: 'hostname ACCESS-01\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk allowed vlan 10\n! MISSING VLAN 20 - Conflict!\ninterface Vlan10\n ip address 10.0.10.2 255.255.255.0'
      }
    ];
    setFiles(samples);
    setIsPasteMode(false);
  };

  const hasContent = files.length > 0 || (isPasteMode && pastedConfig.trim().length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl overflow-hidden p-4 sm:p-8 transition-colors duration-300">
        {/* Toggle Controls */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6 sm:mb-8 w-fit mx-auto border border-slate-200 dark:border-slate-800 transition-colors">
          <button 
            onClick={() => setIsPasteMode(false)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 ${!isPasteMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            <Upload className="w-3 h-3" />
            Files
          </button>
          <button 
            onClick={() => setIsPasteMode(true)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 ${isPasteMode ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            <ClipboardPaste className="w-3 h-3" />
            Paste
          </button>
        </div>

        {!isPasteMode ? (
          <div className="space-y-6">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 sm:py-12 px-4 transition-all group relative cursor-pointer ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.01]' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-blue-500/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" 
                multiple
                accept=".txt,.cfg,.log,.conf,.ios,.cisco"
              />
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 transition-all ${isDragging ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-blue-600/10 text-blue-600 dark:text-blue-500 group-hover:scale-110'}`}>
                <Upload className={`w-6 h-6 sm:w-8 sm:h-8 ${isDragging ? 'text-white' : ''}`} />
              </div>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                {isDragging ? 'Release to upload' : 'Drop configs or browse'}
              </h3>
              <p className="text-slate-500 text-[10px] sm:text-sm text-center max-w-[200px] sm:max-w-sm mb-4">
                Upload raw exports from IOS, IOS XE, or IOS XR.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2">
                {['.cfg', '.conf', '.txt', '.log', '.ios', '.cisco'].map(ext => (
                  <span key={ext} className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-[9px] sm:text-[10px] font-mono text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-blue-50/50 dark:bg-slate-950/50 border border-blue-100 dark:border-slate-800 rounded-xl transition-colors">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-500 flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-snug">
                For best results, use files containing the output of <code className="text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 px-1 rounded transition-colors">show running-config</code>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ClipboardPaste className="w-3 h-3" />
                Single Node CLI
              </h4>
              <button onClick={() => setPastedConfig('')} className="text-[9px] sm:text-[10px] text-red-600 font-bold uppercase tracking-widest hover:text-red-500">Clear</button>
            </div>
            <textarea
              value={pastedConfig}
              onChange={(e) => setPastedConfig(e.target.value)}
              placeholder="Paste 'show running-config' output here..."
              className="w-full h-40 sm:h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 font-mono text-xs sm:text-sm text-blue-700 dark:text-blue-400/90 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 custom-scrollbar resize-none"
            />
          </div>
        )}

        {files.length > 0 && !isPasteMode && (
          <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[9px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" />
                Staged Set ({files.length})
              </h4>
              <button 
                onClick={() => setFiles([])}
                className="text-[10px] sm:text-xs text-red-600 hover:text-red-500 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 sm:p-3 rounded-lg sm:rounded-xl group animate-in zoom-in-95 duration-200 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-[10px] sm:text-sm text-slate-700 dark:text-slate-300 truncate font-mono">{file.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-white dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:justify-between border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
          <button 
            onClick={addSampleFiles}
            className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase tracking-widest"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Load Samples</span>
          </button>
          
          <button
            onClick={handleAnalyzeClick}
            disabled={!hasContent}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-2xl font-bold transition-all shadow-xl text-xs sm:text-sm ${
              hasContent
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/40' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Network className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{files.length > 1 ? `Audit Network (${files.length})` : 'Audit Node'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigUploader;
