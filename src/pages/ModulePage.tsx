import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { ARCHITECTURE_BY_ID, ARCHITECTURE_MODULES } from '../data';
import type { ArchitectureId, ArchitectureModule } from '../types/course';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import {
  ArchitectureIcon,
  ArchitectureIconBadge,
  ARCHITECTURE_VISUALS,
} from '../components/ArchitectureIcon';
import { CodeComparison } from '../components/CodeComparison';
import { MiniDecisionCheck } from '../components/MiniDecisionCheck';
import { PatternDiagram, hasPatternDiagram } from '../components/PatternDiagram';
import { PracticeProjectCard } from '../components/PracticeProjectCard';
import type { CourseProgressState } from '../hooks/useCourseProgress';
import { usePersistedState } from '../hooks/usePersistedState';

interface ModulePageProps {
  progress: CourseProgressState;
  onMarkSectionComplete: (sectionId: string) => void;
  onInspectComparison: (comparisonId: string) => void;
  onCompleteMiniCheck: (checkId: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

const MODULE_STEPS = [
  { id: 'story', shortLabel: '1. Story', fullLabel: 'Overview & Real-World Story' },
  { id: 'diagram', shortLabel: '2. Visual Flow', fullLabel: 'Interactive Flow & Mental Models' },
  { id: 'code', shortLabel: '3. Code', fullLabel: 'Problematic vs. Refactored Code' },
  { id: 'practices', shortLabel: '4. Dos & Don’ts', fullLabel: 'Best Practices & Pitfalls' },
  { id: 'checks', shortLabel: '5. Quick Check', fullLabel: 'Test Your Intuition' },
  { id: 'projects', shortLabel: '6. Projects', fullLabel: 'Self-Paced Practice Projects' },
] as const;

type ModuleStepId = (typeof MODULE_STEPS)[number]['id'];

const isViewMode = (v: unknown): v is 'guided' | 'all' => v === 'guided' || v === 'all';
const isPracticeTab = (v: unknown): v is 'do' | 'avoid' => v === 'do' || v === 'avoid';
const isNumberArray = (v: unknown): v is number[] =>
  Array.isArray(v) && v.every((item) => typeof item === 'number' && Number.isInteger(item));

export function ModulePage(props: ModulePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const mod = slug ? ARCHITECTURE_BY_ID[slug as ArchitectureId] : undefined;

  if (!mod) {
    return <Navigate to="/" replace />;
  }

  return <ModulePageContent key={mod.id} mod={mod} {...props} />;
}

interface ModulePageContentProps extends ModulePageProps {
  mod: ArchitectureModule;
}

function ModulePageContent({
  mod,
  progress,
  onMarkSectionComplete,
  onInspectComparison,
  onCompleteMiniCheck,
  onToggleMilestone,
}: ModulePageContentProps) {
  const keyPrefix = `module.${mod.id}`;
  const [viewMode, setViewMode] = usePersistedState<'guided' | 'all'>(
    `${keyPrefix}.viewMode`,
    'guided',
    isViewMode
  );
  const [stepIdx, setStepIdx] = usePersistedState<number>(
    `${keyPrefix}.stepIdx`,
    0,
    (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < MODULE_STEPS.length
  );
  const [conceptIdx, setConceptIdx] = usePersistedState<number>(
    `${keyPrefix}.conceptIdx`,
    0,
    (v): v is number =>
      typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < mod.deepDiveConcepts.length
  );
  const [conceptJumpOpen, setConceptJumpOpen] = useState(false);
  const [visitedConcepts, setVisitedConcepts] = usePersistedState<number[]>(
    `${keyPrefix}.visitedConcepts`,
    [0],
    isNumberArray
  );
  const [codeIdx, setCodeIdx] = usePersistedState<number>(
    `${keyPrefix}.codeIdx`,
    0,
    (v): v is number =>
      typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < mod.codeComparisons.length
  );
  const [practiceTab, setPracticeTab] = usePersistedState<'do' | 'avoid'>(
    `${keyPrefix}.practiceTab`,
    'do',
    isPracticeTab
  );

  const currentIdx = ARCHITECTURE_MODULES.findIndex((m) => m.id === mod.id);
  const prevMod = currentIdx > 0 ? ARCHITECTURE_MODULES[currentIdx - 1] : null;
  const nextMod =
    currentIdx < ARCHITECTURE_MODULES.length - 1
      ? ARCHITECTURE_MODULES[currentIdx + 1]
      : null;
  const isCompleted = progress.completedSections.includes(mod.id);

  const activeStep: ModuleStepId = MODULE_STEPS[stepIdx].id;
  const isVisible = (id: ModuleStepId) => viewMode === 'all' || activeStep === id;

  const goToStep = (nextIndex: number) => {
    setStepIdx(nextIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectConcept = (index: number) => {
    setConceptIdx(index);
    setConceptJumpOpen(false);
    setVisitedConcepts((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  const activeConcept = mod.deepDiveConcepts[conceptIdx] ?? mod.deepDiveConcepts[0];
  const activeCodeItem = mod.codeComparisons[codeIdx] ?? mod.codeComparisons[0];
  const visual = ARCHITECTURE_VISUALS[mod.id];

  return (
    <div className="space-y-8">
      {/* Calm Header matching Foundations */}
      <header className="space-y-5">
        <div className="flex items-start gap-4">
          <ArchitectureIconBadge architectureId={mod.id} size="lg" className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <div
              className={`flex flex-wrap items-center gap-2 text-xs font-semibold ${visual.eyebrowColor}`}
            >
              <span>
                Module {mod.order} of {ARCHITECTURE_MODULES.length}
              </span>
              {viewMode === 'guided' && (
                <span className="text-slate-400 dark:text-slate-500">
                  · Step {stepIdx + 1} of {MODULE_STEPS.length}
                </span>
              )}
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  · <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </span>
              )}
            </div>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {mod.name}
            </h1>
            <p className="prose-measure mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
              {mod.tagline}
            </p>
          </div>
        </div>

        {/* Single Quiet Underline Tab Bar + Subtle View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-700/80">
          {viewMode === 'guided' ? (
            <div className="-mb-px flex flex-wrap gap-x-5 gap-y-2" role="tablist">
              {MODULE_STEPS.map((step, i) => {
                const isActive = i === stepIdx;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStepIdx(i)}
                    className={`border-b-2 pb-3 text-sm font-semibold transition ${
                      isActive
                        ? 'border-indigo-500 text-slate-900 dark:text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {step.shortLabel}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="pb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing all {MODULE_STEPS.length} sections on one page
            </span>
          )}

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'guided' ? 'all' : 'guided'))}
            className="pb-3 text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {viewMode === 'guided' ? 'All Sections' : 'Back to Guided Steps'}
          </button>
        </div>
      </header>

      {/* STEP 1: Story & Overview */}
      {isVisible('story') && (
        <div className="space-y-6">
          {/* Unified Core Idea + Real-World Scenario Card */}
          <section
            id="scenario"
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]"
          >
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.08] p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                TL;DR — The Core Idea
              </p>
              <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-800 dark:text-slate-100">
                {mod.beginnerSummary}
              </p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Real-World Example · {mod.scenario.company}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                {mod.scenario.domain}
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                <strong>Team:</strong> {mod.scenario.teamSize} &nbsp;·&nbsp;{' '}
                <strong>Traffic:</strong> {mod.scenario.trafficProfile}
              </p>

              <p className="prose-measure mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">
                {mod.scenario.story}
              </p>

              <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-4 text-sm leading-7 text-slate-800 dark:text-slate-100">
                <strong>Why this fits: </strong>
                {mod.scenario.whyThisArchitecture}
              </div>
            </div>
          </section>

          {/* When to Use / Avoid */}
          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-6">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                <ThumbsUp className="h-4 w-4" /> Use {mod.shortName} When
              </h2>
              <ul className="mt-3.5 space-y-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                {mod.whenToUse.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="font-bold text-emerald-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-6">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                <ThumbsDown className="h-4 w-4" /> Avoid It When
              </h2>
              <ul className="mt-3.5 space-y-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                {mod.whenToAvoid.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="font-bold text-rose-500">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}

      {/* STEP 2: Interactive Diagram & Mental Models */}
      {isVisible('diagram') && (
        <div className="space-y-8">
          <section id="diagram">
            <ArchitectureDiagram
              key={mod.id}
              storageKey={mod.id}
              architectureId={mod.id}
              data={mod.diagram}
            />
          </section>

          <section id="concepts" className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Essential Mental Models
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                Key {mod.shortName} Patterns &amp; Trade-Offs
              </h2>
            </div>

            {viewMode === 'guided' && activeConcept ? (
              /* Single Calm Pattern Card (Foundations-style stepper) */
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
                <div className="mb-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setConceptJumpOpen((o) => !o)}
                        aria-expanded={conceptJumpOpen}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <span>
                          Pattern {conceptIdx + 1} of {mod.deepDiveConcepts.length}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </button>

                      {conceptJumpOpen && (
                        <div className="absolute left-0 z-20 mt-1.5 w-72 rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-[#0f172a]">
                          {mod.deepDiveConcepts.map((c, idx) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => selectConcept(idx)}
                              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                                idx === conceptIdx
                                  ? 'bg-indigo-500/15 font-semibold text-indigo-700 dark:text-indigo-300'
                                  : 'text-slate-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="truncate">
                                {idx + 1}. {c.title}
                              </span>
                              {visitedConcepts.includes(idx) && (
                                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={conceptIdx === 0}
                        onClick={() => selectConcept(Math.max(0, conceptIdx - 1))}
                        aria-label="Previous pattern"
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={conceptIdx === mod.deepDiveConcepts.length - 1}
                        onClick={() =>
                          selectConcept(Math.min(mod.deepDiveConcepts.length - 1, conceptIdx + 1))
                        }
                        aria-label="Next pattern"
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quiet Segmented Progress Track */}
                  <div className="flex gap-1.5" aria-hidden="true">
                    {mod.deepDiveConcepts.map((c, idx) => (
                      <button
                        key={c.id}
                        type="button"
                        tabIndex={-1}
                        title={`${idx + 1}. ${c.title}`}
                        onClick={() => selectConcept(idx)}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          idx === conceptIdx
                            ? 'bg-indigo-500'
                            : visitedConcepts.includes(idx)
                            ? 'bg-indigo-400/40 hover:bg-indigo-400/70'
                            : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-700/80 dark:hover:bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeConcept.badge}
                </p>
                <h3 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  {activeConcept.title}
                </h3>
                <p className="prose-measure mt-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {activeConcept.summary}
                </p>

                {activeConcept.bulletPoints && activeConcept.bulletPoints.length > 0 && (
                  <ul className="prose-measure mt-4 space-y-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {activeConcept.bulletPoints.map((bp) => (
                      <li key={bp} className="flex gap-2.5">
                        <span className="font-bold text-indigo-500">→</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {hasPatternDiagram(activeConcept.id) && (
                  <PatternDiagram conceptId={activeConcept.id} />
                )}

                <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-4 text-sm leading-6 text-slate-800 dark:text-slate-100">
                  <strong>Key Takeaway: </strong>
                  {activeConcept.keyTakeaway}
                </div>

                {conceptIdx < mod.deepDiveConcepts.length - 1 && (
                  <div className="mt-6 flex justify-end border-t border-stone-200 pt-4 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => selectConcept(conceptIdx + 1)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-stone-100 px-4 py-2 text-xs font-bold text-slate-800 transition hover:bg-stone-200 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Next Pattern: {mod.deepDiveConcepts[conceptIdx + 1].title}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {mod.deepDiveConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]"
                  >
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {concept.badge}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-slate-900 dark:text-white">
                        {concept.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {concept.summary}
                      </p>

                      {concept.bulletPoints && concept.bulletPoints.length > 0 && (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {concept.bulletPoints.map((bp) => (
                            <li key={bp} className="flex gap-2.5">
                              <span className="font-bold text-indigo-500">→</span>
                              <span>{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {hasPatternDiagram(concept.id) && (
                        <PatternDiagram conceptId={concept.id} />
                      )}
                    </div>

                    <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-3.5 text-sm leading-6 text-slate-800 dark:text-slate-100">
                      <strong>Key Takeaway: </strong>
                      {concept.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* STEP 3: Problematic vs. Refactored Code Comparisons */}
      {isVisible('code') && (
        <section id="code" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Interactive Code Breakdowns · TypeScript
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                Problematic vs. Refactored Examples
              </h2>
              <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Step through one example at a time and click highlighted lines to compare what
                breaks vs. how the refactor fixes it.
              </p>
            </div>

            {/* Quiet 1-at-a-time Example Stepper */}
            {viewMode === 'guided' && mod.codeComparisons.length > 1 && (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  disabled={codeIdx === 0}
                  onClick={() => setCodeIdx((i) => Math.max(0, i - 1))}
                  aria-label="Previous code example"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Example {codeIdx + 1} of {mod.codeComparisons.length}
                </span>
                <button
                  type="button"
                  disabled={codeIdx === mod.codeComparisons.length - 1}
                  onClick={() =>
                    setCodeIdx((i) => Math.min(mod.codeComparisons.length - 1, i + 1))
                  }
                  aria-label="Next code example"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Slim example progress bar in Guided Mode */}
          {viewMode === 'guided' && mod.codeComparisons.length > 1 && (
            <div className="flex gap-1.5" aria-hidden="true">
              {mod.codeComparisons.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  tabIndex={-1}
                  title={`Example ${idx + 1}: ${item.title}`}
                  onClick={() => setCodeIdx(idx)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx === codeIdx
                      ? 'bg-indigo-500'
                      : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-700/80 dark:hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          )}

          {viewMode === 'guided' ? (
            <CodeComparison
              key={activeCodeItem.id}
              item={activeCodeItem}
              onInspect={onInspectComparison}
            />
          ) : (
            <div className="space-y-8">
              {mod.codeComparisons.map((item) => (
                <CodeComparison key={item.id} item={item} onInspect={onInspectComparison} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* STEP 4: Best Practices & Common Pitfalls (One focused list at a time in Guided mode) */}
      {isVisible('practices') && (
        <section id="practices" className="space-y-5">
          {viewMode === 'guided' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPracticeTab('do')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  practiceTab === 'do'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Best Practices ({mod.bestPractices.length})
              </button>
              <button
                type="button"
                onClick={() => setPracticeTab('avoid')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                  practiceTab === 'avoid'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <AlertOctagon className="h-4 w-4" />
                Common Pitfalls ({mod.pitfalls.length})
              </button>
            </div>
          )}

          <div className={viewMode === 'all' ? 'grid gap-8 lg:grid-cols-2' : ''}>
            {(viewMode === 'all' || practiceTab === 'do') && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Best Practices (Do This)
                </h2>
                <div className="space-y-3.5">
                  {mod.bestPractices.map((bp) => (
                    <div
                      key={bp.title}
                      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {bp.title}
                      </h3>
                      <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {bp.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(viewMode === 'all' || practiceTab === 'avoid') && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  <AlertOctagon className="h-5 w-5 text-rose-500" />
                  Common Beginner Pitfalls (Watch Out)
                </h2>
                <div className="space-y-3.5">
                  {mod.pitfalls.map((pf) => (
                    <div
                      key={pf.title}
                      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]"
                    >
                      <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">
                        {pf.title}
                      </h3>
                      <p className="prose-measure mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <strong>Red flag: </strong>
                        {pf.symptom}
                      </p>
                      <p className="prose-measure mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-3.5 py-2.5 text-sm leading-6 text-emerald-900 dark:text-emerald-200">
                        <strong className="text-emerald-700 dark:text-emerald-300">Fix: </strong>
                        {pf.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 5: Mini Decision Checks (1-at-a-time card) */}
      {isVisible('checks') && (
        <section id="checks" className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Test Your Intuition
            </h2>
            <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Quick 30-second gut checks — spot when {mod.shortName} is the right call and when it’s
              a trap.
            </p>
          </div>
          <MiniDecisionCheck
            key={mod.id}
            storageKey={mod.id}
            architectureId={mod.id}
            architectureName={mod.shortName}
            checks={mod.miniChecks}
            onCompleteCheck={onCompleteMiniCheck}
          />
        </section>
      )}

      {/* STEP 6: Self-Paced Practice Projects */}
      {isVisible('projects') && (
        <section id="projects" className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Build It On Your Own Time
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
              Self-Paced {mod.shortName} Projects
            </h2>
            <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Optional weekend blueprints — copy a Markdown brief into a local repo and check off
              milestones whenever you’re ready.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {mod.practiceProjects.map((project) => (
              <PracticeProjectCard
                key={project.id}
                project={project}
                completedMilestones={progress.completedMilestones}
                onToggleMilestone={onToggleMilestone}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quiet Step Footer for Intermediate Steps (Matches Foundations) */}
      {viewMode === 'guided' && stepIdx < MODULE_STEPS.length - 1 && (
        <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={stepIdx === 0}
            onClick={() => goToStep(stepIdx - 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 disabled:opacity-35 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </button>

          <button
            type="button"
            onClick={() => goToStep(stepIdx + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
          >
            Continue: {MODULE_STEPS[stepIdx + 1].shortLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      )}

      {/* Final Completion Card (Last Guided Step or All Sections) */}
      {(viewMode === 'all' || stepIdx === MODULE_STEPS.length - 1) && (
        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]">
          <div>
            {viewMode === 'guided' ? (
              <button
                type="button"
                onClick={() => goToStep(stepIdx - 1)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Quick Check
              </button>
            ) : prevMod ? (
              <Link
                to={`/modules/${prevMod.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                <ArrowLeft className="h-4 w-4" />
                <ArchitectureIcon architectureId={prevMod.id} className="h-4 w-4" colored />
                {prevMod.order}. {prevMod.shortName}
              </Link>
            ) : (
              <Link
                to="/foundations"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
              >
                <ArrowLeft className="h-4 w-4" />
                0. Foundations
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onMarkSectionComplete(mod.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isCompleted ? 'Module Completed' : 'Mark Module Complete'}
            </button>

            {nextMod ? (
              <Link
                to={`/modules/${nextMod.id}`}
                onClick={() => onMarkSectionComplete(mod.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
              >
                <ArchitectureIcon architectureId={nextMod.id} className="h-4 w-4" />
                Next: {nextMod.order}. {nextMod.shortName}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/simulator"
                onClick={() => onMarkSectionComplete(mod.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
              >
                Launch Decision Simulator
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
