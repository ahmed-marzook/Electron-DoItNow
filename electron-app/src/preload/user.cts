import { ipcInvoke, ipcOn } from './helpers.cjs'
import type { ElectronAPI } from '../shared/types/ipc.types.js'

/**
 * User-specific IPC bridge API
 *
 * Exposes type-safe user operations to the renderer process via contextBridge.
 * All operations use the IPC helper functions to communicate with the main process.
 */

/**
 * Creates the user API object that will be exposed to the renderer
 */
export function createUserAPI(): ElectronAPI['user'] {
  return {
    // Request/Response operations (invoke)
    getAll: () => ipcInvoke('user:getAll'),
    getById: (id: number) => ipcInvoke('user:getById', id),
    create: (userData) => ipcInvoke('user:create', userData),
    update: (id: number, userData) => ipcInvoke('user:update', id, userData),
    delete: (id: number) => ipcInvoke('user:delete', id),

    // Event subscriptions (on)
    onUserAdded: (callback) => ipcOn('user:added', callback),
    onUserUpdated: (callback) => ipcOn('user:updated', callback),
    onUserDeleted: (callback) => ipcOn('user:deleted', callback),
  }
}
