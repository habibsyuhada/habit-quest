'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { LifeMap } from '@/components/progress/LifeMap'
import { db, LocalHabitLog, LocalUserHabit } from '@/lib/local-db'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Trophy, Target, Flame, Award } from 'lucide-react'
import { getTodayDate } from '@/lib/utils'

export default function ProgressPage() {
  const { data: session } = useSession()
  const [currentDay, setCurrentDay] = useState(1)
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [stats, setStats] = useState({
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalHabits: 0,
    totalCompletions: 0,
  })

  useEffect(() => {
    loadProgress()
  }, [session])

  const loadProgress = async () => {
    if (!session?.user) return

    const habits = await db.user_habits
      .where('userId')
      .equals(session.user.id)
      .and((habit) => habit.isActive)
      .toArray()

    const logs = await db.habit_logs
      .where('userId')
      .equals(session.user.id)
      .toArray()

    const startDate = habits.length > 0 ? habits[0].createdAt : new Date().toISOString()
    const start = new Date(startDate)
    const today = new Date()
    const dayDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const dayOfJourney = Math.max(1, dayDiff + 1)

    setCurrentDay(dayOfJourney)

    const completedDates = new Set<string>()
    logs.forEach((log) => {
      completedDates.add(log.date.split('T')[0])
    })

    const completedDaysArray = Array.from(completedDates)
      .map((dateStr) => {
        const date = new Date(dateStr)
        const diff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return diff + 1
      })
      .filter((day) => day >= 1 && day <= 30)

    setCompletedDays(completedDaysArray)

    const userProgress = await db.user_progress
      .where('userId')
      .equals(session.user.id)
      .first()

    setStats({
      totalXp: userProgress?.totalXp || 0,
      currentStreak: userProgress?.currentStreak || 0,
      longestStreak: userProgress?.longestStreak || 0,
      totalHabits: habits.length,
      totalCompletions: logs.length,
    })
  }

  return (
    <AppShell>
      <div className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Your Progress
          </h1>
          <p className="text-gray-600">
            Day {currentDay} of your 30-day journey
          </p>
        </motion.div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-xl"
          >
            <Trophy className="mb-2 h-8 w-8" />
            <div className="text-3xl font-bold">{stats.totalXp}</div>
            <div className="text-sm text-amber-100">Total XP</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-6 text-white shadow-xl"
          >
            <Target className="mb-2 h-8 w-8" />
            <div className="text-3xl font-bold">{stats.totalCompletions}</div>
            <div className="text-sm text-purple-100">Habits Done</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-500 p-6 text-white shadow-xl"
          >
            <Flame className="mb-2 h-8 w-8" />
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-blue-100">Day Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 p-6 text-white shadow-xl"
          >
            <Award className="mb-2 h-8 w-8" />
            <div className="text-3xl font-bold">{stats.longestStreak}</div>
            <div className="text-sm text-green-100">Best Streak</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl"
        >
          <LifeMap
            currentDay={currentDay}
            completedDays={completedDays}
            totalDays={30}
          />
        </motion.div>
      </div>
    </AppShell>
  )
}
