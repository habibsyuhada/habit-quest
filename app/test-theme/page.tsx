'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

function subscribeHtmlClass(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}

function getHtmlClassSnapshot() {
  if (typeof window === 'undefined') return '';
  return document.documentElement.className;
}

export default function TestThemePage() {
  const { theme, setTheme } = useTheme();
  const htmlClass = useSyncExternalStore(
    subscribeHtmlClass,
    getHtmlClassSnapshot,
    () => ''
  );

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
            Has dark class: {htmlClass.includes('dark') ? 'YES' : 'NO'}
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
      </div>
    </div>
  );
}
