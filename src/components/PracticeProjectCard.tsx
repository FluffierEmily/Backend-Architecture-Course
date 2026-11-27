import { useState } from 'react';
import {
  Check,
  CheckSquare,
  Copy,
  FolderTree,
  ShieldAlert,
  Square,
} from 'lucide-react';
import type { PracticeProject } from '../types/course';
import { ARCHITECTURE_BY_ID } from '../data';

interface PracticeProjectCardProps {
  project: PracticeProject;
  completedMilestones: string[];
  onToggleMilestone: (milestoneId: string) => void;
  showArchitectureBadge?: boolean;
}

function buildMarkdownBrief(project: PracticeProject): string {
  const archName = ARCHITECTURE_BY_ID[project.architectureId].name;
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
    '',
  ].join('\n');
}

export function PracticeProjectCard({
  project,
  completedMilestones,
  onToggleMilestone,
  showArchitectureBadge = false,
}: PracticeProjectCardProps) {
  const [openDrawer, setOpenDrawer] = useState<'none' | 'folder' | 'rules'>('none');
  const [copied, setCopied] = useState(false);

  const doneCount = project.milestones.filter((m) =>
    completedMilestones.includes(m.id)
  ).length;
  const percentDone =
    project.milestones.length > 0 ? Math.round((doneCount / project.milestones.length) * 100) : 0;

  const handleCopy = async () => {
    const md = buildMarkdownBrief(project);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]">
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
            <span className="text-slate-400 dark:text-slate-500">
              · {ARCHITECTURE_BY_ID[project.architectureId].shortName}
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
        {project.title}
      </h3>
      <p className="prose-measure mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {project.summary}
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
            const isChecked = completedMilestones.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onToggleMilestone(m.id)}
                className="flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition hover:bg-stone-50 dark:hover:bg-[#0f172a]/70"
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
                    {m.title}
                  </p>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">{m.detail}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progressive Disclosure Footer: Folder Layout & Key Rules on demand */}
      <div className="mt-auto border-t border-stone-200 pt-4 dark:border-slate-700/80">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOpenDrawer((d) => (d === 'folder' ? 'none' : 'folder'))}
            className={`inline-flex items-center gap-1.5 transition ${
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
            className={`inline-flex items-center gap-1.5 transition ${
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
        </div>

        {openDrawer === 'folder' && (
          <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-3.5 font-mono text-xs leading-6 text-slate-200">
            {project.folderStructure}
          </pre>
        )}

        {openDrawer === 'rules' && (
          <div className="mt-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3.5">
            <ul className="space-y-1.5 text-xs leading-6 text-slate-700 dark:text-slate-200">
              {project.architectureRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-amber-500">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
