import { getSyncEngine } from './sync-engine'
import { SyncPayload } from '@/types/sync'

export async function addToSyncQueue(event: SyncPayload): Promise<void> {
  const syncEngine = getSyncEngine()
  await syncEngine.addToQueue(event)
}

export async function forceSyncNow(): Promise<void> {
  const syncEngine = getSyncEngine()
  await syncEngine.forceSync()
}

export function isOnline(): boolean {
  const syncEngine = getSyncEngine()
  return syncEngine.getOnlineStatus()
}

export function startSyncEngine(): void {
  const syncEngine = getSyncEngine()
  syncEngine.start()
}

export function stopSyncEngine(): void {
  const syncEngine = getSyncEngine()
  syncEngine.stop()
}
