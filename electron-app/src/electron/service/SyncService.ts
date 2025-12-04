import type { Database } from 'better-sqlite3'
import { SyncQueueDatabaseService } from './syncQueueDatabaseService.js'
import { todoApi, TodoApiService } from './todoApiService.js'
import type { SyncQueueRow } from '../types/syncQueue.types.js'
import type { Todo, TodoRequest } from '@/shared/index.js'
import type { ApiError } from '../types/apiError.js'
import { getDatabase } from '../database.js'

interface SyncResult {
  success: number
  failed: number
  errors: Array<{
    id: string
    error: string
  }>
}

interface SyncOptions {
  maxRetries?: number
  batchSize?: number
}

/**
 * Service for syncing local changes to the remote API
 * Processes items from the sync queue and calls appropriate TodoAPI endpoints
 */
class SyncService {
  private syncQueueService: SyncQueueDatabaseService
  private todoApiService: TodoApiService
  private maxRetries: number
  private batchSize: number
  private isProcessing: boolean = false

  constructor(
    database: Database,
    todoApiService: TodoApiService,
    options: SyncOptions = {},
  ) {
    this.syncQueueService = new SyncQueueDatabaseService(database)
    this.todoApiService = todoApiService
    this.maxRetries = options.maxRetries ?? 3
    this.batchSize = options.batchSize ?? 50
  }

  /**
   * Orchestrates the sync process with logging and error handling.
   * This is intended to be called by the scheduler.
   */
  async runSync(): Promise<void> {
    const timestamp = new Date().toLocaleString()
    console.log('[Sync] Starting sync job at', timestamp)

    try {
      if (this.isSyncing()) {
        console.log('[Sync] Previous sync still in progress, skipping...')
        return
      }

      const statsBefore = this.getQueueStats()
      console.log('[Sync] Queue before:', {
        total: statsBefore.total,
        pending: statsBefore.pending,
        failed: statsBefore.failed,
      })

      const result = await this.processSyncQueue()

      console.log('[Sync] Completed:', {
        success: result.success,
        failed: result.failed,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })

      const statsAfter = this.getQueueStats()
      console.log('[Sync] Queue after:', {
        total: statsAfter.total,
        pending: statsAfter.pending,
        failed: statsAfter.failed,
      })
    } catch (error) {
      console.error('[Sync] Error during sync:', error)
    }
  }

