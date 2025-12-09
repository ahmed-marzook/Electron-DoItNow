import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '@shared/types/ipc.types'
import { ipcInvoke, ipcOn } from './ipc-helpers'

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  todo: {
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
  },
  user: {
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
  },
} as ElectronAPI)
