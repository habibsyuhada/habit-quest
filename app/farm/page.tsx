'use client';

import { StatsBar } from '@/components/dashboard/StatsBar';
import { FarmGrid } from '@/components/farm/FarmGrid';
import { useGameStore } from '@/lib/store';
import { Sprout, Coins } from 'lucide-react';

export default function FarmPage() {
  const user = useGameStore((state) => state.user);

  return (
    <div className="min-h-screen bg-theme-secondary">
      <StatsBar />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/20 rounded-xl blur-lg" />
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 rounded-xl shadow-lg">
                <Sprout className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-theme-primary">Farm</h1>
              <p className="text-sm text-theme-secondary mt-0.5">Grow crops and harvest rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
            <Coins className="h-5 w-5 text-amber-500" strokeWidth={2.5} fill="currentColor" />
            <span className="font-heading font-bold text-amber-600-custom">{user.gold}</span>
          </div>
        </div>

        {/* Farm Grid */}
        <FarmGrid />
      </main>
    </div>
  );
}
