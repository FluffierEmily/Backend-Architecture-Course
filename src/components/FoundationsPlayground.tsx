import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  FlaskConical,
  Gauge,
  GitBranch,
  Globe,
  HardDrive,
  HeartPulse,
  KeyRound,
  Layers,
  Lock,
  Radio,
  Rocket,
  Scale,
  Shield,
  Zap,
} from 'lucide-react';
import { ARCHITECTURE_BY_ID, FOUNDATION_BLOCKS } from '../data';
import type { FoundationBlock } from '../types/course';
import { AvailabilityAndOutboxLab, CircuitBreakerLab } from './ResilienceLabs';
import { FoundationDiagram, hasFoundationDiagram } from './FoundationDiagram';
import { usePersistedState } from '../hooks/usePersistedState';

const BLOCK_ICONS: Record<FoundationBlock['icon'], typeof Globe> = {
  globe: Globe,
  shield: Shield,
  database: Database,
  layers: Layers,
  zap: Zap,
  scale: Scale,
  cpu: Cpu,
  gauge: Gauge,
  activity: Activity,
  lock: Lock,
  'git-branch': GitBranch,
  'flask-conical': FlaskConical,
  'key-round': KeyRound,
  radio: Radio,
  'hard-drive': HardDrive,
  rocket: Rocket,
  building: Building2,
  'heart-pulse': HeartPulse,
};

interface FoundationsPlaygroundProps {
  section?: 'blocks' | 'lab' | 'both';
  onFinishBlocks?: () => void;
}

const isBlockIndex = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < FOUNDATION_BLOCKS.length;
const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === 'string');
const isLabId = (v: unknown): v is 'spike' | 'breaker' | 'reliability' =>
  v === 'spike' || v === 'breaker' || v === 'reliability';

