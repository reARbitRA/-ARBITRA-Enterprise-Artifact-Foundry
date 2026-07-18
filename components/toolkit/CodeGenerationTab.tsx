
import React, { useState } from 'react';
import { generateCode, getPromptSuggestions } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import { CopyIcon } from '../icons/CopyIcon';
import { SparkleIcon } from '../icons/CategoryIcons'; // Reusing SparkleIcon for AI features

interface GenerationState {
    prompt: string;
    resultCode: string | null;
    error: string | null;
    language: string;
}

const languages = ['JavaScript', 'Python', 'TypeScript', 'Go', 'HTML', 'CSS', 'Rust', 'SQL'];

const initialState: GenerationState = {
    prompt: '',
    resultCode: null,
    error: null,
    language: 'JavaScript',
};

const CodeGenerationTab: React.FC = () => {
    const [generationState, setGenerationState] = useLocalStorage<GenerationState>('codeGenerationTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState('Copy Code');

    // State for prompt suggestions
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);


    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGenerationState(prev => ({...prev, prompt: e.target.value}));
    };

    const handleGenerate = async () => {
        if (!generationState.prompt) {
            setGenerationState(prev => ({ ...prev, error: 'Please provide a prompt.' }));
            return;
        }
        setIsLoading(true);
        setGenerationState(prev => ({ ...prev, resultCode: null, error: null }));
        const response = await generateCode(generationState.prompt, generationState.language);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setGenerationState(prev => ({ ...prev, resultCode: response.code }));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setGenerationState(prev => ({ ...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setGenerationState(initialState);
        setShowSuggestions(false);
        setSuggestions([]);
        setSuggestionError(null);
    };

    const handleCopy = () => {
        if (!generationState.resultCode) return;
        navigator.clipboard.writeText(generationState.resultCode).then(() => {
          setCopyStatus('Copied!');
          setTimeout(() => setCopyStatus('Copy Code'), 2000);
        }).catch(() => {
          setCopyStatus('Failed!');
           setTimeout(() => setCopyStatus('Copy Code'), 2000);
        });
      };
    
    const handleGetSuggestions = async () => {
        if (!generationState.prompt.trim()) {
            setSuggestionError('Please enter a prompt to get suggestions.');
            setSuggestions([]);
            setShowSuggestions(true);
            return;
        }
        setIsSuggesting(true);
        setSuggestionError(null);
        setSuggestions([]);
        setShowSuggestions(true); // Always show the panel when fetching suggestions

        const response = await getPromptSuggestions(generationState.prompt);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setSuggestions(response.suggestions);
            if (response.suggestions.length === 0) {
                setSuggestionError("No suggestions could be generated for this prompt.");
            }
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setSuggestionError(response.error);
        }
        setIsSuggesting(false);
    };

    const handleApplySuggestion = (suggestion: string) => {
        setGenerationState(prev => ({ ...prev, prompt: suggestion }));
    };

    const handleClearSuggestions = () => {
        setShowSuggestions(false);
        setSuggestions([]);
        setSuggestionError(null);
    };


    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="code-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Prompt</label>
                <textarea
                    id="code-prompt"
                    value={generationState.prompt}
                    onChange={handlePromptChange}
                    placeholder="e.g., Create a React component that fetches and displays a list of users from an API."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={4}
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
                    disabled={isLoading || !generationState.prompt}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating Code...' : 'Generate Code'}
                </button>
                <button
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting || isLoading}
                    className="flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:bg-background-secondary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    <SparkleIcon className="h-4 w-4 mr-2" />
                    {isSuggesting ? 'Refining...' : 'Refine Prompt with AI'}
                </button>
                 <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {generationState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{generationState.error}</div>}
            
            {showSuggestions && (isSuggesting || suggestionError || suggestions.length > 0) && (
                <div className="bg-background-secondary p-4 rounded-md border border-border-primary space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-border-primary">
                        <h4 className="font-bold text-text-primary uppercase flex items-center">
                            <SparkleIcon className="h-4 w-4 mr-2 text-accent-light" />
                            AI Prompt Refinements
                        </h4>
                         <button
                            onClick={handleClearSuggestions}
                            className="text-xs text-text-default hover:text-text-primary transition-colors"
                        >
                            Clear Suggestions
                        </button>
                    </div>
                    {isSuggesting && (
                        <div className="text-center p-4">
                            <div className="w-6 h-6 border-4 border-accent-light border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-accent-light">Generating suggestions...</p>
                        </div>
                    )}
                    {suggestionError && !isSuggesting && (
                        <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{suggestionError}</div>
                    )}
                    {!isSuggesting && suggestions.length > 0 && (
                        <div className="space-y-2">
                            {suggestions.map((s, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleApplySuggestion(s)}
                                    className="block w-full text-left p-3 bg-background-tertiary text-text-default rounded-md text-xs hover:bg-border-primary transition-colors duration-200 border border-border-secondary hover:border-accent-border"
                                >
                                    <span className="font-bold text-accent-light mr-2">Suggestion {index + 1}:</span>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {(isLoading || generationState.resultCode) && (
                <div className="bg-background-primary rounded-md border border-border-primary">
                    <div className="flex justify-between items-center p-2 bg-background-tertiary rounded-t-md">
                        <h4 className="font-bold text-text-primary text-sm ml-2 uppercase">Generated Code</h4>
                        {generationState.resultCode && !isLoading && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center bg-background-tertiary text-text-primary px-3 py-1 rounded-md text-xs font-semibold uppercase hover:bg-border-primary hover:text-white transition-colors duration-200"
                            >
                                <CopyIcon className="h-3 w-3 mr-2" />
                                {copyStatus}
                            </button>
                        )}
                    </div>
                    <div className="p-4 overflow-x-auto max-h-96">
                         {isLoading && <div className="w-6 h-6 border-4 border-accent-light border-t-transparent rounded-full animate-spin"></div>}
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

export default CodeGenerationTab;