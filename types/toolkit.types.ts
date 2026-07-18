import { z } from 'zod';
import { GroundingChunkSchema, AnalysisResultSchema, ChartDataSchema, DemoSceneResultSchema, DemoSceneSchema } from '../schemas/toolkit.schemas';

// Types for Grounding API responses
export type GroundingChunk = z.infer<typeof GroundingChunkSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type DemoScene = z.infer<typeof DemoSceneSchema>;
export type DemoSceneResult = z.infer<typeof DemoSceneResultSchema>;


declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        aistudio?: AIStudio;
    }
}
