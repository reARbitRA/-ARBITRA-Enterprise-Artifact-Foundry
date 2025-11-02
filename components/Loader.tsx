import React from 'react';
import { GearIcon } from './icons/GearIcon';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = 'Processing...' }) => {
  return (
    <div 
      className="fixed inset-0 bg-background-primary/80 backdrop-blur-sm flex items-center justify-center z-50 no-print"
      aria-live="assertive"
      role="alert"
    >
      <div className="flex flex-col items-center">
        <GearIcon className="h-12 w-12 text-accent-light animate-spin" />
        <p className="mt-4 text-text-primary uppercase tracking-widest font-oswald text-lg">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Loader;
