// src/shared/todo.types.ts

/**
 * Priority levels for a todo item
 */
export type TodoPriority = 'low' | 'medium' | 'high'

/**
 * Full todo entity as stored in the database
 */
export interface Todo {
  id: number
  title: string
  description: string | null
  completed: 0 | 1 // stored as INTEGER in SQLite
  priority: TodoPriority
  due_date: string | null // e.g. '2025-12-15' or null
  user_id: number | null // optional user assignment
  created_at: string // SQLite timestamp
  updated_at: string // SQLite timestamp
}

/**
 * Payload for creating a new todo
 * Matches the columns used in the INSERT statement
 */
export interface TodoCreateInput {
  title: string
  description?: string | null
  completed?: 0 | 1
  priority?: TodoPriority
  due_date?: string | null
  user_id?: number | null
}

/**
 * Payload for updating an existing todo
 * All fields are optional, ID is passed separately
 */
export interface TodoUpdateInput {
  title?: string
  description?: string | null
  completed?: 0 | 1
  priority?: TodoPriority
  due_date?: string | null
  user_id?: number | null
}

export interface TodoRequest {
  entityId: number
  title: string
  description?: string
  completed?: boolean
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string // ISO 8601 format
  userId?: number
  createdAt?: string
}

export interface TodoResponse {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: string
  dueDate?: string
  userId?: number
  createdAt: string
  updatedAt: string
}
