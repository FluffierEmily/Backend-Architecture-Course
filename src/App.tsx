import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useCourseProgress } from './hooks/useCourseProgress';
import { useTheme } from './hooks/useTheme';
import { useReadingPrefs } from './hooks/useReadingPrefs';
import { clearPersistedUiState, readUiState, writeUiState } from './hooks/usePersistedState';
import { ARCHITECTURE_META_BY_ID } from './data/courseMeta';
import {
  loadComparePage,
  loadFoundationsPage,
  loadHomePage,
  loadModulePage,
  loadProjectsPage,
  loadSimulatorPage,
} from './routes/prefetch';
import type { ArchitectureId } from './types/course';

const HomePage = lazy(() => loadHomePage().then((m) => ({ default: m.HomePage })));
const FoundationsPage = lazy(() =>
  loadFoundationsPage().then((m) => ({ default: m.FoundationsPage }))
);
const ModulePage = lazy(() => loadModulePage().then((m) => ({ default: m.ModulePage })));
const ComparePage = lazy(() => loadComparePage().then((m) => ({ default: m.ComparePage })));
const SimulatorPage = lazy(() => loadSimulatorPage().then((m) => ({ default: m.SimulatorPage })));
const ProjectsPage = lazy(() => loadProjectsPage().then((m) => ({ default: m.ProjectsPage })));

const BASE_TITLE = 'Interactive Backend Architectures Course';
const VALID_STATIC_PATHS = new Set(['/', '/foundations', '/compare', '/simulator', '/projects']);

function isValidCoursePath(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (VALID_STATIC_PATHS.has(value)) return true;
  if (value.startsWith('/modules/')) {
    const slug = value.replace('/modules/', '') as ArchitectureId;
    return Boolean(ARCHITECTURE_META_BY_ID[slug]);
  }
  return false;
}

function getTitleForPath(pathname: string): string {
  if (pathname === '/foundations') return `Foundations · ${BASE_TITLE}`;
  if (pathname === '/compare') return `Compare All 4 · ${BASE_TITLE}`;
  if (pathname === '/simulator') return `Decision Simulator · ${BASE_TITLE}`;
  if (pathname === '/projects') return `Practice Projects · ${BASE_TITLE}`;
  if (pathname.startsWith('/modules/')) {
    const slug = pathname.replace('/modules/', '') as ArchitectureId;
    const mod = ARCHITECTURE_META_BY_ID[slug];
    if (mod) return `${mod.shortName} · ${BASE_TITLE}`;
  }
  return BASE_TITLE;
}

function RouteFallback() {
  return (
    <div
      className="space-y-6 py-4"
      role="status"
      aria-live="polite"
      aria-label="Loading section"
    >
      <div className="h-8 w-64 animate-pulse rounded-xl bg-stone-200 dark:bg-slate-800" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-stone-200/80 dark:bg-slate-800/80" />
      <div className="h-56 w-full animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-slate-700/80 dark:bg-[#162033]" />
    </div>
  );
}

function RouteMetadata() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const checkedInitialRestoreRef = useRef(false);

  useEffect(() => {
    if (!checkedInitialRestoreRef.current) {
      checkedInitialRestoreRef.current = true;
      if (pathname === '/') {
        const savedPath = readUiState<string>('lastRoute', '/', isValidCoursePath);
        if (savedPath !== '/') {
          navigate(savedPath, { replace: true });
          return;
        }
      }
    }

    if (isValidCoursePath(pathname)) {
      writeUiState('lastRoute', pathname);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.title = getTitleForPath(pathname);
  }, [pathname, navigate]);

  return null;
}

export function AppRoutes() {
  const {
    progress,
    overallPercent,
    bestFitSimCount,
    markSectionComplete,
    markComparisonInspected,
    markMiniCheckComplete,
    recordSimulatorAttempt,
    toggleProjectMilestone,
    resetProgress,
  } = useCourseProgress();

  const { theme, toggleTheme } = useTheme();
  const { prefs, toggleCalmMotion } = useReadingPrefs();

  const handleResetProgress = useCallback(() => {
    resetProgress();
    clearPersistedUiState();
  }, [resetProgress]);

  const handleMarkFoundationsComplete = useCallback(() => {
    markSectionComplete('foundations');
  }, [markSectionComplete]);

  return (
    <Layout
      progress={progress}
      overallPercent={overallPercent}
      theme={theme}
      readingPrefs={prefs}
      onToggleTheme={toggleTheme}
      onToggleCalmMotion={toggleCalmMotion}
      onResetProgress={handleResetProgress}
    >
      <RouteMetadata />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={<HomePage progress={progress} overallPercent={overallPercent} />}
          />
          <Route
            path="/foundations"
            element={
              <FoundationsPage
                isCompleted={progress.completedSections.includes('foundations')}
                onMarkComplete={handleMarkFoundationsComplete}
              />
            }
          />
          <Route
            path="/modules/:slug"
            element={
              <ModulePage
                progress={progress}
                onMarkSectionComplete={markSectionComplete}
                onInspectComparison={markComparisonInspected}
                onCompleteMiniCheck={markMiniCheckComplete}
                onToggleMilestone={toggleProjectMilestone}
              />
            }
          />
          <Route path="/compare" element={<ComparePage />} />
          <Route
            path="/simulator"
            element={
              <SimulatorPage
                completedChoices={progress.simulatorChoices}
                bestFitCount={bestFitSimCount}
                onRecordChoice={recordSimulatorAttempt}
              />
            }
          />
          <Route
            path="/projects"
            element={
              <ProjectsPage
                completedMilestones={progress.completedMilestones}
                onToggleMilestone={toggleProjectMilestone}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
