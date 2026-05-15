'use client';

import { useEffect, useRef, useState } from 'react';
import { FarmGrid } from '@/components/farm/FarmGrid';
import { useGameStore } from '@/lib/store';
import { Expand, Coins } from 'lucide-react';

export default function FarmPage() {
  const user = useGameStore((state) => state.user);
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement !== fullscreenRef.current) {
        setIsActive(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    const target = fullscreenRef.current;
    if (!target) return;

    try {
      await target.requestFullscreen();
      setIsActive(true);
    } catch {
      // If browser blocks fullscreen, still allow local fullscreen mode fallback.
      setIsActive(true);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setIsActive(false);
  };

  if (!isActive) {
    return (
      <div ref={fullscreenRef} className="h-screen bg-theme-secondary overflow-hidden flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-stone-300/60 dark:border-stone-700/60 bg-theme-primary p-6 shadow-xl text-center">
          <h1 className="font-heading text-3xl font-bold text-theme-primary">Farm Mode</h1>
          <p className="text-theme-secondary mt-2 mb-5">Klik fullscreen dulu sebelum mulai main.</p>
          <div className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-xl mb-4">
            <Coins className="h-5 w-5 text-amber-500" strokeWidth={2.5} fill="currentColor" />
            <span className="font-heading font-bold text-amber-600-custom">{user.gold}</span>
          </div>
          <button
            type="button"
            onClick={enterFullscreen}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-3 font-semibold hover:bg-amber-600 transition-colors"
          >
            <Expand className="h-5 w-5" />
            Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={fullscreenRef} className="fixed inset-0 z-[100] bg-theme-secondary sm:p-4">
      <div className="h-full w-full">
        <FarmGrid />
      </div>
      <button
        type="button"
        onClick={exitFullscreen}
        className="absolute top-3 right-3 rounded-full bg-black/55 text-white text-xs px-3 py-1.5"
      >
        Exit
      </button>
    </div>
  );
}
