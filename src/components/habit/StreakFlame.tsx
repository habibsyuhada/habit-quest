'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakFlameProps {
  streak: number
  className?: string
}

export function StreakFlame({ streak, className }: StreakFlameProps) {
  const getFlameSize = () => {
    if (streak >= 30) return 'text-4xl'
    if (streak >= 14) return 'text-3xl'
    if (streak >= 7) return 'text-2xl'
    return 'text-xl'
  }

  const getFlameColor = () => {
    if (streak >= 30) return 'from-purple-500 to-pink-500'
    if (streak >= 14) return 'from-orange-500 to-red-500'
    if (streak >= 7) return 'from-amber-500 to-orange-500'
    return 'from-yellow-500 to-amber-500'
  }

  const getFlameAnimation = () => {
    if (streak >= 7) {
      return {
        animate: {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        },
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      }
    }
    return {}
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        className={`bg-gradient-to-br ${getFlameColor()} bg-clip-text ${getFlameSize()}`}
        {...getFlameAnimation()}
      >
        <Flame className="h-8 w-8 fill-current" />
      </motion.div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-600">Streak</span>
        <span className="text-lg font-bold text-gray-900">{streak}</span>
      </div>
    </div>
  )
}
