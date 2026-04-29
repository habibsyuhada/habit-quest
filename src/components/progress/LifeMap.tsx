'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LifeMapProps {
  currentDay: number
  completedDays: number[]
  totalDays: number
  className?: string
}

const milestones = [1, 3, 7, 14, 21, 30]

export function LifeMap({
  currentDay,
  completedDays,
  totalDays = 30,
  className,
}: LifeMapProps) {
  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) {
      return 'completed'
    }
    if (day === currentDay) {
      return 'current'
    }
    if (day < currentDay) {
      return 'missed'
    }
    return 'future'
  }

  const getMilestoneLabel = (day: number) => {
    switch (day) {
      case 1:
        return 'Start'
      case 3:
        return 'Day 3'
      case 7:
        return 'Week 1'
      case 14:
        return 'Week 2'
      case 21:
        return 'Week 3'
      case 30:
        return 'Complete'
      default:
        return `Day ${day}`
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Journey</h2>
        <p className="text-sm text-gray-600">
          Day {currentDay} of {totalDays}
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gray-200 rounded-full" />

        <div className="space-y-8">
          {milestones.map((milestone, index) => {
            const status = getDayStatus(milestone)
            const isLeft = index % 2 === 0

            return (
              <motion.div
                key={milestone}
                initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center"
              >
                <div
                  className={cn(
                    'flex w-1/2 flex-col items-center gap-2',
                    isLeft ? 'items-end pr-8' : 'items-start pl-8'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-2xl p-4 text-center',
                      status === 'completed' && 'bg-green-100 text-green-700',
                      status === 'current' && 'bg-blue-100 text-blue-700',
                      status === 'missed' && 'bg-red-100 text-red-700',
                      status === 'future' && 'bg-gray-100 text-gray-500'
                    )}
                  >
                    <div className="text-sm font-semibold">
                      {getMilestoneLabel(milestone)}
                    </div>
                    {status === 'completed' && (
                      <div className="text-xs text-green-600">
                        Completed! 🎉
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                    className={cn(
                      'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 bg-white shadow-lg',
                      status === 'completed' && 'border-green-500',
                      status === 'current' && 'border-blue-500',
                      status === 'missed' && 'border-red-500',
                      status === 'future' && 'border-gray-300'
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500 fill-green-500" />
                    ) : status === 'current' ? (
                      <div className="h-6 w-6 animate-pulse rounded-full bg-blue-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
