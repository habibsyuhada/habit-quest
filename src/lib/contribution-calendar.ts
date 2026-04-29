import { HabitLog, ContributionDay, ContributionWeek, RecurrenceType } from '@/types/habit'

/**
 * Build contribution calendar data for heatmap display
 */
export function buildContributionCalendar(
  logs: HabitLog[],
  startDate: Date,
  endDate: Date,
  targetCount: number = 1
): ContributionWeek[] {
  const weeks: ContributionWeek[] = []
  const currentDate = new Date(startDate)

  // Normalize dates to start of day
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  // Find the Monday of the first week
  const firstMonday = new Date(start)
  const dayOfWeek = firstMonday.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  firstMonday.setDate(firstMonday.getDate() - daysUntilMonday)

  // Build a map of completion counts by date
  const completionMap = new Map<string, { count: number; expEarned: number; logs: HabitLog[] }>()

  logs.forEach((log) => {
    const dateKey = log.completedDate.toISOString().split('T')[0]
    const existing = completionMap.get(dateKey)
    if (existing) {
      existing.count += log.value
      existing.expEarned += log.expEarned
      existing.logs.push(log)
    } else {
      completionMap.set(dateKey, {
        count: log.value,
        expEarned: log.expEarned,
        logs: [log],
      })
    }
  })

  // Generate weeks
  let weekStart = new Date(firstMonday)

  while (weekStart <= end) {
    const days: ContributionDay[] = []

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(weekStart)
      dayDate.setDate(dayDate.getDate() + i)
      dayDate.setHours(0, 0, 0, 0)

      const dateKey = dayDate.toISOString().split('T')[0]
      const completion = completionMap.get(dateKey) || { count: 0, expEarned: 0, logs: [] }

      // Calculate level based on target count
      let level = 0
      if (completion.count > 0) {
        if (completion.count < targetCount) {
          level = 1
        } else if (completion.count === targetCount) {
          level = 2
        } else if (completion.count < targetCount * 2) {
          level = 3
        } else {
          level = 4
        }
      }

      days.push({
        date: dateKey,
        count: completion.count,
        level,
        expEarned: completion.expEarned,
        logs: completion.logs,
      })
    }

    weeks.push({
      startDate: weekStart.toISOString().split('T')[0],
      days,
    })

    // Move to next week
    weekStart.setDate(weekStart.getDate() + 7)
  }

  return weeks
}

/**
 * Get contribution data for last 12 months
 */
export function getLast12MonthsContributions(
  logs: HabitLog[],
  targetCount: number = 1
): ContributionWeek[] {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 12)
  startDate.setDate(1)
  startDate.setHours(0, 0, 0, 0)

  return buildContributionCalendar(logs, startDate, endDate, targetCount)
}

/**
 * Get contribution data for a specific year
 */
export function getYearContributions(
  logs: HabitLog[],
  year: number,
  targetCount: number = 1
): ContributionWeek[] {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)

  return buildContributionCalendar(logs, startDate, endDate, targetCount)
}

/**
 * Get contribution data for last N days
 */
export function getLastNDaysContributions(
  logs: HabitLog[],
  days: number,
  targetCount: number = 1
): ContributionWeek[] {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  startDate.setHours(0, 0, 0, 0)

  return buildContributionCalendar(logs, startDate, endDate, targetCount)
}

/**
 * Get month labels for the heatmap
 */
export function getMonthLabels(weeks: ContributionWeek[]): string[] {
  const labels: string[] = []
  let lastMonth = -1

  weeks.forEach((week) => {
    const weekDate = new Date(week.startDate)
    const month = weekDate.getMonth()

    if (month !== lastMonth) {
      labels.push(weekDate.toLocaleDateString('en-US', { month: 'short' }))
      lastMonth = month
    } else {
      labels.push('')
    }
  })

  return labels
}

/**
 * Get weekday labels for the heatmap
 */
export function getWeekdayLabels(): string[] {
  return ['Mon', '', 'Wed', '', 'Fri', '', '']
}

/**
 * Get total stats from contributions
 */
export function getContributionStats(weeks: ContributionWeek[]): {
  totalDays: number
  activeDays: number
  totalCompletions: number
  totalExp: number
  currentStreak: number
  longestStreak: number
} {
  let totalDays = 0
  let activeDays = 0
  let totalCompletions = 0
  let totalExp = 0
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toISOString().split('T')[0]

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      totalDays++
      if (day.count > 0) {
        activeDays++
        totalCompletions += day.count
        totalExp += day.expEarned
        tempStreak++

        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }

        // Check if this is part of current streak
        if (day.date >= today) {
          currentStreak = tempStreak
        }
      } else {
        tempStreak = 0
      }
    })
  })

  return {
    totalDays,
    activeDays,
    totalCompletions,
    totalExp,
    currentStreak,
    longestStreak,
  }
}

/**
 * Get color class for contribution level
 */
export function getContributionColor(level: number): string {
  switch (level) {
    case 0:
      return 'bg-gray-100'
    case 1:
      return 'bg-green-200'
    case 2:
      return 'bg-green-400'
    case 3:
      return 'bg-green-600'
    case 4:
      return 'bg-green-800'
    default:
      return 'bg-gray-100'
  }
}

/**
 * Format date for tooltip
 */
export function formatContributionDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Get period-specific contribution data
 */
export function getPeriodContributions(
  logs: HabitLog[],
  period: 'week' | 'month' | 'year' | 'all',
  targetCount: number = 1
): ContributionWeek[] {
  const endDate = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case 'year':
      startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    case 'all':
      if (logs.length === 0) {
        startDate = new Date()
      } else {
        startDate = new Date(Math.min(...logs.map(log => new Date(log.completedDate).getTime())))
      }
      break
  }

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(23, 59, 59, 999)

  return buildContributionCalendar(logs, startDate, endDate, targetCount)
}
