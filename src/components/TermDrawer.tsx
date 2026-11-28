import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Check,
  Code2,
  Copy,
  Sparkles,
  X,
} from 'lucide-react';
import { ABBREVIATION_BY_ID, type TermCategory } from '../data/abbreviations';
import { useTermDrawer } from '../context/TermDrawerContext';
import { CourseText } from './CourseText';

const CATEGORY_META: Record<TermCategory, { label: string; pillClass: string }> = {
  architecture: {
    label: 'Architecture',
    pillClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  },
  data: {
    label: 'Data & Storage',
    pillClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  },
  networking: {
    label: 'Networking & APIs',
    pillClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  security: {
    label: 'Security & Auth',
    pillClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  },
  reliability: {
    label: 'Reliability',
    pillClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  },
  ops: {
    label: 'Operations & Cloud',
    pillClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
  general: {
    label: 'Concept',
    pillClass: 'bg-stone-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

export function TermDrawer() {
  const { activeTerm, previousTerm, openTerm, goBack, closeTerm } = useTermDrawer();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCopied(false);
    if (activeTerm) {
      closeBtnRef.current?.focus();
    }
  }, [activeTerm]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const isOpen = Boolean(activeTerm?.drawer);
  const drawer = activeTerm?.drawer;
  const cat = activeTerm ? CATEGORY_META[activeTerm.category] : CATEGORY_META.general;

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const relatedEntries = (drawer?.relatedTerms ?? [])
    .map((id) => ABBREVIATION_BY_ID[id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.drawer));

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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]"
          onClick={closeTerm}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={activeTerm ? `${activeTerm.term} — ${activeTerm.fullName}` : 'Term guide'}
        aria-hidden={!isOpen}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] w-full flex-col rounded-t-2xl border-t border-stone-200 bg-white shadow-2xl transition-[transform,opacity,visibility] duration-200 ease-out sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:max-w-md sm:rounded-none sm:border-t-0 sm:border-l dark:border-slate-800 dark:bg-[#0c1322] ${
          isOpen
            ? 'visible translate-y-0 opacity-100 sm:translate-x-0'
            : 'invisible pointer-events-none translate-y-full opacity-0 sm:translate-y-0 sm:translate-x-full'
        }`}
      >
        {activeTerm && drawer && (
          <>
            {/* Mobile Sheet Handle */}
            <div className="flex justify-center pt-2.5 pb-0.5 sm:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-stone-300 dark:bg-slate-700" />
            </div>

            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-3.5 sm:px-5 sm:py-5 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${cat.pillClass}`}>
                    {cat.label}
                  </span>
                  {previousTerm && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex items-center gap-1 py-0.5 text-xs font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to {previousTerm.term}
                    </button>
                  )}
                </div>

                <h2 className="mt-1.5 font-mono text-xl font-extrabold tracking-tight text-slate-900 sm:mt-2 sm:text-2xl dark:text-white">
                  {activeTerm.term}
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                  {activeTerm.fullName}
                </p>
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeTerm}
                aria-label="Close term explanation drawer"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Calm Scrollable Body */}
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              {/* Plain English Summary */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.07] p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <BookOpen className="h-3.5 w-3.5" />
                  In Plain English
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-800 dark:text-slate-100">
                  <CourseText text={drawer.plainEnglish} />
                </p>
              </div>

              {/* How It's Used */}
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  How It’s Used in Backends
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {drawer.howItsUsed.map((point, idx) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                        {idx + 1}
                      </span>
                      <span>
                        <CourseText text={point} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Code */}
              {drawer.example && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                    Example
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-3.5 py-2">
                      <span className="truncate font-mono text-[11px] font-medium text-slate-400">
                        {drawer.example.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(drawer.example!.snippet)}
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
                      <code>{drawer.example.snippet.trimEnd()}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Optional Watch-Out */}
              {drawer.watchOut && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3.5 text-xs leading-5 text-amber-950 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong className="text-amber-800 dark:text-amber-300">Watch out: </strong>
                    <CourseText text={drawer.watchOut} />
                  </span>
                </div>
              )}

              {/* Related Terms */}
              {relatedEntries.length > 0 && (
                <div className="border-t border-stone-200 pt-4 dark:border-slate-800">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Related Terms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {relatedEntries.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => openTerm(rel.id)}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-indigo-400/50 dark:hover:text-indigo-300"
                      >
                        <span className="font-mono">{rel.term}</span>
                        <span className="ml-1.5 font-normal text-slate-400 dark:text-slate-500">
                          {rel.fullName.split(' (')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quiet Footer Tip */}
            <div className="border-t border-stone-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[11px] text-slate-500 sm:px-5 dark:border-slate-800 dark:text-slate-400">
              <span className="sm:hidden">Tap outside or press × to return to your place.</span>
              <span className="hidden sm:inline">
                Press{' '}
                <kbd className="rounded border border-stone-300 px-1 py-0.5 font-mono text-[10px] dark:border-slate-700">
                  Esc
                </kbd>{' '}
                or click outside to return to your place.
              </span>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
