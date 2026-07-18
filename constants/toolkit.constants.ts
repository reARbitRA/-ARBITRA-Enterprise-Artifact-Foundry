export const AI_MODELS = {
  GPT4: 'gpt-4',
  GPT35: 'gpt-3.5-turbo',
  CLAUDE3: 'claude-3',
  GEMINI: 'gemini-pro'
} as const;

export type AIModelValue = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const MODEL_CAPABILITIES: Record<AIModelValue, {
  maxTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1kTokens: number;
}> = {
  'gpt-4': {
    maxTokens: 8000,
    supportsVision: true,
    supportsFunctions: true,
    costPer1kTokens: 0.03
  },
  'gpt-3.5-turbo': {
    maxTokens: 4000,
    supportsVision: false,
    supportsFunctions: true,
    costPer1kTokens: 0.002
  },
  'claude-3': {
    maxTokens: 100000,
    supportsVision: true,
    supportsFunctions: false,
    costPer1kTokens: 0.015
  },
  'gemini-pro': {
    maxTokens: 30720,
    supportsVision: true,
    supportsFunctions: true,
    costPer1kTokens: 0.00025
  }
};

export const API_ENDPOINTS = {
  GENERATE: '/api/ai/generate',
  ANALYZE: '/api/ai/analyze',
  SEARCH: '/api/ai/search',
  IMAGE: '/api/ai/image',
  VIDEO: '/api/ai/video',
  DATA: '/api/ai/data'
} as const;

export const TEMPERATURE_PRESETS = {
  CREATIVE: 1.0,
  BALANCED: 0.7,
  PRECISE: 0.3,
  DETERMINISTIC: 0.0
} as const;

export const TIMEOUT_CONFIG = {
  SHORT: 10_000,
  MEDIUM: 30_000,
  LONG: 60_000,
  EXTENDED: 120_000
} as const;