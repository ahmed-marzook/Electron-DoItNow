/**
 * Represents an error returned by the API.
 */
export interface ApiError {
  /**
   * The error message associated with the failure.
   */
  message: string
  /**
   * The HTTP status code of the response.
   */
  status: number
  /**
   * An optional application-specific error code.
   */
  code?: string
}
