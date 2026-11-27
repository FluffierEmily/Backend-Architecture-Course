import { useState } from 'react';
import {
  Check,
  CheckSquare,
  Clock,
  Copy,
  FolderTree,
  ShieldAlert,
  Square,
  Wrench,
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
  const [showFolder, setShowFolder] = useState(false);
  const [copied, setCopied] = useState(false);

  const doneCount = project.milestones.filter((m) =>
    completedMilestones.includes(m.id)
  ).length;

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
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
              project.difficulty === 'starter'
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
            }`}
          >
            {project.difficulty === 'starter' ? 'Starter Project' : 'Stretch Project'}
          </span>
          {showArchitectureBadge && (
            <span className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              {ARCHITECTURE_BY_ID[project.architectureId].shortName}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {project.estimatedTime}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy Brief (.md)
            </>
          )}
        </button>
      </div>

      <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">{project.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {project.summary}
      </p>

      {/* Stack Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Wrench className="mr-1 h-3.5 w-3.5 text-slate-400" />
        {project.suggestedStack.map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Collapsible Folder Structure */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowFolder((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          <FolderTree className="h-3.5 w-3.5" />
          {showFolder ? 'Hide Suggested Layout' : 'Show Suggested Folder Layout'}
        </button>
        {showFolder && (
          <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-relaxed text-slate-200">
            {project.folderStructure}
          </pre>
        )}
      </div>

      {/* Checkable Milestones */}
      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Self-Paced Milestones
          </span>
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {doneCount}/{project.milestones.length} done
          </span>
        </div>
        <div className="space-y-2">
          {project.milestones.map((m) => {
            const isChecked = completedMilestones.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onToggleMilestone(m.id)}
                className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                {isChecked ? (
                  <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                )}
                <div className="text-xs">
                  <p
                    className={`font-semibold ${
                      isChecked
                        ? 'text-slate-400 line-through'
                        : 'text-slate-800 dark:text-slate-200'
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

      {/* Architectural Constraints */}
      <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-3.5 w-3.5" />
          Key Architectural Rules
        </p>
        <ul className="space-y-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
          {project.architectureRules.map((rule) => (
            <li key={rule} className="flex gap-1.5">
              <span className="text-amber-500">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
