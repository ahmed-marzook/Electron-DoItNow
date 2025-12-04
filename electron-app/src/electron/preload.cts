import { contextBridge, ipcRenderer } from 'electron'
import { ElectronAPI, EventPayloadMapping } from './ipc/ipc.types'

/**
 * Preload script for secure IPC communication
 *
 * This script runs in an isolated context and exposes a safe API
 * to the renderer process via contextBridge. This prevents the
 * renderer from having direct access to Node.js or Electron APIs.
 */

/**
 * Helper function for request/response IPC with parameters (invoke)
 * Used for: CRUD operations, fetching data
 *
 * @template Key The event key from EventPayloadMapping
 * @param {Key} key The IPC channel to invoke
 * @param {...any[]} args Arguments to pass to the main process
 * @returns {Promise<EventPayloadMapping[Key]>} The response from the main process
 */
function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
  ...args: any[]
): Promise<EventPayloadMapping[Key]> {
  return ipcRenderer.invoke(key, ...args)
}

/**
 * Helper function for subscribing to events (on)
 * Used for: Real-time updates, notifications from main process
 * Returns cleanup function to unsubscribe
 *
 * @template Key The event key from EventPayloadMapping
 * @param {Key} key The IPC channel to listen to
 * @param {(payload: EventPayloadMapping[Key]) => void} callback The callback to execute when the event fires
 * @returns {() => void} A function to unsubscribe the listener
 */
function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void,
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
  ipcRenderer.on(key, cb)
  return () => ipcRenderer.off(key, cb)
}

/**
 * Helper function for fire-and-forget IPC (send)
 * Used for: Commands, actions that don't need a response
 *
 * @template Key The event key from EventPayloadMapping
 * @param {Key} key The IPC channel to send to
 * @param {EventPayloadMapping[Key]} payload The data to send
 */
function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key],
) {
  ipcRenderer.send(key, payload as any)
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  todo: {
    // Request/Response operations (invoke)
    getAll: () => ipcInvoke('todo:getAll'),
    getById: (id: number) => ipcInvoke('todo:getById', id),
    create: (todoData) => ipcInvoke('todo:create', todoData),
    update: (id: number, todoData) => ipcInvoke('todo:update', id, todoData),
    delete: (id: number) => ipcInvoke('todo:delete', id),

    // Event subscriptions (on)
    onTodoAdded: (callback) => ipcOn('todo:added', callback),
    onTodoUpdated: (callback) => ipcOn('todo:updated', callback),
    onTodoDeleted: (callback) => ipcOn('todo:deleted', callback),
  },
} as ElectronAPI)
