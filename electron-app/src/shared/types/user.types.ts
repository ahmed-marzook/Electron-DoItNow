// src/shared/user.types.ts

/**
 * Full user entity as stored in the database
 */
export interface User {
  id: number
  username: string
  email: string
  created_at: string // SQLite timestamp
}

/**
 * Payload for creating a new user
 */
export interface UserCreateInput {
  username: string
  email: string
}

/**
 * Payload for updating an existing user
 * All fields are optional, ID is passed separately
 */
export interface UserUpdateInput {
  username?: string
  email?: string
}

/**
 * User request DTO matching backend API
 */
export interface UserRequest {
  username: string
  email: string
}

/**
 * User response DTO from backend API
 */
export interface UserResponse {
  id: number
  username: string
  email: string
  createdAt: string
}
