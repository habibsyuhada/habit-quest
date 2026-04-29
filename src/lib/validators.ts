import { z } from 'zod'

export const syncEventSchema = z.object({
  client_event_id: z.string().uuid(),
  event_type: z.enum([
    'TEMPLATE_STARTED',
    'HABIT_COMPLETED',
    'HABIT_UNCOMPLETED',
    'HABIT_CREATED',
    'HABIT_UPDATED',
    'RECOVERY_TOKEN_USED',
  ]),
  event_version: z.number().int().positive(),
  client_created_at: z.string().datetime(),
  payload: z.record(z.string(), z.unknown()),
})

export const syncPushRequestSchema = z.object({
  events: z.array(syncEventSchema).min(1),
  app_version: z.string().optional(),
  api_version: z.string(),
})

export const habitCompletionSchema = z.object({
  habitId: z.string().cuid(),
  date: z.string().datetime().optional(),
  optionIds: z.array(z.string().cuid()).optional(),
  note: z.string().max(500).optional(),
})

export const startTemplateSchema = z.object({
  templateId: z.string().cuid(),
})

const habitOptionSchema = z.object({
  id: z.string().cuid().optional(),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  exp: z.number().int().nonnegative().optional(),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
})

export const createHabitSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  xp: z.number().int().positive().default(10),
  recurrenceType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('DAILY'),
  targetCount: z.number().int().positive().default(1),
  categoryIds: z.array(z.string().cuid()).optional(),
  allowMultipleCompletions: z.boolean().default(false),
  options: z.array(habitOptionSchema).optional(),
})

export const updateHabitSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  xp: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
  recurrenceType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  targetCount: z.number().int().positive().optional(),
  categoryIds: z.array(z.string().cuid()).optional(),
  allowMultipleCompletions: z.boolean().optional(),
  options: z.array(habitOptionSchema).optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  icon: z.string().nullable().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  icon: z.string().nullable().optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
})

export const userProgressUpdateSchema = z.object({
  totalXp: z.number().int().nonnegative(),
  currentLevel: z.number().int().positive(),
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  recoveryTokens: z.number().int().nonnegative(),
})
