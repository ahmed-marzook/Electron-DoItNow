import { contextBridge } from 'electron'
import type { ElectronAPI } from '../shared/types/ipc.types.js'
import { createTodoAPI } from './todo.cjs'
import { createUserAPI } from './user.cjs'

/**
 * Main preload script entry point
 *
 * This script runs in an isolated context and exposes a safe API
 * to the renderer process via contextBridge. This prevents the
 * renderer from having direct access to Node.js or Electron APIs.
 *
 * The API is organized by feature (todo, user, etc.) with each feature
 * defined in its own module for better maintainability and scalability.
 */

// Expose the complete API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  todo: createTodoAPI(),
  user: createUserAPI(),
} as ElectronAPI)
