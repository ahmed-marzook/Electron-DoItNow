/**
 * Checks if the application is running in development mode.
 *
 * @returns {boolean} True if NODE_ENV is set to 'development', false otherwise.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development'
}
