import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeIcon } from './icons/ThemeIcon';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'brutalist' ? 'high-contrast' : 'brutalist');
  };

  return (
    <header className="no-print text-center py-6 border-b-2 border-background-secondary relative bg-background-primary">
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex space-x-2 opacity-30">
        <div className="w-2 h-8 bg-gray-800"></div>
        <div className="w-1 h-8 bg-gray-900"></div>
      </div>
       <div className="absolute top-1/2 right-4 -translate-y-1/2 flex space-x-2 opacity-30">
        <div className="w-1 h-8 bg-gray-900"></div>
        <div className="w-2 h-8 bg-gray-800"></div>
      </div>
      <h1 className="font-oswald text-4xl sm:text-5xl font-bold uppercase tracking-widest text-text-emphasis sheen-effect inline-block">
        ARBITRA
      </h1>
      <p className="text-accent-border tracking-[0.2em] text-sm sm:text-base opacity-80">
        ENTERPRISE ARTIFACT FOUNDRY
      </p>
      <button
            onClick={toggleTheme}
            className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors duration-200 no-print"
            aria-label="Toggle theme"
        >
            <ThemeIcon className="h-6 w-6" />
        </button>
    </header>
  );
};

export default Header;