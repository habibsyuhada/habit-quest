import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/lib/store'
import { createMockUser, createMockTask, createMockReward } from '@/__tests__/helpers/test-utils'
import { createInitialFarm } from '@/lib/game-mechanics'
import { CROP_DEFINITIONS } from '@/lib/constants'

describe('GameStore - User Actions', () => {
  beforeEach(() => {
    // Reset store before each test
    const { resetGame } = useGameStore.getState()
    resetGame()
  })

  describe('updateUser', () => {
    it('should update user properties', () => {
      const { updateUser, user } = useGameStore.getState()

      updateUser({ name: 'Updated Hero' })

      expect(useGameStore.getState().user.name).toBe('Updated Hero')
      expect(useGameStore.getState().user.level).toBe(user.level) // Other properties unchanged
    })

    it('should update multiple user properties', () => {
      const { updateUser } = useGameStore.getState()

      updateUser({ name: 'Updated Hero', level: 5, gold: 100 })

      const state = useGameStore.getState()
      expect(state.user.name).toBe('Updated Hero')
      expect(state.user.level).toBe(5)
      expect(state.user.gold).toBe(100)
    })

    it('should maintain immutability', () => {
      const { updateUser, user: originalUser } = useGameStore.getState()

      updateUser({ name: 'Updated Hero' })

      expect(useGameStore.getState().user).not.toBe(originalUser)
    })
  })

  describe('levelUp', () => {
    it('should increment user level', () => {
      const { levelUp, updateUser } = useGameStore.getState()
      updateUser({ xp: 60 })

      levelUp()

      expect(useGameStore.getState().user.level).toBe(2)
    })

    it('should restore health on level up', () => {
      const { updateUser, levelUp } = useGameStore.getState()

      updateUser({ xp: 60, health: 30 })
      levelUp()

      expect(useGameStore.getState().user.health).toBe(50) // Restored to maxHealth
    })

    it('should increase max mana', () => {
      const { levelUp, updateUser } = useGameStore.getState()
      updateUser({ xp: 60 })

      levelUp()

      expect(useGameStore.getState().user.maxMana).toBe(55) // 50 + 5
    })

    it('should restore mana to max', () => {
      const { updateUser, levelUp } = useGameStore.getState()

      updateUser({ xp: 60, mana: 5 })
      levelUp()

      expect(useGameStore.getState().user.mana).toBe(55) // Restored to new max
    })

    it('should increase all stats by 1', () => {
      const { levelUp, updateUser } = useGameStore.getState()
      updateUser({ xp: 60 })

      levelUp()

      const { stats } = useGameStore.getState().user
      expect(stats.strength).toBe(2)
      expect(stats.intelligence).toBe(2)
      expect(stats.constitution).toBe(2)
      expect(stats.perception).toBe(2)
    })
  })

  describe('addXP', () => {
    it('should add XP to user', () => {
      const { addXP } = useGameStore.getState()

      addXP(10)

      expect(useGameStore.getState().user.xp).toBe(10)
    })

    it('should trigger level up when XP threshold reached', () => {
      const { addXP } = useGameStore.getState()

      addXP(60) // Enough for level 2

      const state = useGameStore.getState()
      expect(state.user.level).toBe(2)
      expect(state.user.xp).toBe(60)
    })

    it('should handle multiple level ups', () => {
      const { addXP } = useGameStore.getState()

      // Add XP in increments to trigger multiple level ups
      addXP(60) // Level 2
      addXP(72) // Level 3
      addXP(87) // Level 4

      const state = useGameStore.getState()
      expect(state.user.level).toBeGreaterThan(2) // Should reach at least level 3
      expect(state.user.health).toBe(state.user.maxHealth) // Health restored
    })

    it('should handle negative XP', () => {
      const { addXP, updateUser } = useGameStore.getState()

      updateUser({ xp: 20 })
      addXP(-5)

      expect(useGameStore.getState().user.xp).toBe(15)
    })
  })

  describe('addGold', () => {
    it('should add gold to user', () => {
      const { addGold } = useGameStore.getState()

      addGold(50)

      expect(useGameStore.getState().user.gold).toBe(50)
    })

    it('should handle multiple gold additions', () => {
      const { addGold } = useGameStore.getState()

      addGold(30)
      addGold(20)

      expect(useGameStore.getState().user.gold).toBe(50)
    })

    it('should handle negative gold', () => {
      const { addGold, updateUser } = useGameStore.getState()

      updateUser({ gold: 50 })
      addGold(-20)

      expect(useGameStore.getState().user.gold).toBe(30)
    })
  })

  describe('takeDamage', () => {
    it('should reduce health', () => {
      const { takeDamage } = useGameStore.getState()

      takeDamage(10)

      expect(useGameStore.getState().user.health).toBe(40)
    })

    it('should trigger death when health reaches 0', () => {
      const { takeDamage } = useGameStore.getState()

      takeDamage(50) // Take 50 damage with 50 health

      const state = useGameStore.getState()
      expect(state.user.health).toBe(50) // Restored after death
      expect(state.user.level).toBe(1) // Level doesn't go below 1
    })

    it('should trigger death when health reaches 0', () => {
      const { updateUser, takeDamage } = useGameStore.getState()

      updateUser({ level: 5, gold: 100 })
      takeDamage(50)

      const state = useGameStore.getState()
      expect(state.user.health).toBe(50) // Restored after death
      expect(state.user.level).toBe(4) // Lost 1 level
      expect(state.user.gold).toBe(50) // Lost 50% gold
    })

    it('should not reduce level below 1 on death', () => {
      const { updateUser, takeDamage } = useGameStore.getState()

      updateUser({ level: 1, gold: 100 })
      takeDamage(50)

      expect(useGameStore.getState().user.level).toBe(1)
    })
  })

  describe('heal', () => {
    it('should increase health', () => {
      const { updateUser, heal } = useGameStore.getState()

      updateUser({ health: 30 })
      heal(10)

      expect(useGameStore.getState().user.health).toBe(40)
    })

    it('should not exceed max health', () => {
      const { updateUser, heal } = useGameStore.getState()

      updateUser({ health: 45 })
      heal(10)

      expect(useGameStore.getState().user.health).toBe(50) // Capped at maxHealth
    })

    it('should handle healing from 0', () => {
      const { updateUser, heal } = useGameStore.getState()

      updateUser({ health: 0 })
      heal(25)

      expect(useGameStore.getState().user.health).toBe(25)
    })
  })
})

