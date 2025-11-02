import React from 'react';
import type { GeniusFocus } from '../../types';
import { PaletteIcon, ServerIcon, SparkleIcon } from '../icons/CategoryIcons';

interface GeniusPanelProps {
  focus: GeniusFocus;
  onFocusChange: (focus: GeniusFocus) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

const focusOptions: { id: GeniusFocus; label: string }[] = [
    { id: 'balanced', label: 'Balanced' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'fullstack', label: 'Full-Stack' },
];

const GeniusPanel: React.FC<GeniusPanelProps> = ({ focus, onFocusChange, onGenerate, isGenerating, isDisabled }) => {
  return (
    <div className="border-y border-border-primary/50 py-4 space-y-4">
      <div className="flex justify-around items-center text-xs text-text-default">
        <div className="flex items-center gap-2">
          <PaletteIcon className="h-4 w-4 text-cyan-400" />
          <span className="font-bold">NEXUS-UI</span>
          <span className="text-green-400 bg-green-900/50 px-1.5 py-0.5 rounded-md text-[10px] font-mono">READY</span>
        </div>
        <div className="flex items-center gap-2">
          <ServerIcon className="h-4 w-4 text-fuchsia-400" />
          <span className="font-bold">CODEX-ARCHITECT</span>
          <span className="text-green-400 bg-green-900/50 px-1.5 py-0.5 rounded-md text-[10px] font-mono">READY</span>
        </div>
      </div>
      
      <div>
        <div className="text-center text-xs uppercase text-text-secondary mb-2">Generation Focus</div>
        <div className="grid grid-cols-4 gap-1 bg-background-primary p-1 rounded-md border border-border-primary">
          {focusOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFocusChange(option.id)}
              disabled={isGenerating || isDisabled}
              className={`px-2 py-1.5 text-xs font-semibold uppercase rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-border focus:z-10 ${
                focus === option.id
                  ? 'bg-accent text-accent-text'
                  : 'text-text-default hover:bg-background-tertiary'
              } disabled:text-text-muted disabled:hover:bg-transparent`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isDisabled || isGenerating}
        className="w-full flex items-center justify-center px-4 py-3 rounded-md text-base font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
      >
        <SparkleIcon className="h-5 w-5 mr-3" />
        {isGenerating ? 'Genius Mode Generating...' : 'Generate with AI Geniuses'}
      </button>
    </div>
  );
};

export default GeniusPanel;
