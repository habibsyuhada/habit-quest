import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, LocalUserHabit, LocalHabitLog, getLogDateString } from '@/lib/local-db'

interface HabitState {
  habits: LocalUserHabit[]
  logs: LocalHabitLog[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  fetchLogs: () => Promise<void>
  addHabit: (habit: LocalUserHabit) => Promise<void>
  updateHabit: (id: string, updates: Partial<LocalUserHabit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  completeHabit: (habitId: string, date: string) => Promise<void>
  uncompleteHabit: (habitId: string, date: string) => Promise<void>
  isHabitCompleted: (habitId: string, date: string) => boolean
  getTodayCompletedHabits: () => LocalHabitLog[]
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      isLoading: false,
      error: null,

      fetchHabits: async () => {
        set({ isLoading: true, error: null })
        try {
          const habits = await db.user_habits.toArray()
          set({ habits, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch habits',
            isLoading: false,
          })
        }
      },

      fetchLogs: async () => {
        set({ isLoading: true, error: null })
        try {
          const logs = await db.habit_logs.toArray()
          set({ logs, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch logs',
            isLoading: false,
          })
        }
      },

      addHabit: async (habit) => {
        try {
          await db.user_habits.put(habit)
          const habits = await db.user_habits.toArray()
          set({ habits })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add habit',
          })
        }
      },

      updateHabit: async (id, updates) => {
        try {
          await db.user_habits.update(id, updates)
          const habits = await db.user_habits.toArray()
          set({ habits })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update habit',
          })
        }
      },

      deleteHabit: async (id) => {
        try {
          await db.user_habits.delete(id)
          const habits = await db.user_habits.toArray()
          set({ habits })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete habit',
          })
        }
      },

      completeHabit: async (habitId, date) => {
        try {
          const habit = await db.user_habits.get(habitId)
          if (!habit) return

          const existingLog = await db.habit_logs
            .where('[habitId+completedDate]')
            .equals([habitId, date])
            .first()

          if (existingLog) return

          const log: LocalHabitLog = {
            id: crypto.randomUUID(),
            userId: habit.userId,
            habitId,
            optionId: null,
            completedAt: new Date().toISOString(),
            completedDate: date,
            value: 1,
            expEarned: habit.xp,
            note: null,
            createdAt: new Date().toISOString(),
          }

          await db.habit_logs.put(log)
          const logs = await db.habit_logs.toArray()
          set({ logs })

          const { addToSyncQueue } = await import('@/lib/sync-utils')
          await addToSyncQueue({
            client_event_id: crypto.randomUUID(),
            event_type: 'HABIT_COMPLETED',
            event_version: 1,
            client_created_at: new Date().toISOString(),
            payload: { habitId, date, xp: habit.xp },
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to complete habit',
          })
        }
      },

      uncompleteHabit: async (habitId, date) => {
        try {
          await db.habit_logs
            .where('[habitId+completedDate]')
            .equals([habitId, date])
            .delete()

          const logs = await db.habit_logs.toArray()
          set({ logs })

          const { addToSyncQueue } = await import('@/lib/sync-utils')
          await addToSyncQueue({
            client_event_id: crypto.randomUUID(),
            event_type: 'HABIT_UNCOMPLETED',
            event_version: 1,
            client_created_at: new Date().toISOString(),
            payload: { habitId, date },
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to uncomplete habit',
          })
        }
      },

      isHabitCompleted: (habitId, date) => {
        const { logs } = get()
        return logs.some((log) => log.habitId === habitId && getLogDateString(log) === date)
      },

      getTodayCompletedHabits: () => {
        const { logs } = get()
        const today = new Date().toISOString().split('T')[0]
        return logs.filter((log) => getLogDateString(log) === today)
      },
    }),
    {
      name: 'habit-storage',
      partialize: (state) => ({
        habits: state.habits,
        logs: state.logs,
      }),
    }
  )
)
