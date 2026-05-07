import { vi } from 'vitest'
import { ReactElement } from 'react'

// Mock Framer Motion components
export const motion = {
  div: vi.fn(({ children, ...props }: any) => <div {...props}>{children}</div>),
  button: vi.fn(({ children, ...props }: any) => <button {...props}>{children}</button>),
  span: vi.fn(({ children, ...props }: any) => <span {...props}>{children}</span>),
  form: vi.fn(({ children, ...props }: any) => <form {...props}>{children}</form>),
}

export const AnimatePresence = vi.fn(({ children }: { children: ReactElement }) => <>{children}</>)

// Mock useAnimation hook
export const useAnimation = vi.fn(() => ({
  start: vi.fn(),
  set: vi.fn(),
  stop: vi.fn(),
}))

// Mock useMotionValue hook
export const useMotionValue = vi.fn((initial: any) => ({
  value: initial,
  set: vi.fn(),
  get: vi.fn(),
  onChange: vi.fn(),
}))

// Mock motion value hooks
export const useTransform = vi.fn((value: any, transform: any) => value)
export const useSpring = vi.fn((value: any, config: any) => value)