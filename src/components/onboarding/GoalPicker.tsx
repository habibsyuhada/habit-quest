'use client'

import { motion } from 'framer-motion'
import { Heart, Briefcase, BookOpen, Moon, Wallet, Brain, Sparkles, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Goal {
  id: string
  name: string
  icon: any
  gradient: string
}

const goals: Goal[] = [
  { id: 'health', name: 'Health', icon: Heart, gradient: 'from-green-500 to-emerald-500' },
  { id: 'productivity', name: 'Productivity', icon: Briefcase, gradient: 'from-blue-500 to-indigo-500' },
  { id: 'study', name: 'Study', icon: BookOpen, gradient: 'from-purple-500 to-violet-500' },
  { id: 'faith', name: 'Faith', icon: Moon, gradient: 'from-teal-500 to-cyan-500' },
  { id: 'finance', name: 'Finance', icon: Wallet, gradient: 'from-yellow-500 to-gold-500' },
  { id: 'mental', name: 'Mental Wellness', icon: Brain, gradient: 'from-pink-500 to-rose-500' },
  { id: 'self-care', name: 'Self Care', icon: Sparkles, gradient: 'from-fuchsia-500 to-pink-500' },
  { id: 'developer', name: 'Developer Growth', icon: Code, gradient: 'from-orange-500 to-amber-500' },
]

interface GoalPickerProps {
  onSelect: (goal: string) => void
  className?: string
}

export function GoalPicker({ onSelect, className }: GoalPickerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-gray-900">
          What do you want to improve?
        </h2>
        <p className="text-gray-600">
          Choose a goal to get personalized habit templates
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(goal.id)}
              className="cursor-pointer"
            >
              <div className={cn(
                'rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl',
                goal.gradient
              )}>
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">{goal.name}</h3>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
