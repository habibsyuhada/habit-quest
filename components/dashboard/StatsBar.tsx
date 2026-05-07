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
    <div className="bg-[#fafaf9] dark:bg-[#0c0c0b] border-b border-stone-200/60 dark:border-stone-800/60">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Health */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                'absolute inset-0 bg-red-500/20 rounded-full blur-lg',
                healthPercent < 25 && 'animate-pulse'
              )} />
              <Heart
                className={cn(
                  'relative h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0',
                  healthPercent < 25 ? 'text-red-500' : 'text-red-500'
                )}
                strokeWidth={2.5}
                fill={healthPercent < 25 ? 'none' : 'currentColor'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-heading font-semibold text-stone-700 dark:text-stone-300 text-xs sm:text-sm">Health</span>
                <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
                  {user.health}/{user.maxHealth}
                </span>
              </div>
              <Progress
                value={healthPercent}
                className="h-2 sm:h-2.5 bg-stone-200 dark:bg-stone-800"
                indicatorClassName={cn(
                  'bg-gradient-to-r shadow-lg',
                  healthPercent < 25
                    ? 'from-red-500 to-red-600 shadow-red-500/30'
                    : 'from-red-400 to-red-500 shadow-red-400/20'
                )}
              />
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg" />
              <Zap className="relative h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-amber-500" strokeWidth={2.5} fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-heading font-semibold text-stone-700 dark:text-stone-300 text-xs sm:text-sm">Level {user.level}</span>
                <span className="text-stone-500 dark:text-stone-400 text-xs font-medium">
                  {user.xp}/{user.xpToNextLevel}
                </span>
              </div>
              <Progress
                value={levelProgress}
                className="h-2 sm:h-2.5 bg-stone-200 dark:bg-stone-800"
                indicatorClassName="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/30"
              />
            </div>
          </div>

          {/* Mana & Gold */}
          <div className="flex items-center justify-between gap-4 sm:gap-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-lg" />
                <Droplets className="relative h-5 w-5 sm:h-6 sm:w-6 text-sky-500" strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="text-sm font-heading font-semibold text-stone-700 dark:text-stone-300">
                {user.mana}/{user.maxMana}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-lg" />
                <Coins className="relative h-5 w-5 sm:h-6 sm:w-6 text-amber-500" strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="text-sm font-heading font-bold text-amber-600 dark:text-amber-400">
                {user.gold}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
