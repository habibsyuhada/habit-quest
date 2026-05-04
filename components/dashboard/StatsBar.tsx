'use client';

import { useGameStore } from '@/lib/store';
import { Progress } from '@/components/ui/progress';
import { Coins, Heart, Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsBar() {
  const user = useGameStore((state) => state.user);
  const levelProgress = (user.xp / user.xpToNextLevel) * 100;

  const healthPercent = (user.health / user.maxHealth) * 100;
  const manaPercent = (user.mana / user.maxMana) * 100;

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health */}
          <div className="flex items-center space-x-3">
            <Heart
              className={cn(
                'h-5 w-5 flex-shrink-0',
                healthPercent < 25
                  ? 'text-red-600 animate-pulse'
                  : 'text-red-500'
              )}
            />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Health</span>
                <span className="text-gray-600">
                  {user.health}/{user.maxHealth}
                </span>
              </div>
              <Progress
                value={healthPercent}
                className="h-2"
                indicatorClassName="bg-gradient-to-r from-red-500 to-red-600"
              />
            </div>
          </div>

          {/* XP */}
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 flex-shrink-0 text-yellow-500" />
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">Level {user.level}</span>
                <span className="text-gray-600">
                  {user.xp}/{user.xpToNextLevel} XP
                </span>
              </div>
              <Progress
                value={levelProgress}
                className="h-2"
                indicatorClassName="bg-gradient-to-r from-yellow-500 to-yellow-600"
              />
            </div>
          </div>

          {/* Mana & Gold */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">
                {user.mana}/{user.maxMana}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">
                {user.gold}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}