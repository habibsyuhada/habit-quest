import { vi } from 'vitest'

// Mock localStorage class
class LocalStorageMock {
  store: Record<string, string> = {}

  getItem = vi.fn((key: string) => this.store[key] || null)

  setItem = vi.fn((key: string, value: string) => {
    this.store[key] = value
  })

  removeItem = vi.fn((key: string) => {
    delete this.store[key]
  })

  clear = vi.fn(() => {
    this.store = {}
  })

  // Additional methods
  get length() {
    return Object.keys(this.store).length
  }

  key = vi.fn((index: number) => {
    const keys = Object.keys(this.store)
    return keys[index] || null
  })
}

export const localStorageMock = new LocalStorageMock()

// Reset localStorage between tests
export function resetLocalStorage() {
  localStorageMock.clear()
  vi.clearAllMocks()
}