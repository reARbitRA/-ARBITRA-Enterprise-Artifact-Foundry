import React, { useState, useEffect } from 'react';
import type { Artifact } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { quickEdit } from '../services/aiToolkitService';
import { SparkleIcon } from './icons/CategoryIcons';


interface ModalProps {
  artifact: Artifact;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ artifact, onClose }) => {
  const [copyStatus, setCopyStatus] = useState('Copy Content');
  const [editedContent, setEditedContent] = useState(artifact.content);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    setEditedContent(artifact.content);
  }, [artifact]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent).then(() => {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Content'), 2000);
    }).catch(err => {
      setCopyStatus('Failed!');
       setTimeout(() => setCopyStatus('Copy Content'), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickEdit = async (instruction: string) => {
    setIsEditing(true);
    setEditError('');
    const result = await quickEdit(editedContent, instruction);
    if (result.success) {
      setEditedContent(result.content);
    } else {
      setEditError(result.error);
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-background-primary border border-accent-border/50 rounded-lg shadow-2xl shadow-cyan-900/20 w-full max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-border-primary flex-shrink-0">
          <h2 className="font-oswald text-xl uppercase text-accent-light">{artifact.filename}</h2>
          <button 
            onClick={onClose}
            className="text-text-default hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 flex-grow overflow-y-auto bg-background-inset">
          {editError && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md mb-4 text-xs">{editError}</div>}
          <pre className="whitespace-pre-wrap text-sm text-text-primary bg-background-secondary p-4 rounded-md border border-border-primary">
            <code>
              {isEditing ? 'AI is editing...' : editedContent}
            </code>
          </pre>
        </main>
        <footer className="p-4 border-t border-border-primary flex-shrink-0 flex items-center justify-between space-x-4 bg-background-secondary rounded-b-lg">
            <div className="flex items-center space-x-2">
                 <button
                    onClick={() => handleQuickEdit('Summarize the following content.')}
                    disabled={isEditing}
                    className="flex items-center bg-background-tertiary text-text-primary px-3 py-1.5 rounded-md text-xs font-semibold uppercase hover:bg-border-primary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="h-4 w-4 mr-2" />
                    Summarize
                </button>
                 <button
                    onClick={() => handleQuickEdit('Improve the writing and clarity of the following content.')}
                    disabled={isEditing}
                    className="flex items-center bg-background-tertiary text-text-primary px-3 py-1.5 rounded-md text-xs font-semibold uppercase hover:bg-border-primary hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="h-4 w-4 mr-2" />
                    Improve Writing
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleCopy}
                    className="flex items-center bg-background-tertiary text-text-primary px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-border-primary hover:text-white transition-colors duration-200"
                >
                    <CopyIcon className="h-4 w-4 mr-2" />
                    {copyStatus}
                </button>
                 <button
                    onClick={handleDownload}
                    className="flex items-center bg-accent text-accent-text px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-accent-hover transition-colors duration-200"
                >
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};

export default Modal;