import React, { useState, useRef, useEffect } from 'react';
import type { Artifact } from '../types/artifact.types';
import ArtifactCard from './ArtifactCard';
import { ChevronIcon } from './icons/ChevronIcon';

interface CategoryGroupProps {
  categoryName: string;
  artifacts: Artifact[];
  onSelectArtifact: (artifact: Artifact) => void;
  selectedFiles: Set<string>;
  onToggleFile: (filePath: string) => void;
  onToggleCategory: (categoryName: string, artifacts: Artifact[]) => void;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ categoryName, artifacts, onSelectArtifact, selectedFiles, onToggleFile, onToggleCategory }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const checkboxRef = useRef<HTMLInputElement>(null);

  const categoryFilePaths = artifacts.map(a => `${categoryName}/${a.filename}`);
  const selectedInCategoryCount = categoryFilePaths.filter(fp => selectedFiles.has(fp)).length;
  
  const isAllSelected = selectedInCategoryCount > 0 && selectedInCategoryCount === categoryFilePaths.length;
  const isPartiallySelected = selectedInCategoryCount > 0 && selectedInCategoryCount < categoryFilePaths.length;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);


  return (
    <div className="bg-background-primary border border-border-primary rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center p-3 bg-background-tertiary hover:bg-border-primary transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-border"
        aria-expanded={isExpanded}
        aria-controls={`category-panel-${categoryName.replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center">
            <input
                ref={checkboxRef}
                type="checkbox"
                className="h-5 w-5 rounded bg-background-primary border-border-secondary text-accent focus:ring-accent-emphasis custom-checkbox"
                checked={isAllSelected}
                onChange={(e) => {
                    e.stopPropagation();
                    onToggleCategory(categoryName, artifacts);
                }}
                onClick={(e) => e.stopPropagation()} // Prevent expansion toggle
            />
            <h3 className="font-oswald text-lg uppercase text-text-primary ml-3">{categoryName}</h3>
            <span className="ml-3 bg-background-secondary text-accent-light text-xs font-mono px-2 py-0.5 rounded-full">{artifacts.length} files</span>
        </div>
        <ChevronIcon className={`h-5 w-5 text-text-default transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`} />
      </button>
      {isExpanded && (
        <div id={`category-panel-${categoryName.replace(/\s+/g, '-')}`} className="p-4 bg-background-secondary rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artifacts.map((artifact) => (
              <ArtifactCard 
                key={artifact.filename} 
                artifact={artifact} 
                onSelect={onSelectArtifact} 
                isSelected={selectedFiles.has(`${categoryName}/${artifact.filename}`)}
                onToggleSelection={() => onToggleFile(`${categoryName}/${artifact.filename}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryGroup;