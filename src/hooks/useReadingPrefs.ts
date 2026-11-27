import { useCallback, useEffect, useState } from 'react';

const PREFS_KEY = 'backend-arch-course-reading-prefs-v1';

export interface ReadingPrefs {
  calmMotion: boolean; // Pauses animated SVG dashes & transitions
}

function loadPrefs(): ReadingPrefs {
  const prefersReduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return { calmMotion: prefersReduced };
    const parsed = JSON.parse(raw) as Partial<ReadingPrefs>;
    return {
      calmMotion: typeof parsed.calmMotion === 'boolean' ? parsed.calmMotion : prefersReduced,
    };
  } catch {
    return { calmMotion: prefersReduced };
  }
}

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<ReadingPrefs>(() => loadPrefs());

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.calmMotion) {
      root.classList.add('calm-motion');
    } else {
      root.classList.remove('calm-motion');
    }
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage errors
    }
  }, [prefs]);

  const toggleCalmMotion = useCallback(() => {
    setPrefs((prev) => ({ ...prev, calmMotion: !prev.calmMotion }));
  }, []);

  return { prefs, toggleCalmMotion };
}
