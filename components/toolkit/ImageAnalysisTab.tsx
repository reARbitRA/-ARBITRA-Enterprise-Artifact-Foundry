import React, { useState, useRef } from 'react';
import { analyzeImage } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';

interface AnalysisState {
    prompt: string;
    imagePreview: string | null;
    result: string | null;
    error: string | null;
}

const initialState: AnalysisState = {
    prompt: '',
    imagePreview: null,
    result: null,
    error: null,
};

const ImageAnalysisTab: React.FC = () => {
    const [analysisState, setAnalysisState] = useLocalStorage<AnalysisState>('analysisTabState', initialState);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAnalysisState(prev => ({
                    ...prev,
                    imagePreview: reader.result as string,
                    result: null,
                    error: null,
                }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAnalysisState(prev => ({...prev, prompt: e.target.value}));
    };

    const handleAnalyze = async () => {
        if (!analysisState.prompt || !imageFile) {
            setAnalysisState(prev => ({ ...prev, error: 'Please provide both an image and a prompt.' }));
            return;
        }
        setIsLoading(true);
        setAnalysisState(prev => ({ ...prev, result: null, error: null }));
        const response = await analyzeImage(analysisState.prompt, imageFile);
        if (response.success) {
            setAnalysisState(prev => ({ ...prev, result: response.text ?? 'No text returned.' }));
        } else {
            setAnalysisState(prev => ({ ...prev, error: response.error ?? 'An unknown error occurred.' }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setAnalysisState(initialState);
        setImageFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-text-default mb-1 uppercase tracking-wider">Image for Analysis</label>
                    <div
                        className="border-2 border-dashed border-border-primary rounded-lg p-4 text-center cursor-pointer hover:border-accent-border"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {analysisState.imagePreview ? (
                            <img src={analysisState.imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                        ) : (
                            <p className="text-sm text-text-secondary">Click to upload an image</p>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div>
                    <label htmlFor="image-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Prompt</label>
                    <textarea
                        id="image-prompt"
                        value={analysisState.prompt}
                        onChange={handlePromptChange}
                        placeholder="e.g., What is in this image? Describe the architecture style."
                        className="w-full h-40 p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !analysisState.prompt || !imageFile}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {analysisState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{analysisState.error}</div>}
            {analysisState.result && (
                <div className="bg-background-primary p-4 rounded-md border border-border-primary">
                    <h4 className="font-bold text-text-primary mb-2">Analysis Result</h4>
                    <p className="text-sm text-text-default whitespace-pre-wrap">{analysisState.result}</p>
                </div>
            )}
        </div>
    );
};

export default ImageAnalysisTab;