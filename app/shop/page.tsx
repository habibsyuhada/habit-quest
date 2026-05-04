'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopCard } from '@/components/shop/ShopCard';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { useGameStore } from '@/lib/store';
import { Plus } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Reward Shop</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Spend your gold on items and custom rewards
            </p>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-4">
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Your Gold</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-500">{user.gold}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="potions">Potions</TabsTrigger>
            <TabsTrigger value="custom">
              Custom Rewards
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Reward</DialogTitle>
                    <DialogDescription>
                      Create a personal reward to motivate yourself
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateReward} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Reward Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Watch Netflix, Eat Pizza"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cost (Gold)</label>
                      <Input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description"
                        rows={2}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Reward
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {equipmentRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {equipmentRewards.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No equipment available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="potions">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {potionRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {potionRewards.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No potions available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {customRewards.map((reward) => (
                <ShopCard
                  key={reward.id}
                  reward={reward}
                  userGold={user.gold}
                  onPurchase={() => purchaseReward(reward.id)}
                />
              ))}
              {customRewards.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No custom rewards yet</p>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Reward</DialogTitle>
                        <DialogDescription>
                          Create a personal reward to motivate yourself
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateReward} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Reward Name</label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Watch Netflix, Eat Pizza"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Cost (Gold)</label>
                          <Input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                            rows={2}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Create Reward
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}