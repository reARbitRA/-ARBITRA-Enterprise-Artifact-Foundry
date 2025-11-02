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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onCorpusChange(text);
      }
    };
    reader.onerror = (e) => {
        console.error("Failed to read file:", e);
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const handleSave = () => {
      onSaveSession();
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus('Save Session'), 2000);
  }


  return (
    <div className="textured-panel border border-border-primary rounded-lg p-4 h-full flex flex-col">
      <h2 className="font-oswald text-xl uppercase text-text-primary mb-4 border-b border-border-primary pb-2">
        Foundry Input
      </h2>
      <p className="text-xs text-text-secondary mb-2">Provide the source of truth for all artifact generation.</p>
      <textarea
        value={corpus}
        onChange={(e) => onCorpusChange(e.target.value)}
        placeholder="Enter the master prompt, project specifications, or source data here... or upload a file."
        className="w-full flex-grow p-3 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
        disabled={isGenerating}
      />
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.json,.js,.ts,.html,.css,.xml"
      />
      <div className="mt-4 grid grid-cols-2 gap-2">
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