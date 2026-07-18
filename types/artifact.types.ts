import { z } from 'zod';
import { CorpusObjectSchema, ArtifactSchema } from '../schemas/artifact.schemas';

export type CorpusObject = z.infer<typeof CorpusObjectSchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
