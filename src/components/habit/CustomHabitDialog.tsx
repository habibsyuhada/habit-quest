'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db, LocalUserHabit } from '@/lib/local-db'

interface CustomHabitDialogProps {
  isOpen: boolean
  onClose: () => void
  habit?: LocalUserHabit | null
  onSuccess: () => void
}

export function CustomHabitDialog({
  isOpen,
  onClose,
  habit,
  onSuccess,
}: CustomHabitDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    description: habit?.description || '',
    xp: habit?.xp || 10,
  })

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title || '',
        description: habit.description || '',
        xp: habit.xp || 10,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        xp: 10,
      })
    }
    setError('')
  }, [habit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (habit) {
        // Update existing habit
        const response = await fetch(`/api/habits/${habit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const result = await response.json()

        if (result.success) {
          // Update local IndexedDB
          await db.user_habits.update(habit.id, {
            title: formData.title,
            description: formData.description || null,
            xp: formData.xp,
            updatedAt: new Date().toISOString(),
          })

          onSuccess()
          onClose()
        } else {
          setError(result.error?.message || 'Failed to update habit')
        }
      } else {
        // Create new habit
        const response = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        const result = await response.json()

        if (result.success) {
          // Add to local IndexedDB
          await db.user_habits.put({
            id: result.data.id,
            userId: result.data.userId,
            title: result.data.title,
            description: result.data.description || null,
            xp: result.data.xp,
            order: result.data.order,
            isActive: result.data.isActive,
            sourceTemplateId: result.data.sourceTemplateId,
            sourceTemplateVersion: result.data.sourceTemplateVersion,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          })

          onSuccess()
          onClose()
        } else {
          setError(result.error?.message || 'Failed to create habit')
        }
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <div className="rounded-3xl bg-white/90 backdrop-blur-sm p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {habit ? 'Edit Habit' : 'Create Custom Habit'}
                  </h2>
                  <button
                    onClick={onClose}
                    className="rounded-xl p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Habit Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Morning meditation"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      placeholder="What do you want to achieve?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      XP Reward
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.xp}
                      onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value) || 10 })}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      How much XP for completing this habit?
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Saving...'
                        : habit
                          ? 'Update Habit'
                          : 'Create Habit'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface AddHabitButtonProps {
  onHabitCreated: () => void
}

export function AddHabitButton({ onHabitCreated }: AddHabitButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50"
      >
        <Plus className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <span className="text-sm font-medium text-gray-600">
          Create Custom Habit
        </span>
      </button>

      <CustomHabitDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setIsDialogOpen(false)
          onHabitCreated()
        }}
      />
    </>
  )
}
