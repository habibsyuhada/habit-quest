'use client';

import { Card } from '@/components/ui/card';
import { Coins, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CROP_DEFINITIONS } from '@/lib/constants';
import { getCropImagePath } from '@/lib/game-mechanics';
import type { CropType } from '@/lib/types';

interface CropSelectorProps {
  selectedCrop: CropType | null;
  onSelectCrop: (crop: CropType | null) => void;
  userGold: number;
}

export function CropSelector({ selectedCrop, onSelectCrop, userGold }: CropSelectorProps) {
  return (
    <div>
      <div className="mb-3">
        <Card
          className={cn(
            'border-stone-200/60 dark:border-stone-800/60 bg-white/70 dark:bg-stone-900/50 backdrop-blur-sm transition-all duration-200 cursor-pointer p-3',
            selectedCrop === null && 'ring-2 ring-emerald-500 border-emerald-500'
          )}
          onClick={() => onSelectCrop(null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">No Seed</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Do not plant on empty dirt tiles.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Free</span>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {(Object.entries(CROP_DEFINITIONS) as [CropType, typeof CROP_DEFINITIONS[CropType]][]).map(
          ([crop, def]) => {
            const canAfford = userGold >= def.seedCost;
            const isSelected = selectedCrop === crop;
            return (
              <Card
                key={crop}
                className={cn(
                  'border-stone-200/60 dark:border-stone-800/60 bg-white/70 dark:bg-stone-900/50 backdrop-blur-sm transition-all duration-200 cursor-pointer p-3',
                  canAfford
                    ? 'hover:shadow-lg hover:border-amber-300/50'
                    : 'opacity-40 cursor-not-allowed',
                  isSelected && 'ring-2 ring-emerald-500 border-emerald-500'
                )}
                onClick={() => {
                  if (canAfford) {
                    onSelectCrop(crop);
                  }
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={getCropImagePath(crop, 0)}
                    alt={def.name}
                    style={{ imageRendering: 'pixelated' }}
                    className="w-9 h-9 object-contain"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {def.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <Clock className="h-3 w-3" />
                    <span>{def.growthDuration}s</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[11px]">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-amber-500" />
                      <span className="font-medium text-stone-700 dark:text-stone-300">{def.seedCost}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span className="font-medium text-stone-700 dark:text-stone-300">{def.goldReward}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}
