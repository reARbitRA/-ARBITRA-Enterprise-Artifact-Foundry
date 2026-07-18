export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#6366F1',
  NEUTRAL: '#6B7280'
} as const;

export const CHART_COLOR_PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#6366F1', '#EC4899', '#14B8A6', '#F97316'
] as const;

export const METRIC_TYPES = {
  ARTIFACTS_CREATED: 'artifacts_created',
  GENERATION_TIME: 'generation_time',
  SUCCESS_RATE: 'success_rate',
  TOKEN_USAGE: 'token_usage',
  COST: 'cost',
  USER_ENGAGEMENT: 'user_engagement'
} as const;

export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  CUSTOM: 'custom'
} as const;

export const REFRESH_INTERVALS = {
  REALTIME: 5_000,
  FAST: 30_000,
  NORMAL: 60_000,
  SLOW: 300_000
} as const;