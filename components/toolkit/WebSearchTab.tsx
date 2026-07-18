
import React, { useState } from 'react';
import { groundedSearch } from '../../services/aiToolkitService';
import type { GroundingChunk } from '../../types/toolkit.types';
import SourceLink from './SourceLink';
import useLocalStorage from '../../hooks/useLocalStorage';
import { CopyIcon } from '../icons/CopyIcon';

interface SearchState {
    prompt: string;
    result: { text: string; sources: GroundingChunk[] } | null;
    error: string | null;
}

const initialState: SearchState = {
    prompt: '',
    result: null,
    error: null,
};

const WebSearchTab: React.FC = () => {
    const [searchState, setSearchState] = useLocalStorage<SearchState>('searchTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [copyStatus, setCopyStatus] = useState('Copy All Sources');

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSearchState(prev => ({...prev, prompt: e.target.value}));
    };
    
    const handleSearch = async (tool: 'googleSearch' | 'googleMaps') => {
        if (!searchState.prompt) {
            setSearchState(prev => ({...prev, error: 'Please provide a search query.'}));
            return;
        }
        setIsLoading(true);
        setSearchState(prev => ({...prev, result: null, error: null}));
        const response = await groundedSearch(searchState.prompt, tool);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setSearchState(prev => ({...prev, result: { text: response.text, sources: response.sources }}));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setSearchState(prev => ({...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setSearchState(initialState);
    };

    const handleCopySources = () => {
        if (!searchState.result || searchState.result.sources.length === 0) return;

        const allUris = searchState.result.sources.flatMap(chunk => {
            const uris: string[] = [];
            const source = chunk.web || chunk.maps;
            if (source?.uri) {
                uris.push(source.uri);
            }
            if (chunk.maps?.placeAnswerSources) {
                chunk.maps.placeAnswerSources.forEach(pa => {
                    pa.reviewSnippets.forEach(review => {
                        if (review.uri) uris.push(review.uri);
                    });
                });
            }
            return uris;
        }).filter(Boolean);

        const sourcesText = allUris.join('\n');
    
        navigator.clipboard.writeText(sourcesText).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy All Sources'), 2000);
        }).catch(() => {
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Copy All Sources'), 2000);
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="search-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Query</label>
                <textarea
                    id="search-prompt"
                    value={searchState.prompt}
                    onChange={handlePromptChange}
                    placeholder="Ask a question requiring up-to-date information from the web or maps..."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 <button
                    onClick={() => handleSearch('googleSearch')}
                    disabled={isLoading || !searchState.prompt}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-cyan-900/80 text-accent-lighter hover:bg-cyan-800/90 disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Searching...' : 'Search Web'}
                </button>
                 <button
                    onClick={() => handleSearch('googleMaps')}
                    disabled={isLoading || !searchState.prompt}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-cyan-900/80 text-accent-lighter hover:bg-cyan-800/90 disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Searching...' : 'Search Maps'}
                </button>
            </div>
             <button
                onClick={handleClear}
                className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
            >
               Clear History
            </button>

            {searchState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{searchState.error}</div>}
            
            {isLoading && <div className="text-center p-4 text-sm text-text-default">Searching...</div>}

            {searchState.result && (
                <div className="bg-background-primary p-4 rounded-md border border-border-primary space-y-4">
                    <div>
                        <h4 className="font-bold text-text-primary mb-2 uppercase">Search Result</h4>
                        <p className="text-sm text-text-default whitespace-pre-wrap">{searchState.result.text}</p>
                    </div>
                    {searchState.result.sources.length > 0 && (
                        <div>
                             <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-text-primary uppercase">Sources</h4>
                                <button
                                    onClick={handleCopySources}
                                    className="flex items-center bg-background-tertiary text-text-primary px-3 py-1 rounded-md text-xs font-semibold uppercase hover:bg-border-primary hover:text-white transition-colors duration-200"
                                >
                                    <CopyIcon className="h-3 w-3 mr-2" />
                                    {copyStatus}
                                </button>
                             </div>
                             <div className="space-y-2">
                                {searchState.result.sources.map((chunk, index) => (
                                    <SourceLink key={index} chunk={chunk} />
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WebSearchTab;