export function FoundationsPlayground({
  section = 'both',
  onFinishBlocks,
}: FoundationsPlaygroundProps) {
  const [activeIndex, setActiveIndex] = usePersistedState<number>(
    'foundations.activeBlockIdx',
    0,
    isBlockIndex
  );
  const [visitedIds, setVisitedIds] = usePersistedState<string[]>(
    'foundations.visitedBlockIds',
    [FOUNDATION_BLOCKS[0].id],
    isStringArray
  );
  const [jumpOpen, setJumpOpen] = useState(false);
  const [trafficSpike, setTrafficSpike] = useState(false);
  const [activeLab, setActiveLab] = usePersistedState<'spike' | 'breaker' | 'reliability'>(
    'foundations.activeLab',
    'spike',
    isLabId
  );

  const activeBlock = FOUNDATION_BLOCKS[activeIndex] ?? FOUNDATION_BLOCKS[0];
  const ActiveIcon = BLOCK_ICONS[activeBlock.icon];

  const selectBlock = (index: number) => {
    setActiveIndex(index);
    setJumpOpen(false);
    const id = FOUNDATION_BLOCKS[index]?.id;
    if (id) {
      setVisitedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  return (
    <div className="space-y-8">
      {/* PART 1: Single Calm Lesson Card (No 8-pill wall above it) */}
      {(section === 'blocks' || section === 'both') && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
          {/* Slim Progress Bar + Quiet Controls */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setJumpOpen((o) => !o)}
                  aria-expanded={jumpOpen}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <span>
                    Block {activeIndex + 1} of {FOUNDATION_BLOCKS.length}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </button>

                {jumpOpen && (
                  <div className="absolute left-0 z-20 mt-1.5 max-h-80 w-80 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-[#0f172a]">
                    {FOUNDATION_BLOCKS.map((block, index) => {
                      const isCurrent = index === activeIndex;
                      const isVisited = visitedIds.includes(block.id);
                      return (
                        <button
                          key={block.id}
                          type="button"
                          onClick={() => selectBlock(index)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                            isCurrent
                              ? 'bg-indigo-500/15 font-semibold text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">
                            {index + 1}. {block.name}
                          </span>
                          {isVisited && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activeIndex === 0}
                  onClick={() => selectBlock(Math.max(0, activeIndex - 1))}
                  aria-label="Previous foundation block"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={activeIndex === FOUNDATION_BLOCKS.length - 1}
                  onClick={() =>
                    selectBlock(Math.min(FOUNDATION_BLOCKS.length - 1, activeIndex + 1))
                  }
                  aria-label="Next foundation block"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quiet Segmented Progress Track */}
            <div className="flex gap-1.5" aria-hidden="true">
              {FOUNDATION_BLOCKS.map((block, index) => {
                const isCurrent = index === activeIndex;
                const isVisited = visitedIds.includes(block.id);
                return (
                  <button
                    key={block.id}
                    type="button"
                    tabIndex={-1}
                    title={`${index + 1}. ${block.name}`}
                    onClick={() => selectBlock(index)}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      isCurrent
                        ? 'bg-indigo-500'
                        : isVisited
                        ? 'bg-indigo-400/40 hover:bg-indigo-400/70'
                        : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-700/80 dark:hover:bg-slate-600'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Lesson Heading */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/15 p-2.5 text-indigo-600 dark:text-indigo-300">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeBlock.name}
              </h2>
            </div>
          </div>
          <p className="prose-measure mt-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {activeBlock.oneLiner}
          </p>

          {/* Content Blocks */}
          <div className="mt-6 space-y-5">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.08] p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Real-World Analogy
              </p>
              <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-800 dark:text-slate-100">
                {activeBlock.realWorldAnalogy}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                How It Works in Backends
              </p>
              <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-700 dark:text-slate-200">
                {activeBlock.howItWorks}
              </p>
            </div>

            {hasFoundationDiagram(activeBlock.id) && (
              <FoundationDiagram blockId={activeBlock.id} />
            )}

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Beginner Watch-Out
              </p>
              <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-800 dark:text-slate-100">
                {activeBlock.beginnerWatchOut}
              </p>
            </div>
          </div>

          {/* Single Primary Action Footer */}
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5 dark:border-slate-700/80">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Used in:</span>
              {activeBlock.relevantArchitectures.map((archId) => {
                const mod = ARCHITECTURE_BY_ID[archId];
                return (
                  <Link
                    key={archId}
                    to={`/modules/${archId}`}
                    className="font-medium text-slate-700 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
                  >
                    {mod.shortName}
                  </Link>
                );
              })}
            </div>

            {activeIndex < FOUNDATION_BLOCKS.length - 1 ? (
              <button
                type="button"
                onClick={() => selectBlock(activeIndex + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
              >
                Next: {FOUNDATION_BLOCKS[activeIndex + 1].name.split(' (')[0]}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : onFinishBlocks ? (
              <button
                type="button"
                onClick={onFinishBlocks}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
              >
                Continue to Interactive Labs
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* PART 2: Interactive Mini-Labs (1 calm lab at a time via clean switcher) */}
      {(section === 'lab' || section === 'both') && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Interactive labs">
            {(
              [
                { id: 'spike', label: 'Lab 1 · Traffic Spike (Sync vs. Queue)' },
                { id: 'breaker', label: 'Lab 2 · Circuit Breaker States' },
                { id: 'reliability', label: 'Lab 3 · Availability Math & Outbox Crash' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeLab === tab.id}
                onClick={() => setActiveLab(tab.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  activeLab === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200 dark:bg-[#162033] dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
            {activeLab === 'spike' && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Interactive Mini-Lab
                    </span>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                      Why Queues &amp; Async Matter During Traffic Spikes
                    </h2>
                    <p className="prose-measure mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Toggle a sudden 10x burst of PDF/image jobs to compare a direct synchronous
                      server against a queue-buffered worker backend.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrafficSpike((prev) => !prev)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition ${
                      trafficSpike
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                  >
                    {trafficSpike
                      ? 'Reset to Normal Load (20 req/s)'
                      : 'Trigger 10x Flash Spike (200 req/s)'}
                  </button>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {/* Direct Sync */}
                  <div
                    className={`rounded-2xl border p-5 transition ${
                      trafficSpike
                        ? 'border-rose-500/40 bg-rose-500/10'
                        : 'border-stone-200 bg-stone-50 dark:border-slate-700/80 dark:bg-[#0f172a]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        1. Direct Synchronous Server
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          trafficSpike
                            ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {trafficSpike ? 'OVERLOADED (503 Errors!)' : 'Healthy'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Server CPU &amp; Memory
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {trafficSpike ? '100% Saturated' : '32%'}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            trafficSpike ? 'w-full bg-rose-500' : 'w-1/3 bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-600 dark:text-slate-400">Dropped Requests</span>
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                          {trafficSpike ? '140 req/sec failed (504 Timeout)' : '0'}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                      {trafficSpike
                        ? 'Because the HTTP handler waits for heavy work to finish, all worker threads fill up and new users hit timeouts.'
                        : 'Under steady low traffic, synchronous handling is simple and fast.'}
                    </p>
                  </div>

                  {/* Queue Buffered */}
                  <div
                    className={`rounded-2xl border p-5 transition ${
                      trafficSpike
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-stone-200 bg-stone-50 dark:border-slate-700/80 dark:bg-[#0f172a]/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        2. Queue-Buffered Async Workers
                      </span>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        {trafficSpike ? 'Absorbing Spike Smoothly' : 'Healthy'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Queue Buffer Depth
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {trafficSpike ? '160 jobs safely queued' : '0 jobs queued'}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            trafficSpike ? 'w-3/4 bg-amber-400' : 'w-[8%] bg-emerald-500'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-600 dark:text-slate-400">Dropped Requests</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          0 (all replied 202 Accepted)
                        </span>
                      </div>
                    </div>
                    <p className="mt-3.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                      {trafficSpike
                        ? 'The API replies 202 in milliseconds and parks jobs in the queue. Workers chew through the backlog steadily without crashing.'
                        : 'Workers process incoming jobs immediately while keeping latency predictable.'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeLab === 'breaker' && <CircuitBreakerLab />}
            {activeLab === 'reliability' && <AvailabilityAndOutboxLab />}
          </div>
        </div>
      )}
    </div>
  );
}
