// src/shared/todo.types.ts

/**
 * Priority levels for a todo item.
 */
export type TodoPriority = 'low' | 'medium' | 'high'

/**
 * Full todo entity as stored in the database.
 */
export interface Todo {
  /**
   * Unique identifier for the Todo.
   */
  id: number
  /**
   * Title of the Todo.
   */
  title: string
  /**
   * Description of the Todo.
   */
  description: string | null
  /**
   * Completion status (0 for incomplete, 1 for complete).
   * stored as INTEGER in SQLite.
   */
  completed: 0 | 1 // stored as INTEGER in SQLite
  /**
   * Priority level of the Todo.
   */
  priority: TodoPriority
  /**
   * Due date string (e.g. '2025-12-15') or null.
   */
  due_date: string | null // e.g. '2025-12-15' or null
  /**
   * Creation timestamp (SQLite format).
   */
  created_at: string // SQLite timestamp
  /**
   * Last update timestamp (SQLite format).
   */
  updated_at: string // SQLite timestamp
}

/**
 * Payload for creating a new todo.
 * Matches the columns used in the INSERT statement.
 */
export interface TodoCreateInput {
  /**
   * Title of the new Todo.
   */
  title: string
  /**
   * Optional description.
   */
  description?: string | null
  /**
   * Optional completion status.
   */
  completed?: 0 | 1
  /**
   * Optional priority level.
   */
  priority?: TodoPriority
  /**
   * Optional due date.
   */
  due_date?: string | null
}

/**
 * Payload for updating an existing todo.
 * All fields are optional, ID is passed separately.
 */
export interface TodoUpdateInput {
  /**
   * Updated title.
   */
  title?: string
  /**
   * Updated description.
   */
  description?: string | null
  /**
   * Updated completion status.
   */
  completed?: 0 | 1
  /**
   * Updated priority level.
   */
  priority?: TodoPriority
  /**
   * Updated due date.
   */
  due_date?: string | null
}

/**
 * Request payload for API calls (REST).
 */
export interface TodoRequest {
  /**
   * Title of the Todo.
   */
  title: string
  /**
   * Description of the Todo.
   */
  description?: string
  /**
   * Completion status.
   */
  completed?: boolean
  /**
   * Priority level.
   */
  priority?: 'low' | 'medium' | 'high'
  /**
   * Due date in ISO 8601 format.
   */
  dueDate?: string // ISO 8601 format
}

/**
 * Response payload from API calls (REST).
 */
export interface TodoResponse {
  /**
   * Unique identifier.
   */
  id: number
  /**
   * Title of the Todo.
   */
  title: string
  /**
   * Description of the Todo.
   */
  description?: string
  /**
   * Completion status.
   */
  completed: boolean
  /**
   * Priority level.
   */
  priority: string
  /**
   * Due date string.
   */
  dueDate?: string
  /**
   * Creation timestamp.
   */
  createdAt: string
  /**
   * Last update timestamp.
   */
  updatedAt: string
}
