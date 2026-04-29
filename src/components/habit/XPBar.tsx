'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Zap } from 'lucide-react'

interface XPBarProps {
  currentXP: number
  nextLevelXP: number
  level: number
  className?: string
}

export function XPBar({ currentXP, nextLevelXP, level, className }: XPBarProps) {
  const progress = currentXP % 100
  const percentage = (progress / 100) * 100

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-bold text-gray-900">Level {level}</span>
        </div>
        <span className="text-sm text-gray-600">
          {progress} / 100 XP
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
