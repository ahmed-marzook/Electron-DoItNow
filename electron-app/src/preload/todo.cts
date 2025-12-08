import { ipcInvoke, ipcOn } from './helpers.cjs'
import type { ElectronAPI } from '../shared/types/ipc.types.js'

/**
 * Todo-specific IPC bridge API
 *
 * Exposes type-safe todo operations to the renderer process via contextBridge.
 * All operations use the IPC helper functions to communicate with the main process.
 */

/**
 * Creates the todo API object that will be exposed to the renderer
 */
export function createTodoAPI(): ElectronAPI['todo'] {
  return {
    // Request/Response operations (invoke)
    getAll: () => ipcInvoke('todo:getAll'),
    getById: (id: number) => ipcInvoke('todo:getById', id),
    create: (todoData) => ipcInvoke('todo:create', todoData),
    update: (id: number, todoData) => ipcInvoke('todo:update', id, todoData),
    delete: (id: number) => ipcInvoke('todo:delete', id),
    manualSync: () => ipcInvoke('sync:manual'),

    // Event subscriptions (on)
    onTodoAdded: (callback) => ipcOn('todo:added', callback),
    onTodoUpdated: (callback) => ipcOn('todo:updated', callback),
    onTodoDeleted: (callback) => ipcOn('todo:deleted', callback),
  }
}
