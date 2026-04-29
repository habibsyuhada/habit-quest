'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { HabitCard } from '@/components/habit/HabitCard'
import { ProgressRing } from '@/components/habit/ProgressRing'
import { XPBar } from '@/components/habit/XPBar'
import { StreakFlame } from '@/components/habit/StreakFlame'
import { CustomHabitDialog, AddHabitButton } from '@/components/habit/CustomHabitDialog'
import { BackfillDialog } from '@/components/habit/BackfillDialog'
import { useHabitStore } from '@/stores/useHabitStore'
import { useUserStore } from '@/stores/useUserStore'
import { db, LocalUserHabit, LocalHabitLog, getLogDateString } from '@/lib/local-db'
import { getTodayDate, getGreeting } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Sparkles, Target } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { fetchHabits, fetchLogs } = useHabitStore()
  const { progress, fetchProgress } = useUserStore()
  const [activeHabits, setActiveHabits] = useState<LocalUserHabit[]>([])
  const [todayLogs, setTodayLogs] = useState<LocalHabitLog[]>([])
  const [selectedHabit, setSelectedHabit] = useState<LocalUserHabit | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBackfillDialogOpen, setIsBackfillDialogOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    await fetchHabits()
    await fetchLogs()
    await fetchProgress()

    const allHabits = await db.user_habits
      .where('userId')
      .equals(session?.user?.id || '')
      .and((habit) => habit.isActive)
      .toArray()

    const today = getTodayDate()
    const allLogs = await db.habit_logs
      .where('userId')
      .equals(session?.user?.id || '')
      .toArray()

    setActiveHabits(allHabits)
    setTodayLogs(allLogs.filter((log) => getLogDateString(log).startsWith(today)))
  }

  const handleComplete = async (habitId: string) => {
    const today = getTodayDate()

    // Optimistic update
    const habit = activeHabits.find(h => h.id === habitId)
    if (!habit) return

    await db.habit_logs.put({
      id: crypto.randomUUID(),
      userId: habit.userId,
      habitId,
      optionId: null,
      completedAt: new Date().toISOString(),
      completedDate: today,
      value: 1,
      expEarned: habit.xp,
      note: null,
      createdAt: new Date().toISOString(),
    })

    // Sync to server
    const { addToSyncQueue } = await import('@/lib/sync-utils')
    await addToSyncQueue({
      client_event_id: crypto.randomUUID(),
      event_type: 'HABIT_COMPLETED',
      event_version: 1,
      client_created_at: new Date().toISOString(),
      payload: { habitId, date: today, xp: habit.xp },
    })

    await loadData()
  }

  const handleUncomplete = async (habitId: string) => {
    const today = getTodayDate()

    const habit = activeHabits.find(h => h.id === habitId)
    if (!habit) return

    await db.habit_logs
      .where('[habitId+completedDate]')
      .equals([habitId, today])
      .delete()

    // Sync to server
    const { addToSyncQueue } = await import('@/lib/sync-utils')
    await addToSyncQueue({
      client_event_id: crypto.randomUUID(),
      event_type: 'HABIT_UNCOMPLETED',
      event_version: 1,
      client_created_at: new Date().toISOString(),
      payload: { habitId, date: today },
    })

    await loadData()
  }

  const handleEdit = (habit: LocalUserHabit) => {
    setSelectedHabit(habit)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return

    try {
      await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })

      await db.user_habits.delete(habitId)
      await loadData()
    } catch (error) {
      console.error('Failed to delete habit:', error)
      alert('Failed to delete habit. Please try again.')
    }
  }

  const handleBackfill = (habit: LocalUserHabit) => {
    setSelectedHabit(habit)
    setIsBackfillDialogOpen(true)
  }

  const todayCompletedCount = activeHabits.filter((habit) =>
    todayLogs.some((log) => log.habitId === habit.id)
  ).length

  if (activeHabits.length === 0) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <Target className="h-12 w-12" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Start Your Journey
            </h1>
            <p className="mb-8 text-gray-600">
              Choose a habit template to begin your quest and start building better habits today.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/templates')}
                className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600"
              >
                Browse Templates
              </button>
              <button
                onClick={() => {
                  setSelectedHabit(null)
                  setIsEditDialogOpen(true)
                }}
                className="flex-1 rounded-2xl bg-white border-2 border-gray-300 px-6 py-3 text-gray-700 font-semibold shadow-lg hover:bg-gray-50"
              >
                Create Custom Habit
              </button>
            </div>

            <CustomHabitDialog
              isOpen={isEditDialogOpen}
              onClose={() => {
                setIsEditDialogOpen(false)
                setSelectedHabit(null)
              }}
              habit={selectedHabit}
              onSuccess={loadData}
            />
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            {getGreeting()}, {session?.user?.name || 'Explorer'}!
          </h1>
          <p className="text-gray-600">Ready for today's quest?</p>
        </motion.div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl text-center"
          >
            <ProgressRing
              progress={todayCompletedCount}
              total={activeHabits.length}
              size={120}
            />
            <p className="mt-2 text-sm font-medium text-gray-600">
              Today's Progress
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            {progress && (
              <XPBar
                currentXP={progress.totalXp}
                nextLevelXP={0}
                level={progress.currentLevel}
              />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl"
          >
            {progress && (
              <StreakFlame
                streak={progress.currentStreak}
              />
            )}
          </motion.div>
        </div>

        {todayCompletedCount === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white shadow-xl"
          >
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Minimum viable day</h3>
                <p className="text-sm text-blue-100">
                  Complete at least one habit today to maintain your streak!
                </p>
              </div>
            </div>
          </motion.div>
        ) : todayCompletedCount === activeHabits.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-3xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white shadow-xl"
          >
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg">Perfect day! 🎉</h3>
                <p className="text-sm text-green-100">
                  You've completed all your habits today. Amazing work!
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="space-y-3 pb-24">
          <AddHabitButton onHabitCreated={loadData} />

          {activeHabits.length > 0 && (
            <h2 className="text-xl font-bold text-gray-900">Today's Habits</h2>
          )}

          <div className="space-y-3">
            {activeHabits.map((habit, index) => {
              const isCompleted = todayLogs.some((log) => log.habitId === habit.id)

              return (
                <div key={habit.id} className={index === activeHabits.length - 1 ? 'mb-16' : ''}>
                  <HabitCard
                    habit={habit}
                    isCompleted={isCompleted}
                    onComplete={() => handleComplete(habit.id)}
                    onUncomplete={() => handleUncomplete(habit.id)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBackfill={handleBackfill}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <CustomHabitDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedHabit(null)
          }}
          habit={selectedHabit}
          onSuccess={loadData}
        />

        <BackfillDialog
          isOpen={isBackfillDialogOpen}
          onClose={() => {
            setIsBackfillDialogOpen(false)
            setSelectedHabit(null)
          }}
          habit={selectedHabit}
          onSuccess={loadData}
        />
      </div>
    </AppShell>
  )
}
