import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load the appropriate .env file based on NODE_ENV
export function loadEnvConfig(): void {
  const env = process.env.NODE_ENV || 'development'
  const rootDir = resolve(__dirname, '../..')

  const envFiles: Record<string, string> = {
    development: '.env.local',
    preprod: '.env.preprod',
    production: '.env.production',
  }

  const envPath = resolve(rootDir, envFiles[env] || '.env.local')
  dotenv.config({ path: envPath })
}

// Simple config object - just reads from process.env with defaults
export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
    timeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
  },
  sync: {
    cron: process.env.SYNC_INTERVAL_CRON || '* * * * *',
    timezone: process.env.SYNC_TIMEZONE || 'America/New_York',
    enabled: process.env.ENABLE_AUTO_SYNC !== 'false',
  },
}
