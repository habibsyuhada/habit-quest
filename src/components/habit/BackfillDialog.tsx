'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import { db, LocalUserHabit, LocalHabitLog } from '@/lib/local-db'

interface BackfillDialogProps {
  isOpen: boolean
  onClose: () => void
  habit: LocalUserHabit | null
  onSuccess: () => void
}

export function BackfillDialog({
  isOpen,
  onClose,
  habit,
  onSuccess,
}: BackfillDialogProps) {
  const [dates, setDates] = useState<Date[]>([])
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Generate last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i))
    setDates(last30Days)
  }, [])

  useEffect(() => {
    if (habit) {
      loadCompletedDates()
    }
  }, [habit])

  const loadCompletedDates = async () => {
    if (!habit) return

    const logs = await db.habit_logs
      .where('habitId')
      .equals(habit.id)
      .toArray()

    const completed = new Set(logs.map((log) => log.date.split('T')[0]))
    setCompletedDates(completed)
  }

  const toggleDate = async (date: Date) => {
    if (!habit) return

    const dateStr = format(date, 'yyyy-MM-dd')
    const newCompletedDates = new Set(completedDates)

    if (newCompletedDates.has(dateStr)) {
      // Uncomplete
      newCompletedDates.delete(dateStr)

      // Remove from IndexedDB
      await db.habit_logs
        .where('[habitId+date]')
        .equals([habit.id, dateStr])
        .delete()

      // Sync to server
      const { addToSyncQueue } = await import('@/lib/sync-utils')
      await addToSyncQueue({
        client_event_id: crypto.randomUUID(),
        event_type: 'HABIT_UNCOMPLETED',
        event_version: 1,
        client_created_at: new Date().toISOString(),
        payload: { habitId: habit.id, date: dateStr },
      })
    } else {
      // Complete
      newCompletedDates.add(dateStr)

      // Add to IndexedDB
      await db.habit_logs.put({
        id: crypto.randomUUID(),
        userId: habit.userId,
        habitId: habit.id,
        completedAt: new Date().toISOString(),
        xp: habit.xp,
        date: dateStr,
        createdAt: new Date().toISOString(),
      })

      // Sync to server
      const { addToSyncQueue } = await import('@/lib/sync-utils')
      await addToSyncQueue({
        client_event_id: crypto.randomUUID(),
        event_type: 'HABIT_COMPLETED',
        event_version: 1,
        client_created_at: new Date().toISOString(),
        payload: { habitId: habit.id, date: dateStr, xp: habit.xp },
      })
    }

    setCompletedDates(newCompletedDates)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md max-h-[80vh] overflow-hidden"
            >
              <div className="rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Backfill Progress
                    </h2>
                    <p className="text-sm text-gray-600">
                      {habit?.title}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Select days you completed this habit in the past
                  </p>
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isCompleted = completedDates.has(dateStr)

                    return (
                      <button
                        key={dateStr}
                        onClick={() => toggleDate(date)}
                        className={cn(
                          'w-full flex items-center justify-between rounded-2xl p-3 transition-all',
                          isCompleted
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <CalendarIcon className={cn(
                            'h-5 w-5',
                            isCompleted ? 'text-green-600' : 'text-gray-400'
                          )} />
                          <div className="text-left">
                            <div className={cn(
                              'font-medium',
                              isCompleted ? 'text-green-700' : 'text-gray-900'
                            )}>
                              {format(date, 'EEEE, MMM d')}
                            </div>
                            <div className={cn(
                              'text-xs',
                              isCompleted ? 'text-green-600' : 'text-gray-500'
                            )}>
                              {isToday(date) ? 'Today' : getRelativeDay(date)}
                            </div>
                          </div>
                        </div>

                        {isCompleted ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
                            <Check className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                            <Plus className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      onSuccess()
                      onClose()
                    }}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

function getRelativeDay(date: Date): string {
  const today = new Date()
  const yesterday = subDays(today, 1)

  if (isSameDay(date, yesterday)) {
    return 'Yesterday'
  }

  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  return `${daysDiff} days ago`
}
