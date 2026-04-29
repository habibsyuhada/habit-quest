'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { HabitCard } from '@/components/habit/HabitCard'
import { ProgressRing } from '@/components/habit/ProgressRing'
import { XPBar } from '@/components/habit/XPBar'
import { StreakFlame } from '@/components/habit/StreakFlame'
import { useHabitStore } from '@/stores/useHabitStore'
import { useUserStore } from '@/stores/useUserStore'
import { db, LocalUserHabit, LocalHabitLog } from '@/lib/local-db'
import { getTodayDate, getGreeting } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Sparkles, Target } from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { habits, logs, fetchHabits, fetchLogs, completeHabit, uncompleteHabit, isHabitCompleted } = useHabitStore()
  const { progress, fetchProgress } = useUserStore()
  const [activeHabits, setActiveHabits] = useState<LocalUserHabit[]>([])
  const [todayLogs, setTodayLogs] = useState<LocalHabitLog[]>([])

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
    setTodayLogs(allLogs.filter((log) => log.date.startsWith(today)))
  }

  const handleComplete = async (habitId: string) => {
    const today = new Date().toISOString()
    await completeHabit(habitId, today)
    await loadData()
  }

  const handleUncomplete = async (habitId: string) => {
    const today = new Date().toISOString()
    await uncompleteHabit(habitId, today)
    await loadData()
  }

  const todayCompletedCount = activeHabits.filter((habit) =>
    todayLogs.some((log) => log.habitId === habit.id)
  ).length

  const todayProgress = activeHabits.length > 0 ? (todayCompletedCount / activeHabits.length) * 100 : 0

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
            <button
              onClick={() => router.push('/templates')}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600"
            >
              Browse Templates
            </button>
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

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900">Today's Habits</h2>
          {activeHabits.map((habit, index) => {
            const isCompleted = todayLogs.some((log) => log.habitId === habit.id)

            return (
              <HabitCard
                key={habit.id}
                title={habit.title}
                description={habit.description}
                xp={habit.xp}
                isCompleted={isCompleted}
                onComplete={() => handleComplete(habit.id)}
                onUncomplete={() => handleUncomplete(habit.id)}
              />
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