describe('GameStore - Task Actions', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState()
    resetGame()
  })

  describe('addTask', () => {
    it('should add task to store', () => {
      const { addTask } = useGameStore.getState()

      addTask({
        type: 'todo',
        title: 'Test Task',
        difficulty: 'medium',
        value: 1,
        tags: [],
      })

      const state = useGameStore.getState()
      expect(state.tasks).toHaveLength(1)
      expect(state.tasks[0].title).toBe('Test Task')
    })

    it('should generate ID and timestamps', () => {
      const { addTask } = useGameStore.getState()

      addTask({
        type: 'todo',
        title: 'Test Task',
        difficulty: 'medium',
        value: 1,
        tags: [],
      })

      const task = useGameStore.getState().tasks[0]
      expect(task.id).toBeDefined()
      expect(task.createdAt).toBeDefined()
      expect(task.updatedAt).toBeDefined()
    })

    it('should add multiple tasks', () => {
      const { addTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Task 1', difficulty: 'medium', value: 1, tags: [] })
      addTask({ type: 'habit', title: 'Task 2', difficulty: 'easy', value: 1, tags: [] })

      expect(useGameStore.getState().tasks).toHaveLength(2)
    })
  })

  describe('updateTask', () => {
    it('should update existing task', () => {
      const { addTask, updateTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Original Title', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      updateTask(taskId, { title: 'Updated Title' })

      const task = useGameStore.getState().tasks[0]
      expect(task.title).toBe('Updated Title')
    })

    it('should update updatedAt timestamp', () => {
      const { addTask, updateTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      updateTask(taskId, { title: 'Updated' })

      expect(useGameStore.getState().tasks[0].updatedAt).toBeDefined()
      expect(useGameStore.getState().tasks[0].title).toBe('Updated')
    })

    it('should handle non-existent task', () => {
      const { updateTask } = useGameStore.getState()

      updateTask('non-existent-id', { title: 'Updated' })

      expect(useGameStore.getState().tasks).toHaveLength(0)
    })
  })

  describe('deleteTask', () => {
    it('should delete existing task', () => {
      const { addTask, deleteTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      deleteTask(taskId)

      expect(useGameStore.getState().tasks).toHaveLength(0)
    })

    it('should handle non-existent task', () => {
      const { addTask, deleteTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })

      deleteTask('non-existent-id')

      expect(useGameStore.getState().tasks).toHaveLength(1) // Original task still there
    })
  })

  describe('completeTask', () => {
    it('should add XP and gold for completed task', () => {
      const { addTask, completeTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeTask(taskId)

      const state = useGameStore.getState()
      expect(state.user.xp).toBe(10) // Medium difficulty XP
      expect(state.user.gold).toBe(5) // Medium difficulty gold
    })

    it('should mark todo as completed', () => {
      const { addTask, completeTask } = useGameStore.getState()

      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeTask(taskId)

      const task = useGameStore.getState().tasks[0]
      expect(task.completed).toBe(true)
      expect(task.completedDate).toBeDefined()
    })

    it('should update daily streak', () => {
      const { addTask, completeTask } = useGameStore.getState()

      addTask({ type: 'daily', title: 'Test', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeTask(taskId)

      const task = useGameStore.getState().tasks[0]
      expect(task.streak).toBe(1)
      expect(task.completedToday).toBe(true)
    })

    it('should handle non-existent task', () => {
      const { completeTask } = useGameStore.getState()

      completeTask('non-existent-id')

      const state = useGameStore.getState()
      expect(state.user.xp).toBe(0) // No rewards given
    })
  })

  describe('completeHabit', () => {
    it('should give rewards for positive habit', () => {
      const { addTask, completeHabit } = useGameStore.getState()

      addTask({ type: 'habit', title: 'Exercise', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeHabit(taskId, 'positive')

      const state = useGameStore.getState()
      expect(state.user.xp).toBe(10)
      expect(state.user.gold).toBe(5)
    })

    it('should deal damage for negative habit', () => {
      const { addTask, completeHabit } = useGameStore.getState()

      addTask({ type: 'habit', title: 'Smoking', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeHabit(taskId, 'negative')

      expect(useGameStore.getState().user.health).toBe(49) // Lost 1 HP
    })

    it('should trigger death from negative habit', () => {
      const { updateUser, addTask, completeHabit } = useGameStore.getState()

      updateUser({ health: 1, level: 2, gold: 100 })
      addTask({ type: 'habit', title: 'Bad Habit', difficulty: 'medium', value: 1, tags: [] })
      const taskId = useGameStore.getState().tasks[0].id

      completeHabit(taskId, 'negative')

      const state = useGameStore.getState()
      expect(state.user.health).toBe(50) // Restored after death
      expect(state.user.level).toBe(1) // Lost level
    })
  })

  describe('checkDailies', () => {
    it('should update lastDailyCheck timestamp', () => {
      const { checkDailies } = useGameStore.getState()

      // Force check by setting last check to yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      useGameStore.setState({ lastDailyCheck: yesterday.toISOString() })

      checkDailies()

      expect(useGameStore.getState().lastDailyCheck).toBeDefined()
    })
  })
})

describe('GameStore - Reward Actions', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState()
    resetGame()
  })

  describe('addReward', () => {
    it('should add reward to store', () => {
      const { addReward } = useGameStore.getState()

      addReward({
        type: 'equipment',
        name: 'Test Sword',
        description: 'A powerful sword',
        cost: 50,
        category: 'weapon',
        owned: false,
      })

      const state = useGameStore.getState()
      expect(state.rewards).toHaveLength(1)
      expect(state.rewards[0].name).toBe('Test Sword')
    })

    it('should generate ID for reward', () => {
      const { addReward } = useGameStore.getState()

      addReward({
        type: 'equipment',
        name: 'Test',
        description: 'Test',
        cost: 10,
        category: 'weapon',
        owned: false,
      })

      expect(useGameStore.getState().rewards[0].id).toBeDefined()
    })
  })

  describe('purchaseReward', () => {
    it('should deduct gold and mark as owned', () => {
      const { addReward, updateUser, purchaseReward } = useGameStore.getState()

      updateUser({ gold: 100 })
      addReward({
        type: 'equipment',
        name: 'Sword',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: false,
      })
      const rewardId = useGameStore.getState().rewards[0].id

      purchaseReward(rewardId)

      const state = useGameStore.getState()
      expect(state.user.gold).toBe(50) // 100 - 50
      expect(state.rewards[0].owned).toBe(true)
    })

    it('should not purchase if insufficient gold', () => {
      const { addReward, updateUser, purchaseReward } = useGameStore.getState()

      updateUser({ gold: 10 })
      addReward({
        type: 'equipment',
        name: 'Sword',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: false,
      })
      const rewardId = useGameStore.getState().rewards[0].id

      purchaseReward(rewardId)

      const state = useGameStore.getState()
      expect(state.user.gold).toBe(10) // No change
      expect(state.rewards[0].owned).toBe(false) // Not owned
    })

    it('should not purchase already owned reward', () => {
      const { addReward, updateUser, purchaseReward } = useGameStore.getState()

      updateUser({ gold: 100 })
      addReward({
        type: 'equipment',
        name: 'Sword',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: true, // Already owned
      })
      const rewardId = useGameStore.getState().rewards[0].id

      purchaseReward(rewardId)

      expect(useGameStore.getState().user.gold).toBe(100) // No change
    })
  })

  describe('equipItem', () => {
    it('should equip item and unequip same category', () => {
      const { addReward, equipItem } = useGameStore.getState()

      // Add two weapons
      addReward({
        type: 'equipment',
        name: 'Sword 1',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: true,
        equipped: true,
      })
      const reward1Id = useGameStore.getState().rewards[0].id

      addReward({
        type: 'equipment',
        name: 'Sword 2',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: true,
        equipped: false,
      })
      const reward2Id = useGameStore.getState().rewards[1].id

      equipItem(reward2Id)

      const state = useGameStore.getState()
      expect(state.rewards.find((r) => r.id === reward1Id)?.equipped).toBe(false) // Unequipped
      expect(state.rewards.find((r) => r.id === reward2Id)?.equipped).toBe(true) // Equipped
    })

    it('should not equip unowned item', () => {
      const { addReward, equipItem } = useGameStore.getState()

      addReward({
        type: 'equipment',
        name: 'Sword',
        description: 'Test',
        cost: 50,
        category: 'weapon',
        owned: false,
        equipped: false,
      })
      const rewardId = useGameStore.getState().rewards[0].id

      equipItem(rewardId)

      expect(useGameStore.getState().rewards[0].equipped).toBe(false)
    })
  })
})

describe('GameStore - Utility Actions', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState()
    resetGame()
  })

  describe('resetGame', () => {
    it('should reset store to initial state', () => {
      const { updateUser, addTask, resetGame } = useGameStore.getState()

      // Modify state
      updateUser({ level: 5, gold: 100 })
      addTask({ type: 'todo', title: 'Test', difficulty: 'medium', value: 1, tags: [] })

      // Reset
      resetGame()

      const state = useGameStore.getState()
      expect(state.user.level).toBe(1)
      expect(state.user.gold).toBe(0)
      expect(state.tasks).toHaveLength(0)
    })
  })

  describe('loadGameState', () => {
    it('should load provided game state', () => {
      const { loadGameState } = useGameStore.getState()

      const customState = {
        user: createMockUser({ level: 10, gold: 500 }),
        tasks: [createMockTask()],
        rewards: [createMockReward()],
        lastDailyCheck: new Date().toISOString(),
        farm: createInitialFarm(),
        inventory: {
          crops: Object.fromEntries(
            Object.keys(CROP_DEFINITIONS).map((crop) => [crop, 0])
          ) as Record<keyof typeof CROP_DEFINITIONS, number>,
        },
      }

      loadGameState(customState)

      const state = useGameStore.getState()
      expect(state.user.level).toBe(10)
      expect(state.user.gold).toBe(500)
      expect(state.tasks).toHaveLength(1)
      expect(state.rewards).toHaveLength(1)
    })
  })
})

describe('GameStore - Farm Inventory', () => {
  beforeEach(() => {
    const { resetGame } = useGameStore.getState()
    resetGame()
  })

  it('should add harvested crop to inventory', () => {
    const { updateUser, plantCrop, harvestCrop } = useGameStore.getState()
    updateUser({ gold: 100 })

    const state = useGameStore.getState()
    const plot = state.farm.plots[0]
    if (!plot) throw new Error('Expected at least one farm plot')

    plantCrop(plot.x, plot.y, 'wheat')

    useGameStore.setState((current) => ({
      farm: {
        ...current.farm,
        plots: current.farm.plots.map((p) =>
          p.x === plot.x && p.y === plot.y
            ? { ...p, plantedAt: Date.now() - CROP_DEFINITIONS.wheat.growthDuration * 1000 }
            : p
        ),
      },
    }))

    harvestCrop(plot.x, plot.y)

    expect(useGameStore.getState().inventory.crops.wheat).toBe(1)
  })
})
