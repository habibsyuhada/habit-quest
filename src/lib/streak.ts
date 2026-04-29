import { differenceInDays, startOfDay, isToday, isYesterday } from 'date-fns'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActivityDate: Date | null
}

export function calculateStreak(
  completedDates: Date[],
  lastKnownStreak: number = 0
): StreakData {
  if (completedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
    }
  }

  const sortedDates = completedDates
    .map((date) => startOfDay(date))
    .sort((a, b) => b.getTime() - a.getTime())

  const today = startOfDay(new Date())
  const mostRecent = sortedDates[0]

  let currentStreak = 0
  let longestStreak = lastKnownStreak

  if (isToday(mostRecent) || isYesterday(mostRecent)) {
    currentStreak = 1

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const currentDate = sortedDates[i]
      const nextDate = sortedDates[i + 1]

      const daysDiff = differenceInDays(currentDate, nextDate)

      if (daysDiff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak
  }

  return {
    currentStreak,
    longestStreak,
    lastActivityDate: mostRecent,
  }
}

export function shouldResetStreak(lastActivityDate: Date | null): boolean {
  if (!lastActivityDate) {
    return false
  }

  const today = startOfDay(new Date())
  const lastActivity = startOfDay(lastActivityDate)

  const daysDiff = differenceInDays(today, lastActivity)

  return daysDiff > 1
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥'
  if (streak >= 21) return '⚡'
  if (streak >= 14) return '✨'
  if (streak >= 7) return '💪'
  if (streak >= 3) return '🌟'
  return ''
}
