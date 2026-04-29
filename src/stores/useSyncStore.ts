import { create } from 'zustand'

interface SyncState {
  isOnline: boolean
  isSyncing: boolean
  lastSyncAt: string | null
  queueSize: number
  error: string | null
  setOnline: (isOnline: boolean) => void
  setSyncing: (isSyncing: boolean) => void
  setLastSyncAt: (date: string | null) => void
  setQueueSize: (size: number) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useSyncStore = create<SyncState>((set) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  queueSize: 0,
  error: null,

  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  setQueueSize: (queueSize) => set({ queueSize }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