  /**
   * Process all pending items in the sync queue
   */
  async processSyncQueue(): Promise<SyncResult> {
    if (this.isProcessing) {
      throw new Error('Sync is already in progress')
    }

    this.isProcessing = true

    const result: SyncResult = {
      success: 0,
      failed: 0,
      errors: [],
    }

    try {
      // Check if API is available before processing
      const isOnline = await this.todoApiService.healthCheck()
      if (!isOnline) {
        throw new Error('API is not reachable')
      }

      // Get all pending items ordered by creation time
      const pendingItems = this.getAllPendingItems()

      // Process items in batches
      for (let i = 0; i < pendingItems.length; i += this.batchSize) {
        const batch = pendingItems.slice(i, i + this.batchSize)
        await this.processBatch(batch, result)
      }

      return result
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Get all pending items from the sync queue
   */
  private getAllPendingItems(): SyncQueueRow[] {
    const allItems = this.syncQueueService.getAll()
    return allItems.filter(
      (item) => item.status === 'pending' && item.retry_count < this.maxRetries,
    )
  }

  /**
   * Process a batch of sync queue items
   */
  private async processBatch(
    items: SyncQueueRow[],
    result: SyncResult,
  ): Promise<void> {
    for (const item of items) {
      try {
        await this.processSyncItem(item)
        result.success++
      } catch (error) {
        result.failed++
        result.errors.push({
          id: item.id,
          error: this.getErrorMessage(error),
        })
      }
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: SyncQueueRow): Promise<void> {
    // Mark as processing
    this.syncQueueService.markAsProcessing(item.id)

    try {
      // Parse payload
      const parsePayload = JSON.parse(item.payload) as Todo
      const payload = {
        entityId: parsePayload.id,
        title: parsePayload.title,
        description: parsePayload.description,
        completed: parsePayload.completed === 1,
        priority: parsePayload.priority,
        dueDate: parsePayload.due_date,
        createdAt: String(item.created_at),
      } as TodoRequest

      // Call appropriate API endpoint based on action type
      switch (item.action_type) {
        case 'CREATE':
          await this.handleCreate(item, payload)
          break

        case 'UPDATE':
          await this.handleUpdate(item, payload)
          break

        case 'DELETE':
          await this.handleDelete(item)
          break

        default:
          throw new Error(`Unknown action type: ${item.action_type}`)
      }

      // Successfully synced - remove from queue
      this.syncQueueService.deleteById(item.id)
    } catch (error) {
      await this.handleSyncError(item, error)
      throw error
    }
  }

  /**
   * Handle CREATE action
   */
  private async handleCreate(
    item: SyncQueueRow,
    payload: TodoRequest,
  ): Promise<void> {
    await this.todoApiService.createTodo(payload)
  }

  /**
   * Handle UPDATE action
   */
  private async handleUpdate(
    item: SyncQueueRow,
    payload: TodoRequest,
  ): Promise<void> {
    // Extract ID from entity_id (assuming it's stored as a number)
    const todoId = parseInt(item.entity_id, 10)

    if (isNaN(todoId)) {
      throw new Error(`Invalid entity ID: ${item.entity_id}`)
    }

    await this.todoApiService.updateTodo(todoId, payload)
  }

  /**
   * Handle DELETE action
   */
  private async handleDelete(item: SyncQueueRow): Promise<void> {
    // Extract ID from entity_id
    const todoId = parseInt(item.entity_id, 10)

    if (isNaN(todoId)) {
      throw new Error(`Invalid entity ID: ${item.entity_id}`)
    }

    await this.todoApiService.deleteTodo(todoId)
  }

  /**
   * Handle errors during sync
   */
  private async handleSyncError(
    item: SyncQueueRow,
    error: unknown,
  ): Promise<void> {
    const errorMessage = this.getErrorMessage(error)
    const apiError = error as ApiError

    // Check if we should retry
    if (item.retry_count < this.maxRetries) {
      // Increment retry count and reset to pending for retry
      this.syncQueueService.incrementRetryCount(item.id)
      this.syncQueueService.resetToPending(item.id)
    } else {
      // Max retries reached - mark as failed
      this.syncQueueService.markAsFailed(
        item.id,
        `Max retries exceeded: ${errorMessage}`,
      )
    }
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error
    }

    if (error && typeof error === 'object') {
      const apiError = error as ApiError
      if (apiError.message) {
        return apiError.message
      }

      if ('message' in error && typeof error.message === 'string') {
        return error.message
      }
    }

    return 'Unknown error occurred'
  }

  /**
   * Sync a single item by ID (useful for manual retry)
   */
  async syncSingleItem(itemId: string): Promise<void> {
    const item = this.syncQueueService.getById(itemId)

    if (!item) {
      throw new Error(`Sync queue item not found: ${itemId}`)
    }

    if (item.status === 'processing') {
      throw new Error(`Item is already being processed: ${itemId}`)
    }

    await this.processSyncItem(item)
  }

  /**
   * Clear all completed items from the queue
   */
  clearCompletedItems(): number {
    return this.syncQueueService.deleteByStatus('completed')
  }

  /**
   * Get sync queue statistics
   */
  getQueueStats(): {
    total: number
    pending: number
    processing: number
    failed: number
  } {
    const allItems = this.syncQueueService.getAll()

    return {
      total: allItems.length,
      pending: allItems.filter((item) => item.status === 'pending').length,
      processing: allItems.filter((item) => item.status === 'processing')
        .length,
      failed: allItems.filter((item) => item.status === 'failed').length,
    }
  }

  /**
   * Check if sync is currently running
   */
  isSyncing(): boolean {
    return this.isProcessing
  }
}

export const syncService = new SyncService(getDatabase(), todoApi, {
  maxRetries: 3,
  batchSize: 50,
})

export { SyncService }
export type { SyncResult, SyncOptions }
