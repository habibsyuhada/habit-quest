'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Coins, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CROP_DEFINITIONS } from '@/lib/constants';
import { getCropImagePath } from '@/lib/game-mechanics';
import type { CropType } from '@/lib/types';

interface CropSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCrop: (crop: CropType) => void;
  userGold: number;
}

export function CropSelector({ open, onOpenChange, onSelectCrop, userGold }: CropSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Choose a Crop</DialogTitle>
          <DialogDescription>
            Select a crop to plant. You need enough gold to buy seeds.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
          {(Object.entries(CROP_DEFINITIONS) as [CropType, typeof CROP_DEFINITIONS[CropType]][]).map(
            ([crop, def]) => {
              const canAfford = userGold >= def.seedCost;
              return (
                <Card
                  key={crop}
                  className={cn(
                    'border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm transition-all duration-200 cursor-pointer p-3',
                    canAfford
                      ? 'hover:shadow-lg hover:border-amber-300/50'
                      : 'opacity-40 cursor-not-allowed'
                  )}
                  onClick={() => {
                    if (canAfford) {
                      onSelectCrop(crop);
                      onOpenChange(false);
                    }
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={getCropImagePath(crop, 5)}
                      alt={def.name}
                      style={{ imageRendering: 'pixelated' }}
                      className="w-14 h-14 object-contain"
                    />
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {def.name}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <Clock className="h-3 w-3" />
                      <span>{def.growthDuration}s</span>
                    </div>
                    <div className="flex items-center justify-between w-full text-xs">
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
      </DialogContent>
    </Dialog>
  );
}
