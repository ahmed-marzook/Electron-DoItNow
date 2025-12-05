/**
 * Renderer process configuration
 * Access environment variables passed from Vite
 */

/**
 * Get environment variable from import.meta.env
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key]
  return value !== undefined ? String(value) : (defaultValue || '')
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key]
  return value !== undefined ? parseInt(String(value), 10) : defaultValue
}

/**
 * Renderer configuration object
 */
export const config = {
  api: {
    get baseUrl(): string {
      return getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080')
    },

    get timeout(): number {
      return getEnvNumber('VITE_API_TIMEOUT', 10000)
    },
  },

  get isDevelopment(): boolean {
    return import.meta.env.DEV
  },

  get isProduction(): boolean {
    return import.meta.env.PROD
  },
}
