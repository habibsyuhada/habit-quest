export interface HabitTemplate {
  id: string
  title: string
  slug: string
  category: string
  description: string
  durationDays: number
  isPremium: boolean
  difficulty: string
  xpPerHabit: number
  coverGradient: string | null
  version: string
  changelog: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  items?: HabitTemplateItem[]
}

export interface HabitTemplateItem {
  id: string
  templateId: string
  title: string
  description: string | null
  order: number
  xp: number
  version: string
  createdAt: Date
  updatedAt: Date
}

export interface TemplateCategory {
  id: string
  name: string
  icon: string
}
