
import React, { useState } from 'react';
import { analyzeData } from '../../services/aiToolkitService';
import useLocalStorage from '../../hooks/useLocalStorage';
import type { AnalysisResult, ChartData } from '../../types/toolkit.types';

interface AnalysisState {
    prompt: string;
    data: string;
    result: AnalysisResult | null;
    error: string | null;
}

const initialState: AnalysisState = {
    prompt: '',
    data: 'Region,Sales,Leads\nNorth,50000,120\nSouth,75000,180\nEast,62000,150\nWest,98000,210',
    result: null,
    error: null,
};

const BarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (data.length === 0) {
        return <p className="text-xs text-text-secondary">No data available for visualization.</p>;
    }
    return (
        <div className="space-y-2">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-20 text-text-default truncate text-right">{item.label}</div>
                    <div className="flex-1 bg-background-tertiary rounded-sm h-5 border border-border-primary">
                        <div
                            className="bg-accent-emphasis h-full rounded-sm"
                            style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                        ></div>
                    </div>
                    <div className="w-12 text-text-primary font-mono">{item.value.toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
};


const DataAnalysisTab: React.FC = () => {
    const [analysisState, setAnalysisState] = useLocalStorage<AnalysisState>('dataAnalysisTabState', initialState);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!analysisState.prompt || !analysisState.data) {
            setAnalysisState(prev => ({ ...prev, error: 'Please provide both data and a prompt.' }));
            return;
        }
        setIsLoading(true);
        setAnalysisState(prev => ({ ...prev, result: null, error: null }));
        const response = await analyzeData(analysisState.prompt, analysisState.data);
        // Ensure type narrowing for discriminated union.
        if (response.success) {
            setAnalysisState(prev => ({ ...prev, result: response.result }));
        } else {
            // FIX: Accessing response.error is safe here because the type has been narrowed to ErrorResponse.
            setAnalysisState(prev => ({ ...prev, error: response.error }));
        }
        setIsLoading(false);
    };

    const handleClear = () => {
        setAnalysisState(prev => ({...initialState, data: prev.data, prompt: prev.prompt}));
        setAnalysisState(initialState);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="data-input" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Data (CSV, JSON, etc.)</label>
                    <textarea
                        id="data-input"
                        value={analysisState.data}
                        onChange={(e) => setAnalysisState(prev => ({ ...prev, data: e.target.value }))}
                        placeholder="Paste your raw data here..."
                        className="w-full h-40 p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary font-mono text-xs"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="analysis-prompt" className="block text-xs text-text-default mb-1 uppercase tracking-wider">Analysis Prompt</label>
                    <textarea
                        id="analysis-prompt"
                        value={analysisState.prompt}
                        onChange={(e) => setAnalysisState(prev => ({ ...prev, prompt: e.target.value }))}
                        placeholder="e.g., Summarize sales performance and create a bar chart of sales by region."
                        className="w-full h-40 p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border resize-none border border-border-primary"
                        disabled={isLoading}
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !analysisState.prompt || !analysisState.data}
                    className="w-full px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-accent text-accent-text hover:bg-accent-hover disabled:bg-background-tertiary disabled:text-text-muted disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Analyzing...' : 'Analyze Data'}
                </button>
                 <button
                    onClick={handleClear}
                    className="px-4 py-2 rounded-md text-sm font-semibold uppercase transition-colors duration-200 bg-background-tertiary text-text-primary hover:bg-border-primary"
                >
                   Clear
                </button>
            </div>
            {analysisState.error && <div className="bg-danger-faded border border-border-danger text-danger px-4 py-2 rounded-md text-xs">{analysisState.error}</div>}
            {isLoading && <div className="text-center p-4 text-sm text-text-default">Analyzing data...</div>}
            
            {analysisState.result && (
                <div className="bg-background-primary p-4 rounded-md border border-border-primary space-y-4">
                    <div>
                        <h4 className="font-bold text-text-primary mb-2 uppercase">Analysis Summary</h4>
                        <p className="text-sm text-text-default whitespace-pre-wrap">{analysisState.result.summary}</p>
                    </div>
                     <div>
                        <h4 className="font-bold text-text-primary mb-2 uppercase">Visualization</h4>
                        <BarChart data={analysisState.result.chartData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataAnalysisTab;