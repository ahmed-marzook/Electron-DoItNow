import Database from 'better-sqlite3'
import { getDatabasePath } from './pathResolver.js'

let db: Database.Database | null = null

/**
 * Initialize database schema
 * Creates all necessary tables if they don't exist
 */
function initSchema() {
  if (!db) return

  // Create todos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 🔥 Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
    CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
    CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
  `)

  db.exec(`
    CREATE TABLE sync_queue (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
      entity_type TEXT NOT NULL, -- 'todo', 'habit'
      entity_id TEXT NOT NULL,
      payload TEXT NOT NULL, -- JSON string
      created_at INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending', -- 'pending', 'failed', 'processing'
      error_message TEXT,
      last_attempt_at INTEGER
    );
  `)

  db.exec(`
    CREATE INDEX idx_status ON sync_queue(status);
    CREATE INDEX idx_created_at ON sync_queue(created_at);
  `)

  console.log('Database schema initialized')
}

/**
 * Seed the database with sample data
 * Only runs if tables are empty
 */
function seedDatabase() {
  if (!db) return

  // Seed todos table if empty
  const todoCount = db.prepare('SELECT COUNT(*) as count FROM todos').get() as {
    count: number
  }

  if (todoCount.count === 0) {
    const insertTodo = db.prepare(
      'INSERT INTO todos (title, description, completed, priority, due_date) VALUES (@title, @description, @completed, @priority, @due_date)',
    )

    const insertManyTodos = db.transaction((todos) => {
      for (const todo of todos) insertTodo.run(todo)
    })

    insertManyTodos([
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive README and API documentation',
        completed: 0,
        priority: 'high',
        due_date: '2025-12-15',
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending PRs from team members',
        completed: 0,
        priority: 'medium',
        due_date: '2025-12-05',
      },
      {
        title: 'Fix login bug',
        description: 'Resolve authentication timeout issue reported by users',
        completed: 1,
        priority: 'high',
        due_date: '2025-12-01',
      },
      {
        title: 'Update dependencies',
        description: 'Update npm packages to latest stable versions',
        completed: 0,
        priority: 'low',
        due_date: '2025-12-20',
      },
      {
        title: 'Team meeting preparation',
        description: 'Prepare slides and agenda for weekly standup',
        completed: 1,
        priority: 'medium',
        due_date: '2025-12-02',
      },
      {
        title: 'Refactor database queries',
        description: 'Optimize slow queries and add proper indexing',
        completed: 0,
        priority: 'medium',
        due_date: '2025-12-10',
      },
    ])

    console.log('Sample todo data inserted')
  }

  // Log current data
  const todos = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all()
  console.log('Current todos in database:', todos)
}

/**
 * Initialize the database
 * Must be called after app.whenReady()
 */
export function initDatabase() {
  const dbPath = getDatabasePath()
  console.log('Database location:', dbPath)

  // 🔥 Remove verbose logging in production for better performance
  db = new Database(dbPath, { verbose: console.log })

  // 🔥 Performance optimizations
  // WAL mode allows multiple readers and better concurrency
  db.pragma('journal_mode = WAL')

  // Increase cache size from default 2MB to 10MB (10000 pages * 1KB)
  db.pragma('cache_size = 10000')

  // Store temporary tables in memory instead of disk
  db.pragma('temp_store = MEMORY')

  // Synchronous mode: NORMAL is faster and safe with WAL mode
  db.pragma('synchronous = NORMAL')

  // Memory-mapped I/O for faster reads (30MB)
  db.pragma('mmap_size = 30000000')

  console.log('Database optimizations applied')

  // Initialize schema first
  initSchema()

  // Seed with sample data
  // seedDatabase()

  return db
}

/**
 * Get the database instance
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Close the database connection
 */
export function closeDatabase() {
  try {
    // If you want to be extra safe and use better-sqlite3's flag:
    if (!db || !(db as any).open) {
      console.log('Database connection is already closed')
      db = null
      return
    }

    db.pragma('wal_checkpoint(TRUNCATE)')
    db.close()
    console.log('Database connection closed')

    db = null
  } catch (error) {
    console.error('Error closing database:', error)
  }
}
