'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight, MoreVertical, Pencil, Trash2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { LocalUserHabit } from '@/lib/local-db'

interface HabitCardProps {
  habit: LocalUserHabit
  isCompleted: boolean
  onComplete: () => void
  onUncomplete: () => void
  onEdit: (habit: LocalUserHabit) => void
  onDelete: (habitId: string) => void
  onBackfill: (habit: LocalUserHabit) => void
  showActions?: boolean
}

export function HabitCard({
  habit,
  isCompleted,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onBackfill,
  showActions = true,
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

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
      className="relative"
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
              {habit.title}
            </h3>
            {habit.description && (
              <p className={cn(
                'text-sm truncate',
                isCompleted ? 'text-white/80' : 'text-gray-500'
              )}>
                {habit.description}
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
            <span>+{habit.xp}</span>
            <span className="text-xs">XP</span>
          </div>

          {showActions && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className={cn(
                  'ml-2 rounded-xl p-2 transition-all',
                  isCompleted
                    ? 'hover:bg-white/20'
                    : 'hover:bg-gray-100'
                )}
              >
                <MoreVertical className={cn(
                  'h-5 w-5',
                  isCompleted ? 'text-white' : 'text-gray-500'
                )} />
              </button>

              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-12 z-10 w-48 rounded-2xl bg-white shadow-xl border border-gray-200 py-2"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onEdit(habit)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Habit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onBackfill(habit)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Calendar className="h-4 w-4" />
                    Backfill Progress
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(false)
                      onDelete(habit.id)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Habit
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </button>
    </motion.div>
  )
}
