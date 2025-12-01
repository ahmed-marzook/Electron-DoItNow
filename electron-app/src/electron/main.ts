import { app, BrowserWindow } from 'electron'

import path from 'node:path'
import { isDev } from './util.js'
import { closeDatabase, initDatabase } from './database.js'

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev()) {
    win.loadURL('http://localhost:5123')
  } else {
    win.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase()
    app.quit()
  }
})

// Close database on app quit
app.on('quit', () => {
  closeDatabase()
})
