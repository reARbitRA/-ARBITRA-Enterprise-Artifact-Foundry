import React from 'react';
import type { Artifact } from '../types/artifact.types';
import { ArtifactTypeIcon } from './icons/ArtifactTypeIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { EyeIcon } from './icons/CategoryIcons';

interface ArtifactCardProps {
  artifact: Artifact;
  onSelect: (artifact: Artifact) => void;
  isSelected: boolean;
  onToggleSelection: () => void;
}

const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, onSelect, isSelected, onToggleSelection }) => {
  
  const cardClasses = `bg-background-primary border rounded-lg p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
    isSelected
      ? 'border-accent-border shadow-lg shadow-cyan-500/20'
      : 'border-border-primary hover:border-accent-border/70 hover:shadow-lg hover:shadow-cyan-500/10'
  }`;

  const handleDownloadIndividual = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className={cardClasses}>
      <div className="flex items-center mb-3">
        <input
            type="checkbox"
            className="h-4 w-4 flex-shrink-0 rounded bg-background-primary border-border-secondary text-accent focus:ring-accent-emphasis"
            checked={isSelected}
            onChange={onToggleSelection}
            aria-label={`Select artifact ${artifact.filename}`}
        />
        <div className="flex items-center ml-2 min-w-0">
          <ArtifactTypeIcon filename={artifact.filename} />
          <h3 className="font-bold text-text-primary truncate ml-2 text-sm">{artifact.filename}</h3>
        </div>
      </div>
      <div className="flex flex-col space-y-2 mt-3">
        <button
          onClick={() => onSelect(artifact)}
          className="w-full bg-background-tertiary text-text-primary px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-accent hover:text-accent-text transition-colors duration-200 border border-border-secondary hover:border-accent flex items-center justify-center"
          aria-label={`View content of artifact ${artifact.filename}`}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview Content
        </button>
        <button
          onClick={handleDownloadIndividual}
          className="w-full bg-background-tertiary text-text-primary px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-accent hover:text-accent-text transition-colors duration-200 border border-border-secondary hover:border-accent flex items-center justify-center"
          aria-label={`Download artifact ${artifact.filename}`}
        >
          <DownloadIcon className="h-4 w-4 mr-2" />
          Download File
        </button>
      </div>
    </div>
  );
};

export default ArtifactCard;