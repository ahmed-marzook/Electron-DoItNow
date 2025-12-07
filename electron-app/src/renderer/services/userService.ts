import type { User, UserCreateInput, UserUpdateInput } from '@shared/types/user.types'

/**
 * Service for interacting with the Electron user API
 */
export const userService = {
  /**
   * Fetch all users from the backend
   */
  async getAll(): Promise<User[]> {
    const response = await window.electronAPI.user.getAll()

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to load users')
  },

  /**
   * Fetch a single user by ID
   */
  async getById(id: number): Promise<User> {
    const response = await window.electronAPI.user.getById(id)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to load user')
  },

  /**
   * Create a new user
   */
  async create(user: UserCreateInput): Promise<User> {
    const response = await window.electronAPI.user.create(user)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to create user')
  },

  /**
   * Update an existing user
   */
  async update(id: number, user: UserUpdateInput): Promise<User> {
    const response = await window.electronAPI.user.update(id, user)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || 'Failed to update user')
  },

  /**
   * Delete a user by ID
   */
  async delete(id: number): Promise<void> {
    const response = await window.electronAPI.user.delete(id)

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete user')
    }
  },
}
