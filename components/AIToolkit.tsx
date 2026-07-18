import React from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    AnalysisIcon, BarChartIcon, CodeIcon, EditIcon, FileIcon,
    GlobeIcon, ImageIcon, MicrophoneIcon, SpeakerIcon, VideoIcon, WaveformIcon, SynthesizerIcon
} from './icons/AIToolkitIcons';

import ImageAnalysisTab from './toolkit/ImageAnalysisTab';
import ImageGenerationTab from './toolkit/ImageGenerationTab';
import ImageEditingTab from './toolkit/ImageEditingTab';
import WebSearchTab from './toolkit/WebSearchTab';
import CodeGenerationTab from './toolkit/CodeGenerationTab';
import DataAnalysisTab from './toolkit/DataAnalysisTab';
import FileGenerationTab from './toolkit/FileGenerationTab';
import VideoGenerationTab from './toolkit/VideoGenerationTab';
// FIX: Changed to named import to resolve module resolution error.
import { TranscriptionTab } from './toolkit/TranscriptionTab';
import TextToSpeechTab from './toolkit/TextToSpeechTab';
import LiveConversationTab from './toolkit/LiveConversationTab';
import DemoSynthesizerTab from './toolkit/DemoSynthesizerTab';


const tabs = [
    { name: 'Image Analysis', icon: AnalysisIcon, component: ImageAnalysisTab },
    { name: 'Image Generation', icon: ImageIcon, component: ImageGenerationTab },
    { name: 'Image Editing', icon: EditIcon, component: ImageEditingTab },
    { name: 'Web & Maps Search', icon: GlobeIcon, component: WebSearchTab },
    { name: 'Code Generation', icon: CodeIcon, component: CodeGenerationTab },
    { name: 'Data Analysis', icon: BarChartIcon, component: DataAnalysisTab },
    { name: 'File Generation', icon: FileIcon, component: FileGenerationTab },
    { name: 'Video Generation', icon: VideoIcon, component: VideoGenerationTab },
    { name: 'Transcription', icon: MicrophoneIcon, component: TranscriptionTab },
    { name: 'Text-to-Speech', icon: SpeakerIcon, component: TextToSpeechTab },
    { name: 'Live Conversation', icon: WaveformIcon, component: LiveConversationTab },
    { name: 'Demo Synthesizer', icon: SynthesizerIcon, component: DemoSynthesizerTab },
];

const AIToolkit: React.FC = () => {
    const [activeTab, setActiveTab] = useLocalStorage('aiToolkitActiveTab', 0);
    const ActiveComponent = tabs[activeTab].component;
    const ActiveIcon = tabs[activeTab].icon;

    return (
        <div className="textured-panel border border-border-primary rounded-lg">
            <header className="flex justify-between items-center p-4 border-b border-border-primary">
                <div className="flex items-center">
                    <ActiveIcon className="h-6 w-6 text-accent-light mr-3" />
                    <h2 className="font-oswald text-xl uppercase text-text-primary">
                        AI Toolkit: <span className="text-accent-lighter">{tabs[activeTab].name}</span>
                    </h2>
                </div>
            </header>

            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border-primary p-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(index)}
                                className={`flex items-center w-full text-left p-2.5 my-0.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                    activeTab === index
                                        ? 'bg-accent text-accent-text'
                                        : 'text-text-default hover:bg-background-tertiary'
                                }`}
                            >
                                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{tab.name}</span>
                            </button>
                        );
                    })}
                </aside>

                <main className="p-4 flex-grow w-full">
                    <ActiveComponent />
                </main>
            </div>
        </div>
    );
};

export default AIToolkit;