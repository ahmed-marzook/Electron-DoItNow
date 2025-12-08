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

/**
 * Get the preload script path
 * Works in both development and production/packaged environments
 */
export function getPreloadPath() {
  return path.join(app.getAppPath(), 'dist-electron/preload/index.cjs')
}

/**
 * Get the UI HTML file path
 * Works in both development and production/packaged environments
 */
export function getUIPath() {
  return path.join(app.getAppPath(), 'dist-react/index.html')
}

/**
 * Get the asset directory path
 * Note: In production, assets are bundled in dist-react, not src/assets
 */
export function getAssetPath() {
  if (isDev()) {
    return path.join(app.getAppPath(), 'src/renderer/assets')
  } else {
    // In production, assets are in the dist-react directory
    return path.join(app.getAppPath(), 'dist-react')
  }
}
