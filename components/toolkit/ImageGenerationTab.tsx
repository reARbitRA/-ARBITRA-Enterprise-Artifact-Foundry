import React, { useState } from 'react';
import { generateImage } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';

interface GenerationState {
    prompt: string;
    resultImage: string | null;
    error: string | null;
    aspectRatio: string;
    style: string;
}

const aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const styles = ['None', 'Photorealistic', 'Brutalist', 'Anime', 'Cinematic', 'Abstract', 'Pixel Art', 'Watercolor', 'Low Poly', 'Cyberpunk', 'Fantasy Art'];

const initialState: GenerationState = {
    prompt: '',
    resultImage: null,
    error: null,
    aspectRatio: '1:1',
    style: 'None',
};

const ImageGenerationTab: React.FC = () => {
    const [generationState, setGenerationState] = useLocalStorage<GenerationState>('generationTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setGenerationState(prev => ({...prev, prompt: e.target.value}));
    };

    const handleGenerate = async () => {
        if (!generationState.prompt) {
            setGenerationState(prev => ({ ...prev, error: 'Please provide a prompt.' }));
            return;
        }
        setIsLoading(true);
        setGenerationState(prev => ({ ...prev, resultImage: null, error: null }));
        const response = await generateImage(generationState.prompt, generationState.aspectRatio, generationState.style);
        if (response.success) {
            setGenerationState(prev => ({ ...prev, resultImage: response.image ?? null }));
        } else {
            setGenerationState(prev => ({ ...prev, error: response.error ?? 'An unknown error occurred.' }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setGenerationState(initialState);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="generate-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Prompt</label>
                <textarea
                    id="generate-prompt"
                    value={generationState.prompt}
                    onChange={handlePromptChange}
                    placeholder="e.g., A brutalist skyscraper made of obsidian, cinematic lighting, 8k detail."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={3}
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-text-default mb-2 uppercase tracking-wider">Aspect Ratio</label>
                    <div className="flex flex-wrap gap-2">
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio}
                                onClick={() => setGenerationState(prev => ({...prev, aspectRatio: ratio}))}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors duration-200 border ${generationState.aspectRatio === ratio ? 'bg-accent text-accent-text border-accent-border' : 'bg-background-tertiary text-text-primary border-border-secondary hover:border-accent-border'}`}
                            >
                                {ratio}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-text-default mb-2 uppercase tracking-wider">Style Preset</label>
                    <div className="flex flex-wrap gap-2">
                        {styles.map(style => (
                            <button
                                key={style}
                                onClick={() => setGenerationState(prev => ({...prev, style: style}))}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-colors duration-200 border ${generationState.style === style ? 'bg-accent text-accent-text border-accent-border' : 'bg-background-tertiary text-text-primary border-border-secondary hover:border-accent-border'}`}
                            >
                                {style}
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
                    {isLoading ? 'Generating...' : 'Generate Image'}
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
                {isLoading && <div className="w-8 h-8 border-4 border-accent-light border-t-transparent rounded-full animate-spin"></div>}
                {generationState.resultImage && <img src={generationState.resultImage} alt="Generated image" className="max-w-full max-h-96 rounded-md" />}
                {!isLoading && !generationState.resultImage && <p className="text-sm text-text-secondary">Image will appear here</p>}
            </div>
        </div>
    );
};

export default ImageGenerationTab;