import Dexie, { Table } from 'dexie'
import { LOCAL_DB_SCHEMA_VERSION } from '@/types/version'

export interface LocalTemplate {
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
  createdAt: string
  updatedAt: string
}

export interface LocalTemplateItem {
  id: string
  templateId: string
  title: string
  description: string | null
  order: number
  xp: number
  version: string
  createdAt: string
  updatedAt: string
}

export interface LocalUserHabit {
  id: string
  userId: string
  title: string
  description: string | null
  xp: number
  order: number
  isActive: boolean
  sourceTemplateId: string | null
  sourceTemplateVersion: string | null
  recurrenceType: string
  targetCount: number
  allowMultipleCompletions: boolean
  createdAt: string
  updatedAt: string
  categoryAssignments?: LocalHabitCategoryAssignment[]
  options?: LocalHabitOption[]
}

export interface LocalHabitCategoryAssignment {
  id: string
  habitId: string
  categoryId: string
  createdAt: string
  category?: any
}

export interface LocalHabitOption {
  id: string
  habitId: string
  label: string
  description: string | null
  exp: number | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LocalHabitLog {
  id: string
  userId: string
  habitId: string
  optionId: string | null
  completedAt: string
  completedDate: string
  value: number
  expEarned: number
  note: string | null
  createdAt: string
  option?: LocalHabitOption
}

export interface LocalUserProgress {
  id: string
  userId: string
  totalXp: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
  recoveryTokens: number
  lastActivityAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LocalSyncQueueItem {
  id?: string
  clientEventId: string
  eventType: string
  eventVersion: number
  payload: Record<string, unknown>
  clientCreatedAt: string
  retryCount: number
  createdAt: string
}

export interface LocalSettings {
  id: 'settings'
  onboardingCompleted: boolean
  selectedGoal: string | null
  theme: 'light' | 'dark' | 'system'
}

export interface LocalAppMeta {
  id: 'app_meta'
  local_db_schema_version: number
  app_version: string
  last_sync_at: string | null
  last_template_sync_at: string | null
  last_successful_push_at: string | null
}

export class HabitQuestDB extends Dexie {
  templates!: Table<LocalTemplate>
  template_items!: Table<LocalTemplateItem>
  user_habits!: Table<LocalUserHabit>
  habit_options!: Table<LocalHabitOption>
  habit_logs!: Table<LocalHabitLog>
  user_progress!: Table<LocalUserProgress>
  sync_queue!: Table<LocalSyncQueueItem>
  settings!: Table<LocalSettings>
  app_meta!: Table<LocalAppMeta>

  constructor() {
    super('HabitQuestDB')

    this.version(LOCAL_DB_SCHEMA_VERSION).stores({
      templates: 'id, slug, category, isPremium, version, updatedAt',
      template_items: 'id, templateId, order, version, updatedAt',
      user_habits: 'id, userId, isActive, sourceTemplateId, categoryId, updatedAt',
      habit_options: 'id, habitId, sortOrder, isActive',
      habit_logs: 'id, userId, habitId, optionId, completedDate, [habitId+completedDate], [habitId+optionId+completedDate], completedAt',
      user_progress: 'id, userId, updatedAt',
      sync_queue: '++id, clientEventId, eventType, retryCount, createdAt',
      settings: 'id',
      app_meta: 'id',
    })

    this.version(2).stores({
      templates: 'id, slug, category, isPremium, version, updatedAt',
      template_items: 'id, templateId, order, version, updatedAt',
      user_habits: 'id, userId, isActive, sourceTemplateId, categoryId, updatedAt',
      habit_options: 'id, habitId, sortOrder, isActive',
      habit_logs: 'id, userId, habitId, optionId, completedDate, [habitId+completedDate], [habitId+optionId+completedDate], completedAt',
      user_progress: 'id, userId, updatedAt',
      sync_queue: '++id, clientEventId, eventType, retryCount, createdAt',
      settings: 'id',
      app_meta: 'id',
    }).upgrade(async (tx) => {
    })
  }
}

export const db = new HabitQuestDB()

export async function initializeLocalDB() {
  try {
    await db.open()

    const appMeta = await db.app_meta.get('app_meta')
    if (!appMeta) {
      await db.app_meta.put({
        id: 'app_meta',
        local_db_schema_version: LOCAL_DB_SCHEMA_VERSION,
        app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        last_sync_at: null,
        last_template_sync_at: null,
        last_successful_push_at: null,
      })
    }

    const settings = await db.settings.get('settings')
    if (!settings) {
      await db.settings.put({
        id: 'settings',
        onboardingCompleted: false,
        selectedGoal: null,
        theme: 'system',
      })
    }

    return true
  } catch (error) {
    console.error('Failed to initialize local database:', error)
    return false
  }
}

export async function clearLocalData() {
  try {
    await db.templates.clear()
    await db.template_items.clear()
    await db.user_habits.clear()
    await db.habit_logs.clear()
    await db.user_progress.clear()
    await db.sync_queue.clear()
    await db.settings.clear()
    await db.app_meta.clear()

    await initializeLocalDB()
    return true
  } catch (error) {
    console.error('Failed to clear local data:', error)
    return false
  }
}

export async function getAppMeta(): Promise<LocalAppMeta | null> {
  const result = await db.app_meta.get('app_meta')
  return result || null
}

export async function updateAppMeta(updates: Partial<LocalAppMeta>) {
  const appMeta = await db.app_meta.get('app_meta')
  if (appMeta) {
    await db.app_meta.update('app_meta', updates)
  }
}

// Helper function to safely get date string from log (handles both old and new formats)
export function getLogDateString(log: LocalHabitLog): string {
  const dateStr = log.completedDate || (log as any).date || ''
  return typeof dateStr === 'string' ? dateStr : new Date(dateStr).toISOString()
}
