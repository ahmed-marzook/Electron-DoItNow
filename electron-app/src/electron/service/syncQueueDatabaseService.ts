import type { Database } from 'better-sqlite3'
import {
  SyncQueueInsert,
  SyncQueueRow,
  SyncStatus,
  SyncActionType,
  SyncEntityType,
} from '@electron/types/syncQueue.types.js'

/**
 * Service for handling all database operations related to Sync Queues
 * Encapsulates SQLite queries and provides a clean interface for sync queue CRUD operations
 */
class SyncQueueDatabaseService {
  private db: Database

  constructor(database: Database) {
    this.db = database
  }

  /**
   * Queue an entity action for sync (simplified helper)
   * Automatically generates ID and timestamp
   */
  queueAction<T = any>(
    actionType: SyncActionType,
    entityType: SyncEntityType,
    entityId: string,
    payload: T,
  ): SyncQueueRow {
    const item: SyncQueueInsert = {
      id: crypto.randomUUID(),
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      payload: JSON.stringify(payload),
      created_at: Date.now(),
    }

    return this.insert(item)
  }

  /**
   * Queue a create action
   */
  queueCreate<T = any>(
    entityType: SyncEntityType,
    entityId: string,
    payload: T,
  ): SyncQueueRow {
    return this.queueAction('CREATE', entityType, entityId, payload)
  }

  /**
   * Queue an update action
   */
  queueUpdate<T = any>(
    entityType: SyncEntityType,
    entityId: string,
    payload: T,
  ): SyncQueueRow {
    return this.queueAction('UPDATE', entityType, entityId, payload)
  }

  /**
   * Queue a delete action
   */
  queueDelete<T = any>(
    entityType: SyncEntityType,
    entityId: string,
    payload: T,
  ): SyncQueueRow {
    return this.queueAction('DELETE', entityType, entityId, payload)
  }

  /**
   * Insert a new item into the sync queue
   */
  insert(item: SyncQueueInsert): SyncQueueRow {
    const stmt = this.db.prepare(`
      INSERT INTO sync_queue (
        id, action_type, entity_type, entity_id, payload, 
        created_at, retry_count, status, error_message, last_attempt_at
      ) VALUES (
        @id, @action_type, @entity_type, @entity_id, @payload,
        @created_at, @retry_count, @status, @error_message, @last_attempt_at
      )
    `)

    const params = {
      id: item.id,
      action_type: item.action_type,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      payload: item.payload,
      created_at: item.created_at,
      retry_count: item.retry_count ?? 0,
      status: item.status ?? 'pending',
      error_message: item.error_message ?? null,
      last_attempt_at: item.last_attempt_at ?? null,
    }

    stmt.run(params)
    return this.getById(item.id)!
  }

  /**
   * Get a single item by ID
   */
  getById(id: string): SyncQueueRow | undefined {
    const stmt = this.db.prepare('SELECT * FROM sync_queue WHERE id = ?')
    return stmt.get(id) as SyncQueueRow | undefined
  }

  /**
   * Get all items
   */
  getAll(): SyncQueueRow[] {
    const stmt = this.db.prepare(
      'SELECT * FROM sync_queue ORDER BY created_at ASC',
    )
    return stmt.all() as SyncQueueRow[]
  }

  /**
   * Update item status
   */
  updateStatus(
    id: string,
    status: SyncStatus,
    errorMessage?: string | null,
  ): boolean {
    const stmt = this.db.prepare(`
      UPDATE sync_queue 
      SET status = ?, error_message = ?, last_attempt_at = ?
      WHERE id = ?
    `)

    const result = stmt.run(status, errorMessage ?? null, Date.now(), id)
    return result.changes > 0
  }

  /**
   * Mark item as processing
   */
  markAsProcessing(id: string): boolean {
    return this.updateStatus(id, 'processing')
  }

  /**
   * Mark item as failed with error message
   */
  markAsFailed(id: string, errorMessage: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE sync_queue 
      SET status = 'failed', 
          error_message = ?, 
          retry_count = retry_count + 1,
          last_attempt_at = ?
      WHERE id = ?
    `)

    const result = stmt.run(errorMessage, Date.now(), id)
    return result.changes > 0
  }

  /**
   * Increment retry count
   */
  incrementRetryCount(id: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE sync_queue 
      SET retry_count = retry_count + 1, last_attempt_at = ?
      WHERE id = ?
    `)

    const result = stmt.run(Date.now(), id)
    return result.changes > 0
  }

  /**
   * Reset item to pending (for retry)
   */
  resetToPending(id: string): boolean {
    return this.updateStatus(id, 'pending', null)
  }

  /**
   * Delete a single item by ID
   */
  deleteById(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sync_queue WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  /**
   * Delete items by status
   */
  deleteByStatus(status: SyncStatus): number {
    const stmt = this.db.prepare('DELETE FROM sync_queue WHERE status = ?')
    const result = stmt.run(status)
    return result.changes
  }
}

export { SyncQueueDatabaseService }
