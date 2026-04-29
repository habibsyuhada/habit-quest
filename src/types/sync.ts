export type SyncEventType =
  | 'TEMPLATE_STARTED'
  | 'HABIT_COMPLETED'
  | 'HABIT_UNCOMPLETED'
  | 'HABIT_CREATED'
  | 'HABIT_UPDATED'
  | 'RECOVERY_TOKEN_USED'

export interface SyncEvent {
  id: string
  userId: string
  clientEventId: string
  eventType: SyncEventType
  eventVersion: number
  payload: Record<string, unknown>
  processedAt: Date
  createdAt: Date
}

export interface SyncPayload {
  client_event_id: string
  event_type: SyncEventType
  event_version: number
  client_created_at: string
  payload: Record<string, unknown>
}

export interface SyncPushRequest {
  events: SyncPayload[]
  app_version?: string
  api_version: string
}

export interface SyncPushResponse {
  success: boolean
  data: {
    processed_events: string[]
    user_progress: {
      totalXp: number
      currentLevel: number
      currentStreak: number
      longestStreak: number
      recoveryTokens: number
    }
  }
  meta: {
    api_version: string
    server_time: string
  }
  message?: string
}

export interface SyncPullResponse {
  success: boolean
  data: {
    templates: unknown[]
    user_habits: unknown[]
    habit_logs: unknown[]
    user_progress: unknown
    changed_templates: unknown[]
  }
  meta: {
    api_version: string
    server_time: string
    last_sync_at: string
  }
  message?: string
}

export interface QueuedSyncEvent {
  id?: string
  clientEventId: string
  eventType: SyncEventType
  eventVersion: number
  payload: Record<string, unknown>
  clientCreatedAt: string
  retryCount: number
  createdAt: Date
}
