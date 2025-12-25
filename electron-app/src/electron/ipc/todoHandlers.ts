import { ipcMain } from 'electron'
import { getDatabase } from '@electron/database.js'
import { TodoDatabaseService } from '@electron/service/todoDatabaseService.js'
import type {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
} from '@shared/types/index.js'
import type { IpcResponse } from '@shared/types/ipc.types.js'
import { SyncQueueDatabaseService } from '@electron/service/syncQueueDatabaseService.js'
import { getSyncService } from '@electron/service/SyncService.js'
import { logInfo, logError } from '@electron/logger.js'

/**
 * List of registered IPC channels for cleanup
 */
const IPC_CHANNELS = [
  'todo:getAll',
  'todo:getById',
  'todo:create',
  'todo:update',
  'todo:delete',
]

/**
 * Register all IPC handlers for todo operations
 * These handlers provide CRUD functionality for the todos table
 */
export function registerTodoHandlers() {
  const db = getDatabase()
  const todoDbService = new TodoDatabaseService(db)
  const syncQueueService = new SyncQueueDatabaseService(db)

  /**
   * Get all todos from the database
   * Returns todos ordered by creation date (newest first)
   */
  ipcMain.handle('todo:getAll', (): IpcResponse<Todo[]> => {
    try {
      const todos = todoDbService.getAllTodos()
      return { success: true, data: todos }
    } catch (error) {
      logError('Error fetching todos:', error as Error)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * Get a single todo by ID
   */
  ipcMain.handle('todo:getById', (_event, id: number): IpcResponse<Todo> => {
    try {
      const todo = todoDbService.getTodoById(id)

      if (!todo) {
        return { success: false, error: `Todo with id ${id} not found` }
      }

      return { success: true, data: todo }
    } catch (error) {
      logError('Error fetching todo:', error as Error)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * Create a new todo
   * Accepts todo data and returns the created todo with its ID
   */
  ipcMain.handle(
    'todo:create',
    (_event, todoData: TodoCreateInput): IpcResponse<Todo> => {
      try {
        const newTodo = todoDbService.createTodo(todoData)
        syncQueueService.queueCreate('todo', newTodo.id.toString(), newTodo)
        return { success: true, data: newTodo }
      } catch (error) {
        logError('Error creating todo:', error as Error)
        return { success: false, error: (error as Error).message }
      }
    },
  )

  /**
   * Update an existing todo
   * Accepts todo ID and updated data
   */
  ipcMain.handle(
    'todo:update',
    (_event, id: number, todoData: TodoUpdateInput): IpcResponse<Todo> => {
      try {
        const updatedTodo = todoDbService.updateTodo(id, todoData)

        if (!updatedTodo) {
          return { success: false, error: `Todo with id ${id} not found` }
        }

        syncQueueService.queueUpdate(
          'todo',
          updatedTodo.id.toString(),
          updatedTodo,
        )

        return { success: true, data: updatedTodo }
      } catch (error) {
        logError('Error updating todo:', error as Error)
        return { success: false, error: (error as Error).message }
      }
    },
  )

  /**
   * Delete a todo by ID
   */
  ipcMain.handle('todo:delete', (_event, id: number): IpcResponse<void> => {
    try {
      const deleted = todoDbService.deleteTodo(id)

      if (!deleted) {
        return { success: false, error: `Todo with id ${id} not found` }
      }

      syncQueueService.queueDelete('todo', id.toString(), { id })

      return { success: true }
    } catch (error) {
      logError('Error deleting todo:', error as Error)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * Manually trigger sync
   */
  ipcMain.handle('sync:manual', async (): Promise<IpcResponse<void>> => {
    try {
      await getSyncService().runSync()
      return { success: true }
    } catch (error) {
      logError('Error running manual sync:', error as Error)
      return { success: false, error: (error as Error).message }
    }
  })

  logInfo('Todo IPC handlers registered')
}

/**
 * Unregister all IPC handlers
 * Call this before app quits to ensure clean shutdown
 */
export function unregisterTodoHandlers() {
  IPC_CHANNELS.forEach((channel) => {
    ipcMain.removeHandler(channel)
  })
  logInfo('Todo IPC handlers unregistered')
}
