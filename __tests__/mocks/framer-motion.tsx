import { vi } from 'vitest'
import { ReactElement, HTMLAttributes, ButtonHTMLAttributes } from 'react'

// Mock Framer Motion components
export const motion = {
  div: vi.fn(({ children, ...props }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>),
  button: vi.fn(({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>),
  span: vi.fn(({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>),
  form: vi.fn(({ children, ...props }: HTMLAttributes<HTMLFormElement>) => <form {...props}>{children}</form>),
}

export const AnimatePresence = vi.fn(({ children }: { children: ReactElement }) => <>{children}</>)

// Mock useAnimation hook
export const useAnimation = vi.fn(() => ({
  start: vi.fn(),
  set: vi.fn(),
  stop: vi.fn(),
}))

// Mock useMotionValue hook
export const useMotionValue = vi.fn((initial: unknown) => ({
  value: initial,
  set: vi.fn(),
  get: vi.fn(),
  onChange: vi.fn(),
}))

// Mock motion value hooks
export const useTransform = vi.fn((value: unknown, _transform: unknown) => value)
export const useSpring = vi.fn((value: unknown, _config: unknown) => value)
