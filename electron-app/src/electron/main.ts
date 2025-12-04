import { app, BrowserWindow } from 'electron'

import { isDev } from './util.js'
import { closeDatabase, initDatabase } from './database.js'
import {
  registerTodoHandlers,
  unregisterTodoHandlers,
} from './ipc/todoHandlers.js'
import { getPreloadPath, getUIPath } from './pathResolver.js'
import { CronJob } from 'cron'
import { SyncService } from './service/SyncService.js'
import { todoApi } from './service/TodoApiService.js'

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

app.whenReady().then(() => {
  // Initialize database (creates tables and seeds data)
  const db = initDatabase()

  const syncService = new SyncService(db, todoApi, {
    maxRetries: 3,
    batchSize: 50,
  })

  // Create cron job for syncing every minute
  syncJob = new CronJob(
    '* * * * *', // cronTime (every minute)
    async function () {
      const timestamp = new Date().toLocaleString()
      console.log('[Sync] Starting sync job at', timestamp)

      try {
        // Check if already syncing
        if (syncService.isSyncing()) {
          console.log('[Sync] Previous sync still in progress, skipping...')
          return
        }

        // Get queue stats before sync
        const statsBefore = syncService.getQueueStats()
        console.log('[Sync] Queue before:', {
          total: statsBefore.total,
          pending: statsBefore.pending,
          failed: statsBefore.failed,
        })

        // Process the sync queue
        const result = await syncService.processSyncQueue()

        // Log results
        console.log('[Sync] Completed:', {
          success: result.success,
          failed: result.failed,
          errors: result.errors.length > 0 ? result.errors : undefined,
        })

        // Get queue stats after sync
        const statsAfter = syncService.getQueueStats()
        console.log('[Sync] Queue after:', {
          total: statsAfter.total,
          pending: statsAfter.pending,
          failed: statsAfter.failed,
        })
      } catch (error) {
        console.error('[Sync] Error during sync:', error)
        // Continue running - don't let one failure break the cron
      }
    },
    null, // onComplete
    true, // start immediately
    'America/New_York', // timezone (optional)
  )

  console.log('[Sync] Cron job started - will run every minute')

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
  console.log('[App] Quitting, cleaning up resources...')

  // Stop the cron job
  if (syncJob) {
    console.log('[Sync] Stopping cron job...')
    syncJob.stop()
    syncJob = null
  }

  // Unregister handlers and close database
  unregisterTodoHandlers()
  closeDatabase()

  console.log('[App] Cleanup complete')
})
