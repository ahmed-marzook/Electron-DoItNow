import { app } from 'electron'
import path from 'path'
import { isDev } from './util.js'
import fs from 'node:fs'

/**
 * Get the database file path based on environment
 * Development: Store in project root
 * Production: Store in user data directory
 */
export function getDatabasePath(): string {
  if (isDev()) {
    // Dev: Store in project root
    return 'do-it-now.db'
  } else {
    // Production: Store in user data directory
    const userDataPath = app.getPath('userData')

    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    return path.join(userDataPath, 'do-it-now.db')
  }
}

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? '.' : '..',
    '/dist-electron/electron/preload.cjs',
  )
}

export function getUIPath() {
  return path.join(app.getAppPath(), '/dist-react/index.html')
}

export function getAssetPath() {
  return path.join(app.getAppPath(), isDev() ? '.' : '..', '/src/assets')
}
