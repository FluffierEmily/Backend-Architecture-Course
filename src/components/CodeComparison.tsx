import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CodeAnnotation, CodeComparisonItem } from '../types/course';

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

export function CodeComparison({ item, onInspect }: CodeComparisonProps) {
  const [selectedId, setSelectedId] = useState<string>(item.annotations[0]?.id ?? '');
  const [showAllExplainers, setShowAllExplainers] = useState(false);
  const [mobileTab, setMobileTab] = useState<ViewTab>('split');

  const activeIndex = Math.max(
    0,
    item.annotations.findIndex((a) => a.id === selectedId)
  );
  const activeAnnotation = item.annotations[activeIndex] ?? item.annotations[0];

  const handleSelect = (annotationId: string) => {
    setSelectedId(annotationId);
    onInspect?.(item.id);
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
                  const isActive =
                    matchedAnnotation &&
                    (showAllExplainers || matchedAnnotation.id === activeAnnotation?.id);
                  const isOtherAnnotated = matchedAnnotation && !isActive;

                  const lineProps = getLineProps({ line });

                  let highlightClasses = 'border-l-2 border-transparent hover:bg-white/[0.03]';
                  if (isActive) {
                    highlightClasses = isProblem
                      ? 'border-l-4 border-rose-400 bg-rose-500/15'
                      : 'border-l-4 border-emerald-400 bg-emerald-500/15';
                  } else if (isOtherAnnotated) {
                    highlightClasses = isProblem
                      ? 'border-l-2 border-rose-500/35 bg-rose-500/[0.04] hover:bg-rose-500/10 cursor-pointer'
                      : 'border-l-2 border-emerald-500/35 bg-emerald-500/[0.04] hover:bg-emerald-500/10 cursor-pointer';
                  }

                  return (
                    <div
                      key={lineNumber}
                      {...lineProps}
                      onClick={() => {
                        if (matchedAnnotation) handleSelect(matchedAnnotation.id);
                      }}
                      role={matchedAnnotation ? 'button' : undefined}
                      tabIndex={matchedAnnotation ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (matchedAnnotation && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSelect(matchedAnnotation.id);
                        }
                      }}
                      title={
                        matchedAnnotation ? `Inspect: ${matchedAnnotation.label}` : undefined
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
        {!showAllExplainers && activeAnnotation && (
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
        <button
          type="button"
          onClick={() => {
            setShowAllExplainers((prev) => !prev);
            onInspect?.(item.id);
          }}
          className="shrink-0 self-start text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
        >
          {showAllExplainers ? 'Focus One Highlight' : 'View All Explainers'}
        </button>
      </div>

      {/* Scenario Context */}
      <p className="prose-measure mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">Scenario: </span>
        {item.context}
      </p>

      {/* Quiet Highlight Selector Bar + Step Arrows + Mobile Toggle */}
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

      {/* Code Panes */}
      <div
        className={`grid gap-5 ${
          mobileTab === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {(mobileTab === 'split' || mobileTab === 'problem') && renderCodePane('problem')}
        {(mobileTab === 'split' || mobileTab === 'refactored') && renderCodePane('refactored')}
      </div>

      {/* All Explainers Expanded Comparison */}
      {showAllExplainers && (
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
