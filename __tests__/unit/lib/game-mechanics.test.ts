import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateXPReward,
  calculateGoldReward,
  calculateXPForLevel,
  shouldLevelUp,
  calculateLevelProgress,
  handleLevelUp,
  handleDeath,
  shouldCheckDailies,
  isTodayRepeatDay,
  createDefaultUser,
  generateId,
} from '@/lib/game-mechanics'
import { createMockUser } from '@/__tests__/helpers/test-utils'

describe('calculateXPReward', () => {
  it('should return correct XP for very_easy difficulty', () => {
    expect(calculateXPReward('very_easy')).toBe(3)
  })

  it('should return correct XP for easy difficulty', () => {
    expect(calculateXPReward('easy')).toBe(5)
  })

  it('should return correct XP for medium difficulty', () => {
    expect(calculateXPReward('medium')).toBe(10)
  })

  it('should return correct XP for hard difficulty', () => {
    expect(calculateXPReward('hard')).toBe(15)
  })

  it('should return correct XP for very_hard difficulty', () => {
    expect(calculateXPReward('very_hard')).toBe(20)
  })
})

describe('calculateGoldReward', () => {
  it('should return correct gold for very_easy difficulty', () => {
    expect(calculateGoldReward('very_easy')).toBe(1)
  })

  it('should return correct gold for easy difficulty', () => {
    expect(calculateGoldReward('easy')).toBe(2)
  })

  it('should return correct gold for medium difficulty', () => {
    expect(calculateGoldReward('medium')).toBe(5)
  })

  it('should return correct gold for hard difficulty', () => {
    expect(calculateGoldReward('hard')).toBe(10)
  })

  it('should return correct gold for very_hard difficulty', () => {
    expect(calculateGoldReward('very_hard')).toBe(15)
  })
})

describe('calculateXPForLevel', () => {
  it('should return 50 for level 1', () => {
    expect(calculateXPForLevel(1)).toBe(50)
  })

  it('should return 60 for level 2', () => {
    expect(calculateXPForLevel(2)).toBe(60)
  })

  it('should return 72 for level 3', () => {
    expect(calculateXPForLevel(3)).toBe(72)
  })

  it('should increase by 20% each level', () => {
    const level1 = calculateXPForLevel(1)
    const level2 = calculateXPForLevel(2)
    const level3 = calculateXPForLevel(3)

    expect(level2).toBe(Math.floor(level1 * 1.2))
    expect(level3).toBe(Math.floor(level2 * 1.2))
  })

  it('should calculate correctly for higher levels', () => {
    expect(calculateXPForLevel(10)).toBe(257) // Math.floor(50 * 1.2^9)
    expect(calculateXPForLevel(20)).toBe(1597) // Math.floor(50 * 1.2^19)
  })
})

describe('shouldLevelUp', () => {
  it('should return true when XP meets threshold for next level', () => {
    expect(shouldLevelUp(60, 1)).toBe(true) // 60 >= calculateXPForLevel(2) = 60
  })

  it('should return true when XP exceeds threshold', () => {
    expect(shouldLevelUp(72, 2)).toBe(true) // 72 >= calculateXPForLevel(3) = 72
  })

  it('should return false when XP below threshold', () => {
    expect(shouldLevelUp(59, 1)).toBe(false) // 59 < calculateXPForLevel(2) = 60
  })

  it('should work correctly for higher levels', () => {
    expect(shouldLevelUp(72, 2)).toBe(true) // 72 >= calculateXPForLevel(3) = 72
    expect(shouldLevelUp(71, 2)).toBe(false) // 71 < calculateXPForLevel(3) = 72
  })

  it('should return false for zero XP', () => {
    expect(shouldLevelUp(0, 1)).toBe(false)
  })
})

