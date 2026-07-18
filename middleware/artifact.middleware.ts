import type { Artifact } from '../types/artifact.types';

export const beforeCreate = (artifact: Partial<Artifact>) => {
  console.log('[Middleware] Before create artifact:', artifact.filename);
  return artifact;
};

export const afterCreate = (artifact: Artifact) => {
  console.log('[Middleware] After create artifact:', artifact.filename);
  return artifact;
};

export const beforeUpdate = (artifact: Partial<Artifact>) => {
  console.log('[Middleware] Before update artifact:', artifact.filename);
  return artifact;
};

export const afterUpdate = (artifact: Artifact) => {
  console.log('[Middleware] After update artifact:', artifact.filename);
  return artifact;
};

export const logOperation = (operation: string, artifact: Artifact) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    artifactId: artifact.filename,
  };
  console.log('[Artifact Operation]', logEntry);
  return logEntry;
};