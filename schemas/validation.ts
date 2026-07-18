import { ZodError, z } from 'zod';

interface ValidationSuccess<T> {
  success: true;
  data: T;
}

interface ValidationError {
  success: false;
  error: string;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

/**
 * Validates data against a Zod schema and returns a structured result.
 * @param schema The Zod schema to validate against.
 * @param data The data to validate.
 * @returns A ValidationResult object.
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  try {
    const parsedData = schema.parse(data);
    return { success: true, data: parsedData };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.issues
        .map((e) => `[${e.path.join('.')}] ${e.message}`)
        .join('; ');
      return {
        success: false,
        error: `Data validation failed: ${errorMessage}`,
      };
    }
    // Handle non-Zod errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `An unexpected error occurred during validation: ${errorMessage}`,
    };
  }
}