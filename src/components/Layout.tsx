import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Compass,
  FolderGit2,
  Home,
  Layers,
  Menu,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { ARCHITECTURE_MODULES } from '../data';
import type { CourseProgressState } from '../hooks/useCourseProgress';
import type { ThemeMode } from '../hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
  progress: CourseProgressState;
  overallPercent: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onResetProgress: () => void;
}

export function Layout({
  children,
  progress,
  overallPercent,
  theme,
  onToggleTheme,
  onResetProgress,
}: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <Link
          to="/"
          onClick={() => setDrawerOpen(false)}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight text-slate-900 dark:text-white">
              Backend Arch
            </p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Interactive Course
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation menu"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Meter */}
      <div className="border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Course Progress</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {overallPercent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Course navigation">
        <div className="space-y-1">
          <NavLink to="/" end className={navLinkClass} onClick={() => setDrawerOpen(false)}>
            <span className="flex items-center gap-2.5">
              <Home className="h-4 w-4" />
              Overview
            </span>
          </NavLink>
          <NavLink
            to="/foundations"
            className={navLinkClass}
            onClick={() => setDrawerOpen(false)}
          >
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
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Architectures
          </p>
          <div className="space-y-1">
            {ARCHITECTURE_MODULES.map((mod) => (
              <NavLink
                key={mod.id}
                to={`/modules/${mod.id}`}
                className={navLinkClass}
                onClick={() => setDrawerOpen(false)}
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
          <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Practice & Decide
          </p>
          <div className="space-y-1">
            <NavLink
              to="/compare"
              className={navLinkClass}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-4 w-4" />
                Compare All 4
              </span>
            </NavLink>
            <NavLink
              to="/simulator"
              className={navLinkClass}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <Compass className="h-4 w-4" />
                Decision Simulator
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold">
                {Object.keys(progress.simulatorChoices).length}/8
              </span>
            </NavLink>
            <NavLink
              to="/projects"
              className={navLinkClass}
              onClick={() => setDrawerOpen(false)}
            >
              <span className="flex items-center gap-2.5">
                <FolderGit2 className="h-4 w-4" />
                Practice Projects
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                8
              </span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Footer Controls */}
      <div className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </span>
        </button>

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
              className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Progress
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="text-sm font-extrabold text-slate-900 dark:text-white">
          Backend Architectures Course
        </Link>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-800 dark:text-slate-200"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden dark:border-slate-800 dark:bg-slate-950 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-68 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-950">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="lg:pl-68">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
