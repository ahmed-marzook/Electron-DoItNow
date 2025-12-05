/**
 * Renderer process configuration - reads from Vite environment variables
 */
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  },
}
