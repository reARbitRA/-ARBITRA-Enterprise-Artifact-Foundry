/**
 * Calculates the start and end dates for a given date range key.
 * @param dateRange The date range key (e.g., 'last_7_days').
 * @returns An object with start and end Date objects.
 */
export const getDateRange = (dateRange: string): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (dateRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      break;
    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      break;
    case 'this_month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_month':
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0); // Sets to the last day of the previous month
      end.setHours(23, 59, 59, 999);
      break;
    default:
      // Default to last 7 days if key is unknown
      start.setDate(start.getDate() - 7);
      break;
  }

  return { start, end };
};

/**
 * A placeholder function to calculate metrics from raw data.
 * @param data An array of raw data values.
 * @returns A calculated metrics object.
 */
export const calculateMetrics = (data: number[] = []): object => {
  if (data.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
    };
  }

  const total = data.reduce((sum, value) => sum + value, 0);
  return {
    total,
    average: total / data.length,
    min: Math.min(...data),
    max: Math.max(...data),
  };
};