export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1
}

export function calculateXpForLevel(level: number): number {
  return (level - 1) * 100
}

export function calculateXpProgress(totalXp: number): number {
  return totalXp % 100
}

export function calculateNextLevelXp(totalXp: number): number {
  return Math.ceil((totalXp + 1) / 100) * 100
}
