'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { useGameStore } from '@/lib/store';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { User } from 'lucide-react';

export default function AvatarPage() {
  const user = useGameStore((state) => state.user);
  const updateUser = useGameStore((state) => state.updateUser);
  const [avatar, setAvatar] = useState(user.avatar);

  const hairStyles = ['short', 'long', 'bald'];
  const hairColors = ['#4A3728', '#1a1a1a', '#8B4513', '#FFD700', '#FF6347', '#808080'];
  const skinTones = ['#F5D0C5', '#E8D0B0', '#C68642', '#8D5524', '#5C3317', '#3B2315'];
  const shirtColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#34495e', '#16a085'];
  const backgroundColors = ['#e0f2fe', '#fef3c7', '#dcfce7', '#fee2e2', '#f3e8ff'];

  const handleSave = () => {
    updateUser({ avatar });
  };

  const handleReset = () => {
    const defaultAvatar = {
      hair: 'short',
      hairColor: '#4A3728',
      skin: '#F5D0C5',
      shirt: '#3498db',
      background: '#e0f2fe',
      accessories: [],
    };
    setAvatar(defaultAvatar);
    updateUser({ avatar: defaultAvatar });
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0c0b]">
      <StatsBar />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl">
            <User className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100">
            Hero Creator
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <Card className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <AvatarDisplay size="xl" />
              <div className="text-center">
                <p className="text-xl font-heading font-semibold text-stone-900 dark:text-stone-100">{user.name}</p>
                <p className="text-sm text-stone-600 dark:text-stone-400">Level {user.level} Hero</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button onClick={handleSave} className="flex-1 bg-amber-500 hover:bg-amber-600 font-semibold shadow-md shadow-amber-500/25">
                  Save Changes
                </Button>
                <Button onClick={handleReset} variant="outline" className="border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card className="border-stone-200/60 dark:border-stone-800/60 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading">Customize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hair Style */}
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Hair Style</label>
                <Select
                  value={avatar.hair}
                  onValueChange={(value) => setAvatar({ ...avatar, hair: value })}
                >
                  <SelectTrigger className="border-stone-300 dark:border-stone-700">
                    <SelectValue className="capitalize" />
                  </SelectTrigger>
                  <SelectContent>
                    {hairStyles.map((style) => (
                      <SelectItem key={style} value={style} className="capitalize">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Hair Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {hairColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, hairColor: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.hairColor === color ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/30' : 'border-stone-300 dark:border-stone-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Skin Tone</label>
                <div className="grid grid-cols-6 gap-2">
                  {skinTones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAvatar({ ...avatar, skin: tone })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.skin === tone ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/30' : 'border-stone-300 dark:border-stone-600'
                      }`}
                      style={{ backgroundColor: tone }}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Shirt Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {shirtColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, shirt: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.shirt === color ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/30' : 'border-stone-300 dark:border-stone-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2 block">Background</label>
                <div className="grid grid-cols-5 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, background: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.background === color ? 'border-amber-500 scale-110 shadow-lg shadow-amber-500/30' : 'border-stone-300 dark:border-stone-600'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
