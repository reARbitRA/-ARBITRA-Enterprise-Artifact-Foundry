/**
 * @file Contains all custom errors related to the AI Toolkit domain.
 */

import { BaseError } from './base.errors';

/**
 * A generic error for operations related to the AI Toolkit.
 */
export class AIToolkitError extends BaseError {
  constructor(message: string, code: string = 'AI_TOOLKIT_ERROR', statusCode: number = 500) {
    super(message, code, statusCode);
  }
}

/**
 * Error thrown when a user-provided prompt fails validation checks.
 */
export class PromptValidationError extends AIToolkitError {
  constructor(message: string) {
    super(message, 'PROMPT_VALIDATION_ERROR', 400);
  }
}

/**
 * Error thrown when the requested AI model is not available or temporarily offline.
 */
export class ModelNotAvailableError extends AIToolkitError {
  constructor(model: string) {
    super(`The requested AI model '${model}' is currently unavailable. Please try again later.`, 'MODEL_UNAVAILABLE', 503); // 503 Service Unavailable
  }
}

/**
 * Error thrown when the total number of tokens (prompt + expected completion) exceeds the model's context limit.
 */
export class TokenLimitExceededError extends AIToolkitError {
  constructor(tokens: number, limit: number) {
    const message = `The operation would exceed the token limit. Tokens: ${tokens}, Limit: ${limit}.`;
    super(message, 'TOKEN_LIMIT_EXCEEDED', 413); // 413 Payload Too Large
  }
}

/**
 * Error thrown when the AI model returns a malformed, empty, or otherwise unusable response.
 */
export class AIResponseError extends AIToolkitError {
  constructor(message: string) {
    super(`The AI model returned an invalid response: ${message}`, 'AI_RESPONSE_INVALID', 502); // 502 Bad Gateway
  }
}