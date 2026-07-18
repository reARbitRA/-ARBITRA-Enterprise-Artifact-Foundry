
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import { MicrophoneIcon } from '../icons/AIToolkitIcons';

interface TranscriptionState {
    result: string | null;
    error: string | null;
}

const initialState: TranscriptionState = {
    result: null,
    error: null,
};

export const TranscriptionTab: React.FC = () => {
    const [transcriptionState, setTranscriptionState] = useLocalStorage<TranscriptionState>('transcriptionTabState', initialState);
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        setTranscriptionState(initialState);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleTranscription;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            setTranscriptionState(prev => ({ ...prev, error: 'Microphone access was denied. Please enable it in your browser settings.' }));
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleTranscription = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const response = await transcribeAudio(audioBlob);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setTranscriptionState(prev => ({ ...prev, result: response.text }));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setTranscriptionState(prev => ({ ...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setTranscriptionState(initialState);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-8 bg-background-primary border-2 border-dashed border-border-primary rounded-lg">
                <MicrophoneIcon className={`h-12 w-12 mb-4 ${isRecording ? 'text-danger' : 'text-text-secondary'}`} />
                <p className="text-sm text-text-default mb-4">
                    {isRecording ? 'Recording in progress...' : 'Click the button to start recording'}
                </p>
                {!isRecording ? (
                    <button
                        onClick={handleStartRecording}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-md font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover"
                    >
                        Start Recording
                    </button>
                ) : (
                    <button
                        onClick={handleStopRecording}
                        className="px-6 py-2 rounded-md font-semibold uppercase transition-colors duration-200 bg-danger-faded text-danger border border-border-danger hover:bg-red-800/80"
                    >
                        Stop Recording
                    </button>
                )}
            </div>
             <button
                onClick={handleClear}
                disabled={isLoading || isRecording}
                className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:opacity-50"
            >
               Clear
            </button>
            {transcriptionState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{transcriptionState.error}</div>}
            {isLoading && <div className="text-center p-4 text-sm text-text-default">Transcribing...</div>}
            {transcriptionState.result && (
                <div className="bg-background-primary p-4 rounded-md border border-border-primary">
                    <h4 className="font-bold text-text-primary mb-2 uppercase">Transcription Result</h4>
                    <p className="text-sm text-text-default whitespace-pre-wrap">{transcriptionState.result}</p>
                </div>
            )}
        </div>
    );
};