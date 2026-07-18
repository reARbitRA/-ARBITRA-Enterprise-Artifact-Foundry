/**
 * @file Configuration settings for the AI Toolkit and its services.
 * This file manages API interaction settings like timeouts, retries,
 * and default parameters for AI model requests.
 */

/**
 * A frozen object containing all AI Toolkit-related configurations.
 * Using `as const` provides literal types for better type safety.
 */
export const ToolkitConfig = {
  /**
   * The default timeout for AI API requests, in milliseconds.
   * @type {number}
   */
  timeout: 60000, // 60 seconds

  /**
   * The maximum number of times to retry a failed API call.
   * This is used by the `withRetry` utility in the services.
   * @type {number}
   */
  maxRetries: 3,

  /**
   * The base delay in milliseconds for the first retry. Subsequent retries
   * will use exponential backoff (e.g., 1000ms, 2000ms, 4000ms).
   * @type {number}
   */
  retryDelay: 1000, // 1 second

  /**
   * The default temperature for generative models.
   * Higher values (e.g., 0.9) are more creative, lower values (e.g., 0.2) are more deterministic.
   * @type {number}
   */
  defaultTemperature: 0.7,

  /**
   * The default maximum number of tokens to generate in a response.
   * This is a safeguard against unexpectedly long or expensive API calls.
   * @type {number}
   */
  defaultMaxTokens: 4096,

  /**
   * If true, enables client-side logging of AI requests and responses.
   * Respects the global log level from `AppConfig`.
   * @type {boolean}
   */
  enableLogging: true,
} as const;