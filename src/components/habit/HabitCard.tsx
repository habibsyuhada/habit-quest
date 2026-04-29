'use client'

import { motion } from 'framer-motion'
import { Check, ChevronRight, MoreVertical, Pencil, Trash2, Calendar, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import { Habit as HabitType, HabitOption as HabitOptionType, HabitLog } from '@/types/habit'
import { HabitOptionsDialog } from './HabitOptionsDialog'
import { getHabitProgress, formatPeriodLabel } from '@/lib/habit-progress'

interface HabitCardProps {
  habit: any & { options?: HabitOptionType[] }
  logs?: HabitLog[]
  isCompleted: boolean
  progress?: {
    currentCount: number
    targetCount: number
    percentage: number
    isCompleted: boolean
  }
  onComplete: (optionIds?: string[]) => void
  onUncomplete: () => void
  onEdit: (habit: any) => void
  onDelete: (habitId: string) => void
  onBackfill?: (habit: any) => void
  showActions?: boolean
  onDayClick?: (date: string) => void
}

export function HabitCard({
  habit,
  logs = [],
  isCompleted,
  progress,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onBackfill,
  showActions = true,
  onDayClick,
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const hasOptions = habit.options && habit.options.length > 0

  const handleClick = () => {
    if (hasOptions) {
      // Open options dialog
      setShowOptionsDialog(true)
    } else if (isCompleted) {
      onUncomplete()
    } else {
      setIsAnimating(true)
      onComplete()
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleCompleteWithOptions = async (selectedOptions: string[], note?: string) => {
    try {
      const response = await fetch(`/api/habits/${habit.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          note,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onComplete(selectedOptions)
      } else {
        throw new Error(result.error?.message || 'Failed to complete habit')
      }
    } catch (error: any) {
      alert(error.message || 'Failed to complete habit')
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative',
          showMenu && 'z-[100]'
        )}
      >
        <div
          className={cn(
            'w-full rounded-3xl p-4 text-left transition-all cursor-pointer',
            isCompleted
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
              : 'bg-white/80 backdrop-blur-sm text-gray-900 shadow-md hover:shadow-lg'
          )}
          onClick={handleClick}
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
              ) : hasOptions ? (
                <ListChecks className="h-6 w-6" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  'font-semibold truncate',
                  isCompleted ? 'text-white' : 'text-gray-900'
                )}>
                  {habit.title}
                </h3>

                {habit.categoryAssignments && habit.categoryAssignments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {habit.categoryAssignments.map((ca: any) => (
                      ca.category && (
                        <span
                          key={ca.categoryId}
                          className="flex-shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: ca.category.color + '20',
                            color: ca.category.color,
                          }}
                        >
                          {ca.category.icon ? `${ca.category.icon} ` : ''}{ca.category.name}
                        </span>
                      )
                    ))}
                  </div>
                )}
              </div>

              {habit.description && (
                <p className={cn(
                  'text-sm truncate',
                  isCompleted ? 'text-white/80' : 'text-gray-500'
                )}>
                  {habit.description}
                </p>
              )}

              {/* Progress indicator */}
              {progress && progress.targetCount > 1 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={isCompleted ? 'text-white/80' : 'text-gray-600'}>
                      {formatPeriodLabel(habit.recurrenceType, new Date())}
                    </span>
                    <span className={cn('font-medium', isCompleted ? 'text-white' : 'text-gray-900')}>
                      {progress.currentCount}/{progress.targetCount}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress.percentage}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'h-full rounded-full',
                        isCompleted ? 'bg-white' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Options indicator */}
              {hasOptions && !isCompleted && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <ListChecks className="h-3 w-3" />
                  <span>{habit.options!.length} options available</span>
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex flex-shrink-0 flex-col items-end gap-1',
                isCompleted ? 'text-white' : 'text-gray-900'
              )}
            >
              <div
                className={cn(
                  'flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold',
                  isCompleted
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                )}
              >
                <span>+{habit.xp}</span>
                <span className="text-xs">XP</span>
              </div>

              {showActions && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(!showMenu)
                    }}
                    className={cn(
                      'rounded-xl p-2 transition-all',
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
                      className="absolute right-0 top-12 z-[100] w-48 rounded-2xl bg-white shadow-xl border border-gray-200 py-2"
                      onClick={(e) => e.stopPropagation()}
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

                      {onBackfill && (
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
                      )}

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
          </div>
        </div>
      </motion.div>

      {/* Options Dialog */}
      {hasOptions && (
        <HabitOptionsDialog
          isOpen={showOptionsDialog}
          onClose={() => setShowOptionsDialog(false)}
          habitId={habit.id}
          habitTitle={habit.title}
          options={habit.options!}
          baseXP={habit.xp}
          onComplete={handleCompleteWithOptions}
        />
      )}
    </>
  )
}
