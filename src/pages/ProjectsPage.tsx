import { useState } from 'react';
import { FolderGit2 } from 'lucide-react';
import { ALL_PRACTICE_PROJECTS, ARCHITECTURE_MODULES } from '../data';
import { PracticeProjectCard } from '../components/PracticeProjectCard';
import type { ArchitectureId } from '../types/course';

interface ProjectsPageProps {
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
}

export function ProjectsPage({
  completedMilestones,
  onToggleMilestone,
}: ProjectsPageProps) {
  const [archFilter, setArchFilter] = useState<'all' | ArchitectureId>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'starter' | 'stretch'>('all');

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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <FolderGit2 className="h-3.5 w-3.5" />
            Self-Paced Portfolio Builders
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Practice Projects Gallery
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Simple, realistic projects you can build locally on your own time. Each blueprint comes
            with a beginner-friendly TypeScript stack, folder layout, checkable milestones, and a
            one-click Markdown spec export.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="font-bold text-slate-900 dark:text-white">
            {doneMilestones} / {totalMilestones} Milestones Checked
          </p>
          <p className="text-slate-500 dark:text-slate-400">Saved automatically in this browser</p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setArchFilter('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              archFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All Architectures ({ALL_PRACTICE_PROJECTS.length})
          </button>
          {ARCHITECTURE_MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setArchFilter(m.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                archFilter === m.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {m.shortName}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-0.5 text-xs dark:border-slate-700 dark:bg-slate-800">
          {(['all', 'starter', 'stretch'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-lg px-3 py-1 font-semibold capitalize transition ${
                difficultyFilter === diff
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
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
