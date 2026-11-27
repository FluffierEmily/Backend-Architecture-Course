import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Cpu,
  Database,
  Gauge,
  Globe,
  Layers,
  Scale,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ARCHITECTURE_BY_ID, FOUNDATION_BLOCKS } from '../data';
import type { FoundationBlock } from '../types/course';

const BLOCK_ICONS: Record<FoundationBlock['icon'], typeof Globe> = {
  globe: Globe,
  shield: Shield,
  database: Database,
  layers: Layers,
  zap: Zap,
  scale: Scale,
  cpu: Cpu,
  gauge: Gauge,
};

export function FoundationsPlayground() {
  const [activeBlockId, setActiveBlockId] = useState(FOUNDATION_BLOCKS[0].id);
  const [trafficSpike, setTrafficSpike] = useState(false);

  const activeBlock =
    FOUNDATION_BLOCKS.find((b) => b.id === activeBlockId) ?? FOUNDATION_BLOCKS[0];

  return (
    <div className="space-y-8">
      {/* Interactive 6-Block Explorer */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          {FOUNDATION_BLOCKS.map((block) => {
            const Icon = BLOCK_ICONS[block.icon];
            const isActive = block.id === activeBlock.id;
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => setActiveBlockId(block.id)}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`mt-0.5 rounded-lg p-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{block.name}</p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {block.oneLiner}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Building Block Deep-Dive */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7 dark:border-slate-800 dark:bg-slate-900/70">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Core Building Block
            </span>
            <h3 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeBlock.name}
            </h3>

            <div className="mt-4 rounded-xl border border-sky-500/25 bg-sky-500/10 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Real-World Analogy
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {activeBlock.realWorldAnalogy}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                How It Works in Backends
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {activeBlock.howItWorks}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                Beginner Watch-Out
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {activeBlock.beginnerWatchOut}
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              See this building block in action:
            </p>
            <div className="flex flex-wrap gap-2">
              {activeBlock.relevantArchitectures.map((archId) => {
                const mod = ARCHITECTURE_BY_ID[archId];
                return (
                  <Link
                    key={archId}
                    to={`/modules/${archId}`}
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
                  >
                    {mod.shortName} →
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Traffic Spike Interactive Comparison */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mini-Lab: Why Queues & Async Matter During Traffic Spikes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Toggle a sudden 10x burst of PDF/image jobs to see how a direct sync server vs. a
              queue-buffered backend reacts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTrafficSpike((prev) => !prev)}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition ${
              trafficSpike
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {trafficSpike ? 'Reset to Normal Load (20 req/s)' : 'Trigger 10x Flash Spike (200 req/s)'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* Direct Sync */}
          <div
            className={`rounded-xl border p-4 transition ${
              trafficSpike
                ? 'border-rose-500/40 bg-rose-500/10'
                : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center justify-between">
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

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Server CPU & Memory</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {trafficSpike ? '100% Saturated' : '32%'}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
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
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {trafficSpike
                ? 'Because the HTTP handler waits for heavy work to finish, all worker threads fill up and new users hit timeouts.'
                : 'Under steady low traffic, synchronous handling is simple and fast.'}
            </p>
          </div>

          {/* Queue Buffered */}
          <div
            className={`rounded-xl border p-4 transition ${
              trafficSpike
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                2. Queue-Buffered Async Workers
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                {trafficSpike ? 'Absorbing Spike Smoothly' : 'Healthy'}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Queue Buffer Depth</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {trafficSpike ? '160 jobs safely queued' : '0 jobs queued'}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
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
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {trafficSpike
                ? 'The API replies 202 in milliseconds and parks jobs in the queue. Workers chew through the backlog steadily without crashing.'
                : 'Workers process incoming jobs immediately while keeping latency predictable.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
