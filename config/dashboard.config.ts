/**
 * @file Configuration settings for the Dashboard and its components.
 * This includes parameters for data visualization, refresh intervals, and UI defaults.
 */

/**
 * A frozen object containing all dashboard-related configurations.
 * Using `as const` provides literal types for better type safety.
 */
export const DashboardConfig = {
  /**
   * The default date range key for filtering metrics upon initial load.
   * Corresponds to keys in `constants/dashboard.constants.ts`.
   * @type {string}
   */
  defaultDateRange: 'last_7_days',

  /**
   * The default interval in milliseconds for automatically refreshing dashboard data.
   * @type {number}
   */
  refreshInterval: 60000, // 1 minute

  /**
   * If true, enables real-time updates via WebSockets or more frequent polling.
   * @type {boolean}
   */
  enableRealtime: false,

  /**
   * The maximum number of data points to display on a chart to maintain performance.
   * @type {number}
   */
  maxDataPoints: 100,

  /**
   * The default chart type for visualizations (e.g., 'line', 'bar').
   * @type {string}
   */
  defaultChartType: 'line',

  /**
   * The duration in milliseconds for chart animations.
   * Set to 0 to disable animations.
   * @type {number}
   */
  animationDuration: 300, // 300ms

  /**
   * If true, enables the functionality to export dashboard data.
   * @type {boolean}
   */
  enableExport: true,

  /**
   * An array of allowed formats for data export.
   * @type {ReadonlyArray<'csv' | 'json' | 'png'>}
   */
  exportFormats: ['csv', 'json', 'png'],

  /**
   * The default timezone for displaying date-based data.
   * Uses IANA time zone names.
   * @type {string}
   */
  timezone: 'UTC',

  /**
   * The default locale for formatting numbers and dates.
   * Uses BCP 47 language tags.
   * @type {string}
   */
  locale: 'en-US',
} as const;