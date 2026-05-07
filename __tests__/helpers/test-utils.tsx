import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import type { User, Task, Reward, GameState } from '@/lib/types'

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // For now, just render without additional providers
  // Can be extended to include Redux, Theme, etc.
  return render(ui, options)
}

// Mock user factory
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-1',
    name: 'Test Hero',
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    health: 50,
    maxHealth: 50,
    mana: 10,
    maxMana: 50,
    gold: 0,
    avatar: {
      hair: 'short',
      hairColor: '#4A3728',
      skin: '#F5D0C5',
      shirt: '#3498db',
      background: '#e0f2fe',
      accessories: [],
    },
    stats: {
      strength: 1,
      intelligence: 1,
      constitution: 1,
      perception: 1,
    },
    created: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    ...overrides,
  }
}

// Mock task factory
export function createMockTask(overrides?: Partial<Task>): Task {
  return {
    id: 'task-1',
    type: 'todo',
    title: 'Test Task',
    difficulty: 'medium',
    value: 1,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

// Mock reward factory
export function createMockReward(overrides?: Partial<Reward>): Reward {
  return {
    id: 'reward-1',
    type: 'equipment',
    name: 'Test Sword',
    description: 'A powerful sword',
    cost: 50,
    category: 'weapon',
    owned: false,
    ...overrides,
  }
}

// Mock game state factory
export function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    user: createMockUser(),
    tasks: [],
    rewards: [],
    lastDailyCheck: new Date().toISOString(),
    ...overrides,
  }
}