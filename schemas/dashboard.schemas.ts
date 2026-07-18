import { z } from 'zod';
import { DashboardMetric } from '../types';
import { ArtifactSchema } from './artifact.schemas';

export const dashboardMetricSchema = z.object({
  key: z.string().min(1),
  value: z.number().refine(Number.isFinite, { message: 'value must be a finite number' }),
  label: z.string().min(1),
}) satisfies z.ZodType<DashboardMetric>;

// FIX: Add and export GeniusFocusSchema.
export const GeniusFocusSchema = z.enum(['balanced', 'frontend', 'backend', 'fullstack']);

// FIX: Add and export GeniusGenerationResultSchema.
export const GeniusGenerationResultSchema = z.object({
  success: z.boolean(),
  // FIX: Explicitly provided string key for z.record to fix "Expected 2-3 arguments" error.
  allArtifacts: z.record(z.string(), z.array(ArtifactSchema)),
  errorLog: z.array(z.string()),
});


export type DashboardMetricSchemaType = z.infer<typeof dashboardMetricSchema>;

export function validateDashboardMetric(input: unknown): boolean {
  return dashboardMetricSchema.safeParse(input).success;
}

export function parseDashboardMetric(input: unknown): DashboardMetricSchemaType {
  return dashboardMetricSchema.parse(input);
}
