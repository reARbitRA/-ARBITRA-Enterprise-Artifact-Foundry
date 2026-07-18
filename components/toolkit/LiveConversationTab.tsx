
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { startLiveConversation, encode, decode, decodeAudioData } from '../../services/aiToolkitService';
import type { LiveServerMessage, Blob as GenAI_Blob } from '@google/genai';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface TranscriptEntry {
    speaker: 'user' | 'bot';
    text: string;
    isPartial?: boolean;
}

const LiveConversationTab: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    const handleStop = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
             outputAudioContextRef.current.close();
        }

        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setConnectionState('disconnected');
    }, []);
    
    useEffect(() => {
        return () => handleStop();
    }, [handleStop]);

    const handleStart = async () => {
        setConnectionState('connecting');
        setError(null);
        setTranscript([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const result = startLiveConversation({
                onopen: () => {
                    setConnectionState('connected');
                    const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob: GenAI_Blob = {
                            data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio) {
                        const outputCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                        const source = outputCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputCtx.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(s => s.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }

                    setTranscript(prev => {
                        const newTranscript = [...prev];
                        if (message.serverContent?.inputTranscription) {
                            const last = newTranscript[newTranscript.length - 1];
                            if (last?.speaker === 'user' && last.isPartial) {
                                last.text += message.serverContent.inputTranscription.text;
                            } else {
                                newTranscript.push({ speaker: 'user', text: message.serverContent.inputTranscription.text, isPartial: true });
                            }
                        }
                        if (message.serverContent?.outputTranscription) {
                            const last = newTranscript[newTranscript.length - 1];
                             // FIX: Use 'bot' as speaker to match TranscriptEntry type
                             if (last?.speaker === 'bot' && last.isPartial) {
                                last.text += message.serverContent.outputTranscription.text;
                            } else {
                                // FIX: Use 'bot' as speaker to match TranscriptEntry type
                                newTranscript.push({ speaker: 'bot', text: message.serverContent.outputTranscription.text, isPartial: true });
                            }
                        }
                         if (message.serverContent?.turnComplete) {
                            return newTranscript.map(t => ({ ...t, isPartial: false }));
                        }
                        return newTranscript;
                    });
                },
                onerror: (e: ErrorEvent) => {
                    setError(`Connection error: ${e.message}`);
                    setConnectionState('error');
                    handleStop();
                },
                onclose: () => {
                   handleStop();
                },
            });

            // Ensure type narrowing for discriminated union.
            if (result.success) {
                sessionPromiseRef.current = result.sessionPromise;
            } else {
                // FIX: Accessing result.error is safe here because the type has been narrowed to ErrorResponse.
                throw new Error(result.error);
            }
        } catch (err) {
            setError(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
            setConnectionState('error');
            handleStop();
        }
    };

    const isLive = connectionState === 'connected' || connectionState === 'connecting';

    return (
        <div className="space-y-4">
            <div className="p-4 bg-background-primary border-2 border-dashed border-border-primary rounded-lg text-center">
                <h3 className="font-oswald text-lg uppercase text-text-primary mb-2">Live Conversation with Gemini</h3>
                 <p className="text-xs text-text-secondary mb-4">Click "Start" to begin a real-time voice conversation. Your audio will be streamed for transcription and response.</p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={isLive ? handleStop : handleStart}
                        className={`px-6 py-2 w-40 rounded-md font-semibold uppercase transition-colors duration-200 text-sm ${isLive ? 'bg-danger-faded text-danger border border-border-danger hover:bg-red-800/80' : 'bg-accent text-accent-text hover:bg-accent-hover'}`}
                    >
                        {connectionState === 'connecting' ? 'Connecting...' : isLive ? 'Stop' : 'Start'}
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            connectionState === 'connected' ? 'bg-success animate-pulse' :
                            connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                            connectionState === 'error' ? 'bg-danger' : 'bg-text-muted'
                        }`}></div>
                        <span className="text-xs text-text-default capitalize">{connectionState}</span>
                    </div>
                </div>
            </div>

            {error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{error}</div>}

            <div className="h-80 bg-background-primary p-4 rounded-md border border-border-primary overflow-y-auto space-y-3">
                 {transcript.length === 0 && <p className="text-sm text-text-secondary text-center h-full flex items-center justify-center">Transcript will appear here...</p>}
                 {transcript.map((entry, index) => (
                    <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${entry.speaker === 'user' ? 'bg-accent text-accent-text' : 'bg-background-tertiary text-text-default'}`}>
                            <span className={`font-bold block uppercase text-xs mb-1 ${entry.speaker === 'user' ? 'text-cyan-200' : 'text-text-primary'}`}>{entry.speaker}</span>
                            <p className={entry.isPartial ? 'opacity-70' : ''}>{entry.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={transcriptEndRef} />
            </div>
        </div>
    );
};

export default LiveConversationTab;