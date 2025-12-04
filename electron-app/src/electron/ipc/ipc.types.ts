/**
 * Shared IPC types used by both main and renderer processes
 */

import type { Todo, TodoCreateInput, TodoUpdateInput } from '@shared/index.js'

/**
 * Standard IPC response wrapper
 */
export interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE'

/**
 * EventPayloadMapping defines all IPC channels and their payload types.
 * Provides type safety for all invoke + on handlers.
 */
export interface EventPayloadMapping {
  // ------------------------------
  // Todo operations (invoke)
  // ------------------------------
  'todo:getAll': IpcResponse<Todo[]>
  'todo:getById': IpcResponse<Todo>
  'todo:create': IpcResponse<Todo>
  'todo:update': IpcResponse<Todo>
  'todo:delete': IpcResponse<void>
  'sync:manual': IpcResponse<void>

  // Todo events (one-way)
  'todo:added': Todo
  'todo:updated': Todo
  'todo:deleted': number
}

export type UnsubscribeFunction = () => void

/**
 * ElectronAPI exposed via preload
 */
export interface ElectronAPI {
  todo: {
    getAll: () => Promise<IpcResponse<Todo[]>>
    getById: (id: number) => Promise<IpcResponse<Todo>>
    create: (todoData: TodoCreateInput) => Promise<IpcResponse<Todo>>
    update: (
      id: number,
      todoData: TodoUpdateInput,
    ) => Promise<IpcResponse<Todo>>
    delete: (id: number) => Promise<IpcResponse<void>>
    manualSync: () => Promise<IpcResponse<void>>

    onTodoAdded: (callback: (todo: Todo) => void) => UnsubscribeFunction
    onTodoUpdated: (callback: (todo: Todo) => void) => UnsubscribeFunction
    onTodoDeleted: (callback: (id: number) => void) => UnsubscribeFunction
  }
}
