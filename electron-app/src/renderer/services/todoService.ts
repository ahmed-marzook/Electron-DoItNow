import type { Todo } from '@shared/types/todo.types'

/**
 * Service for interacting with the Electron todo API
 */
export const todoService = {
  /**
   * Fetch all todos from the database
   */
  async getAll(): Promise<Todo[]> {
    const response = await window.electronAPI.todo.getAll()

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to load todos')
  },

  /**
   * Create a new todo
   */
  async create(todo: {
    title: string
    description: string | null
    completed: 0 | 1
    priority: 'low' | 'medium' | 'high'
    due_date: string | null
  }): Promise<Todo> {
    const response = await window.electronAPI.todo.create(todo)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to create todo')
  },

  /**
   * Update an existing todo
   */
  async update(
    id: number,
    todo: {
      title: string
      description: string | null
      completed: 0 | 1
      priority: 'low' | 'medium' | 'high'
      due_date: string | null
    }
  ): Promise<Todo> {
    const response = await window.electronAPI.todo.update(id, todo)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to update todo')
  },

  /**
   * Delete a todo by ID
   */
  async delete(id: number): Promise<void> {
    const response = await window.electronAPI.todo.delete(id)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete todo')
    }
  },
}
