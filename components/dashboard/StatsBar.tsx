'use client';

import { useGameStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Coins, Heart, Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsBar() {
  const user = useGameStore((state) => state.user);
  const levelProgress = (user.xp / user.xpToNextLevel) * 100;

  const healthPercent = (user.health / user.maxHealth) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Health */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Heart
              className={cn(
                'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0',
                healthPercent < 25
                  ? 'text-red-600 animate-pulse'
                  : 'text-red-500'
              )}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium dark:text-gray-200 text-xs sm:text-sm">Health</span>
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  {user.health}/{user.maxHealth}
                </span>
              </div>
              <Progress
                value={healthPercent}
                className="h-1.5 sm:h-2"
                indicatorClassName="bg-gradient-to-r from-red-500 to-red-600"
              />
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-yellow-500" />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium dark:text-gray-200 text-xs sm:text-sm">Level {user.level}</span>
                <span className="text-gray-600 dark:text-gray-400 text-xs">
                  {user.xp}/{user.xpToNextLevel} XP
                </span>
              </div>
              <Progress
                value={levelProgress}
                className="h-1.5 sm:h-2"
                indicatorClassName="bg-gradient-to-r from-yellow-500 to-yellow-600"
              />
            </div>
          </div>

          {/* Mana & Gold */}
          <div className="flex items-center justify-between space-x-2 sm:space-x-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <span className="text-xs sm:text-sm font-medium dark:text-gray-200">
                {user.mana}/{user.maxMana}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-500" />
              <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-400">
                {user.gold}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}