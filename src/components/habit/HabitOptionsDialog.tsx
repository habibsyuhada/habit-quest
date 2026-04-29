'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HabitOption as HabitOptionType } from '@/types/habit'

interface HabitOptionsDialogProps {
  isOpen: boolean
  onClose: () => void
  habitId: string
  habitTitle: string
  options: HabitOptionType[]
  baseXP: number
  onComplete: (selectedOptions: string[], note?: string) => Promise<void>
}

export function HabitOptionsDialog({
  isOpen,
  onClose,
  habitId,
  habitTitle,
  options,
  baseXP,
  onComplete,
}: HabitOptionsDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOptions(new Set())
      setNote('')
      setError('')
    }
  }, [isOpen])

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions)
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId)
    } else {
      newSelected.add(optionId)
    }
    setSelectedOptions(newSelected)
  }

  const calculateTotalXP = () => {
    let total = 0
    selectedOptions.forEach((optionId) => {
      const option = options.find((o) => o.id === optionId)
      if (option?.exp) {
        total += option.exp
      } else {
        total += baseXP
      }
    })
    return total
  }

  const handleSubmit = async () => {
    if (selectedOptions.size === 0) {
      setError('Please select at least one option')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onComplete(Array.from(selectedOptions), note || undefined)
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to complete habit')
    } finally {
      setIsSubmitting(false)
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
                    Complete {habitTitle}
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

                <div className="space-y-3 mb-4">
                  <p className="text-sm text-gray-600">
                    Select the options you completed:
                  </p>

                  {options.map((option) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => toggleOption(option.id!)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
                        selectedOptions.has(option.id!)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                            selectedOptions.has(option.id!)
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedOptions.has(option.id!) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                              {option.label}
                            </h3>
                            <span
                              className={`rounded-lg px-2 py-1 text-xs font-bold ${
                                selectedOptions.has(option.id!)
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              +{option.exp || baseXP} XP
                            </span>
                          </div>

                          {option.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Note Input */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Note (optional)
                  </label>
                  <textarea
                    placeholder="How did it go?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex min-h-[60px] w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
                    rows={2}
                  />
                </div>

                {/* Total XP Preview */}
                {selectedOptions.size > 0 && (
                  <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Total XP to earn:
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        +{calculateTotalXP()} XP
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={isSubmitting || selectedOptions.size === 0}
                  >
                    {isSubmitting ? 'Saving...' : 'Complete'}
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
