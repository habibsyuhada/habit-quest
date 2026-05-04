export const GAME_CONFIG = {
  // XP rewards
  XP_EASY: 5,
  XP_MEDIUM: 10,
  XP_HARD: 15,

  // Gold rewards
  GOLD_EASY: 2,
  GOLD_MEDIUM: 5,
  GOLD_HARD: 10,

  // Leveling
  BASE_XP_REQUIREMENT: 50,
  XP_MULTIPLIER: 1.2, // Each level requires 20% more XP

  // Health
  MAX_HEALTH: 50,
  HEALTH_PENALTY_DAILY: 1,
  HEALTH_REWARD_STREAK: 1,
  STREAK_THRESHOLD: 7, // Days for health reward

  // Mana
  MAX_MANA: 50,
  MANA_REGEN: 1, // Per day

  // Death penalty
  DEATH_GOLD_LOSS: 0.5, // Lose 50% of gold
  DEATH_LEVEL_LOSS: 1, // Lose 1 level

  // Shop
  EQUIPMENT_COST_MULTIPLIER: 1.5,
  POTION_COST: 20,

  // Starting values
  STARTING_LEVEL: 1,
  STARTING_GOLD: 0,
  STARTING_HEALTH: 50,
  STARTING_MANA: 10,
} as const;

export const XP_REWARDS = {
  easy: GAME_CONFIG.XP_EASY,
  medium: GAME_CONFIG.XP_MEDIUM,
  hard: GAME_CONFIG.XP_HARD,
} as const;

export const GOLD_REWARDS = {
  easy: GAME_CONFIG.GOLD_EASY,
  medium: GAME_CONFIG.GOLD_MEDIUM,
  hard: GAME_CONFIG.GOLD_HARD,
} as const;

export const TASK_COLORS = {
  habit: 'bg-purple-500',
  daily: 'bg-blue-500',
  todo: 'bg-green-500',
} as const;

export const DIFFICULTY_COLORS = {
  easy: 'bg-gray-500',
  medium: 'bg-yellow-500',
  hard: 'bg-red-500',
} as const;

export const DEFAULT_AVATAR = {
  hair: 'short',
  hairColor: '#4A3728',
  skin: '#F5D0C5',
  shirt: '#3498db',
  background: '#e0f2fe',
  accessories: [],
} as const;