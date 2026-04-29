export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

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
  recurrenceType: RecurrenceType
  targetCount: number
  allowMultipleCompletions: boolean
  createdAt: Date
  updatedAt: Date
  categories?: HabitCategory[]
  categoryAssignments?: HabitCategoryAssignment[]
  options?: HabitOption[]
}

export interface HabitCategoryAssignment {
  id: string
  habitId: string
  categoryId: string
  createdAt: Date
  category?: HabitCategory
}

export interface HabitCategory {
  id: string
  userId: string | null
  name: string
  color: string
  icon: string | null
  createdAt: Date
  updatedAt: Date
}

export interface HabitOption {
  id: string
  habitId: string
  label: string
  description: string | null
  exp: number | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface HabitLog {
  id: string
  userId: string
  habitId: string
  optionId: string | null
  completedAt: Date
  completedDate: Date
  value: number
  expEarned: number
  note: string | null
  createdAt: Date
  option?: HabitOption
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

export interface HabitProgress {
  currentCount: number
  targetCount: number
  percentage: number
  isCompleted: boolean
  periodStart: Date
  periodEnd: Date
}

export interface HabitStreak {
  currentStreak: number
  longestStreak: number
  lastCompletedDate: Date | null
}

export interface ContributionDay {
  date: string
  count: number
  level: number
  expEarned: number
  logs: HabitLog[]
}

export interface ContributionWeek {
  startDate: string
  days: ContributionDay[]
}
