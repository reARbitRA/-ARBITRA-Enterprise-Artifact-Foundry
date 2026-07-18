import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Artifact } from '../types/artifact.types';
import type { GeniusFocus } from '../types/dashboard.types';

export interface GenerationHistory {
    id: string;
    timestamp: string;
    corpus: string;
    artifacts: { [key: string]: Artifact[] };
    geniusFocus: GeniusFocus;
}

const HISTORY_STORAGE_KEY = 'arbitra-history';
const MAX_HISTORY_ITEMS = 8;

export const useGenerationHistory = () => {
    const [history, setHistory] = useState<GenerationHistory[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, []);

    const saveToHistory = useCallback((artifacts: { [key: string]: Artifact[] }, corpus: string, geniusFocus: GeniusFocus) => {
        const newEntry: GenerationHistory = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            corpus,
            artifacts,
            geniusFocus,
        };
        
        setHistory(prev => {
            const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        toast.success('History cleared');
    }, []);

    const deleteHistoryItem = useCallback((id: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        toast.info('Run removed from history');
    }, []);

    return {
        history,
        saveToHistory,
        clearHistory,
        deleteHistoryItem
    };
};
