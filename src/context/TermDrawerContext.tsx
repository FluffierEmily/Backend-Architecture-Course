import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ABBREVIATION_BY_ID, type AbbreviationEntry } from '../data/abbreviations';

interface TermDrawerContextValue {
  activeTerm: AbbreviationEntry | null;
  previousTerm: AbbreviationEntry | null;
  openTerm: (termId: string) => void;
  goBack: () => void;
  closeTerm: () => void;
}

const NOOP_CONTEXT: TermDrawerContextValue = {
  activeTerm: null,
  previousTerm: null,
  openTerm: () => {},
  goBack: () => {},
  closeTerm: () => {},
};

const TermDrawerContext = createContext<TermDrawerContextValue>(NOOP_CONTEXT);

export function TermDrawerProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<string[]>([]);

  const activeId = history.length > 0 ? history[history.length - 1] : null;
  const prevId = history.length > 1 ? history[history.length - 2] : null;

  const activeTerm = activeId ? (ABBREVIATION_BY_ID[activeId] ?? null) : null;
  const previousTerm = prevId ? (ABBREVIATION_BY_ID[prevId] ?? null) : null;

  const openTerm = useCallback((termId: string) => {
    const entry = ABBREVIATION_BY_ID[termId];
    if (!entry?.drawer) return;
    setHistory((prev) => {
      if (prev[prev.length - 1] === termId) return prev;
      return [...prev.slice(-9), termId];
    });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const closeTerm = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    if (!activeTerm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTerm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTerm, closeTerm]);

  const value = useMemo<TermDrawerContextValue>(
    () => ({ activeTerm, previousTerm, openTerm, goBack, closeTerm }),
    [activeTerm, previousTerm, openTerm, goBack, closeTerm]
  );

  return <TermDrawerContext.Provider value={value}>{children}</TermDrawerContext.Provider>;
}

export function useTermDrawer(): TermDrawerContextValue {
  return useContext(TermDrawerContext);
}