describe('calculateLevelProgress', () => {
  it('should return 0% for user at start of level', () => {
    const user = createMockUser({ level: 1, xp: 50 }) // At exactly level 1 threshold
    expect(calculateLevelProgress(user)).toBe(0)
  })

  it('should return 100% for user at next level threshold', () => {
    const user = createMockUser({ level: 1, xp: 60 }) // At level 2 threshold
    expect(calculateLevelProgress(user)).toBe(100)
  })

  it('should calculate progress correctly for mid-level XP', () => {
    const user = createMockUser({ level: 1, xp: 55 }) // Halfway between 50 and 60
    expect(calculateLevelProgress(user)).toBe(50)
  })

  it('should handle higher levels correctly', () => {
    const user = createMockUser({ level: 2, xp: 66 }) // Between 60 and 72
    const progress = calculateLevelProgress(user)
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(100)
  })

  it('should cap at 100%', () => {
    const user = createMockUser({ level: 1, xp: 100 })
    expect(calculateLevelProgress(user)).toBe(100)
  })

  it('should not go below 0%', () => {
    const user = createMockUser({ level: 2, xp: 50 }) // Below level 2 threshold
    expect(calculateLevelProgress(user)).toBe(0)
  })
})

describe('handleLevelUp', () => {
  it('should increment level by 1 when XP is sufficient', () => {
    const user = createMockUser({ level: 1, xp: 60 })
    const leveledUp = handleLevelUp(user)

    expect(leveledUp.level).toBe(2)
  })

  it('should restore health to max', () => {
    const user = createMockUser({ level: 1, xp: 60, health: 30 })
    const leveledUp = handleLevelUp(user)

    expect(leveledUp.health).toBe(leveledUp.maxHealth)
  })

  it('should increase max mana by 5', () => {
    const user = createMockUser({ level: 1, xp: 60, maxMana: 50 })
    const leveledUp = handleLevelUp(user)

    expect(leveledUp.maxMana).toBe(55)
  })

  it('should restore mana to new max', () => {
    const user = createMockUser({ level: 1, xp: 60, mana: 10 })
    const leveledUp = handleLevelUp(user)

    expect(leveledUp.mana).toBe(leveledUp.maxMana)
  })

  it('should increase all stats by 1', () => {
    const user = createMockUser({ level: 1, xp: 60 })
    const leveledUp = handleLevelUp(user)

    expect(leveledUp.stats.strength).toBe(2)
    expect(leveledUp.stats.intelligence).toBe(2)
    expect(leveledUp.stats.constitution).toBe(2)
    expect(leveledUp.stats.perception).toBe(2)
  })

  it('should not mutate original user object', () => {
    const user = createMockUser({ level: 1 })
    const originalLevel = user.level
    const originalHealth = user.health

    handleLevelUp(user)

    expect(user.level).toBe(originalLevel)
    expect(user.health).toBe(originalHealth)
  })
})

describe('handleDeath', () => {
  it('should deduct 50% of gold', () => {
    const user = createMockUser({ level: 5, gold: 100 })
    const died = handleDeath(user)

    expect(died.gold).toBe(50)
  })

  it('should handle odd gold amounts correctly', () => {
    const user = createMockUser({ level: 5, gold: 15 })
    const died = handleDeath(user)

    expect(died.gold).toBe(8) // 15 - Math.floor(15 * 0.5) = 15 - 7 = 8
  })

  it('should reduce level by 1 when above level 1', () => {
    const user = createMockUser({ level: 5 })
    const died = handleDeath(user)

    expect(died.level).toBe(4)
  })

  it('should not reduce level below 1', () => {
    const user = createMockUser({ level: 1 })
    const died = handleDeath(user)

    expect(died.level).toBe(1)
  })

  it('should restore health to max', () => {
    const user = createMockUser({ health: 0 })
    const died = handleDeath(user)

    expect(died.health).toBe(died.maxHealth)
  })

  it('should not mutate original user object', () => {
    const user = createMockUser({ level: 5, gold: 100 })
    const originalLevel = user.level
    const originalGold = user.gold

    handleDeath(user)

    expect(user.level).toBe(originalLevel)
    expect(user.gold).toBe(originalGold)
  })

  it('should handle zero gold correctly', () => {
    const user = createMockUser({ level: 5, gold: 0 })
    const died = handleDeath(user)

    expect(died.gold).toBe(0)
  })
})

