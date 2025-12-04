import { app } from 'electron'
import path from 'path'
import { isDev } from './util.js'
import fs from 'node:fs'

/**
 * Get the database file path based on environment.
 *
 * In development mode, the database is stored in the project root.
 * In production mode, it is stored in the application's user data directory.
 *
 * @returns {string} The full path to the SQLite database file.
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

/**
 * Get the preload script path.
 *
 * This path is used by the BrowserWindow webPreferences to load the preload script.
 *
 * @returns {string} The full path to the preload script.
 */
export function getPreloadPath(): string {
  return path.join(app.getAppPath(), 'dist-electron/electron/preload.cjs')
}

/**
 * Get the UI HTML file path.
 *
 * This path is used to load the React application in production mode.
 *
 * @returns {string} The full path to the index.html file.
 */
export function getUIPath(): string {
  return path.join(app.getAppPath(), 'dist-react/index.html')
}

/**
 * Get the asset directory path.
 *
 * Helper to locate static assets depending on the environment.
 *
 * @returns {string} The full path to the assets directory.
 */
export function getAssetPath(): string {
  if (isDev()) {
    return path.join(app.getAppPath(), 'src/renderer/assets')
  } else {
    // In production, assets are in the dist-react directory
    return path.join(app.getAppPath(), 'dist-react')
  }
}
