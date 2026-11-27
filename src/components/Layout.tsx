import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  FolderGit2,
  Home,
  Layers,
  Menu,
  Moon,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { ARCHITECTURE_MODULES, SIMULATOR_SCENARIOS } from '../data';
import type { CourseProgressState } from '../hooks/useCourseProgress';
import type { ThemeMode } from '../hooks/useTheme';
import type { ReadingPrefs } from '../hooks/useReadingPrefs';

interface LayoutProps {
  children: ReactNode;
  progress: CourseProgressState;
  overallPercent: number;
  theme: ThemeMode;
  readingPrefs: ReadingPrefs;
  onToggleTheme: () => void;
  onToggleCalmMotion: () => void;
  onResetProgress: () => void;
}

const AUTO_HIDE_DELAY_MS = 200;

export function Layout({
  children,
  progress,
  overallPercent,
  theme,
  readingPrefs,
  onToggleTheme,
  onToggleCalmMotion,
  onResetProgress,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const { calmMotion } = readingPrefs;

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openSidebar = useCallback(() => {
    cancelScheduledClose();
    setSidebarOpen(true);
  }, [cancelScheduledClose]);

  const closeSidebarNow = useCallback(() => {
    cancelScheduledClose();
    setSidebarOpen(false);
    setConfirmReset(false);
  }, [cancelScheduledClose]);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setSidebarOpen(false);
      setConfirmReset(false);
      closeTimerRef.current = null;
    }, AUTO_HIDE_DELAY_MS);
  }, [cancelScheduledClose]);

  useEffect(() => {
    return () => cancelScheduledClose();
  }, [cancelScheduledClose]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebarNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, closeSidebarNow]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive
      ? 'bg-indigo-600 text-white shadow-sm'
      : 'text-slate-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
    }`;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 dark:bg-[#0f172a] dark:text-slate-100">
      {/* Full-Height Clickable & Hoverable Left Edge Area */}
      <button
        type="button"
        onMouseEnter={openSidebar}
        onClick={openSidebar}
        aria-label="Open navigation sidebar"
        aria-expanded={sidebarOpen}
        title="Hover or click to open navigation"
        className="group fixed inset-y-0 left-0 z-30 flex w-6 cursor-pointer items-center justify-center border-r border-stone-200/80 bg-stone-100/50 transition-all duration-150 hover:w-8 hover:border-indigo-400/50 hover:bg-indigo-500/[0.08] focus-visible:w-8 sm:w-7 dark:border-slate-800/90 dark:bg-[#0c1322]/60 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/[0.12]"
      >
        <span className="flex h-14 w-4 items-center justify-center rounded-full bg-stone-200/80 text-slate-500 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>

      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-[#faf9f6]/95 py-3 pl-9 pr-4 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-[#0f172a]/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open navigation menu"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <Link to="/" className="text-sm font-extrabold text-slate-900 dark:text-white">
            Backend Architectures Course
          </Link>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="rounded-xl border border-stone-200 bg-white p-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </button>
      </header>

      {/* Backdrop when Sidebar is Open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[1px]"
          onClick={closeSidebarNow}
        />
      )}

      {/* Auto-Hiding Overlay Sidebar */}
      <aside
        aria-label="Course sidebar"
        aria-hidden={!sidebarOpen}
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-stone-200 bg-white shadow-xl transition-all duration-200 ease-out dark:border-slate-800 dark:bg-[#0c1322] ${sidebarOpen
            ? 'visible translate-x-0 opacity-100'
            : 'invisible pointer-events-none -translate-x-full opacity-0'
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5 dark:border-slate-800">
            <Link to="/" onClick={closeSidebarNow} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold leading-tight text-slate-900 dark:text-white">
                  Backend Architectures
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Interactive Course
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={closeSidebarNow}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Meter */}
          <div className="border-b border-stone-200 px-5 py-4 dark:border-slate-800">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                Course Progress
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {overallPercent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5"
            aria-label="Course navigation"
          >
            <div className="space-y-1.5">
              <NavLink to="/" end className={navLinkClass} onClick={closeSidebarNow}>
                <span className="flex items-center gap-2.5">
                  <Home className="h-4 w-4" />
                  Overview
                </span>
              </NavLink>
              <NavLink to="/foundations" className={navLinkClass} onClick={closeSidebarNow}>
                <span className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4" />
                  0. Foundations
                </span>
                {progress.completedSections.includes('foundations') && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                )}
              </NavLink>
            </div>

            <div>
              <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Architectures
              </p>
              <div className="space-y-1.5">
                {ARCHITECTURE_MODULES.map((mod) => (
                  <NavLink
                    key={mod.id}
                    to={`/modules/${mod.id}`}
                    className={navLinkClass}
                    onClick={closeSidebarNow}
                  >
                    <span className="truncate">
                      {mod.order}. {mod.shortName}
                    </span>
                    {progress.completedSections.includes(mod.id) && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 px-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Practice &amp; Decide
              </p>
              <div className="space-y-1.5">
                <NavLink to="/compare" className={navLinkClass} onClick={closeSidebarNow}>
                  <span className="flex items-center gap-2.5">
                    <SlidersHorizontal className="h-4 w-4" />
                    Compare All 4
                  </span>
                </NavLink>
                <NavLink to="/simulator" className={navLinkClass} onClick={closeSidebarNow}>
                  <span className="flex items-center gap-2.5">
                    <Compass className="h-4 w-4" />
                    Decision Simulator
                  </span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 font-mono text-[11px] font-bold">
                    {Object.keys(progress.simulatorChoices).length}/{SIMULATOR_SCENARIOS.length}
                  </span>
                </NavLink>
                <NavLink to="/projects" className={navLinkClass} onClick={closeSidebarNow}>
                  <span className="flex items-center gap-2.5">
                    <FolderGit2 className="h-4 w-4" />
                    Practice Projects
                  </span>
                  <span className="rounded-full bg-stone-200 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    8
                  </span>
                </NavLink>
              </div>
            </div>
          </nav>

          {/* Compact Reading Comfort & Theme Footer */}
          <div className="space-y-2 border-t border-stone-200 px-3.5 py-3 dark:border-slate-800/90">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onToggleCalmMotion}
                aria-pressed={calmMotion}
                title="Pause animated flow lines and transitions"
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${calmMotion
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                    : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
              >
                {calmMotion ? (
                  <PauseCircle className="h-3.5 w-3.5" />
                ) : (
                  <PlayCircle className="h-3.5 w-3.5" />
                )}
                <span>Calm Motion</span>
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Switch to Warm Light Mode' : 'Switch to Calm Dark Mode'}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-stone-100 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                )}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {confirmReset ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="flex-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                >
                  Confirm Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1 text-[11px] font-medium text-slate-500 transition hover:bg-stone-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Progress
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content with Generous Breathing Room */}
      <main className="pl-6 sm:pl-7">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
