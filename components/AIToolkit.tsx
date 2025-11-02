import React from 'react';
import { ChevronIcon } from './icons/ChevronIcon';
import ImageAnalysisTab from './toolkit/ImageAnalysisTab';
import ImageGenerationTab from './toolkit/ImageGenerationTab';
import WebSearchTab from './toolkit/WebSearchTab';
import CodeGenerationTab from './toolkit/CodeGenerationTab';
import DataAnalysisTab from './toolkit/DataAnalysisTab';
import FileGenerationTab from './toolkit/FileGenerationTab';
import VideoGenerationTab from './toolkit/VideoGenerationTab';
import { AnalyzeIcon, GenerateIcon, SearchIcon, CodeIcon, ChartIcon, FileIcon, VideoIcon } from './icons/AIToolkitIcons';
import useLocalStorage from '../hooks/useLocalStorage';

type Tab = 'Analyze' | 'Generate' | 'Video' | 'Search' | 'Code' | 'Data' | 'File';

const AIToolkit: React.FC = () => {
    const [isExpanded, setIsExpanded] = useLocalStorage('aiToolkitExpanded', false);
    const [activeTab, setActiveTab] = useLocalStorage<Tab>('aiToolkitActiveTab', 'Analyze');

    const tabs: { name: Tab, icon: React.FC<{className?: string}> }[] = [
        { name: 'Analyze', icon: AnalyzeIcon },
        { name: 'Generate', icon: GenerateIcon },
        { name: 'Video', icon: VideoIcon },
        { name: 'Search', icon: SearchIcon },
        { name: 'Code', icon: CodeIcon },
        { name: 'Data', icon: ChartIcon },
        { name: 'File', icon: FileIcon },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Analyze':
                return <ImageAnalysisTab />;
            case 'Generate':
                return <ImageGenerationTab />;
            case 'Video':
                return <VideoGenerationTab />;
            case 'Search':
                return <WebSearchTab />;
            case 'Code':
                return <CodeGenerationTab />;
            case 'Data':
                return <DataAnalysisTab />;
            case 'File':
                return <FileGenerationTab />;
            default:
                return null;
        }
    };

    return (
        <div className="textured-panel border border-border-primary rounded-lg">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 bg-background-secondary hover:bg-border-primary transition-colors duration-200 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-border"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center">
                    <h2 className="font-oswald text-xl uppercase tracking-widest text-text-primary">AI Assistant</h2>
                </div>
                <ChevronIcon className={`h-5 w-5 text-text-default transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-border-primary">
                    <div className="flex border-b border-border-primary mb-4 overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`flex items-center px-4 py-2 text-sm font-semibold uppercase transition-colors duration-200 focus:outline-none -mb-px border-b-2 whitespace-nowrap ${activeTab === tab.name ? 'border-accent-border text-accent-light' : 'border-transparent text-text-default hover:text-text-primary'}`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>
                    <div>
                        {renderTabContent()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIToolkit;