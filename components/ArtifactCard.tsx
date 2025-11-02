import React from 'react';
import type { Artifact } from '../types';
import { ArtifactTypeIcon } from './icons/ArtifactTypeIcon';

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
      <button
        onClick={() => onSelect(artifact)}
        className="w-full bg-background-tertiary text-text-primary px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-accent hover:text-accent-text transition-colors duration-200 border border-border-secondary hover:border-accent"
      >
        View Content
      </button>
    </div>
  );
};

export default ArtifactCard;