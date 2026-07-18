import React, { useState, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import Header from './components/Header';
import CorpusInput from './components/CorpusInput';
import ArtifactDisplay from './components/ArtifactDisplay';
import Dashboard from './components/dashboard/Dashboard';
import AIToolkit from './components/AIToolkit';
import ChatBot from './components/ChatBot';
import BuildLog from './components/BuildLog';
import { TrashIcon } from './components/icons/CategoryIcons';
import type { Artifact } from './types/artifact.types';
import type { GeniusFocus } from './types/dashboard.types';
import { generateArtifactsForCategory, generateAllArtifactsWithGeniusMode } from './services/foundryService';
import { dashboardCategories } from './services/artifactRegistry';
import { useGenerationHistory } from './hooks/dashboard/useGenerationHistory';
import type { GenerationHistory } from './hooks/dashboard/useGenerationHistory';

const SESSION_STORAGE_KEY = 'arbitra-session';

interface BuildLogState {
    status: "PASS" | "FAIL";
    log: string[];
}

const App: React.FC = () => {
  const [corpus, setCorpus] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState<string[]>([]);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<{ [key: string]: Artifact[] }>({});
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [savedSessionExists, setSavedSessionExists] = useState(false);
  const [geniusFocus, setGeniusFocus] = useState<GeniusFocus>('balanced');
  const [buildLog, setBuildLog] = useState<BuildLogState | null>(null);
  const { history, saveToHistory, deleteHistoryItem, clearHistory } = useGenerationHistory();

  useEffect(() => {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    setSavedSessionExists(!!session);
  }, []);

  const handleLoadHistoryEntry = (entry: GenerationHistory) => {
    setCorpus(entry.corpus);
    setArtifacts(entry.artifacts);
    setGeniusFocus(entry.geniusFocus);
    setCompletedCategories(Object.keys(entry.artifacts));
    toast.success(`Loaded generation from ${new Date(entry.timestamp).toLocaleString()}`);
  };

  const handleGenerateCategory = useCallback(async (categoryName: string) => {
    if (loadingCategories.includes(categoryName) || completedCategories.includes(categoryName)) {
      return;
    }

    toast.info(`Starting generation for ${categoryName}...`);
    setLoadingCategories(prev => [...prev, categoryName]);
    if (!isGeneratingAll) {
        setErrorLog([]);
    }

    const category = dashboardCategories.find(c => c.name === categoryName);
    if (!category) {
      setErrorLog(prev => [...prev, `Error: Category "${categoryName}" not found in registry.`]);
      setLoadingCategories(prev => prev.filter(c => c !== categoryName));
      toast.error(`Category ${categoryName} not found.`);
      return;
    }

    const result = await generateArtifactsForCategory(category, corpus);
    
    if (result.success) {
      setArtifacts(prev => ({ ...prev, [categoryName]: result.artifacts }));
      setCompletedCategories(prev => [...prev, categoryName]);
      toast.success(`${categoryName} artifacts ready!`);
    } else {
      setErrorLog(prev => [...prev, ...result.errorLog]);
      toast.error(`Generation failed for ${categoryName}.`);
    }

    const logMessages = result.success
        ? [
            `CATEGORY: ${categoryName}`,
            `STATUS: SUCCESS`,
            `ARTIFACTS_GENERATED: ${result.artifacts.length}`,
            `TIMESTAMP: ${new Date().toISOString()}`
          ]
        : [
            `CATEGORY: ${categoryName}`,
            `STATUS: FAILED`,
            `TIMESTAMP: ${new Date().toISOString()}`,
            '--- ERROR LOG ---',
            ...result.errorLog,
          ];
    
    setBuildLog({
        status: result.success ? 'PASS' : 'FAIL',
        log: logMessages
    });

    setLoadingCategories(prev => prev.filter(c => c !== categoryName));
  }, [corpus, loadingCategories, completedCategories, isGeneratingAll]);
  
  const handleGenerateAll = useCallback(async () => {
      if (isGeneratingAll || loadingCategories.length > 0) return;

      toast.info('Starting full generation sequence...');
      setIsGeneratingAll(true);
      setErrorLog([]);
      setBuildLog(null);

      for (const category of dashboardCategories) {
          if (!completedCategories.includes(category.name)) {
              await handleGenerateCategory(category.name);
          }
      }

      setIsGeneratingAll(false);
      toast.success('Full generation sequence completed.');
  }, [isGeneratingAll, loadingCategories, completedCategories, handleGenerateCategory]);

  const handleGenerateWithGeniusMode = useCallback(async () => {
    if (isGeneratingAll || loadingCategories.length > 0) return;

    toast.info(`Initiating Genius Mode (${geniusFocus} focus)...`);
    setIsGeneratingAll(true);
    setErrorLog([]);
    setArtifacts({});
    setCompletedCategories([]);
    setBuildLog(null);
    setLoadingCategories(dashboardCategories.map(c => c.name));

    const onProgress = (categoryName: string, newArtifacts: Artifact[]) => {
        setArtifacts(prev => ({ ...prev, [categoryName]: newArtifacts }));
        setCompletedCategories(prev => [...prev, categoryName]);

        const category = dashboardCategories.find(c => c.name === categoryName);
        const success = category ? newArtifacts.length === category.files.length : false;
        
        setBuildLog({
            status: success ? 'PASS' : 'FAIL',
            log: success
              ? [`[IN PROGRESS] Successfully generated ${newArtifacts.length} artifacts for "${categoryName}".`]
              : [`[IN PROGRESS] Generation failed or was incomplete for "${categoryName}". Full log will be available at the end.`]
        });
    };

    const result = await generateAllArtifactsWithGeniusMode(corpus, geniusFocus, onProgress);
    
    if (result.errorLog.length > 0) {
        setErrorLog(result.errorLog);
        setBuildLog({
            status: 'FAIL',
            log: [
                `Genius Mode Run (${geniusFocus}) - FINAL STATUS`,
                '--- CUMULATIVE ERROR LOG ---',
                ...result.errorLog
            ]
        });
        toast.error('Genius Mode generation encountered errors.');
    } else {
        setBuildLog({
            status: 'PASS',
            log: [`Genius Mode Run (${geniusFocus}) completed successfully.`]
        });
        toast.success('Genius Mode generation completed successfully!');
        // Save to history on full success
        saveToHistory(result.artifactsByCategory, corpus);
    }

    setLoadingCategories([]); // Clear the loading list
    setIsGeneratingAll(false);
  }, [corpus, geniusFocus, isGeneratingAll, loadingCategories.length, saveToHistory]);


  const handleReset = () => {
    setCorpus('');
    setLoadingCategories([]);
    setCompletedCategories([]);
    setArtifacts({});
    setErrorLog([]);
    setIsGeneratingAll(false);
    setBuildLog(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSavedSessionExists(false);
  };

  const handleSaveSession = () => {
    try {
        const sessionData = {
            corpus,
            completedCategories,
            artifacts,
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
        setSavedSessionExists(true);
    } catch (error) {
        console.error("Failed to save session:", error);
        setErrorLog(prev => [...prev, "Failed to save session to local storage."]);
    }
  };

  const handleLoadSession = () => {
    try {
        const savedData = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedData) {
            const sessionData = JSON.parse(savedData);
            setCorpus(sessionData.corpus || '');
            setCompletedCategories(sessionData.completedCategories || []);
            setArtifacts(sessionData.artifacts || {});
            setErrorLog([]); // Clear errors on successful load
        }
    } catch (error) {
        console.error("Failed to load session:", error);
        setErrorLog(prev => [...prev, "Failed to parse saved session data."]);
    }
  };
  
  const totalArtifacts = dashboardCategories.reduce((acc, cat) => acc + cat.files.length, 0);
  const generatedArtifactsCount = Object.values(artifacts).flat().length;

  return (
    <div className="bg-background-primary text-text-primary min-h-screen relative">
      <Toaster position="top-right" theme="dark" richColors />
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          <div className="lg:col-span-4 space-y-6">
             <CorpusInput 
                corpus={corpus}
                onCorpusChange={setCorpus}
                onReset={handleReset}
                isGenerating={loadingCategories.length > 0 || isGeneratingAll}
                onSaveSession={handleSaveSession}
                onLoadSession={handleLoadSession}
                canLoadSession={savedSessionExists}
             />

             {history.length > 0 && (
                <div className="bg-background-secondary border border-border-primary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <h3 className="font-oswald text-lg uppercase text-accent-light leading-none">History</h3>
                            <span className="text-[9px] text-text-muted mt-1 uppercase tracking-tighter">Deterministic Runs</span>
                        </div>
                        <button 
                            onClick={clearHistory}
                            className="text-[9px] border border-border-secondary px-2 py-1 rounded bg-background-tertiary text-text-muted hover:border-danger hover:text-danger transition-all uppercase"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {history.map(entry => (
                            <div key={entry.id} className="relative group/item">
                                <button
                                    onClick={() => handleLoadHistoryEntry(entry)}
                                    className="w-full text-left text-xs bg-background-tertiary p-3 rounded border border-border-secondary hover:border-accent-border transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-text-primary group-hover/item:text-accent-light truncate flex-grow pr-4">
                                            {entry.corpus.slice(0, 40) || 'Generic Input'}{entry.corpus.length > 40 ? '...' : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-text-muted text-[10px] font-mono">
                                            {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="bg-background-inset px-1.5 py-0.5 rounded text-[9px] border border-border-primary text-accent tracking-widest font-bold uppercase">
                                            {entry.geniusFocus}
                                        </span>
                                    </div>
                                    <div className="absolute top-0 right-0 h-full w-1 bg-accent-emphasis opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteHistoryItem(entry.id);
                                    }}
                                    className="absolute -top-1 -right-1 p-1 bg-background-primary border border-border-secondary rounded-full text-text-muted hover:text-danger hover:border-danger opacity-0 group-hover/item:opacity-100 transition-all z-10"
                                    title="Delete run"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>
          <div className="lg:col-span-8">
            <Dashboard 
              onGenerateCategory={handleGenerateCategory}
              onGenerateAll={handleGenerateAll}
              isGeneratingAll={isGeneratingAll}
              loadingCategories={loadingCategories}
              completedCategories={completedCategories}
              isCorpusEmpty={!corpus.trim()}
              geniusFocus={geniusFocus}
              onGeniusFocusChange={setGeniusFocus}
              onGenerateWithGeniusMode={handleGenerateWithGeniusMode}
            />
            {buildLog && (
                <div className="mt-8">
                    <BuildLog status={buildLog.status} buildLog={buildLog.log} />
                </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 no-print">
            <AIToolkit />
        </div>

        <div className="mt-8">
            <ArtifactDisplay 
                artifactsByCategory={artifacts} 
                generatedArtifactsCount={generatedArtifactsCount}
                totalArtifacts={totalArtifacts}
                errorLog={errorLog}
                loadingCategories={loadingCategories}
            />
        </div>
      </main>

       <ChatBot />

       <footer className="no-print text-center py-6 text-text-secondary text-xs border-t-2 border-background-secondary mt-12">
            <p>ARBITRA ENTERPRISE ARTIFACT FOUNDRY v7.0 - GEMINI ENABLED</p>
            <p>STATUS: OPERATIONAL</p>
       </footer>
    </div>
  );
};

export default App;