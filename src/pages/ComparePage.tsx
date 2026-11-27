import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react';
import { ARCHITECTURE_MODULES } from '../data';
import type { ArchitectureId } from '../types/course';

interface PriorityFilter {
  id: string;
  label: string;
  recommended: ArchitectureId[];
  tip: string;
}

const PRIORITY_FILTERS: PriorityFilter[] = [
  {
    id: 'all',
    label: 'Show All Equally',
    recommended: [],
    tip: 'Compare every trade-off side-by-side. Notice there is no single "best" architecture — only best fits for your constraints.',
  },
  {
    id: 'small-team',
    label: 'Small Team & Fast MVP',
    recommended: ['modular-monolith', 'serverless'],
    tip: 'Start with a Modular Monolith for cohesive CRUD/SaaS apps, or Serverless for tiny event/webhook glue.',
  },
  {
    id: 'spiky',
    label: 'Spiky Traffic / Zero Idle Cost',
    recommended: ['serverless', 'event-driven'],
    tip: 'Serverless shines when traffic sits idle most of the time and suddenly bursts; queues/EDA buffer downstream bottlenecks.',
  },
  {
    id: 'multi-team',
    label: 'Large Multi-Team Autonomy',
    recommended: ['microservices', 'event-driven'],
    tip: 'Once 30+ engineers collide on deploys or need different languages/hardware, Microservices (often paired with EDA) unlock independent velocity.',
  },
  {
    id: 'fan-out',
    label: 'Real-Time Multi-Consumer Fan-Out',
    recommended: ['event-driven'],
    tip: 'When one business fact triggers 4+ independent downstream reactions, Event-Driven Architecture keeps producers clean and resilient.',
  },
];

const COMPARE_STEPS = [
  { id: 'matrix', label: '1. Side-by-Side Matrix' },
  { id: 'hybrids', label: '2. Hybrids & Strangler Fig' },
] as const;

type CompareStepId = (typeof COMPARE_STEPS)[number]['id'];

