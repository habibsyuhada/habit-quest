'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeGrowthStage, getCropImagePath } from '@/lib/game-mechanics';
import { CROP_DEFINITIONS } from '@/lib/constants';
import type { FarmPlot as FarmPlotType, GrowthStage } from '@/lib/types';

interface FarmPlotProps {
  plot: FarmPlotType;
  onSelectCrop: () => void;
  onHarvest: () => void;
  tick: number;
}

export function FarmPlot({ plot, onSelectCrop, onHarvest, tick }: FarmPlotProps) {
  // tick forces re-render for growth stage updates
  void tick;

  if (!plot.crop || plot.plantedAt === null) {
    return (
      <Card
        className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:shadow-lg hover:border-amber-300/50 transition-all duration-300 cursor-pointer aspect-square flex items-center justify-center"
        onClick={onSelectCrop}
      >
        <div className="flex flex-col items-center gap-1">
          <Plus className="h-8 w-8 text-stone-400 dark:text-stone-500" />
          <span className="text-xs text-stone-400 dark:text-stone-500">Plant</span>
        </div>
      </Card>
    );
  }

  const cropDef = CROP_DEFINITIONS[plot.crop];
  const stage = computeGrowthStage(plot.plantedAt, cropDef.growthDuration);
  const displayStage = (Math.max(1, stage) as GrowthStage);
  const isReady = stage >= 5;

  const elapsedMs = Date.now() - plot.plantedAt;
  const totalMs = cropDef.growthDuration * 1000;
  const progress = Math.min(100, (elapsedMs / totalMs) * 100);

  return (
    <Card
      className={cn(
        'border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm transition-all duration-300 aspect-square cursor-pointer',
        isReady && 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/30 hover:ring-amber-400/50'
      )}
      onClick={isReady ? onHarvest : undefined}
    >
      <div className="h-full flex flex-col items-center justify-center p-2 relative">
        {isReady && (
          <motion.div
            className="absolute inset-0 bg-amber-400/10"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-1 relative z-10"
        >
          <img
            src={getCropImagePath(plot.crop, displayStage)}
            alt={cropDef.name}
            style={{ imageRendering: 'pixelated' }}
            className={cn(
              'w-16 h-16 sm:w-20 sm:h-20 object-contain',
              isReady && 'animate-bounce'
            )}
          />
          <span className="text-[10px] sm:text-xs font-medium text-stone-600 dark:text-stone-400">
            {cropDef.name}
          </span>
          {isReady ? (
            <span className="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
              Ready!
            </span>
          ) : (
            <Progress
              value={progress}
              className="h-1.5 w-full max-w-[80px] bg-stone-200 dark:bg-stone-700"
              indicatorClassName="bg-gradient-to-r from-green-400 to-green-600"
            />
          )}
        </motion.div>
      </div>
    </Card>
  );
}
