import { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckSquare,
  Copy,
  FolderTree,
  Lightbulb,
  ShieldAlert,
  Square,
} from 'lucide-react';
import type { PracticeProject } from '../types/course';
import { ARCHITECTURE_META_BY_ID } from '../data/courseMeta';
import { usePersistedState } from '../hooks/usePersistedState';
import { ArchitectureIcon, ARCHITECTURE_VISUALS } from './ArchitectureIcon';
import { ImplementationDrawer } from './ImplementationDrawer';
import { CourseText } from './CourseText';

interface PracticeProjectCardProps {
  project: PracticeProject;
  completedMilestones: string[] | ReadonlySet<string>;
  onToggleMilestone: (milestoneId: string) => void;
  showArchitectureBadge?: boolean;
}

function getArchitectureLabel(
  architectureId: PracticeProject['architectureId'],
  short = false
): string {
  if (architectureId === 'hybrid') {
    return short ? 'Hybrid / Evolution' : 'Hybrid / Strangler Fig Evolution';
  }
  return short
    ? ARCHITECTURE_META_BY_ID[architectureId].shortName
    : ARCHITECTURE_META_BY_ID[architectureId].name;
}

function buildMarkdownBrief(project: PracticeProject): string {
  const archName = getArchitectureLabel(project.architectureId);
  return [
    `# ${project.title}`,
    '',
    `- **Architecture:** ${archName}`,
    `- **Difficulty:** ${project.difficulty === 'starter' ? 'Starter' : 'Stretch'}`,
    `- **Estimated Time:** ${project.estimatedTime}`,
    `- **Suggested Stack:** ${project.suggestedStack.join(', ')}`,
    '',
    '## Goal',
    project.summary,
    '',
    '## Suggested Folder Structure',
    '```text',
    project.folderStructure,
    '```',
    '',
    '## Milestones',
    ...project.milestones.map((m) => `- [ ] **${m.title}** — ${m.detail}`),
    '',
    '## Key Architectural Rules ("Don\'t Cheat")',
    ...project.architectureRules.map((r) => `- ${r}`),
    ...(project.starterHints && project.starterHints.length > 0
      ? [
          '',
          '## Implementation Hints',
          ...project.starterHints.flatMap((h) => [
            `### ${h.label}`,
            h.summary,
            ...h.steps.map((s, idx) => `${idx + 1}. ${s}`),
            ...(h.code ? ['```ts', h.code.snippet.trimEnd(), '```'] : []),
            '',
          ]),
        ]
      : []),
    '',
  ].join('\n');
}

const isDrawerMode = (v: unknown): v is 'none' | 'folder' | 'rules' | 'hints' =>
  v === 'none' || v === 'folder' || v === 'rules' || v === 'hints';

function toMilestoneSet(milestones: string[] | ReadonlySet<string>): ReadonlySet<string> {
  return milestones instanceof Set ? milestones : new Set(milestones);
}

function areProjectCardPropsEqual(
  prev: PracticeProjectCardProps,
  next: PracticeProjectCardProps
): boolean {
  if (
    prev.project !== next.project ||
    prev.onToggleMilestone !== next.onToggleMilestone ||
    prev.showArchitectureBadge !== next.showArchitectureBadge
  ) {
    return false;
  }
  if (prev.completedMilestones === next.completedMilestones) {
    return true;
  }
  const prevSet = toMilestoneSet(prev.completedMilestones);
  const nextSet = toMilestoneSet(next.completedMilestones);
  return next.project.milestones.every((m) => prevSet.has(m.id) === nextSet.has(m.id));
}