export function ComparePage() {
  const [viewMode, setViewMode] = useState<'guided' | 'all'>('guided');
  const [stepIdx, setStepIdx] = useState(0);
  const [activePriority, setActivePriority] = useState<string>('all');

  const currentFilter =
    PRIORITY_FILTERS.find((p) => p.id === activePriority) ?? PRIORITY_FILTERS[0];
  const activeStep: CompareStepId = COMPARE_STEPS[stepIdx].id;
  const isVisible = (id: CompareStepId) => viewMode === 'all' || activeStep === id;

  const goToStep = (next: number) => {
    setStepIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rows: {
    label: string;
    render: (mod: (typeof ARCHITECTURE_MODULES)[number]) => string;
  }[] = [
    {
      label: 'Real-World Example',
      render: (m) => `${m.scenario.company} (${m.scenario.domain})`,
    },
    { label: 'Ideal Team Size', render: (m) => m.comparisonProfile.idealTeamSize },
    { label: 'Deployment Unit', render: (m) => m.comparisonProfile.deploymentUnit },
    { label: 'Scaling Style', render: (m) => m.comparisonProfile.scalingStyle },
    { label: 'Ops Complexity', render: (m) => m.comparisonProfile.opsComplexity },
    { label: 'Early Dev Velocity', render: (m) => m.comparisonProfile.devVelocityEarly },
    { label: 'Fault Isolation', render: (m) => m.comparisonProfile.faultIsolation },
    { label: 'Cost While Idle', render: (m) => m.comparisonProfile.costAtIdle },
    { label: 'Data Consistency', render: (m) => m.comparisonProfile.dataConsistency },
    { label: 'Best Used For', render: (m) => m.comparisonProfile.bestFor },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Cheat Sheet &amp; Matrix
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Compare All 4 Backend Architectures
          </h1>
          <p className="prose-measure mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
            Pick your primary constraint to highlight the best matches, then explore how real teams
            combine and evolve patterns safely.
          </p>
        </div>

        {/* Quiet Underline Tab Bar + Subtle View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-slate-700/80">
          {viewMode === 'guided' ? (
            <div className="-mb-px flex flex-wrap gap-6" role="tablist">
              {COMPARE_STEPS.map((step, i) => {
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
                    {step.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="pb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing both sections on one page
            </span>
          )}

          <button
            type="button"
            onClick={() => setViewMode((m) => (m === 'guided' ? 'all' : 'guided'))}
            className="pb-3 text-xs font-medium text-slate-500 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {viewMode === 'guided' ? 'All Sections' : 'Back to Guided Tabs'}
          </button>
        </div>
      </header>

      {/* STEP 1: Side-by-Side Matrix */}
      {isVisible('matrix') && (
        <section className="space-y-5">
          {/* Calm Priority Highlighter */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-700/80 dark:bg-[#162033]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Highlight by Primary Constraint
            </p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActivePriority(filter.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                    activePriority === filter.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="prose-measure mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {currentFilter.tip}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-slate-700/80 dark:bg-[#162033]">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-slate-700/80">
                  <th className="w-44 p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Dimension
                  </th>
                  {ARCHITECTURE_MODULES.map((mod) => {
                    const isHighlighted = currentFilter.recommended.includes(mod.id);
                    const isDimmed =
                      currentFilter.recommended.length > 0 && !isHighlighted;
                    return (
                      <th
                        key={mod.id}
                        className={`p-4 transition ${
                          isHighlighted
                            ? 'bg-indigo-500/10'
                            : isDimmed
                            ? 'opacity-40'
                            : ''
                        }`}
                      >
                        <Link
                          to={`/modules/${mod.id}`}
                          className="text-sm font-extrabold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                        >
                          {mod.shortName}
                        </Link>
                        {isHighlighted && (
                          <span className="mt-1 block text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                            ★ Strong Match
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-slate-700/70">
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {row.label}
                    </td>
                    {ARCHITECTURE_MODULES.map((mod) => {
                      const isHighlighted = currentFilter.recommended.includes(mod.id);
                      const isDimmed =
                        currentFilter.recommended.length > 0 && !isHighlighted;
                      return (
                        <td
                          key={mod.id}
                          className={`p-4 align-top text-[13px] leading-6 text-slate-700 transition dark:text-slate-200 ${
                            isHighlighted
                              ? 'bg-indigo-500/[0.06] font-medium'
                              : isDimmed
                              ? 'opacity-40'
                              : ''
                          }`}
                        >
                          {row.render(mod)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* STEP 2: Hybrid Architectures & Evolutionary Migration */}
      {isVisible('hybrids') && (
        <section className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Real-World Architecture Is Rarely Pure
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
              How Teams Combine &amp; Evolve Architectures Safely
            </h2>
            <p className="prose-measure mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              You do not have to pick one architecture forever. Most teams start simple, combine
              patterns as real bottlenecks appear, and migrate one slice at a time.
            </p>
          </div>

          {/* Common Hybrid Combos */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Modular Monolith + Serverless Workers',
                pattern: 'Startup Sweet Spot',
                detail:
                  'Keep core auth, users, and billing in one clean Modular Monolith, while offloading spiky PDF exports, image thumbnails, and webhook handlers to Serverless functions.',
              },
              {
                title: 'Modular Monolith + Persistent Job Queue',
                pattern: 'Durable Async Without Microservices',
                detail:
                  'Add Redis (BullMQ) or Postgres (pg-boss) so one codebase runs both fast HTTP handlers and crash-safe background email/report workers.',
              },
              {
                title: 'Microservices + Event-Driven Backbone',
                pattern: 'Large-Scale Standard',
                detail:
                  'Use synchronous HTTP/gRPC for user-facing reads (Search, Checkout), and publish domain events to Kafka/RabbitMQ so Billing, Analytics, and Notifications react without tight coupling.',
              },
            ].map((combo) => (
              <div
                key={combo.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]"
              >
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {combo.pattern}
                </p>
                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                  {combo.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {combo.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Strangler Fig Pattern Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7 dark:border-slate-700/80 dark:bg-[#162033]">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Evolutionary Migration · Avoid 9-Month Feature Freezes
              </p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                The Strangler Fig Pattern (Instead of a Big-Bang Rewrite)
              </h3>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: 'Step 1 · Place a Routing Layer in Front',
                  desc: 'Route all traffic through an API Gateway or reverse proxy in front of your existing monolith so clients never notice backend moves.',
                },
                {
                  step: 'Step 2 · Extract One High-Pain Slice',
                  desc: 'Pick the single bottleneck module (e.g., Video Encoding or PDF Billing), build it as an isolated service/function with its own DB, and route just `/api/reports/*` to it.',
                },
                {
                  step: 'Step 3 · Verify, Observe & Repeat Only If Needed',
                  desc: 'Compare latency and error rates in production before deleting the old code path. Often extracting 1–2 hot modules solves 90% of scaling pain without splitting everything.',
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
                >
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{s.step}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quiet Step Footer */}
      {viewMode === 'guided' && stepIdx === 0 && (
        <footer className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => goToStep(1)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
          >
            Continue: 2. Hybrids &amp; Strangler Fig
            <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      )}

      {(viewMode === 'all' || stepIdx === 1) && (
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {viewMode === 'guided' ? (
            <button
              type="button"
              onClick={() => goToStep(0)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Matrix
            </button>
          ) : (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Ready to test your judgment on 8 realistic company briefs?
            </span>
          )}

          <Link
            to="/simulator"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
          >
            <Compass className="h-4 w-4" />
            Open Decision Simulator
            <ArrowRight className="h-4 w-4" />
          </Link>
        </footer>
      )}
    </div>
  );
}
