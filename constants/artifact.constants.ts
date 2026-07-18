// Use lowercase keys to match schema values
export const ARTIFACT_TYPES = {
  CODE: 'code',
  DOCUMENT: 'document',
  IMAGE: 'image',
  VIDEO: 'video',
  DATA: 'data',
  ANALYSIS: 'analysis'
} as const;

export type ArtifactTypeValue = (typeof ARTIFACT_TYPES)[keyof typeof ARTIFACT_TYPES];

export const ARTIFACT_SIZE_LIMITS: Record<ArtifactTypeValue, number> = {
  code: 5 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  image: 20 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  data: 50 * 1024 * 1024,
  analysis: 15 * 1024 * 1024
};

export const ARTIFACT_EXTENSIONS: Record<ArtifactTypeValue, readonly string[]> = {
  code: ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rb', '.php'],
  document: ['.txt', '.md', '.pdf', '.docx', '.doc'],
  image: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
  video: ['.mp4', '.webm', '.avi', '.mov', '.mkv'],
  data: ['.json', '.csv', '.xml', '.yaml', '.yml'],
  analysis: ['.html', '.ipynb', '.rmd']
};

export const ARTIFACT_CATEGORIES = {
  STRATEGIC: 'Strategic & Business Case',
  TECHNICAL: 'Product & Technical Specification',
  MARKET: 'Market & Sales',
  DEPLOYMENT: 'Deployment & Operations',
  DESIGN: 'Design & UX',
  LEGAL: 'Legal & Compliance'
} as const;

export const DEFAULT_ARTIFACT = {
  VERSION: '1.0.0',
  AUTHOR: 'AI Assistant',
  RETENTION_DAYS: 90,
  MAX_VERSIONS: 10
} as const;

export const ARTIFACT_ID_PREFIX = 'art_';