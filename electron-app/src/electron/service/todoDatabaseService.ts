import type { Database } from 'better-sqlite3'
import type {
  Todo,
  TodoCreateInput,
  TodoUpdateInput,
} from '@shared/types/index.js'

/**
 * Service for handling all database operations related to todos
 * Encapsulates SQLite queries and provides a clean interface for todo CRUD operations
 */
class TodoDatabaseService {
  private db: Database

  constructor(database: Database) {
    this.db = database
  }

  /**
   * Get all todos from the database
   * @returns Array of todos ordered by creation date (newest first)
   */
  getAllTodos(): Todo[] {
    const todos = this.db
      .prepare('SELECT * FROM todos ORDER BY created_at DESC')
      .all() as Todo[]
    return todos
  }

  /**
   * Get a single todo by ID
   * @param id - The todo ID
   * @returns The todo if found, undefined otherwise
   */
  getTodoById(id: number): Todo | undefined {
    const todo = this.db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(id) as Todo | undefined
    return todo
  }

  /**
   * Create a new todo in the database
   * @param todoData - The todo data to insert
   * @returns The newly created todo with its assigned ID
   */
  createTodo(todoData: TodoCreateInput): Todo {
    const stmt = this.db.prepare(`
      INSERT INTO todos (title, description, completed, priority, due_date, user_id)
      VALUES (@title, @description, @completed, @priority, @due_date, @user_id)
    `)

    const info = stmt.run(todoData)

    const newTodo = this.db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(info.lastInsertRowid) as Todo

    return newTodo
  }

  /**
   * Update an existing todo
   * @param id - The todo ID to update
   * @param todoData - The updated todo data
   * @returns The updated todo if successful, undefined if todo not found
   */
  updateTodo(id: number, todoData: TodoUpdateInput): Todo | undefined {
    const stmt = this.db.prepare(`
      UPDATE todos
      SET
        title = @title,
        description = @description,
        completed = @completed,
        priority = @priority,
        due_date = @due_date,
        user_id = @user_id,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `)

    const result = stmt.run({ ...todoData, id })

    if (result.changes === 0) {
      return undefined
    }

    const updatedTodo = this.db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(id) as Todo

    return updatedTodo
  }

  /**
   * Delete a todo by ID
   * @param id - The todo ID to delete
   * @returns True if the todo was deleted, false if not found
   */
  deleteTodo(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?')
    const result = stmt.run(id)

    return result.changes > 0
  }
}

export { TodoDatabaseService }
