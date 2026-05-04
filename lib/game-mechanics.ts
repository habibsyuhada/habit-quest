import { GAME_CONFIG } from './constants';
import type { TaskDifficulty, User } from './types';

// Calculate XP required for a specific level
export function calculateXPForLevel(level: number): number {
  return Math.floor(GAME_CONFIG.BASE_XP_REQUIREMENT * Math.pow(GAME_CONFIG.XP_MULTIPLIER, level - 1));
}

// Calculate XP reward based on difficulty and value multiplier
export function calculateXPReward(difficulty: TaskDifficulty, value: number = 1): number {
  const baseReward = {
    easy: GAME_CONFIG.XP_EASY,
    medium: GAME_CONFIG.XP_MEDIUM,
    hard: GAME_CONFIG.XP_HARD,
  }[difficulty];

  return Math.floor(baseReward * value);
}

// Calculate Gold reward based on difficulty and value multiplier
export function calculateGoldReward(difficulty: TaskDifficulty, value: number = 1): number {
  const baseReward = {
    easy: GAME_CONFIG.GOLD_EASY,
    medium: GAME_CONFIG.GOLD_MEDIUM,
    hard: GAME_CONFIG.GOLD_HARD,
  }[difficulty];

  return Math.floor(baseReward * value);
}

// Check if user should level up
export function shouldLevelUp(currentXP: number, currentLevel: number): boolean {
  const xpNeeded = calculateXPForLevel(currentLevel + 1);
  return currentXP >= xpNeeded;
}

// Calculate level progress percentage
export function calculateLevelProgress(user: User): number {
  const xpForCurrentLevel = calculateXPForLevel(user.level);
  const xpForNextLevel = calculateXPForLevel(user.level + 1);
  const xpInRange = xpForNextLevel - xpForCurrentLevel;
  const currentXPInRange = user.xp - xpForCurrentLevel;

  return Math.min(100, Math.max(0, (currentXPInRange / xpInRange) * 100));
}

// Handle level up
export function handleLevelUp(user: User): User {
  const newUser = { ...user };
  newUser.level += 1;
  newUser.health = newUser.maxHealth; // Restore health on level up
  newUser.maxMana += 5; // Increase max mana
  newUser.mana = newUser.maxMana; // Restore mana

  // Increase stats
  newUser.stats = {
    strength: newUser.stats.strength + 1,
    intelligence: newUser.stats.intelligence + 1,
    constitution: newUser.stats.constitution + 1,
    perception: newUser.stats.perception + 1,
  };

  return newUser;
}

// Handle user death (health = 0)
export function handleDeath(user: User): User {
  const newUser = { ...user };

  // Lose gold
  const goldLoss = Math.floor(newUser.gold * GAME_CONFIG.DEATH_GOLD_LOSS);
  newUser.gold = Math.max(0, newUser.gold - goldLoss);

  // Lose level (but not below 1)
  if (newUser.level > 1) {
    newUser.level = Math.max(1, newUser.level - GAME_CONFIG.DEATH_LEVEL_LOSS);
  }

  // Restore health
  newUser.health = newUser.maxHealth;

  return newUser;
}

// Check if dailies should be reset based on last check
export function shouldCheckDailies(lastCheck: string): boolean {
  const lastCheckDate = new Date(lastCheck);
  const now = new Date();

  return (
    lastCheckDate.getDate() !== now.getDate() ||
    lastCheckDate.getMonth() !== now.getMonth() ||
    lastCheckDate.getFullYear() !== now.getFullYear()
  );
}

// Check if today is a weekday for daily tasks
export function isTodayRepeatDay(repeat: {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}): boolean {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  const dayMap = {
    0: repeat.sun,
    1: repeat.mon,
    2: repeat.tue,
    3: repeat.wed,
    4: repeat.thu,
    5: repeat.fri,
    6: repeat.sat,
  };

  return dayMap[today as keyof typeof dayMap] || false;
}

// Create default user
export function createDefaultUser(): Omit<User, 'id' | 'created' | 'lastLogin'> {
  return {
    name: 'Hero',
    avatar: {
      hair: 'short',
      hairColor: '#4A3728',
      skin: '#F5D0C5',
      shirt: '#3498db',
      background: '#e0f2fe',
      accessories: [],
    },
    level: GAME_CONFIG.STARTING_LEVEL,
    xp: 0,
    xpToNextLevel: calculateXPForLevel(2),
    health: GAME_CONFIG.STARTING_HEALTH,
    maxHealth: GAME_CONFIG.MAX_HEALTH,
    mana: GAME_CONFIG.STARTING_MANA,
    maxMana: GAME_CONFIG.MAX_MANA,
    gold: GAME_CONFIG.STARTING_GOLD,
    stats: {
      strength: 1,
      intelligence: 1,
      constitution: 1,
      perception: 1,
    },
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}