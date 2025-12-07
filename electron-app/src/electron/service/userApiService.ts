import type { UserRequest, UserResponse } from '@/shared/index.js'
import { ApiError } from '@electron/types/apiError.js'
import { config } from '../config.js'

class UserApiService {
  private baseUrl: string
  private timeout: number

  constructor(
    baseUrl?: string,
    timeout?: number,
  ) {
    this.baseUrl = baseUrl || config.api.baseUrl
    this.timeout = timeout || config.api.timeout
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
   * GET /api/users
   * Get all users
   */
  async getAllUsers(): Promise<UserResponse[]> {
    return this.fetchWithTimeout<UserResponse[]>(`${this.baseUrl}/api/users`, {
      method: 'GET',
    })
  }

  /**
   * GET /api/users/{id}
   * Get a single user by ID
   */
  async getUserById(id: number): Promise<UserResponse> {
    return this.fetchWithTimeout<UserResponse>(
      `${this.baseUrl}/api/users/${id}`,
      { method: 'GET' },
    )
  }

  /**
   * GET /api/users/username/{username}
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<UserResponse> {
    return this.fetchWithTimeout<UserResponse>(
      `${this.baseUrl}/api/users/username/${encodeURIComponent(username)}`,
      { method: 'GET' },
    )
  }

  /**
   * GET /api/users/email/{email}
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<UserResponse> {
    return this.fetchWithTimeout<UserResponse>(
      `${this.baseUrl}/api/users/email/${encodeURIComponent(email)}`,
      { method: 'GET' },
    )
  }

  /**
   * POST /api/users
   * Create a new user
   */
  async createUser(user: UserRequest): Promise<UserResponse> {
    return this.fetchWithTimeout<UserResponse>(`${this.baseUrl}/api/users`, {
      method: 'POST',
      body: JSON.stringify(user),
    })
  }

  /**
   * PUT /api/users/{id}
   * Update an existing user
   */
  async updateUser(id: number, user: UserRequest): Promise<UserResponse> {
    return this.fetchWithTimeout<UserResponse>(
      `${this.baseUrl}/api/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(user),
      },
    )
  }

  /**
   * DELETE /api/users/{id}
   * Delete a user (cascades to todos)
   */
  async deleteUser(id: number): Promise<void> {
    return this.fetchWithTimeout<void>(`${this.baseUrl}/api/users/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Check if API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchWithTimeout<any>(`${this.baseUrl}/api/users`, {
        method: 'GET',
      })
      return true
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const userApi = new UserApiService()

// Also export the class for testing or multiple instances
export { UserApiService }
