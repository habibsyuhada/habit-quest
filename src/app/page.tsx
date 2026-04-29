import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">HabitQuest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-gray-900 sm:text-7xl">
              Build Better Habits,
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}Level Up Your Life
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Transform your daily routine into an epic adventure. Complete quests, earn XP, and become the best version of yourself.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="gap-2">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Ready-Made Templates
              </h3>
              <p className="text-gray-600">
                Choose from expert-designed 30-day habit templates for any goal
              </p>
            </div>

            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Gamified Progress
              </h3>
              <p className="text-gray-600">
                Earn XP, maintain streaks, and watch your life map come alive
              </p>
            </div>

            <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-8 shadow-xl">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Offline-First
              </h3>
              <p className="text-gray-600">
                Works anywhere, anytime. Your data syncs when you're back online
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
