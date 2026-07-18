import { z } from 'zod';
import { AIToolkitConfig } from '../types';

export const toolkitSchema = z.object({
  model: z.string().min(1),
  provider: z.enum(['openai', 'google', 'azure', 'custom']),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().positive(),
}) satisfies z.ZodType<AIToolkitConfig>;

export type ToolkitSchemaType = z.infer<typeof toolkitSchema>;

export function validateToolkitSchema(input: unknown): boolean {
  return toolkitSchema.safeParse(input).success;
}

export function parseToolkit(input: unknown): ToolkitSchemaType {
  return toolkitSchema.parse(input);
}


// Schemas for API responses from aiToolkitService

// For Grounded Search
const WebSourceSchema = z.object({
  uri: z.string().url().optional(),
  title: z.string().optional(),
}).passthrough();

const ReviewSnippetSchema = z.object({
    uri: z.string().url().optional(),
    title: z.string().optional(),
    snippet: z.string().optional(),
}).passthrough();

const PlaceAnswerSourceSchema = z.object({
    reviewSnippets: z.array(ReviewSnippetSchema).optional(),
}).passthrough();

const MapsSourceSchema = z.object({
  uri: z.string().url().optional(),
  title: z.string().optional(),
  placeAnswerSources: z.array(PlaceAnswerSourceSchema).optional(),
}).passthrough();

export const GroundingChunkSchema = z.object({
  web: WebSourceSchema.optional(),
  maps: MapsSourceSchema.optional(),
}).passthrough();


// For Data Analysis
export const ChartDataSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const AnalysisResultSchema = z.object({
  summary: z.string(),
  chartData: z.array(ChartDataSchema),
});


// For Demo Synthesizer
export const DemoSceneSchema = z.object({
    scene: z.number(),
    narrative: z.string(),
    visual_prompt: z.string(),
});

export const DemoSceneResultSchema = z.object({
    scenes: z.array(DemoSceneSchema),
});