import { ALL_PRACTICE_PROJECTS, ARCHITECTURE_MODULES } from '../data';
import { PracticeProjectCard } from '../components/PracticeProjectCard';
import type { ProjectArchitectureId } from '../types/course';
import { usePersistedState } from '../hooks/usePersistedState';

interface ProjectsPageProps {
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
}

const VALID_ARCH_FILTERS = new Set<string>([
  'all',
  'hybrid',
  ...ARCHITECTURE_MODULES.map((m) => m.id),
]);

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

  const filtered = ALL_PRACTICE_PROJECTS.filter((p) => {
    const matchArch = archFilter === 'all' || p.architectureId === archFilter;
    const matchDiff = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    return matchArch && matchDiff;
  });

  const totalMilestones = ALL_PRACTICE_PROJECTS.reduce(
    (sum, p) => sum + p.milestones.length,
    0
  );
  const doneMilestones = ALL_PRACTICE_PROJECTS.flatMap((p) => p.milestones).filter((m) =>
    completedMilestones.includes(m.id)
  ).length;

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
            <span className="text-indigo-600 dark:text-indigo-400">
              Self-Paced Portfolio Builders
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              {doneMilestones} / {totalMilestones} Milestones Checked
            </span>
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practice Projects Gallery
          </h1>
          <p className="prose-measure mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
            Simple, realistic projects to build locally on your own time — each with checkable
            milestones, a suggested folder layout, and a one-click Markdown brief.
          </p>
        </div>

        {/* Single Quiet Underline Tab Bar + Inline Level Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-700/80">
          <div className="-mb-px flex flex-wrap gap-x-5 gap-y-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={archFilter === 'all'}
              onClick={() => setArchFilter('all')}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                archFilter === 'all'
                  ? 'border-indigo-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              All ({ALL_PRACTICE_PROJECTS.length})
            </button>
            {ARCHITECTURE_MODULES.map((m) => {
              const isSelected = archFilter === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setArchFilter(m.id)}
                  className={`border-b-2 pb-3 text-sm font-semibold transition ${
                    isSelected
                      ? 'border-indigo-500 text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {m.shortName}
                </button>
              );
            })}
            <button
              type="button"
              role="tab"
              aria-selected={archFilter === 'hybrid'}
              onClick={() => setArchFilter('hybrid')}
              className={`border-b-2 pb-3 text-sm font-semibold transition ${
                archFilter === 'hybrid'
                  ? 'border-indigo-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Hybrid / Evolution
            </button>
          </div>

          <div className="flex items-center gap-3 pb-3 text-xs">
            <span className="text-slate-400 dark:text-slate-500">Level:</span>
            {(['all', 'starter', 'stretch'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`font-semibold capitalize transition ${
                  difficultyFilter === diff
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
            completedMilestones={completedMilestones}
            onToggleMilestone={onToggleMilestone}
            showArchitectureBadge
          />
        ))}
      </div>
    </div>
  );
}
