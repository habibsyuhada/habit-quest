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
    <div className="min-h-screen bg-gray-50">
      <StatsBar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to turn your life into an adventure?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Swords className="h-5 w-5 text-purple-600" />
              <span>Character Stats</span>
            </CardTitle>
            <CardDescription>
              Your character grows as you complete tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Strength</p>
                <p className="text-xl font-bold text-red-600">{user.stats.strength}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Intelligence</p>
                <p className="text-xl font-bold text-blue-600">{user.stats.intelligence}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Constitution</p>
                <p className="text-xl font-bold text-green-600">{user.stats.constitution}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Perception</p>
                <p className="text-xl font-bold text-purple-600">{user.stats.perception}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/tasks">
                <Button className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Task
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" size="lg">
                  <Trophy className="mr-2 h-4 w-4" />
                  Visit Shop
                </Button>
              </Link>
              <Link href="/avatar">
                <Button variant="outline" className="w-full" size="lg">
                  <Swords className="mr-2 h-4 w-4" />
                  Customize Avatar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>🎯 Create habits to build positive routines</p>
              <p>📅 Set up dailies for recurring tasks</p>
              <p>✅ Add to-dos for one-time goals</p>
              <p>🏪 Earn gold and shop for rewards</p>
              <p>⚔️ Level up and grow your stats</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}