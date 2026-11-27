import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  HelpCircle,
} from 'lucide-react';
import type { CodeAnnotation, CodeComparisonItem } from '../types/course';
import { usePersistedState } from '../hooks/usePersistedState';

interface CodeComparisonProps {
  item: CodeComparisonItem;
  onInspect?: (id: string) => void;
}

type ViewTab = 'split' | 'problem' | 'refactored';

function isLineInRange(lineNumber: number, range: [number, number]): boolean {
  return lineNumber >= range[0] && lineNumber <= range[1];
}

function findAnnotationForLine(
  annotations: CodeAnnotation[],
  lineNumber: number,
  side: 'problem' | 'refactored'
): CodeAnnotation | undefined {
  return annotations.find((a) =>
    isLineInRange(lineNumber, side === 'problem' ? a.problemLines : a.refactoredLines)
  );
}

const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

export function CodeComparison({ item, onInspect }: CodeComparisonProps) {
  const [selectedId, setSelectedId] = usePersistedState<string>(
    `code.${item.id}.selectedAnnotationId`,
    item.annotations[0]?.id ?? '',
    (v): v is string => typeof v === 'string' && item.annotations.some((a) => a.id === v)
  );
  const [showAllExplainers, setShowAllExplainers] = usePersistedState<boolean>(
    `code.${item.id}.showAllExplainers`,
    false,
    isBoolean
  );
  const [mobileTab, setMobileTab] = useState<ViewTab>('split');
  const [quizMode, setQuizMode] = useState(false);
  const [spottedIds, setSpottedIds] = useState<string[]>([]);
  const [quizHint, setQuizHint] = useState<string | null>(null);

  const activeIndex = Math.max(
    0,
    item.annotations.findIndex((a) => a.id === selectedId)
  );
  const activeAnnotation = item.annotations[activeIndex] ?? item.annotations[0];
  const allSpotted = spottedIds.length === item.annotations.length;

  const handleSelect = (annotationId: string) => {
    setSelectedId(annotationId);
    onInspect?.(item.id);
  };

  const toggleQuizMode = () => {
    setQuizMode((prev) => {
      const next = !prev;
      if (next) {
        setShowAllExplainers(false);
        setSpottedIds([]);
        setQuizHint(null);
      }
      return next;
    });
  };

  const handleLineClick = (
    side: 'problem' | 'refactored',
    lineNumber: number,
    matchedAnnotation: CodeAnnotation | undefined
  ) => {
    if (quizMode && side === 'problem') {
      if (matchedAnnotation) {
        setSpottedIds((prev) =>
          prev.includes(matchedAnnotation.id) ? prev : [...prev, matchedAnnotation.id]
        );
        setQuizHint(null);
        handleSelect(matchedAnnotation.id);
      } else {
        setQuizHint(
          `Line ${lineNumber} looks safe — try clicking where coupling, timeouts, retries, or side effects happen.`
        );
      }
      return;
    }

    if (matchedAnnotation) {
      handleSelect(matchedAnnotation.id);
    }
  };

  const stepAnnotation = (delta: number) => {
    const nextIdx =
      (activeIndex + delta + item.annotations.length) % item.annotations.length;
    setShowAllExplainers(false);
    handleSelect(item.annotations[nextIdx].id);
  };

  const renderCodePane = (side: 'problem' | 'refactored') => {
    const isProblem = side === 'problem';
    const code = isProblem ? item.problemCode : item.refactoredCode;
    const title = isProblem ? item.problemTitle : item.refactoredTitle;
    const file = isProblem ? item.problemFile : item.refactoredFile;
    const isQuizProblem = quizMode && isProblem;

    return (
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border bg-[#0b1120] ${
          isProblem ? 'border-rose-500/25' : 'border-emerald-500/25'
        }`}
      >
        {/* Calm Pane Header */}
        <div
          className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${
            isProblem
              ? 'border-rose-500/20 bg-rose-950/25'
              : 'border-emerald-500/20 bg-emerald-950/25'
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isProblem ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <span
                className={`truncate text-sm font-semibold ${
                  isProblem ? 'text-rose-200' : 'text-emerald-200'
                }`}
              >
                {title}
              </span>
            </div>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-400">{file}</p>
          </div>
          <span
            className={`shrink-0 text-[11px] font-bold uppercase tracking-wider ${
              isProblem ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {isProblem ? 'Problematic' : 'Refactored'}
          </span>
        </div>

        {/* Highlighted Code with Comfortable Line Spacing */}
        <div className="overflow-x-auto py-4 text-[13.5px] leading-7">
          <Highlight theme={themes.nightOwl} code={code.trimEnd()} language="typescript">
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="m-0 bg-transparent font-mono">
                {tokens.map((line, idx) => {
                  const lineNumber = idx + 1;
                  const matchedAnnotation = findAnnotationForLine(
                    item.annotations,
                    lineNumber,
                    side
                  );

                  const isSpotted =
                    matchedAnnotation && spottedIds.includes(matchedAnnotation.id);

                  const isActive = isQuizProblem
                    ? Boolean(isSpotted)
                    : Boolean(
                        matchedAnnotation &&
                          (showAllExplainers || matchedAnnotation.id === activeAnnotation?.id)
                      );
                  const isOtherAnnotated = !isQuizProblem && Boolean(matchedAnnotation && !isActive);

                  const lineProps = getLineProps({ line });

                  let highlightClasses = isQuizProblem
                    ? 'border-l-2 border-transparent hover:bg-indigo-500/10 cursor-pointer'
                    : 'border-l-2 border-transparent hover:bg-white/[0.03]';
                  if (isActive) {
                    highlightClasses = isProblem
                      ? 'border-l-4 border-rose-400 bg-rose-500/15'
                      : 'border-l-4 border-emerald-400 bg-emerald-500/15';
                  } else if (isOtherAnnotated) {
                    highlightClasses = isProblem
                      ? 'border-l-2 border-rose-500/35 bg-rose-500/[0.04] hover:bg-rose-500/10 cursor-pointer'
                      : 'border-l-2 border-emerald-500/35 bg-emerald-500/[0.04] hover:bg-emerald-500/10 cursor-pointer';
                  }

                  const isInteractive = isQuizProblem || Boolean(matchedAnnotation);

                  return (
                    <div
                      key={lineNumber}
                      {...lineProps}
                      onClick={() => handleLineClick(side, lineNumber, matchedAnnotation)}
                      role={isInteractive ? 'button' : undefined}
                      tabIndex={isInteractive ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleLineClick(side, lineNumber, matchedAnnotation);
                        }
                      }}
                      title={
                        isQuizProblem
                          ? `Check line ${lineNumber}`
                          : matchedAnnotation
                          ? `Inspect: ${matchedAnnotation.label}`
                          : undefined
                      }
                      className={`flex px-3.5 py-0.5 transition-colors ${highlightClasses}`}
                    >
                      <span className="mr-4 inline-block w-6 shrink-0 select-none text-right text-xs text-slate-500">
                        {lineNumber}
                      </span>
                      <span className="flex-1 whitespace-pre">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </div>

        {/* Synced Single Explainer Footer */}
        {!quizMode && !showAllExplainers && activeAnnotation && (
          <div
            className={`mt-auto border-t px-5 py-4 text-sm ${
              isProblem
                ? 'border-rose-500/20 bg-rose-950/25 text-rose-100'
                : 'border-emerald-500/20 bg-emerald-950/25 text-emerald-100'
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isProblem ? 'text-rose-300' : 'text-emerald-300'
                }`}
              >
                {isProblem ? 'Why this breaks' : 'Why the refactor works'} ·{' '}
                {activeAnnotation.label}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                L
                {isProblem
                  ? `${activeAnnotation.problemLines[0]}–${activeAnnotation.problemLines[1]}`
                  : `${activeAnnotation.refactoredLines[0]}–${activeAnnotation.refactoredLines[1]}`}
              </span>
            </div>
            <p className="leading-7 text-slate-200">
              {isProblem
                ? activeAnnotation.problemExplanation
                : activeAnnotation.refactoredExplanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
          <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {item.subtitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 self-start">
          <button
            type="button"
            onClick={toggleQuizMode}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
              quizMode
                ? 'text-indigo-600 underline decoration-indigo-500/50 underline-offset-4 dark:text-indigo-300'
                : 'text-slate-500 underline decoration-slate-400/50 underline-offset-4 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {quizMode ? 'Exit Quiz Mode' : 'Quiz Me First'}
          </button>

          {!quizMode && (
            <button
              type="button"
              onClick={() => {
                setShowAllExplainers((prev) => !prev);
                onInspect?.(item.id);
              }}
              className="text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
            >
              {showAllExplainers ? 'Focus One Highlight' : 'View All Explainers'}
            </button>
          )}
        </div>
      </div>

      {/* Scenario Context */}
      <p className="prose-measure mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">Scenario: </span>
        {item.context}
      </p>

      {/* Quiet Highlight Selector Bar (Hidden during Quiz Mode so pitfalls aren't spoiled) */}
      {!quizMode && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 dark:border-slate-700/80">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Code highlights"
          >
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Focus:
            </span>
            {item.annotations.map((ann) => {
              const isSelected = !showAllExplainers && ann.id === activeAnnotation?.id;
              return (
                <button
                  key={ann.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setShowAllExplainers(false);
                    handleSelect(ann.id);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {ann.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {item.annotations.length > 1 && !showAllExplainers && (
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous highlight"
                  onClick={() => stepAnnotation(-1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next highlight"
                  onClick={() => stepAnnotation(1)}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mobile pane switcher */}
            <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-0.5 text-xs lg:hidden dark:border-slate-700 dark:bg-[#0f172a]">
              {(['split', 'problem', 'refactored'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMobileTab(tab)}
                  className={`rounded-lg px-2.5 py-1 font-medium capitalize transition ${
                    mobileTab === tab
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab === 'problem' ? 'Problematic' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Panes (Or Problem + Spot-the-Pitfall Panel in Quiz Mode) */}
      <div
        className={`grid gap-5 ${
          quizMode || mobileTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {(quizMode || mobileTab === 'split' || mobileTab === 'problem') &&
          renderCodePane('problem')}

        {quizMode ? (
          <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-50 p-6 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="text-indigo-600 dark:text-indigo-400">
                  Spot the Pitfall · Active Recall
                </span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  Spotted {spottedIds.length} of {item.annotations.length}
                </span>
              </div>

              <h4 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
                {allSpotted
                  ? 'You spotted every pitfall!'
                  : 'Click the risky lines in the Problematic code'}
              </h4>
              <p className="prose-measure mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {allSpotted
                  ? 'Reveal the Refactored code to compare how each issue is fixed cleanly.'
                  : 'Tap any line on the left that looks risky before peeking at the refactored solution.'}
              </p>

              {/* Progress Track */}
              <div className="mt-4 flex gap-1.5" aria-hidden="true">
                {item.annotations.map((ann) => (
                  <div
                    key={ann.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      spottedIds.includes(ann.id)
                        ? 'bg-emerald-500'
                        : 'bg-stone-200 dark:bg-slate-700/80'
                    }`}
                  />
                ))}
              </div>

              {quizHint && (
                <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs leading-5 text-amber-900 dark:text-amber-200">
                  {quizHint}
                </p>
              )}

              {/* Revealed Explanations for Spotted Pitfalls */}
              {spottedIds.length > 0 && (
                <div className="mt-4 space-y-3">
                  {item.annotations
                    .filter((a) => spottedIds.includes(a.id))
                    .map((ann) => (
                      <div
                        key={ann.id}
                        className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3.5 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <span className="inline-flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Spotted: {ann.label}
                          </span>
                          <span className="font-mono">
                            L{ann.problemLines[0]}–{ann.problemLines[1]}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-6 text-slate-700 dark:text-slate-200">
                          {ann.problemExplanation}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-stone-200 pt-4 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  setQuizMode(false);
                  onInspect?.(item.id);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
              >
                <Eye className="h-4 w-4" />
                Reveal Refactored Code
              </button>
            </div>
          </div>
        ) : (
          (mobileTab === 'split' || mobileTab === 'refactored') && renderCodePane('refactored')
        )}
      </div>

      {/* All Explainers Expanded Comparison */}
      {!quizMode && showAllExplainers && (
        <div className="mt-5 space-y-3.5">
          {item.annotations.map((ann) => (
            <div
              key={ann.id}
              className="grid gap-3.5 rounded-2xl border border-stone-200 bg-stone-50 p-4 lg:grid-cols-2 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
            >
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] p-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-300">
                  <span>Problematic · {ann.label}</span>
                  <span className="font-mono">
                    L{ann.problemLines[0]}–{ann.problemLines[1]}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {ann.problemExplanation}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4">
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>Refactored · {ann.label}</span>
                  <span className="font-mono">
                    L{ann.refactoredLines[0]}–{ann.refactoredLines[1]}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {ann.refactoredExplanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
