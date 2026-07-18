
import React, { useState } from 'react';
import { synthesizeDemoScenes, generateImage, generateSpeech } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import { DownloadIcon } from '../icons/DownloadIcon';
import { SpeakerIcon } from '../icons/AIToolkitIcons';
import type { DemoScene } from '../../types/toolkit.types';

const defaultScript = `Scene 1: Introduction
Narrative: In today's fast-paced enterprise environment, generating consistent, high-quality documentation is a major bottleneck. Arbitra is here to change that.
Visuals: A sleek, futuristic command center interface with glowing blue holograms. The main screen shows a complex architectural diagram. The mood is professional and cutting-edge.

Scene 2: The Problem
Narrative: Teams waste countless hours manually creating, updating, and synchronizing dozens of artifacts, from technical specs to sales decks. This leads to errors, delays, and misalignment.
Visuals: A split-screen view. On one side, a frustrated engineer is surrounded by messy whiteboards and sticky notes. On the other, a sales executive looks confused at an outdated product slide. Style is slightly dramatic with shadow contrasts.

Scene 3: The Solution
Narrative: Arbitra's AI-powered foundry takes a single source of truth and autonomously generates a complete, enterprise-grade artifact pack in minutes, ensuring perfect alignment across all departments.
Visuals: A central, glowing orb of data labeled "Source Corpus" with lines of light extending outwards to icons representing different documents (code, charts, text). The background is clean and abstract.

Scene 4: The Result
Narrative: The result? Drastically accelerated project timelines, empowered teams, and a truly unified vision, from engineering to go-to-market. Welcome to the future of enterprise agility.
Visuals: A diverse group of professionals (工程师, product managers, sales reps) collaborating successfully in a modern office. They look confident and happy. The lighting is bright and optimistic.`;

interface SceneResult extends DemoScene {
    imageUrl?: string;
    audioBuffer?: AudioBuffer;
    audioContext?: AudioContext;
    isGenerating?: boolean;
}

const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  const channels: Float32Array[] = [];
  let pos = 0;

  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }
  
  let offset = 0;
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([view], { type: "audio/wav" });
};

