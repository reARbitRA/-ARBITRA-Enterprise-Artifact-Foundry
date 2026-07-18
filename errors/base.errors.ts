/**
 * @file Base error class for the application.
 * All custom errors should extend this class to ensure a consistent error structure.
 */

/**
 * Represents a base error with a custom code, status code, and timestamp.
 * This class provides a standardized structure for error handling and logging.
 *
 * @example
 * throw new BaseError('Something went wrong', 'UNSPECIFIED_ERROR', 500);
 */
export class BaseError extends Error {
  /**
   * A unique, machine-readable code for the error.
   * @example 'INTERNAL_SERVER_ERROR'
   */
  public readonly code: string;

  /**
   * The HTTP status code associated with this error.
   * @example 500
   */
  public readonly statusCode: number;

  /**
   * The exact time when the error occurred.
   */
  public readonly timestamp: Date;

  /**
   * Constructs a new BaseError.
   * @param message A human-readable description of the error.
   * @param code A unique, machine-readable code for the error. Defaults to 'INTERNAL_ERROR'.
   * @param statusCode The HTTP status code. Defaults to 500.
   */
  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
    super(message);
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();

    // Captures the stack trace, excluding the constructor call from it.
    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Converts the error object to a plain JSON object for serialization.
   * @returns A plain object representing the error.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };
  }
}