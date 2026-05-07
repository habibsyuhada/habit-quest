'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function TestThemePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [htmlClass, setHtmlClass] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateClass = () => {
      setHtmlClass(document.documentElement.className);
    };
    updateClass();

    const observer = new MutationObserver(updateClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-theme-secondary p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-theme-primary">
          CSS Variables Dark Mode Test
        </h1>

        <div className="space-y-2 p-4 bg-theme-primary rounded-lg border-2 border-theme-secondary">
          <p className="text-theme-primary font-mono text-sm">
            theme prop: {theme || 'undefined'}
          </p>
          <p className="text-theme-primary font-mono text-sm">
            HTML class: {htmlClass}
          </p>
          <p className="text-theme-primary font-mono text-sm">
            Has dark class: {htmlClass.includes('dark') ? 'YES ✓' : 'NO ✗'}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setTheme('light')}
            className="px-4 py-2 bg-blue-500-custom text-white rounded hover:bg-blue-600-custom"
          >
            Light Mode
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-4 py-2 bg-gray-700-custom text-white rounded hover:bg-gray-600-custom"
          >
            Dark Mode
          </button>
        </div>

        {/* Test boxes using CSS variables - these should change color! */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-100-custom rounded-lg">
            <p className="text-blue-900-custom font-medium">
              Blue Box
            </p>
            <p className="text-xs text-blue-700-custom mt-1">
              Should change from light blue to dark blue
            </p>
          </div>

          <div className="p-4 bg-red-100-custom rounded-lg">
            <p className="text-red-900-custom font-medium">
              Red Box
            </p>
            <p className="text-xs text-red-700-custom mt-1">
              Should change from light red to dark red
            </p>
          </div>

          <div className="p-4 bg-green-100-custom rounded-lg">
            <p className="text-green-900-custom font-medium">
              Green Box
            </p>
            <p className="text-xs text-green-700-custom mt-1">
              Should change from light green to dark green
            </p>
          </div>

          <div className="p-4 bg-purple-100-custom rounded-lg">
            <p className="text-purple-900-custom font-medium">
              Purple Box
            </p>
            <p className="text-xs text-purple-700-custom mt-1">
              Should change from light purple to dark purple
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-50-custom rounded-lg border border-amber-200-custom">
          <p className="text-amber-900-custom font-medium">
            Success!
          </p>
          <p className="text-sm text-amber-800-custom mt-2">
            If the boxes above change color when you toggle dark mode,
            then CSS variables are working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}
