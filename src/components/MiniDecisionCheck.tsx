import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import type { ArchitectureId, MiniDecisionCheckItem } from '../types/course';
import { ARCHITECTURE_BY_ID } from '../data';
import { usePersistedState } from '../hooks/usePersistedState';
import { ArchitectureIcon } from './ArchitectureIcon';

interface MiniDecisionCheckProps {
  storageKey?: string;
  architectureId?: ArchitectureId;
  architectureName: string;
  checks: MiniDecisionCheckItem[];
  onCompleteCheck?: (checkId: string) => void;
}

const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
const isAnswerRecord = (v: unknown): v is Record<string, boolean> =>
  Boolean(v) &&
  typeof v === 'object' &&
  !Array.isArray(v) &&
  Object.values(v as Record<string, unknown>).every((val) => typeof val === 'boolean');

export function MiniDecisionCheck({
  storageKey = 'default',
  architectureId,
  architectureName,
  checks,
  onCompleteCheck,
}: MiniDecisionCheckProps) {
  const [activeIndex, setActiveIndex] = usePersistedState<number>(
    `minicheck.${storageKey}.activeIndex`,
    0,
    (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < checks.length
  );
  const [showAll, setShowAll] = usePersistedState<boolean>(
    `minicheck.${storageKey}.showAll`,
    false,
    isBoolean
  );
  const [answers, setAnswers] = usePersistedState<Record<string, boolean>>(
    `minicheck.${storageKey}.answers`,
    {},
    isAnswerRecord
  );

  const handleAnswer = (checkId: string, choice: boolean) => {
    setAnswers((prev) => ({ ...prev, [checkId]: choice }));
    onCompleteCheck?.(checkId);
  };

  const renderCheckContent = (check: MiniDecisionCheckItem, index: number, isSingle: boolean) => {
    const hasAnswered = check.id in answers;
    const userChoice = answers[check.id];
    const isCorrect = hasAnswered && userChoice === check.isGoodFit;
    const betterArch = check.betterAlternative
      ? ARCHITECTURE_BY_ID[check.betterAlternative]
      : undefined;

    return (
      <div
        key={check.id}
        className={
          isSingle
            ? ''
            : 'rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]'
        }
      >
        {!isSingle && (
          <p className="mb-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Check {index + 1} of {checks.length}
          </p>
        )}

        <p className="prose-measure text-base font-semibold leading-7 text-slate-900 dark:text-white">
          {check.prompt}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAnswer(check.id, true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              hasAnswered && userChoice === true
                ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {architectureId && (
              <ArchitectureIcon
                architectureId={architectureId}
                className="h-3.5 w-3.5"
                colored={!(hasAnswered && userChoice === true)}
              />
            )}
            Good fit for {architectureName}
          </button>
          <button
            type="button"
            onClick={() => handleAnswer(check.id, false)}
            className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
              hasAnswered && userChoice === false
                ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Pick a different architecture
          </button>
        </div>

        {hasAnswered && (
          <div
            className={`mt-5 rounded-xl border p-4 text-sm sm:p-5 ${
              isCorrect
                ? 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-950 dark:text-emerald-100'
                : 'border-amber-500/25 bg-amber-500/[0.08] text-amber-950 dark:text-amber-100'
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2 font-bold">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Spot on!
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-amber-500" />
                  Not quite — here’s why:
                </>
              )}
            </div>
            <p className="prose-measure leading-7 text-slate-700 dark:text-slate-200">
              {check.explanation}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {betterArch ? (
                <Link
                  to={`/modules/${betterArch.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 underline decoration-indigo-500/40 underline-offset-4 hover:text-indigo-500 dark:text-indigo-300"
                >
                  <ArchitectureIcon architectureId={betterArch.id} className="h-3.5 w-3.5" colored />
                  Explore {betterArch.name} →
                </Link>
              ) : (
                <span />
              )}

              {isSingle && index < checks.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveIndex(index + 1)}
                  className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
                >
                  Next Check
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showAll) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            Focus One at a Time
          </button>
        </div>
        {checks.map((check, i) => renderCheckContent(check, i, false))}
      </div>
    );
  }

  const activeCheck = checks[activeIndex] ?? checks[0];
  if (!activeCheck) return null;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
      {/* Slim Progress Header matching Foundations */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Check {activeIndex + 1} of {checks.length}
          </span>

          <div className="flex items-center gap-3">
            {checks.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
              >
                Show All ({checks.length})
              </button>
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                aria-label="Previous check"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={activeIndex === checks.length - 1}
                onClick={() => setActiveIndex((i) => Math.min(checks.length - 1, i + 1))}
                aria-label="Next check"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Segmented Progress Track */}
        <div className="flex gap-1.5" aria-hidden="true">
          {checks.map((c, idx) => {
            const answered = c.id in answers;
            const correct = answered && answers[c.id] === c.isGoodFit;
            return (
              <button
                key={c.id}
                type="button"
                tabIndex={-1}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx === activeIndex
                    ? 'bg-indigo-500'
                    : correct
                    ? 'bg-emerald-500/70'
                    : answered
                    ? 'bg-amber-400/70'
                    : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-700/80 dark:hover:bg-slate-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      {renderCheckContent(activeCheck, activeIndex, true)}
    </div>
  );
}
