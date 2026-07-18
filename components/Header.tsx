import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeIcon } from './icons/ThemeIcon';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'brutalist' ? 'high-contrast' : 'brutalist');
  };

  return (
    <header className="no-print border-b-4 border-background-secondary relative bg-background-primary px-8 py-10">
      <div className="flex flex-col items-center">
        <div className="relative group">
            <h1 className="font-oswald text-5xl sm:text-7xl font-bold uppercase tracking-[0.15em] text-text-emphasis relative z-10">
                ARBITRA
            </h1>
            <div className="absolute -top-2 -left-4 w-full h-full bg-accent-emphasis opacity-5 -skew-x-12 group-hover:skew-x-0 transition-transform duration-500"></div>
            <div className="absolute top-4 left-4 w-full h-full border-2 border-border-secondary opacity-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-500"></div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
            <div className="h-[1px] w-12 bg-border-secondary"></div>
            <p className="text-accent tracking-[0.4em] text-xs font-bold uppercase whitespace-nowrap">
                Artifact Foundry
            </p>
            <div className="h-[1px] w-12 bg-border-secondary"></div>
        </div>
        
        <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-accent' : 'bg-border-secondary opacity-30'}`}></div>
            ))}
        </div>
      </div>

      <button
            onClick={toggleTheme}
            className="absolute top-8 right-8 p-3 rounded-none border-2 border-border-primary text-text-secondary hover:text-accent hover:border-accent bg-background-secondary transition-all duration-300 no-print group"
            aria-label="Toggle theme"
        >
            <ThemeIcon className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
    </header>
  );
};

export default Header;