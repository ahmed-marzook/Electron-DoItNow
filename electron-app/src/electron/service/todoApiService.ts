import type { TodoRequest, TodoResponse } from '@/shared/index.js'
import { ApiError } from '@electron/types/apiError.js'

class TodoApiService {
  private baseUrl: string
  private timeout: number

  constructor(
    baseUrl: string = 'http://localhost:8080',
    timeout: number = 10000,
  ) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Generic fetch wrapper with error handling and timeout
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
   * Get all todos with optional filters
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
   * Get a single todo by ID
   */
  async getTodoById(id: number): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(
      `${this.baseUrl}/api/todos/${id}`,
      { method: 'GET' },
    )
  }

  /**
   * POST /api/todos
   * Create a new todo
   */
  async createTodo(todo: TodoRequest): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(`${this.baseUrl}/api/todos`, {
      method: 'POST',
      body: JSON.stringify(todo),
    })
  }

  /**
   * PUT /api/todos/{id}
   * Update an existing todo
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
   * Delete a todo
   */
  async deleteTodo(id: number): Promise<void> {
    return this.fetchWithTimeout<void>(`${this.baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * PATCH /api/todos/{id}/toggle
   * Toggle todo completed status
   */
  async toggleTodoCompleted(id: number): Promise<TodoResponse> {
    return this.fetchWithTimeout<TodoResponse>(
      `${this.baseUrl}/api/todos/${id}/toggle`,
      { method: 'PATCH' },
    )
  }

  /**
   * GET /api/todos/due-date
   * Get todos by due date range
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
   * Check if API is reachable
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
