'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Reward } from '@/lib/types';

interface ShopCardProps {
  reward: Reward;
  userGold: number;
  onPurchase: () => void;
}

export function ShopCard({ reward, userGold, onPurchase }: ShopCardProps) {
  const canAfford = userGold >= reward.cost;
  const isOwned = reward.owned;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300',
          isOwned && 'border-l-4 border-l-emerald-500'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg text-stone-900 dark:text-stone-100">{reward.name}</CardTitle>
            {isOwned && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
                <Check className="mr-1 h-3 w-3" />
                Owned
              </Badge>
            )}
          </div>
          {reward.description && (
            <p className="text-sm text-stone-600 dark:text-stone-400">{reward.description}</p>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-lg" />
                <Coins className="relative h-5 w-5 text-amber-500" strokeWidth={2.5} fill="currentColor" />
              </div>
              <span className="font-heading font-bold text-amber-600 dark:text-amber-400">{reward.cost}</span>
            </div>
            <Button
              onClick={onPurchase}
              disabled={!canAfford || isOwned}
              size="sm"
              variant={isOwned ? 'secondary' : 'default'}
              className={cn(
                'text-xs sm:text-sm font-semibold',
                !isOwned && canAfford && 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/25'
              )}
            >
              {isOwned ? 'Purchased' : canAfford ? 'Buy' : 'No Gold'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
