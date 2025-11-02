import React from 'react';
import { dashboardCategories } from '../../services/artifactRegistry';
import CategoryButton from './CategoryButton';
import GeniusPanel from './GeniusPanel';
import { SparkleIcon } from '../icons/CategoryIcons';
import type { GeniusFocus } from '../../types';


interface DashboardProps {
  onGenerateCategory: (categoryName: string) => void;
  onGenerateAll: () => void;
  isGeneratingAll: boolean;
  loadingCategories: string[];
  completedCategories: string[];
  isCorpusEmpty: boolean;
  geniusFocus: GeniusFocus;
  onGeniusFocusChange: (focus: GeniusFocus) => void;
  onGenerateWithGeniusMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onGenerateCategory,
  onGenerateAll,
  isGeneratingAll,
  loadingCategories, 
  completedCategories,
  isCorpusEmpty,
  geniusFocus,
  onGeniusFocusChange,
  onGenerateWithGeniusMode
}) => {
  const overallProgress = (completedCategories.length / dashboardCategories.length) * 100;
  const currentCategory = loadingCategories[0];
  const isGenerating = isGeneratingAll || loadingCategories.length > 0;

  return (
    <div className="textured-panel border border-border-primary rounded-lg p-4 h-full flex flex-col">
      <h2 className="font-oswald text-xl uppercase text-text-primary mb-4 border-b border-border-primary pb-2">
        Generation Control
      </h2>
      
      <div className="mb-4">
        {isGenerating && (
           <div className="mb-4">
              <div className="flex justify-between items-center text-sm text-accent-light mb-1">
                  <p>Overall Generation: {currentCategory ? `Processing "${currentCategory}"...` : 'Finalizing...'}</p>
                  <p>{completedCategories.length} / {dashboardCategories.length} Categories</p>
              </div>
              <div className="w-full bg-background-primary rounded-full h-2.5 border border-border-primary">
                  <div 
                      className="bg-accent-emphasis h-2 rounded-full transition-all duration-500" 
                      style={{width: `${overallProgress}%`}}
                  ></div>
              </div>
          </div>
        )}
         <button
          onClick={onGenerateAll}
          disabled={isCorpusEmpty || isGenerating}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:bg-background-secondary disabled:text-text-muted disabled:cursor-not-allowed"
        >
          Generate All (Standard)
        </button>
      </div>

      <GeniusPanel 
        focus={geniusFocus}
        onFocusChange={onGeniusFocusChange}
        onGenerate={onGenerateWithGeniusMode}
        isGenerating={isGenerating}
        isDisabled={isCorpusEmpty}
      />
      
      <p className="text-center text-xs text-text-secondary my-3 uppercase">Or Generate by Category</p>
      
      <div className="grid grid-cols-1 gap-3 flex-grow overflow-y-auto pr-1 border-t border-border-primary/50 pt-3">
        {dashboardCategories.map((category) => (
          <CategoryButton
            key={category.name}
            category={category}
            isLoading={loadingCategories.includes(category.name)}
            isCompleted={completedCategories.includes(category.name)}
            isDisabled={isCorpusEmpty || isGenerating}
            onClick={() => onGenerateCategory(category.name)}
          />
        ))}
      </div>
       {isCorpusEmpty && !isGenerating && (
          <p className="text-xs text-warning mt-4 p-2 bg-warning-faded rounded-md flex-shrink-0">
              Please provide a source corpus in the Foundry Input before generating categories.
          </p>
       )}
    </div>
  );
};

export default Dashboard;
