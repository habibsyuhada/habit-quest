'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RecurrenceType } from '@/types/habit'
import { HabitCategory } from '@/types/habit'

interface HabitOption {
  id?: string
  label: string
  description?: string
  exp?: number
  sortOrder: number
  isActive?: boolean
}

interface CustomHabitDialogProps {
  isOpen: boolean
  onClose: () => void
  habit?: any | null
  onSuccess: () => void
}

const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
]

const DEFAULT_CATEGORIES: HabitCategory[] = [
  { id: 'cat-health', userId: null, name: 'Health', color: '#10B981', icon: '❤️', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-productivity', userId: null, name: 'Productivity', color: '#3B82F6', icon: '⚡', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-learning', userId: null, name: 'Learning', color: '#8B5CF6', icon: '📚', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-finance', userId: null, name: 'Finance', color: '#F59E0B', icon: '💰', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-social', userId: null, name: 'Social', color: '#EC4899', icon: '👥', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-spiritual', userId: null, name: 'Spiritual', color: '#6366F1', icon: '🧘', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-mindfulness', userId: null, name: 'Mindfulness', color: '#14B8A6', icon: '🌿', createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-personal', userId: null, name: 'Personal', color: '#6B7280', icon: '🎯', createdAt: new Date(), updatedAt: new Date() },
]

export function CustomHabitDialog({
  isOpen,
  onClose,
  habit,
  onSuccess,
}: CustomHabitDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<HabitCategory[]>(DEFAULT_CATEGORIES)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    title: habit?.title || '',
    description: habit?.description || '',
    xp: habit?.xp || 10,
    recurrenceType: habit?.recurrenceType || 'DAILY',
    targetCount: habit?.targetCount || 1,
    categoryIds: habit?.categoryAssignments?.map((ca: any) => ca.categoryId) || [],
    allowMultipleCompletions: habit?.allowMultipleCompletions || false,
    options: [] as HabitOption[],
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const result = await response.json()
        if (result.success) {
          setCategories(result.data)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  // Load habit options when editing
  useEffect(() => {
    if (habit && habit.options) {
      setFormData(prev => ({
        ...prev,
        options: habit.options.map((opt: any) => ({
          id: opt.id,
          label: opt.label,
          description: opt.description || '',
          exp: opt.exp,
          sortOrder: opt.sortOrder,
          isActive: opt.isActive,
        })),
      }))
    }
  }, [habit, isOpen])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setFormData({
          title: habit.title || '',
          description: habit.description || '',
          xp: habit.xp || 10,
          recurrenceType: habit.recurrenceType || 'DAILY',
          targetCount: habit.targetCount || 1,
          categoryIds: habit.categoryAssignments?.map((ca: any) => ca.categoryId) || [],
          allowMultipleCompletions: habit.allowMultipleCompletions || false,
          options: habit.options?.map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            description: opt.description || '',
            exp: opt.exp,
            sortOrder: opt.sortOrder,
            isActive: opt.isActive,
          })) || [],
        })
      } else {
        setFormData({
          title: '',
          description: '',
          xp: 10,
          recurrenceType: 'DAILY',
          targetCount: 1,
          categoryIds: [],
          allowMultipleCompletions: false,
          options: [],
        })
      }
      setError('')
    }
  }, [habit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const endpoint = habit ? `/api/habits/${habit.id}` : '/api/habits'
      const method = habit ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error?.message || 'Failed to save habit')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          label: '',
          description: '',
          exp: 10,
          sortOrder: formData.options.length,
          isActive: true,
        },
      ],
    })
  }

  const updateOption = (index: number, field: keyof HabitOption, value: any) => {
    const newOptions = [...formData.options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setFormData({ ...formData, options: newOptions })
  }

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    })
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

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl my-8"
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
                  {/* Title */}
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

                  {/* Description */}
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

                  {/* Basic Settings */}
                  <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Categories (Select multiple)
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-2xl p-2">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={formData.categoryIds.includes(cat.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] })
                                } else {
                                  setFormData({ ...formData, categoryIds: formData.categoryIds.filter((id: string) => id !== cat.id) })
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">
                              {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Select one or more categories for this habit
                      </p>
                    </div>
                  </div>

                  {/* Advanced Settings Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    />
                    Advanced Settings
                  </button>

                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 border-t border-gray-200 pt-4"
                    >
                      {/* Recurrence Type */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Recurrence Type
                        </label>
                        <select
                          value={formData.recurrenceType}
                          onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value as RecurrenceType })}
                          className="flex h-10 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-all focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                        >
                          {RECURRENCE_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Target Count */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Target Count per {formData.recurrenceType.toLowerCase()}
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.targetCount}
                          onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) || 1 })}
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          How many times do you want to complete this habit each {formData.recurrenceType.toLowerCase()}?
                        </p>
                      </div>

                      {/* Allow Multiple Completions */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allowMultiple"
                          checked={formData.allowMultipleCompletions}
                          onChange={(e) => setFormData({ ...formData, allowMultipleCompletions: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="allowMultiple" className="text-sm text-gray-700">
                          Allow multiple completions per day
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* Habit Options */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Habit Options (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        <Plus className="h-4 w-4" />
                        Add Option
                      </button>
                    </div>

                    {formData.options.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Add options to create sub-tasks for this habit. Leave empty for a simple habit.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {formData.options.map((option, index) => (
                          <div key={index} className="rounded-xl border border-gray-200 p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Option {index + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder="Option label"
                                value={option.label}
                                onChange={(e) => updateOption(index, 'label', e.target.value)}
                                required
                              />

                              <Input
                                type="text"
                                placeholder="Description (optional)"
                                value={option.description}
                                onChange={(e) => updateOption(index, 'description', e.target.value)}
                              />

                              <Input
                                type="number"
                                placeholder="XP reward (optional)"
                                min="0"
                                value={option.exp || ''}
                                onChange={(e) => updateOption(index, 'exp', parseInt(e.target.value) || undefined)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
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
