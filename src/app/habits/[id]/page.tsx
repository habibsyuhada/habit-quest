'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, TrendingUp, Award } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { HabitContributionHeatmap, HabitHeatmapStats } from '@/components/habit/HabitContributionHeatmap'
import { getHabitProgress, getHabitStreak, formatPeriodLabel } from '@/lib/habit-progress'
import { Habit, HabitLog, ContributionWeek } from '@/types/habit'
import { formatDistanceToNow } from 'date-fns'

export default function HabitDetailPage() {
  const params = useParams()
  const habitId = params.id as string
  const { data: session } = useSession()
  const router = useRouter()
  const [habit, setHabit] = useState<Habit | null>(null)
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [contributions, setContributions] = useState<ContributionWeek[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user && habitId) {
      loadHabitData()
    }
  }, [session, habitId])

  const loadHabitData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Load habit details
      const habitResponse = await fetch(`/api/habits/${habitId}`)
      const habitResult = await habitResponse.json()

      if (!habitResult.success) {
        throw new Error(habitResult.error?.message || 'Failed to load habit')
      }

      // We need to get the habit from the habits list since there's no individual GET endpoint
      const habitsResponse = await fetch('/api/habits')
      const habitsResult = await habitsResponse.json()

      if (habitsResult.success) {
        const foundHabit = habitsResult.data.find((h: Habit) => h.id === habitId)
        if (foundHabit) {
          setHabit(foundHabit)

          // Load heatmap data
          const heatmapResponse = await fetch(`/api/habits/${habitId}/heatmap`)
          const heatmapResult = await heatmapResponse.json()

          if (heatmapResult.success) {
            setContributions(heatmapResult.data.contributions)
            setStats(heatmapResult.data.stats)

            // Load logs for the habit
            const logsResponse = await fetch('/api/habits') // You might want to create a logs endpoint
            // For now, we'll use the heatmap data
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load habit data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
            <p className="text-gray-600">Loading habit details...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !habit) {
    return (
      <AppShell>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="mb-4 text-red-600">{error || 'Habit not found'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-2xl bg-blue-500 px-6 py-3 text-white font-semibold hover:bg-blue-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  const progress = getHabitProgress(habit, logs)
  const streak = getHabitStreak(habit, logs)

  return (
    <AppShell>
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{habit.title}</h1>
                {habit.categoryAssignments && habit.categoryAssignments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {habit.categoryAssignments.map((ca) =>
                      ca.category && (
                        <span
                          key={ca.categoryId}
                          className="rounded-lg px-3 py-1 text-sm font-medium"
                          style={{
                            backgroundColor: ca.category.color + '20',
                            color: ca.category.color,
                          }}
                        >
                          {ca.category.icon ? `${ca.category.icon} ` : ''}{ca.category.name}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              {habit.description && (
                <p className="text-gray-600 mb-3">{habit.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{habit.recurrenceType.toLowerCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{habit.xp} XP per completion</span>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Target: {habit.targetCount}x per {habit.recurrenceType.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid gap-4 md:grid-cols-3"
        >
          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">
              {formatPeriodLabel(habit.recurrenceType, new Date())}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {progress.currentCount}/{progress.targetCount}
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-orange-600">
              {streak.currentStreak} {habit.recurrenceType === 'DAILY' ? 'days' : habit.recurrenceType === 'WEEKLY' ? 'weeks' : habit.recurrenceType === 'MONTHLY' ? 'months' : 'years'}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-lg">
            <div className="text-sm text-gray-600 mb-1">Longest Streak</div>
            <div className="text-2xl font-bold text-purple-600">
              {streak.longestStreak} {habit.recurrenceType === 'DAILY' ? 'days' : habit.recurrenceType === 'WEEKLY' ? 'weeks' : habit.recurrenceType === 'MONTHLY' ? 'months' : 'years'}
            </div>
          </div>
        </motion.div>

        {/* Heatmap Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <HabitHeatmapStats stats={stats} />
          </motion.div>
        )}

        {/* Contribution Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Contribution History
          </h2>
          <HabitContributionHeatmap
            contributions={contributions}
            showLegend={true}
            onDayClick={(day) => {
              console.log('Clicked day:', day)
              // You could show a modal with day details here
            }}
          />
        </motion.div>

        {/* Options List */}
        {habit.options && habit.options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Habit Options
            </h2>
            <div className="space-y-3">
              {habit.options.map((option) => (
                <div
                  key={option.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    <span className="rounded-lg bg-amber-100 px-2 py-1 text-sm font-bold text-amber-700">
                      +{option.exp || habit.xp} XP
                    </span>
                  </div>
                  {option.description && (
                    <p className="text-sm text-gray-600">{option.description}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  )
}
