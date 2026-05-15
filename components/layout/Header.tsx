'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, CheckSquare, ShoppingBag, Sprout, Swords, Menu, X } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const ThemeToggle = dynamic(
  () => import('@/components/theme-toggle').then((mod) => mod.ThemeToggle),
  { ssr: false }
);

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/tasks', label: 'Quests', icon: CheckSquare },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/farm', label: 'Farm', icon: Sprout },
];

export function Header() {
  const pathname = usePathname();
  const user = useGameStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200-custom bg-theme-secondary/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400/20 rounded-xl blur-lg group-hover:bg-amber-400/30 transition-all" />
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-all">
                <Swords className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">
              <span className="text-theme-primary">Habit</span>
              <span className="text-amber-600-custom">Quest</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-theme-secondary hover:bg-gray-200-custom'
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <div className="text-sm font-heading font-semibold text-theme-primary">{user.name}</div>
              <div className="text-xs text-theme-tertiary">Level {user.level}</div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full h-11 w-11 flex items-center justify-center text-white font-heading font-bold shadow-lg">
                {user.level}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-theme-secondary hover:text-theme-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200-custom">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-theme-secondary hover:bg-gray-200-custom'
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
