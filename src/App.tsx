import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FoundationsPage } from './pages/FoundationsPage';
import { ModulePage } from './pages/ModulePage';
import { ComparePage } from './pages/ComparePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { useCourseProgress } from './hooks/useCourseProgress';
import { useTheme } from './hooks/useTheme';
import { ARCHITECTURE_BY_ID } from './data';
import type { ArchitectureId } from './types/course';

const BASE_TITLE = 'Interactive Backend Architectures Course';

function getTitleForPath(pathname: string): string {
  if (pathname === '/foundations') return `Foundations · ${BASE_TITLE}`;
  if (pathname === '/compare') return `Compare All 4 · ${BASE_TITLE}`;
  if (pathname === '/simulator') return `Decision Simulator · ${BASE_TITLE}`;
  if (pathname === '/projects') return `Practice Projects · ${BASE_TITLE}`;
  if (pathname.startsWith('/modules/')) {
    const slug = pathname.replace('/modules/', '') as ArchitectureId;
    const mod = ARCHITECTURE_BY_ID[slug];
    if (mod) return `${mod.shortName} · ${BASE_TITLE}`;
  }
  return BASE_TITLE;
}

function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.title = getTitleForPath(pathname);
  }, [pathname]);
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

  return (
    <Layout
      progress={progress}
      overallPercent={overallPercent}
      theme={theme}
      onToggleTheme={toggleTheme}
      onResetProgress={resetProgress}
    >
      <RouteMetadata />
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
              onMarkComplete={() => markSectionComplete('foundations')}
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
