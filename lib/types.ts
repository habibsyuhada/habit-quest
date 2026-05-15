// Core User State
export interface User {
  id: string;
  name: string;
  avatar: Avatar;
  level: number;
  xp: number;
  xpToNextLevel: number;
  health: number; // 0-50 (Habitica standard)
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  stats: UserStats;
  created: string;
  lastLogin: string;
}

export interface UserStats {
  strength: number;
  intelligence: number;
  constitution: number;
  perception: number;
}

// Avatar System
export interface Avatar {
  hair: string;
  hairColor: string;
  skin: string;
  shirt: string;
  background: string;
  accessories: string[];
}

// Task System
export type TaskType = 'habit' | 'daily' | 'todo';
export type TaskDifficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
export type HabitType = 'positive' | 'negative' | 'both';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  tags: string[];

  // Habit specific
  habitType?: HabitType;

  // Daily specific
  repeat?: WeeklyRepeat;
  streak?: number;
  completedToday?: boolean;
  lastCompleted?: string;

  // Todo specific
  completed?: boolean;
  completedDate?: string;

  // Shared
  value: number; // user can adjust difficulty multiplier
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyRepeat {
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
}

// Rewards System
export type RewardType = 'equipment' | 'custom' | 'potion';
export type RewardCategory = 'weapon' | 'armor' | 'head' | 'shield' | 'potion' | 'custom';

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  cost: number;
  image?: string;
  category: RewardCategory;
  owned: boolean;
  equipped?: boolean;
}

// Farm System
export type CropType = 'beetroot' | 'cabbage' | 'carrot' | 'cauliflower' | 'kale' | 'parsnip' | 'potato' | 'pumpkin' | 'radish' | 'sunflower' | 'wheat';
export type GrowthStage = 0 | 1 | 2 | 3 | 4 | 5;
export type FarmTileType = 'grass' | 'dirt';

export interface FarmPlot {
  x: number;
  y: number;
  crop: CropType | null;
  plantedAt: number | null;
}

export interface FarmDirtRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FarmState {
  worldWidth: number;
  worldHeight: number;
  dirtRect: FarmDirtRect;
  plots: FarmPlot[];
  totalHarvests: number;
}

// Game State
export interface GameState {
  user: User;
  tasks: Task[];
  rewards: Reward[];
  lastDailyCheck: string;
  farm: FarmState;
}

// Store State
export interface GameStore extends GameState {
  // User Actions
  updateUser: (updates: Partial<User>) => void;
  levelUp: () => void;
  addXP: (amount: number) => void;
  addGold: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  completeHabit: (id: string, direction: 'positive' | 'negative') => void;
  checkDailies: () => void;

  // Reward Actions
  addReward: (reward: Omit<Reward, 'id'>) => void;
  purchaseReward: (id: string) => void;
  equipItem: (id: string) => void;

  // Farm Actions
  plantCrop: (x: number, y: number, crop: CropType) => void;
  harvestCrop: (x: number, y: number) => void;

  // Utility
  resetGame: () => void;
  loadGameState: (state: GameState) => void;
}
