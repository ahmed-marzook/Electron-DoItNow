import type { TodoRequest, TodoResponse } from '@/shared/index.js'
import { ApiError } from '@electron/types/apiError.js'

/**
 * Service to interact with the backend API for Todo operations.
 */
class TodoApiService {
  private baseUrl: string
  private timeout: number

  /**
   * Constructs a new TodoApiService.
   *
   * @param {string} baseUrl The base URL of the API. Defaults to 'http://localhost:8080'.
   * @param {number} timeout The request timeout in milliseconds. Defaults to 10000ms.
   */
  constructor(
    baseUrl: string = 'http://localhost:8080',
    timeout: number = 10000,
  ) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Generic fetch wrapper with error handling and timeout.
   *
   * @template T The expected return type.
   * @param {string} url The URL to fetch.
   * @param {RequestInit} [options={}] The fetch options.
   * @returns {Promise<T>} A promise resolving to the response data.
   * @throws {ApiError} If the request fails, times out, or returns a non-success status.
   */
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      // Handle non-2xx responses
      if (!response.ok) {
        const errorBody = await response.text()
        let errorData

        try {
          errorData = JSON.parse(errorBody)
        } catch {
          errorData = { message: errorBody }
        }

        const error: ApiError = {
          message:
            errorData.message || errorData.error || `HTTP ${response.status}`,
          status: response.status,
          code: errorData.code,
        }

        throw error
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)

      // Handle abort/timeout
      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          status: 0,
          code: 'TIMEOUT',
        } as ApiError
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: 'Network error - check connection',
          status: 0,
          code: 'NETWORK_ERROR',
        } as ApiError
      }

      // Re-throw API errors
      throw error
    }
  }

  /**
   * GET /api/todos
   * Get all todos with optional filters.
   *
   * @param {Object} [params] Optional query parameters.
   * @param {boolean} [params.completed] Filter by completion status.
   * @param {string} [params.priority] Filter by priority.
   * @returns {Promise<TodoResponse[]>} A list of todos matching the criteria.
   */
  async getAllTodos(params?: {
    completed?: boolean
    priority?: string
  }): Promise<TodoResponse[]> {
    const searchParams = new URLSearchParams()

    if (params?.completed !== undefined) {
      searchParams.append('completed', String(params.completed))
    }
    if (params?.priority) {
      searchParams.append('priority', params.priority)
    }

    const queryString = searchParams.toString()
    const url = `${this.baseUrl}/api/todos${queryString ? `?${queryString}` : ''}`

    return this.fetchWithTimeout<TodoResponse[]>(url, {
      method: 'GET',
    })
  }

  /**
   * GET /api/todos/{id}
   * Get a single todo by ID.
   *
   * @param {number} id The ID of the todo.
   * @returns {Promise<TodoResponse>} The requested todo.
   */
  async getTodoById(id: number): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(
      `${this.baseUrl}/api/todos/${id}`,
      { method: 'GET' },
    )
  }

  /**
   * POST /api/todos
   * Create a new todo.
   *
   * @param {TodoRequest} todo The data for the new todo.
   * @returns {Promise<TodoResponse>} The created todo.
   */
  async createTodo(todo: TodoRequest): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(`${this.baseUrl}/api/todos`, {
      method: 'POST',
      body: JSON.stringify(todo),
    })
  }

  /**
   * PUT /api/todos/{id}
   * Update an existing todo.
   *
   * @param {number} id The ID of the todo to update.
   * @param {TodoRequest} todo The new data for the todo.
   * @returns {Promise<TodoResponse>} The updated todo.
   */
  async updateTodo(id: number, todo: TodoRequest): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(
      `${this.baseUrl}/api/todos/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(todo),
      },
    )
  }

  /**
   * DELETE /api/todos/{id}
   * Delete a todo.
   *
   * @param {number} id The ID of the todo to delete.
   * @returns {Promise<void>} A promise that resolves when deletion is complete.
   */
  async deleteTodo(id: number): Promise<void> {
    return this.fetchWithTimeout<void>(`${this.baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * PATCH /api/todos/{id}/toggle
   * Toggle todo completed status.
   *
   * @param {number} id The ID of the todo.
   * @returns {Promise<TodoResponse>} The updated todo.
   */
  async toggleTodoCompleted(id: number): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(
      `${this.baseUrl}/api/todos/${id}/toggle`,
      { method: 'PATCH' },
    )
  }

  /**
   * GET /api/todos/due-date
   * Get todos by due date range.
   *
   * @param {Date} start The start date.
   * @param {Date} end The end date.
   * @returns {Promise<TodoResponse[]>} List of todos within the date range.
   */
  async getTodosByDueDateRange(
    start: Date,
    end: Date,
  ): Promise<TodoResponse[]> {
    const params = new URLSearchParams({
      start: start.toISOString(),
      end: end.toISOString(),
    })

    return this.fetchWithTimeout<TodoResponse[]>(
      `${this.baseUrl}/api/todos/due-date?${params}`,
      { method: 'GET' },
    )
  }

  /**
   * Check if API is reachable.
   *
   * @returns {Promise<boolean>} True if the API is reachable, false otherwise.
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchWithTimeout<any>(`${this.baseUrl}/api/todos`, {
        method: 'GET',
      })
      return true
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const todoApi = new TodoApiService()

// Also export the class for testing or multiple instances
export { TodoApiService }
