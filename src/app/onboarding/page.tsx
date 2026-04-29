'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoalPicker } from '@/components/onboarding/GoalPicker'
import { db } from '@/lib/local-db'
import { useSession } from 'next-auth/react'

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGoalSelect = async (goal: string) => {
    setSelectedGoal(goal)
    setIsLoading(true)

    try {
      await db.settings.update('settings', {
        selectedGoal: goal,
        onboardingCompleted: true,
      })

      setTimeout(() => {
        router.push('/templates')
      }, 500)
    } catch (error) {
      console.error('Failed to save goal:', error)
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
          <p className="text-gray-600">Setting up your journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="mx-auto max-w-4xl py-12">
        <GoalPicker onSelect={handleGoalSelect} />
      </div>
    </div>
  )
}
