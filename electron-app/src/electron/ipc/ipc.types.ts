/**
 * Shared IPC types used by both main and renderer processes
 */

import type { Todo, TodoCreateInput, TodoUpdateInput } from '@shared/index.js'

/**
 * Standard IPC response wrapper.
 *
 * @template T The type of the data returned in a successful response.
 */
export interface IpcResponse<T = any> {
  /**
   * Indicates if the operation was successful.
   */
  success: boolean
  /**
   * The result data if successful.
   */
  data?: T
  /**
   * The error message if the operation failed.
   */
  error?: string
}

/**
 * Actions that can be performed on the application window frame.
 */
export type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE'

/**
 * EventPayloadMapping defines all IPC channels and their payload types.
 * Provides type safety for all invoke + on handlers.
 */
export interface EventPayloadMapping {
  // ------------------------------
  // Todo operations (invoke)
  // ------------------------------
  /**
   * Channel to retrieve all Todos.
   */
  'todo:getAll': IpcResponse<Todo[]>
  /**
   * Channel to retrieve a single Todo by ID.
   */
  'todo:getById': IpcResponse<Todo>
  /**
   * Channel to create a new Todo.
   */
  'todo:create': IpcResponse<Todo>
  /**
   * Channel to update an existing Todo.
   */
  'todo:update': IpcResponse<Todo>
  /**
   * Channel to delete a Todo.
   */
  'todo:delete': IpcResponse<void>

  // Todo events (one-way)
  /**
   * Event emitted when a Todo is added.
   */
  'todo:added': Todo
  /**
   * Event emitted when a Todo is updated.
   */
  'todo:updated': Todo
  /**
   * Event emitted when a Todo is deleted.
   */
  'todo:deleted': number
}

/**
 * Function type for unsubscribing from an event listener.
 */
export type UnsubscribeFunction = () => void

/**
 * ElectronAPI exposed via preload.
 *
 * Defines the methods available in the `window.electronAPI` object in the renderer process.
 */
export interface ElectronAPI {
  todo: {
    /**
     * Retrieves all Todos.
     * @returns {Promise<IpcResponse<Todo[]>>} A promise resolving to the list of Todos.
     */
    getAll: () => Promise<IpcResponse<Todo[]>>
    /**
     * Retrieves a single Todo by ID.
     * @param {number} id The ID of the Todo.
     * @returns {Promise<IpcResponse<Todo>>} A promise resolving to the Todo.
     */
    getById: (id: number) => Promise<IpcResponse<Todo>>
    /**
     * Creates a new Todo.
     * @param {TodoCreateInput} todoData The data for the new Todo.
     * @returns {Promise<IpcResponse<Todo>>} A promise resolving to the created Todo.
     */
    create: (todoData: TodoCreateInput) => Promise<IpcResponse<Todo>>
    /**
     * Updates an existing Todo.
     * @param {number} id The ID of the Todo.
     * @param {TodoUpdateInput} todoData The data to update.
     * @returns {Promise<IpcResponse<Todo>>} A promise resolving to the updated Todo.
     */
    update: (
      id: number,
      todoData: TodoUpdateInput,
    ) => Promise<IpcResponse<Todo>>
    /**
     * Deletes a Todo.
     * @param {number} id The ID of the Todo to delete.
     * @returns {Promise<IpcResponse<void>>} A promise resolving when the Todo is deleted.
     */
    delete: (id: number) => Promise<IpcResponse<void>>

    /**
     * Subscribes to the 'todo:added' event.
     * @param {(todo: Todo) => void} callback The function to call when a Todo is added.
     * @returns {UnsubscribeFunction} A function to unsubscribe.
     */
    onTodoAdded: (callback: (todo: Todo) => void) => UnsubscribeFunction
    /**
     * Subscribes to the 'todo:updated' event.
     * @param {(todo: Todo) => void} callback The function to call when a Todo is updated.
     * @returns {UnsubscribeFunction} A function to unsubscribe.
     */
    onTodoUpdated: (callback: (todo: Todo) => void) => UnsubscribeFunction
    /**
     * Subscribes to the 'todo:deleted' event.
     * @param {(id: number) => void} callback The function to call when a Todo is deleted.
     * @returns {UnsubscribeFunction} A function to unsubscribe.
     */
    onTodoDeleted: (callback: (id: number) => void) => UnsubscribeFunction
  }
}
