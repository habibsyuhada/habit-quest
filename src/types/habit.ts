export interface Habit {
  id: string
  userId: string
  title: string
  description: string | null
  xp: number
  order: number
  isActive: boolean
  sourceTemplateId: string | null
  sourceTemplateVersion: string | null
  createdAt: Date
  updatedAt: Date
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  completedAt: Date
  xp: number
  date: Date
  createdAt: Date
}

export interface UserProgress {
  id: string
  userId: string
  totalXp: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  recoveryTokens: number
  lastActivityAt: Date | null
  createdAt: Date
  updatedAt: Date
}
