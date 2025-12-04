import type { Todo } from '@shared/types/todo.types'

/**
 * Service for interacting with the Electron todo API.
 * Wrapper around `window.electronAPI.todo`.
 */
export const todoService = {
  /**
   * Fetch all todos from the database.
   *
   * @returns {Promise<Todo[]>} A list of todos.
   * @throws {Error} If the operation fails.
   */
  async getAll(): Promise<Todo[]> {
    const response = await window.electronAPI.todo.getAll()

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to load todos')
  },

  /**
   * Create a new todo.
   *
   * @param {Object} todo The todo data.
   * @param {string} todo.title The title of the todo.
   * @param {string | null} todo.description The description of the todo.
   * @param {0 | 1} todo.completed Completion status (0 or 1).
   * @param {'low' | 'medium' | 'high'} todo.priority Priority level.
   * @param {string | null} todo.due_date Due date as a string.
   * @returns {Promise<Todo>} The created todo.
   * @throws {Error} If the operation fails.
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
   * Update an existing todo.
   *
   * @param {number} id The ID of the todo to update.
   * @param {Object} todo The new todo data.
   * @param {string} todo.title The title of the todo.
   * @param {string | null} todo.description The description of the todo.
   * @param {0 | 1} todo.completed Completion status (0 or 1).
   * @param {'low' | 'medium' | 'high'} todo.priority Priority level.
   * @param {string | null} todo.due_date Due date as a string.
   * @returns {Promise<Todo>} The updated todo.
   * @throws {Error} If the operation fails.
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
   * Delete a todo by ID.
   *
   * @param {number} id The ID of the todo to delete.
   * @returns {Promise<void>} A promise that resolves when deletion is complete.
   * @throws {Error} If the operation fails.
   */
  async delete(id: number): Promise<void> {
    const response = await window.electronAPI.todo.delete(id)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete todo')
    }
  },
}
