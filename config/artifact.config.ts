/**
 * @file Configuration settings specific to the Artifact domain.
 * This includes parameters for artifact generation, storage, and management.
 */

/**
 * A frozen object containing all artifact-related configurations.
 * Using `as const` provides literal types for better type safety.
 */
export const ArtifactConfig = {
  /**
   * The default semantic version assigned to newly created artifacts.
   * @type {string}
   */
  defaultVersion: '1.0.0',

  /**
   * The maximum number of times to retry a failed artifact generation.
   * @type {number}
   */
  maxRetries: 3,

  /**
   * The number of days an artifact should be stored before being considered for archival.
   * @type {number}
   */
  retentionDays: 90,

  /**
   * If true, enables automatic versioning of artifacts upon modification.
   * @type {boolean}
   */
  enableVersioning: true,

  /**
   * If true, enables automatic saving of the session to local storage.
   * Note: The current implementation uses manual saving.
   * @type {boolean}
   */
  autoSave: false,

  /**
   * The interval in milliseconds for auto-saving, if enabled.
   * @type {number}
   */
  autoSaveInterval: 30000, // 30 seconds

  /**
   * If true, artifacts will be compressed before being downloaded in a zip file.
   * @type {boolean}
   */
  compressionEnabled: true,

  /**
   * The compression level for zipping artifacts (1-9).
   * Higher numbers mean more compression but slower performance.
   * @type {number}
   */
  compressionLevel: 6,

  /**
   * The maximum number of historical versions to keep for a single artifact.
   * @type {number}
   */
  maxHistoryLength: 50,
} as const;