'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap } from 'lucide-react';
import { getCropImagePath } from '@/lib/game-mechanics';
import type { CropType } from '@/lib/types';

interface HarvestAnimationProps {
  crop: CropType;
  goldReward: number;
  xpReward: number;
  onComplete: () => void;
}

export function HarvestAnimation({ crop, goldReward, xpReward, onComplete }: HarvestAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onComplete}
      >
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -30 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
        >
          <motion.img
            src={getCropImagePath(crop, 5)}
            alt="Harvested"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl"
            style={{ imageRendering: 'pixelated' }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: 1 }}
          />
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-full">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="font-heading font-bold text-amber-600 dark:text-amber-400">+{goldReward}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sky-100 dark:bg-sky-900/40 px-3 py-1.5 rounded-full">
              <Zap className="h-4 w-4 text-sky-500" />
              <span className="font-heading font-bold text-sky-600 dark:text-sky-400">+{xpReward} XP</span>
            </div>
          </motion.div>
          <span className="text-xs text-white/50 mt-1">Tap to close</span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
