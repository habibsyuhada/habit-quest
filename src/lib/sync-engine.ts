import { db, LocalSyncQueueItem } from './local-db'
import { SyncPayload, SyncEventType } from '@/types/sync'

export interface SyncEngineConfig {
  pushInterval?: number
  pullInterval?: number
  maxRetries?: number
}

export class SyncEngine {
  private pushTimer: ReturnType<typeof setInterval> | null = null
  private pullTimer: ReturnType<typeof setInterval> | null = null
  private isOnline: boolean = true
  private isPushing: boolean = false
  private isPulling: boolean = false
  private config: Required<SyncEngineConfig>

  constructor(config: SyncEngineConfig = {}) {
    this.config = {
      pushInterval: config.pushInterval || 30000,
      pullInterval: config.pullInterval || 60000,
      maxRetries: config.maxRetries || 3,
    }

    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  private handleOnline = () => {
    this.isOnline = true
    console.log('Device is online')
    this.push()
    this.pull()
  }

  private handleOffline = () => {
    this.isOnline = false
    console.log('Device is offline')
  }

  async addToQueue(event: SyncPayload): Promise<void> {
    try {
      await db.sync_queue.add({
        clientEventId: event.client_event_id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        payload: event.payload,
        clientCreatedAt: event.client_created_at,
        retryCount: 0,
        createdAt: new Date().toISOString(),
      })

      if (this.isOnline) {
        this.push()
      }
    } catch (error) {
      console.error('Failed to add event to sync queue:', error)
    }
  }

  async push(): Promise<void> {
    if (this.isPushing || !this.isOnline) {
      return
    }

    this.isPushing = true

    try {
      const queuedEvents = await db.sync_queue
        .where('retryCount')
        .below(this.config.maxRetries)
        .toArray()

      if (queuedEvents.length === 0) {
        return
      }

      const payload = {
        events: queuedEvents.map((event) => ({
          client_event_id: event.clientEventId,
          event_type: event.eventType as SyncEventType,
          event_version: event.eventVersion,
          client_created_at: event.clientCreatedAt,
          payload: event.payload,
        })),
        api_version: process.env.NEXT_PUBLIC_API_VERSION || '1',
      }

      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Sync push failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        const processedIds = result.data.processed_events || []

        for (const id of processedIds) {
          await db.sync_queue.where('clientEventId').equals(id).delete()
        }

        const { updateAppMeta } = await import('./local-db')
        await updateAppMeta({
          last_successful_push_at: new Date().toISOString(),
        })

        console.log(`Synced ${processedIds.length} events successfully`)
      }
    } catch (error) {
      console.error('Sync push failed:', error)

      await db.sync_queue
        .toCollection()
        .modify((event) => {
          event.retryCount = (event.retryCount || 0) + 1
        })
    } finally {
      this.isPushing = false
    }
  }

  async pull(): Promise<void> {
    if (this.isPulling || !this.isOnline) {
      return
    }

    this.isPulling = true

    try {
      const appMeta = await db.app_meta.get('app_meta')
      const since = appMeta?.last_sync_at || new Date(0).toISOString()

      const response = await fetch(`/api/sync/pull?since=${encodeURIComponent(since)}`)

      if (!response.ok) {
        throw new Error(`Sync pull failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        const { data } = result

        if (data.templates?.length > 0) {
          // Extract and store template items separately
          const allItems = data.templates.flatMap((template: any) =>
            template.items.map((item: any) => ({
              ...item,
              templateId: template.id,
            }))
          )

          if (allItems.length > 0) {
            await db.template_items.bulkPut(allItems)
          }

          // Remove items from templates before storing
          const templatesWithoutItems = data.templates.map((template: any) => {
            const { items, ...templateData } = template
            return templateData
          })

          await db.templates.bulkPut(templatesWithoutItems)
        }

        if (data.user_habits?.length > 0) {
          await db.user_habits.bulkPut(data.user_habits)
        }

        if (data.habit_logs?.length > 0) {
          await db.habit_logs.bulkPut(data.habit_logs)
        }

        if (data.user_progress) {
          await db.user_progress.put(data.user_progress)
        }

        const { updateAppMeta } = await import('./local-db')
        await updateAppMeta({
          last_sync_at: result.meta.server_time,
        })

        console.log('Sync pull completed successfully')
      }
    } catch (error) {
      console.error('Sync pull failed:', error)
    } finally {
      this.isPulling = false
    }
  }

  start(): void {
    if (this.pushTimer) clearInterval(this.pushTimer)
    if (this.pullTimer) clearInterval(this.pullTimer)

    this.pushTimer = setInterval(() => {
      this.push()
    }, this.config.pushInterval)

    this.pullTimer = setInterval(() => {
      this.pull()
    }, this.config.pullInterval)

    if (this.isOnline) {
      this.push()
      this.pull()
    }
  }

  stop(): void {
    if (this.pushTimer) {
      clearInterval(this.pushTimer)
      this.pushTimer = null
    }

    if (this.pullTimer) {
      clearInterval(this.pullTimer)
      this.pullTimer = null
    }
  }

  destroy(): void {
    this.stop()

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline
  }

  async getQueueSize(): Promise<number> {
    return await db.sync_queue.count()
  }

  async forceSync(): Promise<void> {
    await Promise.all([this.push(), this.pull()])
  }
}

let syncEngineInstance: SyncEngine | null = null

export function getSyncEngine(): SyncEngine {
  if (!syncEngineInstance) {
    syncEngineInstance = new SyncEngine()
  }
  return syncEngineInstance
}

export function destroySyncEngine(): void {
  if (syncEngineInstance) {
    syncEngineInstance.destroy()
    syncEngineInstance = null
  }
}
