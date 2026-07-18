
import React, { useState, useEffect, useRef } from 'react';
import { generateVideo } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';

interface GenerationState {
    prompt: string;
    resultVideoUrl: string | null;
    error: string | null;
    resolution: '720p' | '1080p';
    aspectRatio: '16:9' | '9:16';
}

const resolutions: ('720p' | '1080p')[] = ['720p', '1080p'];
const aspectRatios: ('16:9' | '9:16')[] = ['16:9', '9:16'];

const initialState: GenerationState = {
    prompt: 'A neon hologram of a cat driving a futuristic car at top speed through a cyberpunk city.',
    resultVideoUrl: null,
    error: null,
    resolution: '720p',
    aspectRatio: '16:9',
};

const loadingMessages = [
    "Initializing video synthesis engine...",
    "Allocating dedicated generation resources...",
    "Analyzing prompt semantics...",
    "Rendering initial frames (this can take a few minutes)...",
    "Compositing video stream...",
    "Applying post-processing effects...",
    "Finalizing video output, almost there...",
];

const VideoGenerationTab: React.FC = () => {
    const [generationState, setGenerationState] = useLocalStorage<GenerationState>('videoGenerationTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const videoUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            } else {
                setApiKeySelected(true); // Fallback if aistudio object is not available, assume key exists
            }
        };
        checkApiKey();
    }, []);

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            let i = 0;
            interval = window.setInterval(() => {
                i = (i + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[i]);
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);
    
    useEffect(() => {
        return () => {
            if (videoUrlRef.current) {
                URL.revokeObjectURL(videoUrlRef.current);
            }
        };
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        if (!generationState.prompt) {
            setGenerationState(prev => ({ ...prev, error: 'Please provide a prompt.' }));
            return;
        }

        if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }

        setIsLoading(true);
        setLoadingMessage(loadingMessages[0]);
        setGenerationState(prev => ({ ...prev, resultVideoUrl: null, error: null }));
        
        const response = await generateVideo(generationState.prompt, generationState.resolution, generationState.aspectRatio);
        
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            const url = URL.createObjectURL(response.video);
            videoUrlRef.current = url;
            setGenerationState(prev => ({ ...prev, resultVideoUrl: url }));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            let errorMessage = response.error;
            if (errorMessage.includes("Requested entity was not found.")) {
                errorMessage = "API Key not found or invalid for Veo. Please select a valid, billing-enabled API key and try again.";
                setApiKeySelected(false);
            }
            setGenerationState(prev => ({ ...prev, error: errorMessage }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setGenerationState(initialState);
         if (videoUrlRef.current) {
            URL.revokeObjectURL(videoUrlRef.current);
            videoUrlRef.current = null;
        }
    };
    
    if (apiKeySelected === null) {
        return <div className="text-center p-4">Checking API key status...</div>;
    }

    if (!apiKeySelected) {
        return (
             <div className="bg-warning-faded border border-yellow-700 text-yellow-300 p-4 rounded-lg text-center space-y-3">
                <h3 className="font-bold uppercase">API Key Required for Video Generation</h3>
                <p className="text-xs">The Veo video model requires a user-selected API key with billing enabled.</p>
                <p className="text-xs">For more information, please see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">billing documentation</a>.</p>
                <button onClick={handleSelectKey} className="bg-accent text-accent-text px-4 py-2 rounded-md text-sm font-semibold uppercase hover:bg-accent-hover">
                    Select API Key
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="video-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Prompt</label>
                <textarea
                    id="video-prompt"
                    value={generationState.prompt}
                    onChange={(e) => setGenerationState(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="e.g., A majestic lion waking up at sunrise on the savannah."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-text-default mb-2 uppercase tracking-wider">Resolution</label>
                    <div className="flex flex-wrap gap-2">
                        {resolutions.map(res => (
                            <button
                                key={res}
                                onClick={() => setGenerationState(prev => ({...prev, resolution: res}))}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors duration-200 border ${generationState.resolution === res ? 'bg-accent text-accent-text border-accent-border' : 'bg-background-tertiary text-text-primary border-border-secondary hover:border-accent-border'}`}
                            >
                                {res}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-text-default mb-2 uppercase tracking-wider">Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setGenerationState(prev => ({...prev, aspectRatio: ratio}))}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors duration-200 border ${generationState.aspectRatio === ratio ? 'bg-accent text-accent-text border-accent-border' : 'bg-background-tertiary text-text-primary border-border-secondary hover:border-accent-border'}`}
                            >
                                {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !generationState.prompt}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating Video...' : 'Generate Video'}
                </button>
                 <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {generationState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{generationState.error}</div>}
            
            <div className="bg-background-primary p-4 rounded-md border border-border-primary min-h-[256px] flex items-center justify-center">
                {isLoading && (
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-accent-light border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-sm text-accent-light mt-4">{loadingMessage}</p>
                    </div>
                )}
                {generationState.resultVideoUrl && (
                     <video src={generationState.resultVideoUrl} controls autoPlay loop className="max-w-full max-h-96 rounded-md bg-black" />
                )}
                {!isLoading && !generationState.resultVideoUrl && <p className="text-sm text-text-secondary">Video will appear here</p>}
            </div>
        </div>
    );
};

export default VideoGenerationTab;