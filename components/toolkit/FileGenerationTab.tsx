import React, { useState } from 'react';
import { generateCode } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import { DownloadIcon } from '../icons/DownloadIcon';

interface GenerationState {
    prompt: string;
    filename: string;
    resultCode: string | null;
    error: string | null;
    language: string;
}

const languages = ['JavaScript', 'Python', 'TypeScript', 'Go', 'HTML', 'CSS', 'Rust', 'SQL', 'Markdown', 'JSON'];

const initialState: GenerationState = {
    prompt: 'Create a simple "Hello World" web server that listens on port 3000.',
    filename: 'server.js',
    resultCode: null,
    error: null,
    language: 'JavaScript',
};

const FileGenerationTab: React.FC = () => {
    const [generationState, setGenerationState] = useLocalStorage<GenerationState>('fileGenerationTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!generationState.prompt || !generationState.filename || !generationState.language) {
            setGenerationState(prev => ({ ...prev, error: 'Please provide a filename, language, and prompt.' }));
            return;
        }
        setIsLoading(true);
        setGenerationState(prev => ({ ...prev, resultCode: null, error: null }));
        
        const fileGenPrompt = `Generate the complete code for a file named "${generationState.filename}". The file should be written in ${generationState.language}.
        
Based on the following request: ${generationState.prompt}`;

        const response = await generateCode(fileGenPrompt, generationState.language);
        if (response.success) {
            setGenerationState(prev => ({ ...prev, resultCode: response.code ?? null }));
        } else {
            setGenerationState(prev => ({ ...prev, error: response.error ?? 'An unknown error occurred.' }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setGenerationState(initialState);
    };

    const handleDownload = () => {
        if (!generationState.resultCode || !generationState.filename) return;
        const blob = new Blob([generationState.resultCode], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = generationState.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="file-filename" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Filename</label>
                    <input
                        id="file-filename"
                        type="text"
                        value={generationState.filename}
                        onChange={(e) => setGenerationState(prev => ({...prev, filename: e.target.value}))}
                        placeholder="e.g., component.tsx"
                        className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border border border-border-primary"
                        disabled={isLoading}
                    />
                </div>
            </div>
             <div>
                <label htmlFor="file-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">File Content Prompt</label>
                <textarea
                    id="file-prompt"
                    value={generationState.prompt}
                    onChange={(e) => setGenerationState(prev => ({...prev, prompt: e.target.value}))}
                    placeholder="e.g., A simple Express.js server that returns 'Hello World'."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
             <div>
                <label className="block text-xs text-text-default mb-2 uppercase tracking-wider">Language</label>
                <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                        <button
                            key={lang}
                            onClick={() => setGenerationState(prev => ({...prev, language: lang}))}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors duration-200 border ${generationState.language === lang ? 'bg-accent text-accent-text border-accent-border' : 'bg-background-tertiary text-text-primary border-border-secondary hover:border-accent-border'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !generationState.prompt || !generationState.filename}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating File...' : 'Generate File'}
                </button>
                 <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {generationState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{generationState.error}</div>}
            
            {(isLoading || generationState.resultCode) && (
                <div className="bg-background-primary rounded-md border border-border-primary">
                    <div className="flex justify-between items-center p-2 bg-background-tertiary rounded-t-md">
                        <h4 className="font-bold text-text-primary text-sm ml-2 uppercase">Content for {generationState.filename}</h4>
                        {generationState.resultCode && !isLoading && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center bg-accent text-accent-text px-3 py-1 rounded-md text-xs font-semibold uppercase hover:bg-accent-hover transition-colors duration-200"
                            >
                                <DownloadIcon className="h-3 w-3 mr-2" />
                                Download File
                            </button>
                        )}
                    </div>
                    <div className="p-4 overflow-x-auto max-h-96">
                         {isLoading && <div className="text-center w-full"><div className="w-6 h-6 border-4 border-accent-light border-t-transparent rounded-full animate-spin inline-block"></div></div>}
                         {generationState.resultCode && (
                            <pre className="text-sm text-text-primary">
                                <code className={`language-${generationState.language.toLowerCase()}`}>{generationState.resultCode}</code>
                            </pre>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileGenerationTab;
