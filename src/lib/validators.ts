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
})

export const startTemplateSchema = z.object({
  templateId: z.string().cuid(),
})

export const updateHabitSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  xp: z.number().int().positive().optional(),
  order: z.number().int().nonnegative().optional(),
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
