// Load environment variables first
import { loadEnvConfig, config } from './config.js'
loadEnvConfig()

import { app, BrowserWindow } from 'electron'

import { isDev } from './util.js'
import { closeDatabase, initDatabase } from './database.js'
import {
  registerTodoHandlers,
  unregisterTodoHandlers,
} from './ipc/todoHandlers.js'
import { getPreloadPath, getUIPath } from './pathResolver.js'
import { CronJob } from 'cron'
import { getSyncService } from './service/SyncService.js'
import { todoApi } from './service/todoApiService.js'
import logger, { logInfo, logError } from './logger.js'

let syncJob: CronJob | null = null

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: getPreloadPath(),
    },
  })

  if (isDev()) {
    win.loadURL('http://localhost:5123')
  } else {
    win.loadFile(getUIPath())
  }
}

app.whenReady().then(async () => {
  initDatabase()

  // Run immediately on startup
  logInfo('[Sync] Running initial sync on startup...')
  await getSyncService().runSync()

  // Create cron job with configuration from environment
  if (config.features.autoSync) {
    syncJob = new CronJob(
      config.sync.intervalCron,
      () => getSyncService().runSync(),
      null,
      true,
      config.sync.timezone,
    )

    logInfo(`[Sync] Cron job started - running on schedule: ${config.sync.intervalCron}`)
  } else {
    logInfo('[Sync] Auto-sync is disabled via configuration')
  }

  // Register IPC handlers for To Do operations
  registerTodoHandlers()

  // Create the main window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up resources before app quits (all platforms)
app.on('before-quit', () => {
  logInfo('[App] Quitting, cleaning up resources...')

  // Stop the cron job
  if (syncJob) {
    logInfo('[Sync] Stopping cron job...')
    syncJob.stop()
    syncJob = null
  }

  // Unregister handlers and close database
  unregisterTodoHandlers()
  closeDatabase()

  logInfo('[App] Cleanup complete')
})
