import { RecurrenceType, HabitLog, HabitProgress, HabitStreak } from '@/types/habit'

/**
 * Get the start and end of a period based on recurrence type and date
 */
export function getPeriodRange(date: Date, recurrenceType: RecurrenceType): { start: Date; end: Date } {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  switch (recurrenceType) {
    case 'DAILY':
      // Start and end of the day
      return {
        start: new Date(d),
        end: new Date(d.setHours(23, 59, 59, 999)),
      }

    case 'WEEKLY':
      // Start of week (Monday) to end of week (Sunday)
      const dayOfWeek = d.getDay()
      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      const weekStart = new Date(d.setDate(diff))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      return { start: weekStart, end: weekEnd }

    case 'MONTHLY':
      // Start to end of the month
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
      return { start: monthStart, end: monthEnd }

    case 'YEARLY':
      // Start to end of the year
      const yearStart = new Date(d.getFullYear(), 0, 1)
      const yearEnd = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
      return { start: yearStart, end: yearEnd }

    default:
      return { start: new Date(d), end: new Date(d) }
  }
}

/**
 * Get completion count for a specific period
 */
export function getCompletionCountForPeriod(
  logs: HabitLog[],
  date: Date,
  recurrenceType: RecurrenceType
): number {
  const { start, end } = getPeriodRange(date, recurrenceType)

  return logs.filter((log) => {
    const logDate = new Date(log.completedDate)
    return logDate >= start && logDate <= end
  }).length
}

/**
 * Get habit progress for current period
 */
export function getHabitProgress(
  habit: { recurrenceType: RecurrenceType; targetCount: number; allowMultipleCompletions: boolean },
  logs: HabitLog[],
  date: Date = new Date()
): HabitProgress {
  const { start, end } = getPeriodRange(date, habit.recurrenceType)

  // Count unique completions in period
  const periodLogs = logs.filter((log) => {
    const logDate = new Date(log.completedDate)
    return logDate >= start && logDate <= end
  })

  // If multiple completions are allowed, count all logs
  // Otherwise, count unique dates
  const currentCount = habit.allowMultipleCompletions
    ? periodLogs.length
    : new Set(periodLogs.map((log) => log.completedDate.toISOString().split('T')[0])).size

  const targetCount = habit.targetCount
  const percentage = Math.min((currentCount / targetCount) * 100, 100)
  const isCompleted = currentCount >= targetCount

  return {
    currentCount,
    targetCount,
    percentage,
    isCompleted,
    periodStart: start,
    periodEnd: end,
  }
}

/**
 * Calculate current streak
 */
export function calculateCurrentStreak(
  habit: { recurrenceType: RecurrenceType; targetCount: number; allowMultipleCompletions: boolean },
  logs: HabitLog[],
  date: Date = new Date()
): number {
  let streak = 0
  let currentDate = new Date(date)

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
  )

  while (true) {
    const { start, end } = getPeriodRange(currentDate, habit.recurrenceType)

    // Check if period is completed
    const periodLogs = sortedLogs.filter((log) => {
      const logDate = new Date(log.completedDate)
      return logDate >= start && logDate <= end
    })

    const completionCount = habit.allowMultipleCompletions
      ? periodLogs.length
      : new Set(periodLogs.map((log) => log.completedDate.toISOString().split('T')[0])).size

    if (completionCount >= habit.targetCount) {
      streak++
      // Move to previous period
      switch (habit.recurrenceType) {
        case 'DAILY':
          currentDate.setDate(currentDate.getDate() - 1)
          break
        case 'WEEKLY':
          currentDate.setDate(currentDate.getDate() - 7)
          break
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() - 1)
          break
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() - 1)
          break
      }
    } else {
      break
    }
  }

  return streak
}

/**
 * Calculate longest streak
 */
export function calculateLongestStreak(
  habit: { recurrenceType: RecurrenceType; targetCount: number; allowMultipleCompletions: boolean },
  logs: HabitLog[]
): number {
  if (logs.length === 0) return 0

  // Get all unique periods that have logs
  const periodMap = new Map<string, HabitLog[]>()

  logs.forEach((log) => {
    const { start } = getPeriodRange(new Date(log.completedDate), habit.recurrenceType)
    const key = start.toISOString().split('T')[0]
    if (!periodMap.has(key)) {
      periodMap.set(key, [])
    }
    periodMap.get(key)!.push(log)
  })

  // Sort periods by date
  const sortedPeriods = Array.from(periodMap.entries()).sort((a, b) =>
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  )

  let longestStreak = 0
  let currentStreak = 0

  sortedPeriods.forEach(([_, periodLogs]) => {
    const completionCount = habit.allowMultipleCompletions
      ? periodLogs.length
      : new Set(periodLogs.map((log) => log.completedDate.toISOString().split('T')[0])).size

    if (completionCount >= habit.targetCount) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })

  return longestStreak
}

/**
 * Get habit streak info
 */
export function getHabitStreak(
  habit: { recurrenceType: RecurrenceType; targetCount: number; allowMultipleCompletions: boolean },
  logs: HabitLog[],
  date: Date = new Date()
): HabitStreak {
  const currentStreak = calculateCurrentStreak(habit, logs, date)
  const longestStreak = calculateLongestStreak(habit, logs)

  // Find last completed date
  const lastLog = logs.sort((a, b) =>
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )[0]

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: lastLog ? new Date(lastLog.completedDate) : null,
  }
}

/**
 * Format period label for display
 */
export function formatPeriodLabel(recurrenceType: RecurrenceType, date: Date): string {
  const { start, end } = getPeriodRange(date, recurrenceType)

  switch (recurrenceType) {
    case 'DAILY':
      return start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })

    case 'WEEKLY':
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

    case 'MONTHLY':
      return start.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })

    case 'YEARLY':
      return start.getFullYear().toString()

    default:
      return start.toLocaleDateString()
  }
}

/**
 * Check if a date is within current period
 */
export function isInCurrentPeriod(date: Date, recurrenceType: RecurrenceType): boolean {
  const now = new Date()
  const { start, end } = getPeriodRange(now, recurrenceType)
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate >= start && checkDate <= end
}
