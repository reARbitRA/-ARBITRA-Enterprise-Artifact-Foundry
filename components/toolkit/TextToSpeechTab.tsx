
import React, { useState } from 'react';
import { generateSpeech } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import { SpeakerIcon } from '../icons/AIToolkitIcons';

interface TTSState {
    text: string;
    error: string | null;
}

const initialState: TTSState = {
    text: 'Hello, this is Gemini. I can convert your text into speech.',
    error: null,
};

const TextToSpeechTab: React.FC = () => {
    const [ttsState, setTtsState] = useLocalStorage<TTSState>('ttsTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateAndPlay = async () => {
        if (!ttsState.text) {
            setTtsState(prev => ({ ...prev, error: 'Please provide some text to synthesize.' }));
            return;
        }
        setIsLoading(true);
        setTtsState(prev => ({ ...prev, error: null }));
        const response = await generateSpeech(ttsState.text);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            const { audioBuffer, audioContext } = response;
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setTtsState(prev => ({ ...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setTtsState(initialState);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="tts-text" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Text to Synthesize</label>
                <textarea
                    id="tts-text"
                    value={ttsState.text}
                    onChange={(e) => setTtsState(prev => ({...prev, text: e.target.value}))}
                    placeholder="Enter text here..."
                    className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                    rows={5}
                    disabled={isLoading}
                />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleGenerateAndPlay}
                    disabled={isLoading || !ttsState.text}
                    className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    <SpeakerIcon className="h-4 w-4 mr-2" />
                    {isLoading ? 'Generating Audio...' : 'Generate and Play'}
                </button>
                 <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {ttsState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{ttsState.error}</div>}
        </div>
    );
};

export default TextToSpeechTab;