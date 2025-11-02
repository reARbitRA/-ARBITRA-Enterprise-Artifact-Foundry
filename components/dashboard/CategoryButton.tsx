import React from 'react';
import type { Category } from '../../services/artifactRegistry';
import { CheckIcon } from '../icons/CheckIcon';
import { getCategoryIcon } from '../icons/CategoryIcons';

interface CategoryButtonProps {
  category: Category;
  isLoading: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isLoading, isCompleted, isDisabled, onClick }) => {
  const baseClasses = "relative w-full text-left p-3 pr-12 border-l-4 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-secondary focus:ring-accent-border rounded-r-md overflow-hidden";
  
  let stateClasses = "bg-background-tertiary border-text-muted hover:bg-border-primary hover:border-accent-border";
  if (isDisabled) {
    stateClasses = "bg-background-tertiary/50 border-border-primary text-text-muted cursor-not-allowed";
  } else if (isLoading) {
    stateClasses = "bg-background-tertiary border-accent-border text-accent-lighter cursor-wait";
  } else if (isCompleted) {
    stateClasses = "bg-success-faded border-border-success text-text-primary";
  }
  
  const CategoryIcon = getCategoryIcon(category.name);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading || isCompleted}
      className={`${baseClasses} ${stateClasses}`}
    >
      <div className="flex items-start gap-3">
        {CategoryIcon && (
          <div className="flex-shrink-0 pt-0.5">
            <CategoryIcon className={`h-5 w-5 ${isDisabled ? 'text-text-muted' : 'text-accent-light/70'}`} />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="font-bold text-sm uppercase tracking-wider">{category.name}</h3>
          <p className={`text-xs mt-1 ${isDisabled ? 'text-text-muted' : 'text-text-default'}`}>{category.description}</p>
        </div>
      </div>


      <div className="absolute top-1/2 right-3 -translate-y-1/2 h-8 w-8 flex items-center justify-center">
        {isLoading && (
          <div className="w-5 h-5 border-2 border-accent-light border-t-transparent rounded-full animate-spin"></div>
        )}
        {isCompleted && !isLoading && (
          <div className="w-6 h-6 bg-success-bg rounded-full flex items-center justify-center">
            <CheckIcon className="w-4 h-4 text-text-inverted" />
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="absolute bottom-0 left-0 h-[3px] bg-accent-border/70 animate-fill-progress"></div>
      )}
    </button>
  );
};

export default CategoryButton;