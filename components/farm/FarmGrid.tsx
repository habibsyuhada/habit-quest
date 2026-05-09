'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { CROP_DEFINITIONS, FARM_CONFIG } from '@/lib/constants';
import { computeGrowthStage } from '@/lib/game-mechanics';
import { FarmPlot } from './FarmPlot';
import { CropSelector } from './CropSelector';
import { HarvestAnimation } from './HarvestAnimation';
import type { CropType } from '@/lib/types';

export function FarmGrid() {
  const farm = useGameStore((state) => state.farm);
  const userGold = useGameStore((state) => state.user.gold);
  const plantCrop = useGameStore((state) => state.plantCrop);
  const harvestCrop = useGameStore((state) => state.harvestCrop);

  const [tick, setTick] = useState(0);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [harvestingPlot, setHarvestingPlot] = useState<{
    crop: CropType;
    gold: number;
    xp: number;
  } | null>(null);

  // Poll for growth stage updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), FARM_CONFIG.POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const handleSelectCrop = useCallback((crop: CropType) => {
    if (selectedPlotId) {
      plantCrop(selectedPlotId, crop);
      setSelectedPlotId(null);
    }
  }, [selectedPlotId, plantCrop]);

  const handleHarvest = useCallback((plotId: string) => {
    const plot = farm.plots.find((p) => p.id === plotId);
    if (!plot || !plot.crop || plot.plantedAt === null) return;

    const cropDef = CROP_DEFINITIONS[plot.crop];
    const stage = computeGrowthStage(plot.plantedAt, cropDef.growthDuration);
    if (stage < 5) return;

    setHarvestingPlot({
      crop: plot.crop,
      gold: cropDef.goldReward,
      xp: cropDef.xpReward,
    });
    harvestCrop(plotId);
  }, [farm.plots, harvestCrop]);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto">
        <AnimatePresence>
          {farm.plots.map((plot) => (
            <FarmPlot
              key={plot.id}
              plot={plot}
              tick={tick}
              onSelectCrop={() => setSelectedPlotId(plot.id)}
              onHarvest={() => handleHarvest(plot.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      <CropSelector
        open={selectedPlotId !== null}
        onOpenChange={(open) => !open && setSelectedPlotId(null)}
        onSelectCrop={handleSelectCrop}
        userGold={userGold}
      />

      {harvestingPlot && (
        <HarvestAnimation
          crop={harvestingPlot.crop}
          goldReward={harvestingPlot.gold}
          xpReward={harvestingPlot.xp}
          onComplete={() => setHarvestingPlot(null)}
        />
      )}
    </>
  );
}
