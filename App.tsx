import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import CorpusInput from './components/CorpusInput';
import ArtifactDisplay from './components/ArtifactDisplay';
import Dashboard from './components/dashboard/Dashboard';
import AIToolkit from './components/AIToolkit';
import type { Artifact, GeniusFocus } from './types';
import { generateArtifactsForCategory, generateAllArtifactsWithGeniusMode } from './services/foundryService';
import { dashboardCategories } from './services/artifactRegistry';

const SESSION_STORAGE_KEY = 'arbitra-session';

const App: React.FC = () => {
  const [corpus, setCorpus] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState<string[]>([]);
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<{ [key: string]: Artifact[] }>({});
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [savedSessionExists, setSavedSessionExists] = useState(false);
  const [geniusFocus, setGeniusFocus] = useState<GeniusFocus>('balanced');

  useEffect(() => {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    setSavedSessionExists(!!session);
  }, []);

  const handleGenerateCategory = useCallback(async (categoryName: string) => {
    if (loadingCategories.includes(categoryName) || completedCategories.includes(categoryName)) {
      return;
    }

    setLoadingCategories(prev => [...prev, categoryName]);
    if (!isGeneratingAll) {
        setErrorLog([]);
    }

    const category = dashboardCategories.find(c => c.name === categoryName);
    if (!category) {
      setErrorLog(prev => [...prev, `Error: Category "${categoryName}" not found in registry.`]);
      setLoadingCategories(prev => prev.filter(c => c !== categoryName));
      return;
    }

    const result = await generateArtifactsForCategory(category, corpus);
    
    if (result.success) {
      setArtifacts(prev => ({ ...prev, [categoryName]: result.artifacts }));
      setCompletedCategories(prev => [...prev, categoryName]);
    } else {
      setErrorLog(prev => [...prev, ...result.errorLog]);
    }

    setLoadingCategories(prev => prev.filter(c => c !== categoryName));
  }, [corpus, loadingCategories, completedCategories, isGeneratingAll]);
  
  const handleGenerateAll = useCallback(async () => {
      if (isGeneratingAll || loadingCategories.length > 0) return;

      setIsGeneratingAll(true);
      setErrorLog([]);

      for (const category of dashboardCategories) {
          if (!completedCategories.includes(category.name)) {
              await handleGenerateCategory(category.name);
          }
      }

      setIsGeneratingAll(false);
  }, [isGeneratingAll, loadingCategories, completedCategories, handleGenerateCategory]);

  const handleGenerateWithGeniusMode = useCallback(async () => {
    if (isGeneratingAll || loadingCategories.length > 0) return;
    
    setIsGeneratingAll(true);
    setErrorLog([]);
    // Set all categories to a loading state for better visual feedback
    setLoadingCategories(dashboardCategories.map(c => c.name));

    const result = await generateAllArtifactsWithGeniusMode(corpus, geniusFocus);

    if (result.success) {
      setArtifacts(result.allArtifacts);
      setCompletedCategories(Object.keys(result.allArtifacts));
    } else {
      setErrorLog(result.errorLog);
    }
    
    setLoadingCategories([]); // Clear loading state
    setIsGeneratingAll(false);
  }, [corpus, geniusFocus, isGeneratingAll, loadingCategories.length]);

  const handleReset = () => {
    setCorpus('');
    setLoadingCategories([]);
    setCompletedCategories([]);
    setArtifacts({});
    setErrorLog([]);
    setIsGeneratingAll(false);
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
    <div className="bg-background-primary text-text-primary min-h-screen">
      <Header />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          <div className="lg:col-span-4">
             <CorpusInput 
                corpus={corpus}
                onCorpusChange={setCorpus}
                onReset={handleReset}
                isGenerating={loadingCategories.length > 0 || isGeneratingAll}
                onSaveSession={handleSaveSession}
                onLoadSession={handleLoadSession}
                canLoadSession={savedSessionExists}
             />
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
            />
        </div>
      </main>

       <footer className="no-print text-center py-6 text-text-secondary text-xs border-t-2 border-background-secondary mt-12">
            <p>ARBITRA ENTERPRISE ARTIFACT FOUNDRY v7.0 - GEMINI ENABLED</p>
            <p>STATUS: OPERATIONAL</p>
       </footer>
    </div>
  );
};

export default App;
