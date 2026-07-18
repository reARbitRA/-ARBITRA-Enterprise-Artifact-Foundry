/**
 * @fileoverview Barrel file for all configuration modules.
 * This file centralizes all config exports, making them easy to import
 * from a single location. It also combines them into a single `Config`
 * object for convenient access.
 *
 * @example
 * import { Config, AppConfig } from './config';
 * console.log(Config.app.appName);
 * console.log(AppConfig.version);
 */

import { AppConfig } from './app.config';
import { ArtifactConfig } from './artifact.config';
import { DashboardConfig } from './dashboard.config';
import { ToolkitConfig } from './toolkit.config';

// Export individual config objects
export * from './app.config';
export * from './artifact.config';
export * from './dashboard.config';
export * from './toolkit.config';

/**
 * A unified, immutable configuration object that aggregates all domain-specific configs.
 * Provides a single, predictable access point for all configuration values.
 */
export const Config = {
  app: AppConfig,
  artifact: ArtifactConfig,
  dashboard: DashboardConfig,
  toolkit: ToolkitConfig,
} as const;

/**
 * The inferred type of the unified `Config` object.
 * Can be used for typing props or variables that expect the full config.
 */
export type AppConfigType = typeof Config;