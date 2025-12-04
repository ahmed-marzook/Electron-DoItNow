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

  /**
   * Constructs a new TodoDatabaseService.
   *
   * @param {Database} database The initialized better-sqlite3 database instance.
   */
  constructor(database: Database) {
    this.db = database
  }

  /**
   * Get all todos from the database
   * @returns {Todo[]} Array of todos ordered by creation date (newest first)
   */
  getAllTodos(): Todo[] {
    const todos = this.db
      .prepare('SELECT * FROM todos ORDER BY created_at DESC')
      .all() as Todo[]
    return todos
  }

  /**
   * Get a single todo by ID
   * @param {number} id - The todo ID
   * @returns {Todo | undefined} The todo if found, undefined otherwise
   */
  getTodoById(id: number): Todo | undefined {
    const todo = this.db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(id) as Todo | undefined
    return todo
  }

  /**
   * Create a new todo in the database
   * @param {TodoCreateInput} todoData - The todo data to insert
   * @returns {Todo} The newly created todo with its assigned ID
   */
  createTodo(todoData: TodoCreateInput): Todo {
    const stmt = this.db.prepare(`
      INSERT INTO todos (title, description, completed, priority, due_date)
      VALUES (@title, @description, @completed, @priority, @due_date)
    `)

    const info = stmt.run(todoData)

    const newTodo = this.db
      .prepare('SELECT * FROM todos WHERE id = ?')
      .get(info.lastInsertRowid) as Todo

    return newTodo
  }

  /**
   * Update an existing todo
   * @param {number} id - The todo ID to update
   * @param {TodoUpdateInput} todoData - The updated todo data
   * @returns {Todo | undefined} The updated todo if successful, undefined if todo not found
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
   * @param {number} id - The todo ID to delete
   * @returns {boolean} True if the todo was deleted, false if not found
   */
  deleteTodo(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM todos WHERE id = ?')
    const result = stmt.run(id)

    return result.changes > 0
  }
}

export { TodoDatabaseService }