const DemoSynthesizerTab: React.FC = () => {
    const [script, setScript] = useLocalStorage<string>('demoSynthesizerScript', defaultScript);
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sceneResults, setSceneResults] = useState<SceneResult[]>([]);
    
    const resetState = (clearScript = false) => {
        setIsLoading(false);
        setProgressMessage('');
        setError(null);
        setSceneResults([]);
        if(clearScript) setScript(defaultScript);
    };

    const handleSynthesize = async () => {
        resetState();
        if (!script.trim()) {
            setError('Please provide a demo script.');
            return;
        }
        setIsLoading(true);
        
        try {
            setProgressMessage('Step 1/2: Analyzing script and creating scenes...');
            const sceneResponse = await synthesizeDemoScenes(script);
            
            // Ensure type narrowing for discriminated union.
            if (sceneResponse.success) { 
                const initialResults: SceneResult[] = sceneResponse.result.scenes.map(s => ({
                    scene: s.scene,
                    narrative: s.narrative,
                    visual_prompt: s.visual_prompt,
                    isGenerating: true
                }));
                setSceneResults(initialResults);

                const totalScenes = initialResults.length;

                for (let i = 0; i < totalScenes; i++) {
                    setProgressMessage(`Step 2/2: Generating assets for Scene ${i + 1}/${totalScenes}...`);
                    
                    // Access from the state directly to ensure correct typing and reactivity
                    const currentScene: DemoScene = initialResults[i];

                    const [imageRes, audioRes] = await Promise.all([
                        generateImage(currentScene.visual_prompt, '16:9', 'Cinematic'),
                        generateSpeech(currentScene.narrative)
                    ]);

                    setSceneResults(prev => {
                        const newResults = [...prev];
                        const updatedScene = { ...newResults[i] }; // Create a copy to avoid direct state mutation
                        updatedScene.isGenerating = false;
                        
                        // Ensure type narrowing for discriminated union.
                        if (imageRes.success) {
                            updatedScene.imageUrl = imageRes.image;
                        } else {
                            // FIX: Accessing imageRes.error is safe here because the type has been narrowed to ErrorResponse.
                            console.error(`Image generation failed for scene ${i + 1}:`, imageRes.error);
                        }
                        // Ensure type narrowing for discriminated union.
                        if (audioRes.success) {
                            updatedScene.audioBuffer = audioRes.audioBuffer;
                            updatedScene.audioContext = audioRes.audioContext;
                        } else {
                            // FIX: Accessing audioRes.error is safe here because the type has been narrowed to ErrorResponse.
                             console.error(`Audio generation failed for scene ${i + 1}:`, audioRes.error);
                        }
                        newResults[i] = updatedScene; // Replace the scene with the updated copy
                        return newResults;
                    });
                }
                setProgressMessage('Synthesis complete!');
            } else { 
                // FIX: Accessing sceneResponse.error is safe here because the type has been narrowed to ErrorResponse.
                throw new Error(sceneResponse.error);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            setSceneResults([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePlayAudio = (scene: SceneResult) => {
        if (scene.audioBuffer && scene.audioContext) {
            const source = scene.audioContext.createBufferSource();
            source.buffer = scene.audioBuffer;
            source.connect(scene.audioContext.destination);
            source.start();
        }
    };

    const handleDownloadAudio = (blob: Blob | null, filename: string) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadImage = (imageUrl: string, filename: string) => {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="demo-script" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Demo Script</label>
                <textarea
                    id="demo-script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter your demo script here..."
                    className="w-full h-40 p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary font-mono text-xs"
                    disabled={isLoading}
                />
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleSynthesize}
                    disabled={isLoading}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Synthesizing...' : 'Synthesize Demo'}
                </button>
                <button
                    onClick={() => resetState(true)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Reset
                </button>
            </div>

            {error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{error}</div>}
            
            {(isLoading || sceneResults.length > 0) && (
                <div className="bg-background-primary p-4 rounded-md border border-border-primary">
                    <h4 className="font-bold text-text-primary mb-2 uppercase">Synthesized Scenes</h4>
                    {isLoading && (
                         <div className="text-center p-8">
                            <div className="w-8 h-8 border-4 border-accent-light border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm text-accent-light mt-4">{progressMessage}</p>
                        </div>
                    )}
                    {!isLoading && progressMessage && sceneResults.length > 0 && <p className="text-sm text-success text-center mb-4">{progressMessage}</p>}
                    
                    <div className="space-y-6">
                        {sceneResults.map((scene, index) => (
                            <div key={index} className="p-4 bg-background-secondary rounded-lg border border-border-secondary">
                                <h5 className="font-oswald text-lg uppercase text-accent-lighter">Scene {scene.scene}</h5>
                                <p className="text-sm text-text-default italic mt-1 mb-3">"{scene.narrative}"</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <div className="aspect-video bg-background-tertiary rounded-md flex items-center justify-center overflow-hidden border border-border-primary">
                                        {scene.isGenerating ? (
                                            <div className="w-6 h-6 border-2 border-accent-light border-t-transparent rounded-full animate-spin"></div>
                                        ) : scene.imageUrl ? (
                                            <img src={scene.imageUrl} alt={`Visual for scene ${scene.scene}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <p className="text-xs text-danger">Image Failed</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                         <button
                                            onClick={() => handlePlayAudio(scene)}
                                            disabled={!scene.audioBuffer || scene.isGenerating}
                                            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary disabled:opacity-50"
                                        >
                                            <SpeakerIcon className="h-4 w-4 mr-2" />
                                            Play Narration
                                        </button>
                                        <button
                                            onClick={() => handleDownloadImage(scene.imageUrl!, `scene_${scene.scene}_image.jpg`)}
                                            disabled={!scene.imageUrl || scene.isGenerating}
                                            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-cyan-900/70 text-accent-lighter hover:bg-cyan-800/80 disabled:opacity-50"
                                        >
                                            <DownloadIcon className="h-4 w-4 mr-2" />
                                            Download Image
                                        </button>
                                        <button
                                            onClick={() => handleDownloadAudio(audioBufferToWav(scene.audioBuffer!), `scene_${scene.scene}_narration.wav`)}
                                            disabled={!scene.audioBuffer || scene.isGenerating}
                                            className="flex items-center justify-center w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-cyan-900/70 text-accent-lighter hover:bg-cyan-800/80 disabled:opacity-50"
                                        >
                                            <DownloadIcon className="h-4 w-4 mr-2" />
                                            Download Audio
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemoSynthesizerTab;