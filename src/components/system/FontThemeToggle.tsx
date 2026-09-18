import React, { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

type FontTheme = 'console' | 'archive';

const STORAGE_KEY = 'fontTheme';

function readTheme(): FontTheme {
  return document.documentElement.dataset.fontTheme === 'archive' ? 'archive' : 'console';
}

export const FontThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<FontTheme>('console');

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const toggle = () => {
    const next: FontTheme = theme === 'console' ? 'archive' : 'console';
    setTheme(next);
    document.documentElement.dataset.fontTheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: theme still applies for this session.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'archive'}
      title="Toggle font theme (Console / Archive)"
      className="flex items-center gap-2 rounded border border-border bg-surface/60 px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Type className="h-3.5 w-3.5 text-primary" />
      <span className="label-mono hidden text-[10px] sm:inline">
        FONT: {theme === 'console' ? 'CONSOLE' : 'ARCHIVE'}
      </span>
    </button>
  );
};
