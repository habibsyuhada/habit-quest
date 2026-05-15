import { GAME_CONFIG, FARM_CONFIG } from './constants';
import type { TaskDifficulty, User, CropType, GrowthStage, FarmPlot, FarmState, FarmDirtRect } from './types';

// Calculate XP required for a specific level
export function calculateXPForLevel(level: number): number {
  return Math.floor(GAME_CONFIG.BASE_XP_REQUIREMENT * Math.pow(GAME_CONFIG.XP_MULTIPLIER, level - 1));
}

// Calculate XP reward based on difficulty
export function calculateXPReward(difficulty: TaskDifficulty): number {
  const baseReward = {
    very_easy: GAME_CONFIG.XP_VERY_EASY,
    easy: GAME_CONFIG.XP_EASY,
    medium: GAME_CONFIG.XP_MEDIUM,
    hard: GAME_CONFIG.XP_HARD,
    very_hard: GAME_CONFIG.XP_VERY_HARD,
  }[difficulty];

  return baseReward;
}

// Calculate Gold reward based on difficulty
export function calculateGoldReward(difficulty: TaskDifficulty): number {
  const baseReward = {
    very_easy: GAME_CONFIG.GOLD_VERY_EASY,
    easy: GAME_CONFIG.GOLD_EASY,
    medium: GAME_CONFIG.GOLD_MEDIUM,
    hard: GAME_CONFIG.GOLD_HARD,
    very_hard: GAME_CONFIG.GOLD_VERY_HARD,
  }[difficulty];

  return baseReward;
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

// Handle level up - supports multiple level ups at once
export function handleLevelUp(user: User): User {
  const newUser = { ...user };

  // Keep leveling up while XP is sufficient for the next level
  while (shouldLevelUp(newUser.xp, newUser.level)) {
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
  }

  // Update xpToNextLevel to reflect the new level
  newUser.xpToNextLevel = calculateXPForLevel(newUser.level + 1);

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

// Compute growth stage (0-5) based on elapsed time
export function computeGrowthStage(
  plantedAt: number,
  growthDuration: number
): GrowthStage {
  const elapsedMs = Date.now() - plantedAt;
  const elapsedSec = elapsedMs / 1000;
  const stageDuration = growthDuration / 5;

  const stage = Math.floor(elapsedSec / stageDuration);
  return Math.min(5, Math.max(0, stage)) as GrowthStage;
}

// Get the image path for a crop at a given stage
export function getCropImagePath(crop: CropType, stage: GrowthStage): string {
  return `/crop/${crop}_${String(stage).padStart(2, '0')}.png`;
}

export function isDirtTile(x: number, y: number, dirtRect: FarmDirtRect): boolean {
  return x >= dirtRect.x
    && x < dirtRect.x + dirtRect.width
    && y >= dirtRect.y
    && y < dirtRect.y + dirtRect.height;
}

// Create the initial farm state with empty plots
export function createInitialFarm(): FarmState {
  const worldWidth = FARM_CONFIG.WORLD_WIDTH;
  const worldHeight = FARM_CONFIG.WORLD_HEIGHT;
  const dirtRect = {
    x: Math.floor((worldWidth - FARM_CONFIG.DIRT_WIDTH) / 2),
    y: Math.floor((worldHeight - FARM_CONFIG.DIRT_HEIGHT) / 2),
    width: FARM_CONFIG.DIRT_WIDTH,
    height: FARM_CONFIG.DIRT_HEIGHT,
  };
  const plots: FarmPlot[] = [];
  for (let y = 0; y < worldHeight; y += 1) {
    for (let x = 0; x < worldWidth; x += 1) {
      if (isDirtTile(x, y, dirtRect)) {
        plots.push({
          x,
          y,
          crop: null,
          plantedAt: null,
        });
      }
    }
  }

  return {
    worldWidth,
    worldHeight,
    dirtRect,
    plots,
    totalHarvests: 0,
  };
}
