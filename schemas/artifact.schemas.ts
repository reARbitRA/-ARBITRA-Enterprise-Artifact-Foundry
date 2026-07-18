import { z } from 'zod';
import { Artifact, JsonValue } from '../types';

const statusEnum = z.enum(['pending', 'complete', 'error']);

// مطابق تست‌ها createdAt/updatedAt می‌تواند رشته خالی باشد
const isoOrEmpty = z.string().refine(
  (s) => s === '' || !Number.isNaN(Date.parse(s)),
  { message: 'Invalid date string' }
);

// FIX: Define a Zod schema for the JsonValue type to satisfy the generic Artifact type.
const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    // FIX: Explicitly provided string key for z.record to fix "Expected 2-3 arguments" error.
    z.record(z.string(), JsonValueSchema),
  ])
);

// FIX: Export CorpusObjectSchema to be used in other parts of the application.
export const CorpusObjectSchema = z.object({
    content: z.string(),
});


// FIX: Renamed to ArtifactSchema and aligned with application usage.
export const ArtifactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: statusEnum,
  createdAt: isoOrEmpty,
  updatedAt: isoOrEmpty,
  // FIX: Added filename and content to match usage in components and services.
  filename: z.string(),
  content: z.string(),
  // FIX: Use the JsonValueSchema to correctly type the 'data' field.
  data: JsonValueSchema.optional(),
})

export type ArtifactSchemaType = z.infer<typeof ArtifactSchema>;

export function validateArtifactSchema(input: unknown): boolean {
  return ArtifactSchema.safeParse(input).success;
}

export function parseArtifact(input: unknown): ArtifactSchemaType {
  return ArtifactSchema.parse(input);
}
