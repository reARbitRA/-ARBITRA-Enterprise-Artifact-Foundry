import { AI_MODELS, MODEL_CAPABILITIES, API_ENDPOINTS } from '../constants';
import type { AIModelValue } from '../constants';

/**
 * A very rough approximation of token count.
 * @param text The text to estimate tokens for.
 * @returns An estimated number of tokens.
 */
export const estimateTokenCount = (text: string): number => {
  // Based on the general rule of thumb that 1 token is approximately 4 characters for English text.
  return Math.ceil(text.length / 4);
};

/**
 * Calculates the estimated cost of an AI operation.
 * @param model The AI model used.
 * @param totalTokens The total number of tokens (prompt + completion).
 * @returns The estimated cost in USD.
 */
export const calculateCost = (model: AIModelValue, totalTokens: number): number => {
  const modelInfo = MODEL_CAPABILITIES[model];
  if (!modelInfo) {
    console.warn(`Cost calculation not available for model: ${model}`);
    return 0;
  }
  return (totalTokens / 1000) * modelInfo.costPer1kTokens;
};

/**
 * Validates and prepares a prompt object for an API call.
 * @param userPrompt The user-provided prompt text.
 * @param options Additional options for the prompt.
 * @returns A prepared prompt object.
 */
export const validateAndPreparePrompt = (userPrompt: string, options: any = {}) => {
  if (!userPrompt || userPrompt.trim().length < 1) {
    throw new Error('Prompt cannot be empty.');
  }
  return {
    text: userPrompt,
    model: options.model || AI_MODELS.GEMINI,
    ...options,
  };
};

/**
 * Gets the API endpoint for generation.
 * @returns The generation endpoint URL.
 */
export const getGenerateEndpoint = (): string => {
  return API_ENDPOINTS.GENERATE;
};