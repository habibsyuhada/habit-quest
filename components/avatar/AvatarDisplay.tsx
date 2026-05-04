'use client';

import { useGameStore } from '@/lib/store';

interface AvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const DEFAULT_AVATAR = {
  hair: 'short',
  hairColor: '#4A3728',
  skin: '#F5D0C5',
  shirt: '#3498db',
  background: '#e0f2fe',
  accessories: [],
};

export function AvatarDisplay({ size = 'md' }: AvatarDisplayProps) {
  const user = useGameStore((state) => state.user);
  const avatar = user.avatar || DEFAULT_AVATAR;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-4 border-white shadow-lg relative overflow-hidden`}
      style={{ backgroundColor: avatar.background }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Face */}
        <ellipse cx="50" cy="55" rx="30" ry="32" fill={avatar.skin} />

        {/* Hair */}
        {avatar.hair === 'short' && (
          <path
            d="M 20 40 Q 50 10 80 40 Q 80 30 50 25 Q 20 30 20 40"
            fill={avatar.hairColor}
          />
        )}
        {avatar.hair === 'long' && (
          <path
            d="M 20 40 Q 50 10 80 40 L 85 70 Q 80 75 75 70 L 70 50 Q 50 25 30 50 L 25 70 Q 20 75 15 70 Z"
            fill={avatar.hairColor}
          />
        )}
        {avatar.hair === 'bald' && null}

        {/* Eyes */}
        <circle cx="40" cy="50" r="4" fill="#1a1a1a" />
        <circle cx="60" cy="50" r="4" fill="#1a1a1a" />

        {/* Smile */}
        <path
          d="M 40 65 Q 50 70 60 65"
          stroke="#1a1a1a"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Shirt */}
        <path
          d="M 25 85 L 50 100 L 75 85"
          fill={avatar.shirt}
          stroke="#1a1a1a"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}