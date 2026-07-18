/**
 * @file Contains all custom errors related to the Dashboard domain.
 */

import { BaseError } from './base.errors';

/**
 * A generic error for operations related to the dashboard.
 */
export class DashboardError extends BaseError {
  constructor(message: string, code: string = 'DASHBOARD_ERROR', statusCode: number = 500) {
    super(message, code, statusCode);
  }
}

/**
 * Error thrown when there's an issue during the calculation of dashboard metrics.
 */
export class MetricCalculationError extends DashboardError {
  constructor(message: string) {
    super(`Failed to calculate metrics: ${message}`, 'METRIC_CALCULATION_ERROR', 500);
  }
}

/**
 * Error thrown when the data source for the dashboard fails to load or returns an error.
 */
export class DataLoadError extends DashboardError {
  constructor(dataSourceName: string, originalError?: string) {
    const message = `Failed to load data from source: ${dataSourceName}. ${originalError || ''}`.trim();
    super(message, 'DATA_LOAD_ERROR', 503); // 503 Service Unavailable
  }
}

/**
 * Error thrown when the provided dashboard filters are invalid or malformed.
 */
export class FilterValidationError extends DashboardError {
  constructor(message: string) {
    super(`Invalid dashboard filters provided: ${message}`, 'FILTER_VALIDATION_ERROR', 400);
  }
}