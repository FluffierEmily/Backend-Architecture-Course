export const loadHomePage = () => import('../pages/HomePage');
export const loadFoundationsPage = () => import('../pages/FoundationsPage');
export const loadModulePage = () => import('../pages/ModulePage');
export const loadComparePage = () => import('../pages/ComparePage');
export const loadSimulatorPage = () => import('../pages/SimulatorPage');
export const loadProjectsPage = () => import('../pages/ProjectsPage');
export const loadCodeComparison = () => import('../components/CodeComparison');

const prefetchedKeys = new Set<string>();

function runOnce(key: string, loader: () => Promise<unknown>): void {
  if (prefetchedKeys.has(key)) return;
  prefetchedKeys.add(key);
  void loader().catch(() => {
    prefetchedKeys.delete(key);
  });
}

export function prefetchRoute(pathname: string): void {
  if (pathname === '/') {
    runOnce('home', loadHomePage);
  } else if (pathname === '/foundations') {
    runOnce('foundations', loadFoundationsPage);
  } else if (pathname.startsWith('/modules/')) {
    runOnce('module', loadModulePage);
  } else if (pathname === '/compare') {
    runOnce('compare', loadComparePage);
  } else if (pathname === '/simulator') {
    runOnce('simulator', loadSimulatorPage);
  } else if (pathname === '/projects') {
    runOnce('projects', loadProjectsPage);
  }
}

export function prefetchCodeComparison(): void {
  runOnce('code-comparison', loadCodeComparison);
}
