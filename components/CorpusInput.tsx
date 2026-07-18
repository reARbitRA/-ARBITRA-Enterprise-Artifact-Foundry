import React, { useRef, useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ResetIcon } from './icons/ResetIcon';

interface CorpusInputProps {
  corpus: string;
  onCorpusChange: (corpus: string) => void;
  onReset: () => void;
  isGenerating: boolean;
  onSaveSession: () => void;
  onLoadSession: () => void;
  canLoadSession: boolean;
}

const CorpusInput: React.FC<CorpusInputProps> = ({ corpus, onCorpusChange, onReset, isGenerating, onSaveSession, onLoadSession, canLoadSession }) => {
  const hasContent = corpus.trim().length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveStatus, setSaveStatus] = useState('Save Session');
  const [isDragging, setIsDragging] = useState(false);

  const charCount = corpus.length;
  const wordCount = corpus.trim() ? corpus.trim().split(/\s+/).length : 0;
  const tokenEstimate = Math.ceil(charCount / 4);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onCorpusChange(text);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = () => {
      onSaveSession();
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus('Save Session'), 2000);
  }

  return (
    <div 
        className={`textured-panel border rounded-lg p-4 h-full flex flex-col transition-all duration-300 ${isDragging ? 'border-accent ring-2 ring-accent/20 bg-accent/5' : 'border-border-primary'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4 border-b border-border-primary pb-2">
        <h2 className="font-oswald text-xl uppercase text-text-primary">
            Foundry Input
        </h2>
        <div className="flex gap-4">
            <div className="text-[10px] text-text-muted flex flex-col items-end">
                <span className="uppercase font-bold tracking-widest text-accent">Corpus Scale</span>
                <span>{charCount.toLocaleString()} chars / {tokenEstimate.toLocaleString()} tokens</span>
            </div>
        </div>
      </div>
      
      <p className="text-[10px] text-text-secondary mb-3 uppercase tracking-wider">Master Source of Truth (TXT, MD, JSON)</p>
      
      <div className="relative flex-grow group">
          <textarea
            value={corpus}
            onChange={(e) => onCorpusChange(e.target.value)}
            placeholder="Paste technical requirements, project summaries, or domain data here..."
            className="w-full h-full p-4 bg-background-primary text-text-primary rounded-none focus:outline-none focus:ring-1 focus:ring-accent-border resize-none border border-border-primary font-mono text-xs leading-relaxed"
            disabled={isGenerating}
          />
          {isDragging && (
              <div className="absolute inset-0 bg-accent/10 backdrop-blur-sm flex items-center justify-center border-2 border-dashed border-accent">
                  <p className="font-oswald text-2xl text-accent uppercase animate-pulse">Drop to Load Corpus</p>
              </div>
          )}
      </div>

       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.json,.js,.ts,.html,.css,.xml"
      />
      
      <div className="mt-4 grid grid-cols-2 gap-3">
         <button
            onClick={handleSave}
            disabled={isGenerating || !hasContent}
            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:bg-background-secondary disabled:text-text-muted disabled:cursor-not-allowed"
        >
            <DownloadIcon className="h-4 w-4 mr-2" />
            {saveStatus}
        </button>
        <button
          onClick={onLoadSession}
          disabled={isGenerating || !canLoadSession}
          className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:bg-background-secondary disabled:text-text-muted disabled:cursor-not-allowed"
        >
          <UploadIcon className="h-4 w-4 mr-2 transform rotate-180" />
          Load Session
        </button>
        <button
            onClick={handleUploadClick}
            disabled={isGenerating}
            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-cyan-900/70 text-accent-lighter hover:bg-cyan-800/80 disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed disabled:border-transparent border border-cyan-800/50"
        >
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload File
        </button>
        <button
          onClick={onReset}
          disabled={isGenerating && !hasContent}
          className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-danger-faded text-danger hover:bg-red-800/80 disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed disabled:border-transparent border border-red-800/50"
        >
          <ResetIcon className="h-4 w-4 mr-2" />
          {isGenerating ? 'In Progress...' : 'Reset'}
        </button>
      </div>
    </div>
  );
};

export default CorpusInput;