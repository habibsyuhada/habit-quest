'use client'

import { motion } from 'framer-motion'
import { Lock, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TemplateCardProps {
  title: string
  description: string
  category: string
  duration: number
  isPremium: boolean
  coverGradient: string | null
  difficulty: string
  onClick: () => void
}

export function TemplateCard({
  title,
  description,
  category,
  duration,
  isPremium,
  coverGradient,
  difficulty,
  onClick,
}: TemplateCardProps) {
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500'
      case 'intermediate':
        return 'bg-amber-500'
      case 'advanced':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getGradient = () => {
    if (coverGradient) {
      return coverGradient
    }
    if (isPremium) {
      return 'from-purple-500 to-pink-500'
    }
    return 'from-blue-500 to-indigo-500'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      <div className={cn(
        'rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl',
        getGradient()
      )}>
        {isPremium && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold backdrop-blur-sm">
            <Star className="h-4 w-4 fill-white" />
            Premium
          </div>
        )}

        <div className="mb-4">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {category}
          </span>
        </div>

        <h3 className="mb-2 text-2xl font-bold">{title}</h3>
        <p className="mb-4 text-sm text-white/80 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{duration} days</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', getDifficultyColor())} />
            <span className="text-sm capitalize">{difficulty}</span>
          </div>
        </div>

        {isPremium && (
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-8 w-8" />
              <span className="text-lg font-bold">Premium</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