describe('shouldCheckDailies', () => {
  it('should return true when last check was yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    expect(shouldCheckDailies(yesterday.toISOString())).toBe(true)
  })

  it('should return false when last check was today', () => {
    const today = new Date()

    expect(shouldCheckDailies(today.toISOString())).toBe(false)
  })

  it('should return true when last check was last month', () => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    expect(shouldCheckDailies(lastMonth.toISOString())).toBe(true)
  })

  it('should return true when last check was last year', () => {
    const lastYear = new Date()
    lastYear.setFullYear(lastYear.getFullYear() - 1)

    expect(shouldCheckDailies(lastYear.toISOString())).toBe(true)
  })
})

describe('isTodayRepeatDay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when today is Monday and Monday is set to repeat', () => {
    // Mock current day to Monday (1)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(1)

    const repeat = { mon: true, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false }
    expect(isTodayRepeatDay(repeat)).toBe(true)
  })

  it('should return false when today is Monday but Monday is not set to repeat', () => {
    // Mock current day to Monday (1)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(1)

    const repeat = { mon: false, tue: true, wed: false, thu: false, fri: false, sat: false, sun: false }
    expect(isTodayRepeatDay(repeat)).toBe(false)
  })

  it('should return true when today is Sunday and Sunday is set to repeat', () => {
    // Mock current day to Sunday (0)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(0)

    const repeat = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: true }
    expect(isTodayRepeatDay(repeat)).toBe(true)
  })

  it('should handle multiple repeat days correctly', () => {
    // Mock current day to Wednesday (3)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(3)

    const repeat = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: true }
    expect(isTodayRepeatDay(repeat)).toBe(true)
  })

  it('should return false when no days are set to repeat', () => {
    // Mock current day to Tuesday (2)
    vi.spyOn(Date.prototype, 'getDay').mockReturnValue(2)

    const repeat = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false }
    expect(isTodayRepeatDay(repeat)).toBe(false)
  })
})

describe('createDefaultUser', () => {
  it('should create a user with default stats', () => {
    const user = createDefaultUser()

    expect(user.name).toBe('Hero')
    expect(user.level).toBe(1)
    expect(user.xp).toBe(0)
    expect(user.health).toBe(50)
    expect(user.maxHealth).toBe(50)
    expect(user.mana).toBe(10)
    expect(user.maxMana).toBe(50)
    expect(user.gold).toBe(0)
  })

  it('should create a user with default avatar', () => {
    const user = createDefaultUser()

    expect(user.avatar.hair).toBe('short')
    expect(user.avatar.hairColor).toBe('#4A3728')
    expect(user.avatar.skin).toBe('#F5D0C5')
    expect(user.avatar.shirt).toBe('#3498db')
    expect(user.avatar.background).toBe('#e0f2fe')
    expect(user.avatar.accessories).toEqual([])
  })

  it('should create a user with starting stats of 1', () => {
    const user = createDefaultUser()

    expect(user.stats.strength).toBe(1)
    expect(user.stats.intelligence).toBe(1)
    expect(user.stats.constitution).toBe(1)
    expect(user.stats.perception).toBe(1)
  })

  it('should calculate XP for next level correctly', () => {
    const user = createDefaultUser()

    expect(user.xpToNextLevel).toBe(60) // calculateXPForLevel(2) = Math.floor(50 * 1.2^1) = 60
  })

  it('should not include id, created, or lastLogin', () => {
    const user = createDefaultUser()

    expect(user).not.toHaveProperty('id')
    expect(user).not.toHaveProperty('created')
    expect(user).not.toHaveProperty('lastLogin')
  })
})

describe('generateId', () => {
  it('should generate a unique ID', () => {
    const id1 = generateId()
    const id2 = generateId()

    expect(id1).not.toBe(id2)
  })

  it('should generate ID with timestamp prefix', () => {
    const id = generateId()
    const timestamp = Date.now()

    expect(id).toMatch(/^\d+-/)
    expect(parseInt(id.split('-')[0])).toBeLessThanOrEqual(timestamp)
  })

  it('should generate ID with random suffix', () => {
    const id = generateId()
    const parts = id.split('-')

    expect(parts.length).toBe(2)
    expect(parts[1]).toMatch(/^[a-z0-9]{9}$/)
  })

  it('should generate different IDs even when called quickly', () => {
    const ids = new Set()

    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }

    expect(ids.size).toBe(100)
  })
})
