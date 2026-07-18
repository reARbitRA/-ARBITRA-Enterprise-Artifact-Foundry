import { z } from 'zod';
import { GeniusFocusSchema, GeniusGenerationResultSchema } from '../schemas/dashboard.schemas';

export type GeniusFocus = z.infer<typeof GeniusFocusSchema>;
export type GeniusGenerationResult = z.infer<typeof GeniusGenerationResultSchema>;
