'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { useGameStore } from '@/lib/store';
import { StatsBar } from '@/components/dashboard/StatsBar';

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
    <div className="min-h-screen bg-gray-50">
      <StatsBar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Avatar Creator</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <AvatarDisplay size="xl" />
              <div className="text-center">
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">Level {user.level} {user.avatar.hair}</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hair Style */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Style</label>
                <Select
                  value={avatar.hair}
                  onValueChange={(value) => setAvatar({ ...avatar, hair: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <label className="text-sm font-medium mb-2 block">Hair Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {hairColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, hairColor: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.hairColor === color ? 'border-purple-600 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Tone</label>
                <div className="grid grid-cols-6 gap-2">
                  {skinTones.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setAvatar({ ...avatar, skin: tone })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.skin === tone ? 'border-purple-600 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: tone }}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Shirt Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {shirtColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, shirt: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.shirt === color ? 'border-purple-600 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Background</label>
                <div className="grid grid-cols-5 gap-2">
                  {backgroundColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAvatar({ ...avatar, background: color })}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        avatar.background === color ? 'border-purple-600 scale-110' : 'border-gray-300'
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