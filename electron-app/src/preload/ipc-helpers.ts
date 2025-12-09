import { ipcRenderer } from 'electron'
import type { EventPayloadMapping } from '../shared/types/ipc.types'

/**
 * Helper function for request/response IPC with parameters (invoke)
 * Used for: CRUD operations, fetching data
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
 */
export function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key],
) {
  ipcRenderer.send(key, payload as any)
}
