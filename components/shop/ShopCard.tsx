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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'hover:shadow-lg transition-all duration-200',
          isOwned && 'border-green-500'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{reward.name}</CardTitle>
            {isOwned && (
              <Badge className="bg-green-100 text-green-700">
                <Check className="mr-1 h-3 w-3" />
                Owned
              </Badge>
            )}
          </div>
          {reward.description && (
            <p className="text-sm text-gray-600">{reward.description}</p>
          )}
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
              <span className="font-bold text-yellow-700 dark:text-yellow-400">{reward.cost}</span>
            </div>
            <Button
              onClick={onPurchase}
              disabled={!canAfford || isOwned}
              size="sm"
              variant={isOwned ? 'secondary' : 'default'}
              className="text-xs sm:text-sm"
            >
              {isOwned ? 'Purchased' : canAfford ? 'Buy' : 'No Gold'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}