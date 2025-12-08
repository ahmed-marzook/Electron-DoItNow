import { ipcRenderer } from 'electron'
import { EventPayloadMapping } from '../shared/types/ipc.types.js'

/**
 * Shared IPC helper functions for preload scripts
 *
 * These functions provide type-safe wrappers around Electron's IPC mechanisms,
 * ensuring consistent communication patterns between renderer and main processes.
 */

/**
 * Helper function for request/response IPC with parameters (invoke)
 * Used for: CRUD operations, fetching data
 *
 * @example
 * const todos = await ipcInvoke('todo:getAll')
 */
export function ipcInvoke<Key extends keyof EventPayloadMapping>(
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
 * @example
 * const unsubscribe = ipcOn('todo:added', (todo) => console.log(todo))
 * // Later: unsubscribe()
 */
export function ipcOn<Key extends keyof EventPayloadMapping>(
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
 * @example
 * ipcSend('window:minimize', {})
 */
export function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key],
) {
  ipcRenderer.send(key, payload as any)
}
