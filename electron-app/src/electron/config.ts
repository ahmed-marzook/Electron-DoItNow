import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Load environment variables based on NODE_ENV
 * Priority: .env.{NODE_ENV} > .env.local > .env
 */
export function loadEnvConfig(): void {
  const env = process.env.NODE_ENV || 'development'
  const rootDir = resolve(__dirname, '../..')

  // Map NODE_ENV values to env file names
  const envFileMap: Record<string, string> = {
    development: '.env.local',
    preprod: '.env.preprod',
    production: '.env.production',
  }

  const envFile = envFileMap[env] || '.env.local'
  const envPath = resolve(rootDir, envFile)

  // Load and expand environment variables
  const result = dotenv.config({ path: envPath })

  if (result.error) {
    console.warn(`Warning: Could not load ${envFile}, falling back to defaults`)
    // Try loading .env.local as fallback
    if (envFile !== '.env.local') {
      const fallbackResult = dotenv.config({ path: resolve(rootDir, '.env.local') })
      if (!fallbackResult.error) {
        dotenvExpand.expand(fallbackResult)
      }
    }
  } else {
    dotenvExpand.expand(result)
  }
}

/**
 * Get environment variable with type safety and default value
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  return process.env[key] || defaultValue || ''
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  return value ? parseInt(value, 10) : defaultValue
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

/**
 * Application configuration object
 */
export const config = {
  get nodeEnv(): string {
    return getEnvVar('NODE_ENV', 'development')
  },

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development'
  },

  get isPreprod(): boolean {
    return this.nodeEnv === 'preprod'
  },

  get isProduction(): boolean {
    return this.nodeEnv === 'production'
  },

  api: {
    get baseUrl(): string {
      return getEnvVar('API_BASE_URL', 'http://localhost:8080')
    },

    get timeout(): number {
      return getEnvNumber('API_TIMEOUT', 10000)
    },
  },

  logging: {
    get level(): string {
      return getEnvVar('LOG_LEVEL', 'info')
    },
  },

  sync: {
    get intervalCron(): string {
      return getEnvVar('SYNC_INTERVAL_CRON', '* * * * *')
    },

    get timezone(): string {
      return getEnvVar('SYNC_TIMEZONE', 'America/New_York')
    },
  },

  features: {
    get autoSync(): boolean {
      return getEnvBoolean('ENABLE_AUTO_SYNC', true)
    },

    get devTools(): boolean {
      return getEnvBoolean('ENABLE_DEV_TOOLS', false)
    },
  },
}