export const PracticeProjectCard = memo(function PracticeProjectCard({
  project,
  completedMilestones,
  onToggleMilestone,
  showArchitectureBadge = false,
}: PracticeProjectCardProps) {
  const [openDrawer, setOpenDrawer] = usePersistedState<'none' | 'folder' | 'rules' | 'hints'>(
    `project.${project.id}.openDrawer`,
    'none',
    isDrawerMode
  );
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const completedSet = useMemo(
    () => toMilestoneSet(completedMilestones),
    [completedMilestones]
  );

  const doneCount = project.milestones.filter((m) => completedSet.has(m.id)).length;
  const percentDone =
    project.milestones.length > 0 ? Math.round((doneCount / project.milestones.length) * 100) : 0;

  const handleCopy = async () => {
    const md = buildMarkdownBrief(project);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6 dark:border-slate-700/80 dark:bg-[#162033]">
      {/* Quiet Eyebrow + Copy Action */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-semibold">
          <span
            className={
              project.difficulty === 'starter'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }
          >
            {project.difficulty === 'starter' ? 'Starter Project' : 'Stretch Project'}
          </span>
          {showArchitectureBadge && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                ARCHITECTURE_VISUALS[project.architectureId].pillClass
              }`}
            >
              <ArchitectureIcon architectureId={project.architectureId} className="h-3 w-3" />
              {getArchitectureLabel(project.architectureId, true)}
            </span>
          )}
          <span className="text-slate-400 dark:text-slate-500">· {project.estimatedTime}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Brief (.md)
            </>
          )}
        </button>
      </div>

      {/* Title & Summary */}
      <h3 className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
        <CourseText text={project.title} />
      </h3>
      <p className="prose-measure mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <CourseText text={project.summary} />
      </p>

      {/* Quiet Stack Line (No pill-tag clutter) */}
      <p className="mt-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {project.suggestedStack.join(' · ')}
      </p>

      {/* Checkable Milestones with Slim Progress Bar */}
      <div className="mt-5 border-t border-stone-200 pt-4 dark:border-slate-700/80">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Milestones
          </span>
          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-300">
            {doneCount}/{project.milestones.length} done
          </span>
        </div>

        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${percentDone}%` }}
          />
        </div>

        <div className="space-y-1.5">
          {project.milestones.map((m) => {
            const isChecked = completedSet.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onToggleMilestone(m.id)}
                className="flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition hover:bg-stone-50 sm:p-2 dark:hover:bg-[#0f172a]/70"
              >
                {isChecked ? (
                  <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                )}
                <div className="text-xs leading-5">
                  <p
                    className={`font-semibold ${
                      isChecked
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <CourseText text={m.title} interactive={false} />
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    <CourseText text={m.detail} interactive={false} />
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progressive Disclosure Footer: Folder Layout & Key Rules on demand */}
      <div className="mt-auto border-t border-stone-200 pt-4 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOpenDrawer((d) => (d === 'folder' ? 'none' : 'folder'))}
            className={`inline-flex items-center gap-1.5 py-1 transition sm:py-0 ${
              openDrawer === 'folder'
                ? 'text-indigo-600 dark:text-indigo-300'
                : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300'
            }`}
          >
            <FolderTree className="h-3.5 w-3.5" />
            {openDrawer === 'folder' ? 'Hide Folder Layout' : 'Folder Layout'}
          </button>

          <button
            type="button"
            onClick={() => setOpenDrawer((d) => (d === 'rules' ? 'none' : 'rules'))}
            className={`inline-flex items-center gap-1.5 py-1 transition sm:py-0 ${
              openDrawer === 'rules'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            {openDrawer === 'rules'
              ? 'Hide Rules'
              : `Key Rules (${project.architectureRules.length})`}
          </button>

          {project.starterHints && project.starterHints.length > 0 && (
            <button
              type="button"
              onClick={() => setOpenDrawer((d) => (d === 'hints' ? 'none' : 'hints'))}
              className={`inline-flex items-center gap-1.5 py-1 transition sm:py-0 ${
                openDrawer === 'hints'
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-300'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              {openDrawer === 'hints'
                ? 'Hide Hints'
                : `Starter Hints (${project.starterHints.length})`}
            </button>
          )}
        </div>

        {openDrawer === 'folder' && (
          <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-3 font-mono text-[11px] leading-6 text-slate-200 sm:p-3.5 sm:text-xs">
            {project.folderStructure}
          </pre>
        )}

        {openDrawer === 'rules' && (
          <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3.5">
            <ul className="space-y-1.5 text-xs leading-6 text-slate-700 dark:text-slate-200">
              {project.architectureRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>
                    <CourseText text={rule} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {openDrawer === 'hints' && project.starterHints && project.starterHints.length > 0 && (
          <div className="mt-3">
            <ImplementationDrawer recipes={project.starterHints} variant="inline" />
          </div>
        )}
      </div>
    </div>
  );
}, areProjectCardPropsEqual);
