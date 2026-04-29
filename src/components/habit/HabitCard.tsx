'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface HabitCardProps {
  title: string
  description?: string | null
  xp: number
  isCompleted: boolean
  onComplete: () => void
  onUncomplete: () => void
}

export function HabitCard({
  title,
  description,
  xp,
  isCompleted,
  onComplete,
  onUncomplete,
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = () => {
    if (isCompleted) {
      onUncomplete()
    } else {
      setIsAnimating(true)
      onComplete()
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={handleClick}
        className={cn(
          'w-full rounded-3xl p-4 text-left transition-all',
          isCompleted
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
            : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-md hover:shadow-lg'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl transition-all',
              isCompleted
                ? 'bg-white/20'
                : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
            )}
          >
            {isAnimating ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <Check className="h-6 w-6" />
              </motion.div>
            ) : isCompleted ? (
              <Check className="h-6 w-6" />
            ) : (
              <ChevronRight className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold truncate',
              isCompleted ? 'text-white' : 'text-gray-900'
            )}>
              {title}
            </h3>
            {description && (
              <p className={cn(
                'text-sm truncate',
                isCompleted ? 'text-white/80' : 'text-gray-500'
              )}>
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              'flex flex-shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold',
              isCompleted
                ? 'bg-white/20 text-white'
                : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
            )}
          >
            <span>+{xp}</span>
            <span className="text-xs">XP</span>
          </div>
        </div>
      </button>
    </motion.div>
  )
}
