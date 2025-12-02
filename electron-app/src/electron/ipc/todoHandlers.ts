import { ipcMain } from 'electron'
import { getDatabase } from '../database.js'
import type {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
} from '@shared/types/index.js'
import type { IpcResponse } from './ipc.types.js'

/**
 * Register all IPC handlers for todo operations
 * These handlers provide CRUD functionality for the todos table
 */
export function registerTodoHandlers() {
  const db = getDatabase()

  /**
   * Get all todos from the database
   * Returns todos ordered by creation date (newest first)
   */
  ipcMain.handle('todo:getAll', (): IpcResponse<Todo[]> => {
    try {
      const todos = db
        .prepare('SELECT * FROM todos ORDER BY created_at DESC')
        .all() as Todo[]
      return { success: true, data: todos }
    } catch (error) {
      console.error('Error fetching todos:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * Get a single todo by ID
   */
  ipcMain.handle('todo:getById', (_event, id: number): IpcResponse<Todo> => {
    try {
      const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id) as
        | Todo
        | undefined

      if (!todo) {
        return { success: false, error: `Todo with id ${id} not found` }
      }

      return { success: true, data: todo }
    } catch (error) {
      console.error('Error fetching todo:', error)
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
        const stmt = db.prepare(`
          INSERT INTO todos (title, description, completed, priority, due_date)
          VALUES (@title, @description, @completed, @priority, @due_date)
        `)

        const info = stmt.run(todoData)

        const newTodo = db
          .prepare('SELECT * FROM todos WHERE id = ?')
          .get(info.lastInsertRowid) as Todo

        return { success: true, data: newTodo }
      } catch (error) {
        console.error('Error creating todo:', error)
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
        const stmt = db.prepare(`
          UPDATE todos
          SET
            title = @title,
            description = @description,
            completed = @completed,
            priority = @priority,
            due_date = @due_date,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = @id
        `)

        const result = stmt.run({ ...todoData, id })

        if (result.changes === 0) {
          return { success: false, error: `Todo with id ${id} not found` }
        }

        const updatedTodo = db
          .prepare('SELECT * FROM todos WHERE id = ?')
          .get(id) as Todo

        return { success: true, data: updatedTodo }
      } catch (error) {
        console.error('Error updating todo:', error)
        return { success: false, error: (error as Error).message }
      }
    },
  )

  /**
   * Delete a todo by ID
   */
  ipcMain.handle('todo:delete', (_event, id: number): IpcResponse<void> => {
    try {
      const stmt = db.prepare('DELETE FROM todos WHERE id = ?')
      const result = stmt.run(id)

      if (result.changes === 0) {
        return { success: false, error: `Todo with id ${id} not found` }
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting todo:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  console.log('Todo IPC handlers registered')
}
