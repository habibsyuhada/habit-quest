'use client';

import { useEffect } from 'react';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Swords, Trophy, Target, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';

export default function Home() {
  const user = useGameStore((state) => state.user);
  const tasks = useGameStore((state) => state.tasks);
  const checkDailies = useGameStore((state) => state.checkDailies);

  useEffect(() => {
    checkDailies();
  }, [checkDailies]);

  const habitCount = tasks.filter((t) => t.type === 'habit').length;
  const dailyCount = tasks.filter((t) => t.type === 'daily').length;
  const todoCount = tasks.filter((t) => t.type === 'todo').length;
  const completedTodos = tasks.filter((t) => t.type === 'todo' && t.completed).length;

  const stats = [
    {
      title: 'Habits',
      value: habitCount,
      icon: Target,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Dailies',
      value: dailyCount,
      icon: Zap,
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      title: 'To-Dos',
      value: `${completedTodos}/${todoCount}`,
      icon: Trophy,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0c0b]">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
              Welcome back, {user.name}!
            </h1>
          </div>
          <p className="text-stone-600 dark:text-stone-400 text-base sm:text-lg">
            Your adventure continues. Ready for today&apos;s quests?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bgColor} p-3 rounded-2xl`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">{stat.title}</p>
                      <p className="text-2xl font-heading font-bold text-stone-900 dark:text-stone-100">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Character Stats */}
        <Card className="mb-8 border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl">
                <Swords className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span>Hero Stats</span>
            </CardTitle>
            <CardDescription className="text-stone-600 dark:text-stone-400">
              Complete quests to grow stronger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Strength', value: user.stats.strength, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
                { name: 'Intellect', value: user.stats.intelligence, color: 'text-sky-500', bg: 'bg-sky-100 dark:bg-sky-900/30' },
                { name: 'Vitality', value: user.stats.constitution, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                { name: 'Focus', value: user.stats.perception, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
              ].map((stat) => (
                <div key={stat.name} className="text-center">
                  <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                    <span className="font-heading font-bold text-lg">{stat.value}</span>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">{stat.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasks" className="block">
                <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Quest
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/shop">
                  <Button variant="outline" className="w-full h-12 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800" size="lg">
                    <Trophy className="mr-2 h-4 w-4" />
                    Shop
                  </Button>
                </Link>
                <Link href="/avatar">
                  <Button variant="outline" className="w-full h-12 border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800" size="lg">
                    <Swords className="mr-2 h-4 w-4" />
                    Hero
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-stone-600 dark:text-stone-400">
              <div className="flex items-start gap-3">
                <span className="text-xl">🎯</span>
                <p className="text-sm">Build positive habits that stick</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">📅</span>
                <p className="text-sm">Set up daily quests for routine tasks</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">✅</span>
                <p className="text-sm">Track one-time goals and achievements</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">🏪</span>
                <p className="text-sm">Earn gold and unlock rewards</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl">⚔️</span>
                <p className="text-sm">Level up and grow your hero</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
