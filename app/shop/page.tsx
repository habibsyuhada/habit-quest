'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopCard } from '@/components/shop/ShopCard';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { useGameStore } from '@/lib/store';
import { Plus, Store } from 'lucide-react';
import type { RewardCategory } from '@/lib/types';

export default function ShopPage() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('10');

  const user = useGameStore((state) => state.user);
  const rewards = useGameStore((state) => state.rewards);
  const addReward = useGameStore((state) => state.addReward);
  const purchaseReward = useGameStore((state) => state.purchaseReward);

  // Initialize default rewards if empty
  useEffect(() => {
    if (rewards.length === 0) {
      const defaultRewards = [
        {
          type: 'potion' as const,
          name: 'Health Potion',
          description: 'Restore 10 health points',
          cost: 20,
          category: 'potion' as RewardCategory,
          owned: false,
        },
        {
          type: 'potion' as const,
          name: 'Mana Potion',
          description: 'Restore 10 mana points',
          cost: 15,
          category: 'potion' as RewardCategory,
          owned: false,
        },
        {
          type: 'equipment' as const,
          name: 'Iron Sword',
          description: 'A sturdy sword for adventurers',
          cost: 50,
          category: 'weapon' as RewardCategory,
          owned: false,
        },
        {
          type: 'equipment' as const,
          name: 'Wooden Shield',
          description: 'Basic protection',
          cost: 40,
          category: 'shield' as RewardCategory,
          owned: false,
        },
        {
          type: 'equipment' as const,
          name: 'Leather Armor',
          description: 'Light protection for travelers',
          cost: 60,
          category: 'armor' as RewardCategory,
          owned: false,
        },
      ];

      defaultRewards.forEach((reward) => addReward(reward));
    }
  }, [rewards.length, addReward]);

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !cost) return;

    addReward({
      type: 'custom',
      name: name.trim(),
      description: description.trim() || 'Custom reward',
      cost: parseInt(cost),
      category: 'custom',
      owned: false,
    });

    setName('');
    setDescription('');
    setCost('10');
    setOpen(false);
  };

  const equipmentRewards = rewards.filter((r) => r.type === 'equipment');
  const potionRewards = rewards.filter((r) => r.type === 'potion');
  const customRewards = rewards.filter((r) => r.type === 'custom');

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0c0b]">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl">
                <Store className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
                Reward Shop
              </h1>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-base">
              Spend your hard-earned gold
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-4">
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">Your Gold</p>
              <div className="flex items-center justify-end gap-1">
                <span className="font-heading text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">{user.gold}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="equipment" className="w-full">
          <div className="flex items-center gap-4 mb-6">
            <TabsList className="grid grid-cols-3 flex-1 bg-stone-200/50 dark:bg-stone-800/50 p-1 h-auto">
              <TabsTrigger value="equipment" className="py-2.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-sm">
                Equipment
              </TabsTrigger>
              <TabsTrigger value="potions" className="py-2.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-sm">
                Potions
              </TabsTrigger>
              <TabsTrigger value="custom" className="py-2.5 text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-stone-900 data-[state=active]:shadow-sm">
                Custom
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Reward</span>
            </Button>
          </div>

          <TabsContent value="equipment">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipmentRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {equipmentRewards.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/50 dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                  <p className="text-stone-500 dark:text-stone-400">No equipment available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="potions">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {potionRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {potionRewards.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/50 dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                  <p className="text-stone-500 dark:text-stone-400">No potions available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {customRewards.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white/50 dark:bg-stone-900/50 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700">
                  <p className="text-stone-500 dark:text-stone-400 mb-4">No custom rewards yet</p>
                  <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Reward
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Reward Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Create Custom Reward</DialogTitle>
              <DialogDescription className="text-stone-600 dark:text-stone-400">
                Create a personal reward to motivate yourself
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReward} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Reward Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Watch Netflix, Eat Pizza"
                  required
                  className="border-stone-300 dark:border-stone-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Cost (Gold)</label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  min="1"
                  required
                  className="border-stone-300 dark:border-stone-700"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="border-stone-300 dark:border-stone-700"
                />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 font-semibold">
                Create Reward
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
