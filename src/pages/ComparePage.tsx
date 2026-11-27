import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Compass, GitBranch, Layers, SlidersHorizontal } from 'lucide-react';
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

export function ComparePage() {
  const [activePriority, setActivePriority] = useState<string>('all');
  const currentFilter =
    PRIORITY_FILTERS.find((p) => p.id === activePriority) ?? PRIORITY_FILTERS[0];

  const rows: {
    label: string;
    render: (mod: (typeof ARCHITECTURE_MODULES)[number]) => string;
  }[] = [
    { label: 'Real-World Course Example', render: (m) => `${m.scenario.company} (${m.scenario.domain})` },
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
      <header className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Cheat Sheet &amp; Matrix
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Compare All 4 Backend Architectures
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Highlight the columns that match your top priority to see trade-offs side-by-side. In
          real production systems, teams often combine patterns (e.g., Microservices communicating
          via Event-Driven brokers, or a Modular Monolith offloading PDFs to Serverless).
        </p>
      </header>

      {/* Priority Highlighter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Highlight by Your Primary Constraint:
        </p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActivePriority(filter.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activePriority === filter.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-2.5 text-sm text-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
          {currentFilter.tip}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="w-48 p-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                        ? 'opacity-45'
                        : ''
                    }`}
                  >
                    <Link
                      to={`/modules/${mod.id}`}
                      className="text-base font-extrabold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {mod.shortName}
                    </Link>
                    {isHighlighted && (
                      <span className="mt-1 block text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        ★ Strong Match
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="p-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {row.label}
                </td>
                {ARCHITECTURE_MODULES.map((mod) => {
                  const isHighlighted = currentFilter.recommended.includes(mod.id);
                  const isDimmed =
                    currentFilter.recommended.length > 0 && !isHighlighted;
                  return (
                    <td
                      key={mod.id}
                      className={`p-4 align-top text-xs leading-relaxed text-slate-700 transition dark:text-slate-200 ${
                        isHighlighted
                          ? 'bg-indigo-500/5 font-medium'
                          : isDimmed
                          ? 'opacity-45'
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

      {/* Hybrid Architectures & Evolutionary Migration (Strangler Fig) */}
      <section className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <GitBranch className="h-4 w-4" />
            Real-World Architecture Is Rarely Pure
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            How Teams Combine &amp; Evolve Architectures Safely
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            You do <strong>not</strong> have to pick one architecture forever. Most successful
            backends start simple, combine strengths as real bottlenecks emerge, and migrate one
            slice at a time.
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
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                <Layers className="h-3 w-3" />
                {combo.pattern}
              </span>
              <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">
                {combo.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {combo.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Strangler Fig Pattern Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Evolutionary Migration Pattern
              </span>
              <h3 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
                The Strangler Fig Pattern (Instead of a Big-Bang Rewrite)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              Avoid 9-Month Feature Freezes
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
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
                desc: 'Compare latency and error rates in production before deleting the old code path. Often extracting 1–2 hot modules solves 90% of scaling pain without splitting everything!',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{s.step}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to Simulator */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Ready to put your judgment to the test?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Practice picking the right architecture across 8 realistic briefs in the Decision
            Simulator.
          </p>
        </div>
        <Link
          to="/simulator"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
        >
          <Compass className="h-4 w-4" />
          Open Decision Simulator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
