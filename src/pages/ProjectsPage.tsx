import { useMemo } from 'react';
import { ALL_PRACTICE_PROJECTS } from '../data/projects';
import { ARCHITECTURE_META } from '../data/courseMeta';
import { PracticeProjectCard } from '../components/PracticeProjectCard';
import { ArchitectureIcon } from '../components/ArchitectureIcon';
import type { ProjectArchitectureId } from '../types/course';
import { usePersistedState } from '../hooks/usePersistedState';

interface ProjectsPageProps {
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
}

const VALID_ARCH_FILTERS = new Set<string>([
  'all',
  'hybrid',
  ...ARCHITECTURE_META.map((m) => m.id),
]);

const ALL_MILESTONE_IDS = ALL_PRACTICE_PROJECTS.flatMap((p) => p.milestones.map((m) => m.id));
const TOTAL_MILESTONES = ALL_MILESTONE_IDS.length;

const isArchFilter = (v: unknown): v is 'all' | ProjectArchitectureId =>
  typeof v === 'string' && VALID_ARCH_FILTERS.has(v);

const isDifficultyFilter = (v: unknown): v is 'all' | 'starter' | 'stretch' =>
  v === 'all' || v === 'starter' || v === 'stretch';

export function ProjectsPage({
  completedMilestones,
  onToggleMilestone,
}: ProjectsPageProps) {
  const [archFilter, setArchFilter] = usePersistedState<'all' | ProjectArchitectureId>(
    'projects.archFilter',
    'all',
    isArchFilter
  );
  const [difficultyFilter, setDifficultyFilter] = usePersistedState<'all' | 'starter' | 'stretch'>(
    'projects.difficultyFilter',
    'all',
    isDifficultyFilter
  );

  const completedSet = useMemo(() => new Set(completedMilestones), [completedMilestones]);

  const filtered = useMemo(
    () =>
      ALL_PRACTICE_PROJECTS.filter((p) => {
        const matchArch = archFilter === 'all' || p.architectureId === archFilter;
        const matchDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
        return matchArch && matchDiff;
      }),
    [archFilter, difficultyFilter]
  );

  const doneMilestones = useMemo(
    () => ALL_MILESTONE_IDS.filter((id) => completedSet.has(id)).length,
    [completedSet]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-4 sm:space-y-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-indigo-600 dark:text-indigo-400">
              Self-Paced Portfolio Builders
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {doneMilestones} / {TOTAL_MILESTONES} Milestones Checked
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Practice Projects Gallery
          </h1>
          <p className="prose-measure mt-2 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
            Simple, realistic projects to build locally on your own time — each with checkable
            milestones, a suggested folder layout, and a one-click Markdown brief.
          </p>
        </div>

        {/* Single Quiet Underline Tab Bar + Inline Level Filter */}
        <div className="flex flex-col gap-2 border-b border-stone-200 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-slate-700/80">
          <div
            className="no-scrollbar -mb-px flex w-full flex-nowrap gap-5 overflow-x-auto sm:w-auto sm:flex-wrap sm:gap-x-5 sm:gap-y-2"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={archFilter === 'all'}
              onClick={() => setArchFilter('all')}
              className={`shrink-0 whitespace-nowrap border-b-2 py-2.5 text-sm font-semibold transition sm:pt-0 sm:pb-3 ${archFilter === 'all'
                  ? 'border-indigo-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              All ({ALL_PRACTICE_PROJECTS.length})
            </button>
            {ARCHITECTURE_META.map((m) => {
              const isSelected = archFilter === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setArchFilter(m.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm font-semibold transition sm:pt-0 sm:pb-3 ${isSelected
                      ? 'border-indigo-500 text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                  <ArchitectureIcon architectureId={m.id} className="h-3.5 w-3.5" colored />
                  {m.shortName}
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              aria-selected={archFilter === 'hybrid'}
              onClick={() => setArchFilter('hybrid')}
              className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 py-2.5 text-sm font-semibold transition sm:pt-0 sm:pb-3 ${archFilter === 'hybrid'
                  ? 'border-indigo-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <ArchitectureIcon architectureId="hybrid" className="h-3.5 w-3.5" colored />
              Hybrid / Evolution
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2.5 text-xs sm:gap-3 sm:pb-3">
            <span className="text-slate-400 dark:text-slate-500">Level:</span>
            {(['all', 'starter', 'stretch'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-1 py-1 font-semibold capitalize transition sm:px-0 sm:py-0 ${difficultyFilter === diff
                    ? 'text-indigo-600 underline decoration-indigo-500 underline-offset-4 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Project Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filtered.map((project) => (
          <PracticeProjectCard
            key={project.id}
            project={project}
            completedMilestones={completedSet}
            onToggleMilestone={onToggleMilestone}
            showArchitectureBadge
          />
        ))}
      </div>
    </div>
  );
}
