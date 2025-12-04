// Enums for specific fields
/**
 * Types of actions that can be synchronized.
 */
export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * Types of entities that can be synchronized.
 */
export type SyncEntityType = 'todo' | 'habit'

/**
 * Status of a synchronization item in the queue.
 */
export type SyncStatus = 'pending' | 'failed' | 'processing'

// Base type representing the database row
/**
 * Represents a row in the synchronization queue table.
 */
export interface SyncQueueRow {
  /**
   * Unique identifier for the sync queue item (UUID).
   */
  id: string
  /**
   * The type of action performed (CREATE, UPDATE, DELETE).
   */
  action_type: SyncActionType
  /**
   * The type of entity involved (e.g., 'todo', 'habit').
   */
  entity_type: SyncEntityType
  /**
   * The ID of the entity being synchronized.
   */
  entity_id: string
  /**
   * The data payload for the action, stored as a JSON string.
   */
  payload: string // JSON string
  /**
   * Timestamp when the action occurred.
   */
  created_at: number
  /**
   * Number of times synchronization has been attempted for this item.
   */
  retry_count: number
  /**
   * Current processing status of the item.
   */
  status: SyncStatus
  /**
   * Error message if the last attempt failed.
   */
  error_message: string | null
  /**
   * Timestamp of the last synchronization attempt.
   */
  last_attempt_at: number | null
}

// Type for inserting a new sync queue item (optional fields with defaults)
/**
 * Type definition for inserting a new item into the sync queue.
 *
 * Fields with defaults in the database are optional.
 */
export interface SyncQueueInsert {
  /**
   * Unique identifier for the sync queue item.
   */
  id: string
  /**
   * The type of action.
   */
  action_type: SyncActionType
  /**
   * The type of entity.
   */
  entity_type: SyncEntityType
  /**
   * The ID of the entity.
   */
  entity_id: string
  /**
   * The payload data as a JSON string.
   */
  payload: string // JSON string
  /**
   * Timestamp of creation.
   */
  created_at: number
  /**
   * Initial retry count (default is 0).
   */
  retry_count?: number // Default: 0
  /**
   * Initial status (default is 'pending').
   */
  status?: SyncStatus // Default: 'pending'
  /**
   * Initial error message (default is null).
   */
  error_message?: string | null
  /**
   * Initial last attempt timestamp (default is null).
   */
  last_attempt_at?: number | null
}

// Type for getting/querying sync queue items (all fields present)
/**
 * Alias for SyncQueueRow, used when retrieving items.
 */
export type SyncQueueGet = SyncQueueRow

// Type for delete operation (just needs the ID)
/**
 * Type definition for deleting a sync queue item.
 */
export interface SyncQueueDelete {
  /**
   * The ID of the item to delete.
   */
  id: string
}

// Optional: Generic payload type if you want type safety for the payload JSON
/**
 * Extended SyncQueueRow type with a parsed generic payload.
 *
 * @template T The type of the parsed payload.
 */
export interface SyncQueueWithPayload<T = any> extends Omit<
  SyncQueueRow,
  'payload'
> {
  /**
   * The parsed payload data.
   */
  payload: T // Parsed JSON payload
}
