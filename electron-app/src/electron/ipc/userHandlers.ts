import { ipcMain } from 'electron'
import type { User, UserCreateInput, UserUpdateInput } from '@shared/types/index.js'
import type { IpcResponse } from '@shared/types/ipc.types.js'
import { userApi } from '@electron/service/userApiService.js'
import { logInfo, logError } from '@electron/logger.js'

/**
 * List of registered IPC channels for cleanup
 */
const IPC_CHANNELS = [
  'user:getAll',
  'user:getById',
  'user:create',
  'user:update',
  'user:delete',
]

/**
 * Convert UserResponse from backend to User type for frontend
 */
function convertUserResponseToUser(userResponse: any): User {
  return {
    id: userResponse.id,
    username: userResponse.username,
    email: userResponse.email,
    created_at: userResponse.createdAt,
  }
}

/**
 * Register all IPC handlers for user operations
 * These handlers provide CRUD functionality for users via the backend API
 */
export function registerUserHandlers() {
  /**
   * Get all users from the backend
   */
  ipcMain.handle('user:getAll', async (): Promise<IpcResponse<User[]>> => {
    try {
      const userResponses = await userApi.getAllUsers()
      const users = userResponses.map(convertUserResponseToUser)
      return { success: true, data: users }
    } catch (error: any) {
      logError('Error fetching users:', error)
      return { success: false, error: error.message || 'Failed to fetch users' }
    }
  })

  /**
   * Get a single user by ID
   */
  ipcMain.handle('user:getById', async (_event, id: number): Promise<IpcResponse<User>> => {
    try {
      const userResponse = await userApi.getUserById(id)
      const user = convertUserResponseToUser(userResponse)
      return { success: true, data: user }
    } catch (error: any) {
      logError('Error fetching user:', error)
      return { success: false, error: error.message || `User with id ${id} not found` }
    }
  })

  /**
   * Create a new user
   * Accepts user data and returns the created user with its ID
   */
  ipcMain.handle(
    'user:create',
    async (_event, userData: UserCreateInput): Promise<IpcResponse<User>> => {
      try {
        const userRequest = {
          username: userData.username,
          email: userData.email,
        }
        const userResponse = await userApi.createUser(userRequest)
        const user = convertUserResponseToUser(userResponse)
        return { success: true, data: user }
      } catch (error: any) {
        logError('Error creating user:', error)
        return { success: false, error: error.message || 'Failed to create user' }
      }
    },
  )

  /**
   * Update an existing user
   * Accepts user ID and updated data
   */
  ipcMain.handle(
    'user:update',
    async (_event, id: number, userData: UserUpdateInput): Promise<IpcResponse<User>> => {
      try {
        // Build the request with only provided fields
        const userRequest: any = {}
        if (userData.username !== undefined) {
          userRequest.username = userData.username
        }
        if (userData.email !== undefined) {
          userRequest.email = userData.email
        }

        const userResponse = await userApi.updateUser(id, userRequest)
        const user = convertUserResponseToUser(userResponse)
        return { success: true, data: user }
      } catch (error: any) {
        logError('Error updating user:', error)
        return { success: false, error: error.message || `Failed to update user ${id}` }
      }
    },
  )

  /**
   * Delete a user by ID
   */
  ipcMain.handle('user:delete', async (_event, id: number): Promise<IpcResponse<void>> => {
    try {
      await userApi.deleteUser(id)
      return { success: true }
    } catch (error: any) {
      logError('Error deleting user:', error)
      return { success: false, error: error.message || `Failed to delete user ${id}` }
    }
  })

  logInfo('User IPC handlers registered')
}

/**
 * Unregister all IPC handlers
 * Call this before app quits to ensure clean shutdown
 */
export function unregisterUserHandlers() {
  IPC_CHANNELS.forEach((channel) => {
    ipcMain.removeHandler(channel)
  })
  logInfo('User IPC handlers unregistered')
}
