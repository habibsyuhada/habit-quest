'use client';

import { useEffect } from 'react';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Swords, Trophy, Target, Zap } from 'lucide-react';
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
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Dailies',
      value: dailyCount,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'To-Dos',
      value: `${completedTodos}/${todoCount}`,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Ready to turn your life into an adventure?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
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
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Swords className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span>Character Stats</span>
            </CardTitle>
            <CardDescription>
              Your character grows as you complete tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Strength</p>
                <p className="text-lg sm:text-xl font-bold text-red-600">{user.stats.strength}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Intelligence</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{user.stats.intelligence}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Constitution</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{user.stats.constitution}</p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Perception</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600">{user.stats.perception}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasks">
                <Button className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Create New Task</span>
                  <span className="sm:hidden">New Task</span>
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" size="lg">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Visit Shop</span>
                  <span className="sm:hidden">Shop</span>
                </Button>
              </Link>
              <Link href="/avatar">
                <Button variant="outline" className="w-full" size="lg">
                  <Swords className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Customize Avatar</span>
                  <span className="sm:hidden">Avatar</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="text-xs sm:text-sm">🎯 Create habits to build positive routines</p>
              <p className="text-xs sm:text-sm">📅 Set up dailies for recurring tasks</p>
              <p className="text-xs sm:text-sm">✅ Add to-dos for one-time goals</p>
              <p className="text-xs sm:text-sm">🏪 Earn gold and shop for rewards</p>
              <p className="text-xs sm:text-sm">⚔️ Level up and grow your stats</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}