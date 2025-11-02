export interface CorpusObject {
  promptId: string;
  content: string;
}

export interface Artifact {
  filename: string;
  content: string;
}

// Types for Grounding API responses
interface GroundingChunkWeb {
  uri: string;
  title: string;
}

interface GroundingChunkMaps {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets: {
            uri: string;
            title: string;
            snippet: string;
        }[];
    }[];
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  maps?: GroundingChunkMaps;
}

// FIX: Removed export from AIStudio interface to scope it to this module and prevent global type conflicts.
interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

declare global {
    interface Window {
        aistudio?: AIStudio;
    }
}

export type GeniusFocus = 'balanced' | 'frontend' | 'backend' | 'fullstack';

export interface GeniusGenerationResult {
    success: boolean;
    allArtifacts: { [key: string]: Artifact[] };
    errorLog: string[];
}