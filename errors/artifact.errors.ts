/**
 * @file Contains all custom errors related to the Artifact domain.
 */

import { BaseError } from './base.errors';

/**
 * A generic error for operations related to artifacts.
 */
export class ArtifactError extends BaseError {
  constructor(message: string, code: string = 'ARTIFACT_ERROR', statusCode: number = 400) {
    super(message, code, statusCode);
  }
}

/**
 * Error thrown when an artifact fails validation against its schema.
 * Optionally includes the field that caused the validation to fail.
 */
export class ArtifactValidationError extends ArtifactError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 'ARTIFACT_VALIDATION_ERROR', 422); // 422 Unprocessable Entity
    this.field = field;
  }
}

/**
 * Error thrown when a specific artifact cannot be found.
 */
export class ArtifactNotFoundError extends ArtifactError {
  constructor(artifactId: string) {
    super(`Artifact with ID '${artifactId}' was not found.`, 'ARTIFACT_NOT_FOUND', 404);
  }
}

/**
 * Error thrown when an artifact's content exceeds the configured size limit.
 */
export class ArtifactSizeLimitError extends ArtifactError {
  constructor(size: number, limit: number) {
    const message = `Artifact size of ${size} bytes exceeds the maximum allowed limit of ${limit} bytes.`;
    super(message, 'ARTIFACT_SIZE_LIMIT_EXCEEDED', 413); // 413 Payload Too Large
  }
}

/**
 * Error thrown for operations involving an invalid or unsupported artifact type.
 */
export class ArtifactTypeError extends ArtifactError {
  constructor(type: string) {
    super(`The artifact type '${type}' is invalid or not supported for this operation.`, 'ARTIFACT_TYPE_INVALID', 400);
  }
}