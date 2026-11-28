import { startTransition } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FoundationsPlayground } from '../components/FoundationsPlayground';
import { ArchitectureIcon } from '../components/ArchitectureIcon';
import { CourseText } from '../components/CourseText';
import { BEGINNER_GLOSSARY } from '../data/foundations';
import { usePersistedState } from '../hooks/usePersistedState';

interface FoundationsPageProps {
  isCompleted: boolean;
  onMarkComplete: () => void;
}

const FOUNDATION_STEPS = [
  { id: 'blocks', label: '1. Building Blocks' },
  { id: 'lab', label: '2. Interactive Labs' },
  { id: 'glossary', label: '3. Quick Glossary' },
] as const;

type FoundationStepId = (typeof FOUNDATION_STEPS)[number]['id'];

const isViewMode = (v: unknown): v is 'guided' | 'all' => v === 'guided' || v === 'all';
const isFoundationStepIdx = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < FOUNDATION_STEPS.length;

export function FoundationsPage({ isCompleted, onMarkComplete }: FoundationsPageProps) {
  const [viewMode, setViewMode] = usePersistedState<'guided' | 'all'>(
    'foundations.viewMode',
    'guided',
    isViewMode
  );
  const [stepIdx, setStepIdx] = usePersistedState<number>(
    'foundations.stepIdx',
    0,
    isFoundationStepIdx
  );

  const activeStep: FoundationStepId = FOUNDATION_STEPS[stepIdx].id;
  const isVisible = (id: FoundationStepId) => viewMode === 'all' || activeStep === id;

  const goToStep = (next: number) => {
    setStepIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-4 sm:space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>Module 0 · Beginner On-Ramp</span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                · <CheckCircle2 className="h-3.5 w-3.5" /> Completed
              </span>
            )}
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Backend Architecture Foundations
          </h1>
          <p className="prose-measure mt-2 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
            Every backend combines the same core building blocks. Take them one calm step at a time
            before comparing the 4 architectures.
          </p>
        </div>

        {/* Single Quiet Underline Tab Bar + Subtle View Mode Link */}
        <div className="flex flex-col gap-2 border-b border-stone-200 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-slate-700/80">
          {viewMode === 'guided' ? (
            <div
              className="no-scrollbar -mb-px flex w-full flex-nowrap gap-5 overflow-x-auto sm:w-auto sm:flex-wrap sm:gap-6"
              role="tablist"
            >
              {FOUNDATION_STEPS.map((step, i) => {
                const isActive = i === stepIdx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStepIdx(i)}
                    className={`shrink-0 whitespace-nowrap border-b-2 py-2.5 text-sm font-semibold transition sm:pt-0 sm:pb-3 ${
                      isActive
                        ? 'border-indigo-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="pb-2 text-xs font-medium text-slate-500 sm:pb-3 dark:text-slate-400">
              Showing all 3 sections on one page
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              startTransition(() => setViewMode((m) => (m === 'guided' ? 'all' : 'guided')))
            }
            className="self-start pb-2.5 text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 sm:self-auto sm:pb-3 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {viewMode === 'guided' ? 'All Sections' : 'Back to Guided Steps'}
          </button>
        </div>
      </header>

      {/* Step 1 & Step 2 */}
      {viewMode === 'all' ? (
        <FoundationsPlayground section="both" />
      ) : (
        <>
          {isVisible('blocks') && (
            <FoundationsPlayground section="blocks" onFinishBlocks={() => goToStep(1)} />
          )}
          {isVisible('lab') && <FoundationsPlayground section="lab" />}
        </>
      )}

      {/* Step 3: Beginner Glossary */}
      {isVisible('glossary') && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {BEGINNER_GLOSSARY.length} Architecture Terms You’ll Hear Everywhere
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A quick pocket glossary — plain English, no textbook jargon.
            </p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            {BEGINNER_GLOSSARY.map((item) => (
              <div
                key={item.term}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5 dark:border-slate-700/80 dark:bg-[#162033]"
              >
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-300">
                  <CourseText text={item.term} />
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <CourseText text={item.meaning} />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quiet Step Footer (Only shown when needed — Step 1 already has Next Block inside card) */}
      {viewMode === 'guided' && stepIdx === 1 && (
        <footer className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => goToStep(0)}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-stone-50 sm:w-auto dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Building Blocks
          </button>

          <button
            type="button"
            onClick={() => goToStep(2)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500 sm:w-auto"
          >
            Continue: 3. Quick Glossary
            <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      )}

      {(viewMode === 'all' || stepIdx === 2) && (
        <footer className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:p-5 dark:border-slate-700/80 dark:bg-[#162033]">
          <button
            type="button"
            onClick={onMarkComplete}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Foundations Marked Complete' : 'Mark Foundations Complete'}
          </button>

          <Link
            to="/modules/modular-monolith"
            onClick={onMarkComplete}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500 sm:w-auto"
          >
            <ArchitectureIcon architectureId="modular-monolith" className="h-4 w-4" />
            Next: 1. Modular Monolith
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      )}
    </div>
  );
}
