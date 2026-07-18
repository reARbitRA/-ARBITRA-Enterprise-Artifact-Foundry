/**
 * @file Application-wide configuration settings.
 * This file centralizes general configuration for the application, such as environment,
 * versioning, and feature flags for logging and analytics.
 */

/**
 * A type-safe helper function to parse boolean values from environment variables.
 * @param envVar The environment variable string.
 * @returns `true` if the string is 'true', otherwise `false`.
 */
const getBooleanEnv = (envVar: string | undefined): boolean => envVar?.toLowerCase() === 'true';

/**
 * Defines the log levels available in the application.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * A frozen object containing all application-level configurations.
 * Using `as const` provides literal types for better type safety.
 */
export const AppConfig = {
  /**
   * The public name of the application.
   * @type {string}
   */
  appName: 'Arbitra Enterprise Artifact Foundry',

  /**
   * The current version of the application.
   * Follows semantic versioning.
   * @type {string}
   */
  version: '7.0.0',

  /**
   * The current runtime environment.
   * Defaults to 'development' if not set.
   * @type {'development' | 'production' | 'test'}
   */
  environment: process.env.NODE_ENV || 'development',

  /**
   * Base URL for all API requests.
   * Can be configured via `REACT_APP_API_URL` environment variable.
   * @type {string}
   */
  apiBaseUrl: process.env.REACT_APP_API_URL || '/api',

  /**
   * Global flag to enable or disable logging.
   * Controlled by `REACT_APP_ENABLE_LOGGING` environment variable.
   * @type {boolean}
   */
  enableLogging: getBooleanEnv(process.env.REACT_APP_ENABLE_LOGGING) || true,

  /**
   * The minimum log level to output.
   * Controlled by `REACT_APP_LOG_LEVEL` environment variable.
   * @type {LogLevel}
   */
  logLevel: (process.env.REACT_APP_LOG_LEVEL as LogLevel) || 'info',

  /**
   * Flag to enable or disable external analytics tracking (e.g., Google Analytics).
   * @type {boolean}
   */
  enableAnalytics: getBooleanEnv(process.env.REACT_APP_ENABLE_ANALYTICS),

  /**
   * The tracking ID for the analytics service.
   * @type {string}
   */
  analyticsId: process.env.REACT_APP_ANALYTICS_ID || '',

  /**
   * Flag to enable or disable external error reporting (e.g., Sentry).
   * @type {boolean}
   */
  enableErrorReporting: getBooleanEnv(process.env.REACT_APP_ENABLE_ERROR_REPORTING),

  /**
   * The DSN (Data Source Name) for the error reporting service.
   * @type {string}
   */
  errorReportingDsn: process.env.REACT_APP_SENTRY_DSN || '',

  /**
   * The maximum file size for uploads, in bytes.
   * Defaults to 50MB.
   * @type {number}
   */
  maxUploadSize: 50 * 1024 * 1024, // 50MB
} as const;