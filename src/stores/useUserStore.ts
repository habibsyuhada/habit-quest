import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, LocalUserProgress } from '@/lib/local-db'

interface UserState {
  progress: LocalUserProgress | null
  isLoading: boolean
  error: string | null
  fetchProgress: () => Promise<void>
  updateProgress: (updates: Partial<LocalUserProgress>) => Promise<void>
  calculateLevel: () => number
  getXpProgress: () => number
  getNextLevelXp: () => number
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      progress: null,
      isLoading: false,
      error: null,

      fetchProgress: async () => {
        set({ isLoading: true, error: null })
        try {
          const progress = await db.user_progress
            .limit(1)
            .first()

          set({ progress: progress || null, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch progress',
            isLoading: false,
          })
        }
      },

      updateProgress: async (updates) => {
        try {
          const currentProgress = get().progress
          if (!currentProgress) {
            const newProgress: LocalUserProgress = {
              id: crypto.randomUUID(),
              userId: updates.userId || 'unknown',
              totalXp: updates.totalXp || 0,
              currentLevel: updates.currentLevel || 1,
              currentStreak: updates.currentStreak || 0,
              longestStreak: updates.longestStreak || 0,
              recoveryTokens: updates.recoveryTokens || 3,
              lastActivityAt: updates.lastActivityAt || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            await db.user_progress.put(newProgress)
            set({ progress: newProgress })
          } else {
            const updatedProgress = {
              ...currentProgress,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
            await db.user_progress.put(updatedProgress)
            set({ progress: updatedProgress })
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update progress',
          })
        }
      },

      calculateLevel: () => {
        const { progress } = get()
        if (!progress) return 1
        return Math.floor(progress.totalXp / 100) + 1
      },

      getXpProgress: () => {
        const { progress } = get()
        if (!progress) return 0
        return progress.totalXp % 100
      },

      getNextLevelXp: () => {
        const { progress } = get()
        if (!progress) return 100
        return Math.ceil((progress.totalXp + 1) / 100) * 100
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        progress: state.progress,
      }),
    }
  )
)
