'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('dark-mode') === 'true';
    setDark(stored);
    if (stored) document.documentElement.classList.add('dark');
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dark-mode', 'false');
    }
  }

  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggle}
      title={dark ? 'Цайвар горим' : 'Харанхуй горим'}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-forest-500 hover:bg-forest-50 hover:text-forest-700 transition-colors"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
