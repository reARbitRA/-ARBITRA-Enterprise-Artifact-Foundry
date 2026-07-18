import { ARTIFACT_ID_PREFIX } from '../constants';

/**
 * Generates a unique identifier for a new artifact.
 * @returns A string representing the unique artifact ID.
 */
export const generateArtifactId = (): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${ARTIFACT_ID_PREFIX}${timestamp}_${randomPart}`;
};