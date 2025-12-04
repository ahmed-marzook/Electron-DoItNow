// Enums for specific fields
export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE'
export type SyncEntityType = 'todo' | 'habit'
export type SyncStatus = 'pending' | 'failed' | 'processing' | 'completed'

// Base type representing the database row
export interface SyncQueueRow {
  id: string
  action_type: SyncActionType
  entity_type: SyncEntityType
  entity_id: string
  payload: string // JSON string
  created_at: number
  retry_count: number
  status: SyncStatus
  error_message: string | null
  last_attempt_at: number | null
}

// Type for inserting a new sync queue item (optional fields with defaults)
export interface SyncQueueInsert {
  id: string
  action_type: SyncActionType
  entity_type: SyncEntityType
  entity_id: string
  payload: string // JSON string
  created_at: number
  retry_count?: number // Default: 0
  status?: SyncStatus // Default: 'pending'
  error_message?: string | null
  last_attempt_at?: number | null
}

// Type for getting/querying sync queue items (all fields present)
export type SyncQueueGet = SyncQueueRow

// Type for delete operation (just needs the ID)
export interface SyncQueueDelete {
  id: string
}

// Optional: Generic payload type if you want type safety for the payload JSON
export interface SyncQueueWithPayload<T = any> extends Omit<
  SyncQueueRow,
  'payload'
> {
  payload: T // Parsed JSON payload
}
