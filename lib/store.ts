import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameStore, GameState } from './types';
import {
  generateId,
  createDefaultUser,
  calculateXPReward,
  calculateGoldReward,
  shouldLevelUp,
  handleLevelUp,
  handleDeath,
  shouldCheckDailies,
  isTodayRepeatDay,
  computeGrowthStage,
  createInitialFarm,
  isDirtTile,
} from './game-mechanics';
import { GAME_CONFIG, CROP_DEFINITIONS } from './constants';
import type { CropType } from './types';

const createInitialInventory = () => {
  const crops = {} as Record<CropType, number>;
  (Object.keys(CROP_DEFINITIONS) as CropType[]).forEach((crop) => {
    crops[crop] = 0;
  });
  return { crops };
};

// Create initial state
const createInitialState = (): GameState => ({
  user: {
    ...createDefaultUser(),
    id: generateId(),
    created: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  tasks: [],
  rewards: [],
  lastDailyCheck: new Date().toISOString(),
  farm: createInitialFarm(),
  inventory: createInitialInventory(),
});

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      // Initial state
      ...createInitialState(),

      // User Actions
      updateUser: (updates) =>
        set((state) => ({
          user: { ...state.user, ...updates },
        })),

      levelUp: () =>
        set((state) => {
          const newUser = handleLevelUp(state.user);
          return { user: newUser };
        }),

      addXP: (amount) =>
        set((state) => {
          const newXP = state.user.xp + amount;
          let newUser = { ...state.user, xp: newXP };

          // Check for level up
          if (shouldLevelUp(newXP, newUser.level)) {
            newUser = handleLevelUp(newUser);
          }

          return { user: newUser };
        }),

      addGold: (amount) =>
        set((state) => ({
          user: { ...state.user, gold: state.user.gold + amount },
        })),

      takeDamage: (amount) =>
        set((state) => {
          const newHealth = Math.max(0, state.user.health - amount);
          let newUser = { ...state.user, health: newHealth };

          // Check for death
          if (newHealth === 0) {
            newUser = handleDeath(newUser);
          }

          return { user: newUser };
        }),

      heal: (amount) =>
        set((state) => ({
          user: {
            ...state.user,
            health: Math.min(state.user.maxHealth, state.user.health + amount),
          },
        })),

      // Task Actions
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      completeTask: (id) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          let newUser = { ...state.user };

          // Calculate rewards
          const xpReward = calculateXPReward(task.difficulty);
          const goldReward = calculateGoldReward(task.difficulty);

          // Add rewards
          newUser.xp += xpReward;
          newUser.gold += goldReward;

          // Check for level up
          if (shouldLevelUp(newUser.xp, newUser.level)) {
            newUser = handleLevelUp(newUser);
          }

          // Update task based on type
          const updatedTasks = state.tasks.map((t) => {
            if (t.id !== id) return t;

            if (task.type === 'todo') {
              return {
                ...t,
                completed: true,
                completedDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            } else if (task.type === 'daily') {
              // Update streak
              const newStreak = (task.streak || 0) + 1;

              // Health reward for streak
              if (newStreak % GAME_CONFIG.STREAK_THRESHOLD === 0) {
                newUser.health = Math.min(
                  newUser.maxHealth,
                  newUser.health + GAME_CONFIG.HEALTH_REWARD_STREAK
                );
              }

              return {
                ...t,
                streak: newStreak,
                completedToday: true,
                lastCompleted: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            }

            return t;
          });

          return { user: newUser, tasks: updatedTasks };
        }),

      completeHabit: (id, direction) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task || task.type !== 'habit') return state;

          // Validate direction against habitType
          const habitType = task.habitType || 'both';
          if (habitType === 'positive' && direction === 'negative') {
            // Positive-only habits cannot have negative actions
            return state;
          }
          if (habitType === 'negative' && direction === 'positive') {
            // Negative-only habits cannot have positive actions
            return state;
          }

          let newUser = { ...state.user };

          if (direction === 'positive') {
            // Give rewards
            const xpReward = calculateXPReward(task.difficulty);
            const goldReward = calculateGoldReward(task.difficulty);

            newUser.xp += xpReward;
            newUser.gold += goldReward;

            // Check for level up
            if (shouldLevelUp(newUser.xp, newUser.level)) {
              newUser = handleLevelUp(newUser);
            }
          } else {
            // Take damage for negative habit
            newUser.health = Math.max(0, newUser.health - 1);

            // Check for death
            if (newUser.health === 0) {
              newUser = handleDeath(newUser);
            }
          }

          return { user: newUser };
        }),

      checkDailies: () =>
        set((state) => {
          if (!shouldCheckDailies(state.lastDailyCheck)) return state;

          let newUser = { ...state.user };
          const updatedTasks = state.tasks.map((task) => {
            if (task.type !== 'daily') return task;

            // Check if this daily should be done today
            if (task.repeat && isTodayRepeatDay(task.repeat)) {
              // If it wasn't completed yesterday, reset streak and deal damage
              if (!task.completedToday && task.lastCompleted) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const lastCompletedDate = new Date(task.lastCompleted);

                // If last completed was more than 1 day ago
                if (
                  lastCompletedDate.getDate() !== yesterday.getDate() ||
                  lastCompletedDate.getMonth() !== yesterday.getMonth() ||
                  lastCompletedDate.getFullYear() !== yesterday.getFullYear()
                ) {
                  // Reset streak and deal damage
                  newUser.health = Math.max(0, newUser.health - GAME_CONFIG.HEALTH_PENALTY_DAILY);

                  if (newUser.health === 0) {
                    newUser = handleDeath(newUser);
                  }

                  return {
                    ...task,
                    streak: 0,
                    completedToday: false,
                    updatedAt: new Date().toISOString(),
                  };
                }
              }

              // Reset completedToday for new day
              return {
                ...task,
                completedToday: false,
                updatedAt: new Date().toISOString(),
              };
            }

            return task;
          });

          // Regen mana
          newUser.mana = Math.min(
            newUser.maxMana,
            newUser.mana + GAME_CONFIG.MANA_REGEN
          );

          return {
            user: newUser,
            tasks: updatedTasks,
            lastDailyCheck: new Date().toISOString(),
          };
        }),

      // Reward Actions
      addReward: (reward) =>
        set((state) => ({
          rewards: [
            ...state.rewards,
            {
              ...reward,
              id: generateId(),
            },
          ],
        })),

      purchaseReward: (id) =>
        set((state) => {
          const reward = state.rewards.find((r) => r.id === id);
          if (!reward || reward.owned || state.user.gold < reward.cost) return state;

          return {
            user: {
              ...state.user,
              gold: state.user.gold - reward.cost,
            },
            rewards: state.rewards.map((r) =>
              r.id === id ? { ...r, owned: true } : r
            ),
          };
        }),

      equipItem: (id) =>
        set((state) => {
          const reward = state.rewards.find((r) => r.id === id);
          if (!reward || !reward.owned) return state;

          // Unequip other items in the same category
          const updatedRewards = state.rewards.map((r) => {
            if (r.category === reward.category && r.equipped) {
              return { ...r, equipped: false };
            }
            if (r.id === id) {
              return { ...r, equipped: true };
            }
            return r;
          });

          return { rewards: updatedRewards };
        }),

      // Farm Actions
      plantCrop: (x, y, crop) =>
        set((state) => {
          if (!isDirtTile(x, y, state.farm.dirtRect)) return state;
          const plot = state.farm.plots.find((p) => p.x === x && p.y === y);
          if (!plot || plot.crop !== null) return state;

          const seedCost = CROP_DEFINITIONS[crop].seedCost;
          if (state.user.gold < seedCost) return state;

          return {
            user: { ...state.user, gold: state.user.gold - seedCost },
            farm: {
              ...state.farm,
              plots: state.farm.plots.map((p) =>
                p.x === x && p.y === y
                  ? { ...p, crop, plantedAt: Date.now() }
                  : p
              ),
            },
          };
        }),

      harvestCrop: (x, y) =>
        set((state) => {
          const plot = state.farm.plots.find((p) => p.x === x && p.y === y);
          if (!plot || plot.crop === null || plot.plantedAt === null) return state;

          const cropDef = CROP_DEFINITIONS[plot.crop];
          const stage = computeGrowthStage(plot.plantedAt, cropDef.growthDuration);
          if (stage < 5) return state;

          let newUser = { ...state.user };
          newUser.gold += cropDef.goldReward;
          newUser.xp += cropDef.xpReward;

          if (shouldLevelUp(newUser.xp, newUser.level)) {
            newUser = handleLevelUp(newUser);
          }

          return {
            user: newUser,
            farm: {
              ...state.farm,
              plots: state.farm.plots.map((p) =>
                p.x === x && p.y === y
                  ? { ...p, crop: null, plantedAt: null }
                  : p
              ),
              totalHarvests: state.farm.totalHarvests + 1,
            },
            inventory: {
              crops: {
                ...state.inventory.crops,
                [plot.crop]: (state.inventory.crops[plot.crop] ?? 0) + 1,
              },
            },
          };
        }),

      // Utility
      resetGame: () => set(createInitialState()),

      loadGameState: (newState) => set(newState),
    }),
    {
      name: 'habit-quest-storage',
      version: 4,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 3) {
          state.farm = createInitialFarm();
        }
        if (version < 4) {
          state.inventory = createInitialInventory();
        }
        return state as unknown as GameState;
      },
    }
  )
);
