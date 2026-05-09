export const GAME_CONFIG = {
  // XP rewards - 5 difficulty levels
  XP_VERY_EASY: 3,
  XP_EASY: 5,
  XP_MEDIUM: 10,
  XP_HARD: 15,
  XP_VERY_HARD: 20,

  // Gold rewards - synced dengan XP
  GOLD_VERY_EASY: 1,
  GOLD_EASY: 2,
  GOLD_MEDIUM: 5,
  GOLD_HARD: 10,
  GOLD_VERY_HARD: 15,

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

export const CROP_DEFINITIONS: Record<import('./types').CropType, {
  name: string;
  growthDuration: number;
  goldReward: number;
  xpReward: number;
  seedCost: number;
}> = {
  wheat:        { name: 'Wheat',        growthDuration: 30,  goldReward: 3,  xpReward: 2,  seedCost: 1 },
  radish:       { name: 'Radish',       growthDuration: 45,  goldReward: 5,  xpReward: 3,  seedCost: 2 },
  carrot:       { name: 'Carrot',       growthDuration: 60,  goldReward: 8,  xpReward: 5,  seedCost: 3 },
  parsnip:      { name: 'Parsnip',      growthDuration: 75,  goldReward: 10, xpReward: 6,  seedCost: 4 },
  potato:       { name: 'Potato',       growthDuration: 90,  goldReward: 12, xpReward: 8,  seedCost: 5 },
  beetroot:     { name: 'Beetroot',     growthDuration: 120, goldReward: 15, xpReward: 10, seedCost: 7 },
  cabbage:      { name: 'Cabbage',      growthDuration: 150, goldReward: 18, xpReward: 12, seedCost: 9 },
  kale:         { name: 'Kale',         growthDuration: 180, goldReward: 22, xpReward: 14, seedCost: 11 },
  cauliflower:  { name: 'Cauliflower',  growthDuration: 225, goldReward: 28, xpReward: 18, seedCost: 14 },
  sunflower:    { name: 'Sunflower',    growthDuration: 270, goldReward: 35, xpReward: 22, seedCost: 18 },
  pumpkin:      { name: 'Pumpkin',      growthDuration: 300, goldReward: 45, xpReward: 30, seedCost: 25 },
};

export const FARM_CONFIG = {
  INITIAL_PLOT_COUNT: 9,
  POLL_INTERVAL_MS: 1000,
} as const;

export const XP_REWARDS = {
  very_easy: GAME_CONFIG.XP_VERY_EASY,
  easy: GAME_CONFIG.XP_EASY,
  medium: GAME_CONFIG.XP_MEDIUM,
  hard: GAME_CONFIG.XP_HARD,
  very_hard: GAME_CONFIG.XP_VERY_HARD,
} as const;

export const GOLD_REWARDS = {
  very_easy: GAME_CONFIG.GOLD_VERY_EASY,
  easy: GAME_CONFIG.GOLD_EASY,
  medium: GAME_CONFIG.GOLD_MEDIUM,
  hard: GAME_CONFIG.GOLD_HARD,
  very_hard: GAME_CONFIG.GOLD_VERY_HARD,
} as const;

export const DIFFICULTY_MULTIPLIERS = {
  very_easy: 0.5,
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
  very_hard: 2.5,
} as const;

export const TASK_COLORS = {
  habit: 'bg-purple-500',
  daily: 'bg-blue-500',
  todo: 'bg-green-500',
} as const;

export const DIFFICULTY_COLORS = {
  very_easy: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
  easy: 'bg-green-400 text-green-900 dark:bg-green-800 dark:text-green-200',
  medium: 'bg-yellow-400 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-200',
  hard: 'bg-orange-400 text-orange-900 dark:bg-orange-800 dark:text-orange-200',
  very_hard: 'bg-red-500 text-red-100 dark:bg-red-900 dark:text-red-200',
} as const;

export const DIFFICULTY_LABELS = {
  very_easy: 'Very Easy',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  very_hard: 'Very Hard',
} as const;