import { memo, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Copy, Wrench } from 'lucide-react';
import type { ImplementationRecipe } from '../types/course';

interface ImplementationDrawerProps {
  recipes: ImplementationRecipe[];
  triggerLabel?: string;
  variant?: 'card' | 'compact' | 'inline';
  className?: string;
}

export const ImplementationDrawer = memo(function ImplementationDrawer({
  recipes,
  triggerLabel = 'How to Implement',
  variant = 'card',
  className = '',
}: ImplementationDrawerProps) {
  const [open, setOpen] = useState(variant === 'inline');
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveIdx(0);
    setOpen(variant === 'inline');
    setCopied(false);
  }, [recipes, variant]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  if (recipes.length === 0) return null;

  const activeRecipe = recipes[activeIdx] ?? recipes[0];

  const handleCopy = async (snippet: string) => {
    try {
      await navigator.clipboard.writeText(snippet);
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

  const previewLabels = recipes.map((r) => r.label).join(' · ');

  return (
    <div className={className}>
      {variant === 'inline' ? null : variant === 'compact' ? (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>{open ? 'Hide implementation steps' : `${triggerLabel}: ${activeRecipe.label}`}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
            open
              ? 'border-indigo-500/35 bg-indigo-500/[0.08] text-slate-900 dark:text-white'
              : 'border-stone-200 bg-stone-50/90 text-slate-700 hover:border-indigo-400/50 hover:bg-indigo-500/[0.04] dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:text-slate-200 dark:hover:border-indigo-400/40'
          }`}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
              <Wrench className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {triggerLabel}
                {recipes.length > 1 ? ` (${recipes.length} quick guides)` : ''}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {previewLabels}
              </p>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
            {open ? 'Hide' : 'Open'}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
      )}

      {open && (
        <div
          className={`${
            variant === 'inline' ? '' : 'mt-3 '
          }space-y-4 rounded-xl border border-indigo-500/20 bg-stone-50/90 p-4 sm:p-5 dark:border-indigo-500/25 dark:bg-[#0f172a]/85`}
        >
          {/* Calm 1-at-a-time pill switcher when multiple recipes exist */}
          {recipes.length > 1 && (
            <div
              className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3 dark:border-slate-700/80"
              role="tablist"
              aria-label="Implementation guides"
            >
              {recipes.map((recipe, idx) => {
                const isSelected = idx === activeIdx;
                return (
                  <button
                    key={recipe.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setActiveIdx(idx);
                      setCopied(false);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-stone-200/70 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {idx + 1}. {recipe.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Recipe Summary */}
          <p className="prose-measure text-sm leading-6 text-slate-700 dark:text-slate-200">
            {activeRecipe.summary}
          </p>

          {/* Numbered Micro-Steps */}
          <ol className="space-y-2">
            {activeRecipe.steps.map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-2.5 text-xs leading-6 text-slate-700 sm:text-[13px] dark:text-slate-200"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  {i + 1}
                </span>
                <span className="prose-measure">{step}</span>
              </li>
            ))}
          </ol>

          {/* Optional Copyable Starter Snippet */}
          {activeRecipe.code && (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120]">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3.5 py-2">
                <span className="truncate font-mono text-[11px] font-medium text-slate-400">
                  {activeRecipe.code.filename}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(activeRecipe.code!.snippet)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-3.5 font-mono text-xs leading-6 text-slate-200">
                <code>{activeRecipe.code.snippet.trimEnd()}</code>
              </pre>
            </div>
          )}

          {/* Optional Single-Line Gotcha */}
          {activeRecipe.watchOut && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs leading-5 text-amber-950 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong className="text-amber-800 dark:text-amber-300">Gotcha: </strong>
                {activeRecipe.watchOut}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
