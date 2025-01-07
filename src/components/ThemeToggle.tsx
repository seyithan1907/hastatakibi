'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
      aria-label="Tema değiştir"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      ) : (
        <MoonIcon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
} 