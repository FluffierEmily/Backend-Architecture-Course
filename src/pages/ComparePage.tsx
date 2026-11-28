import { memo, startTransition, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Compass, Copy } from 'lucide-react';
import { ARCHITECTURE_MODULES } from '../data/architectures';
import { COURSE_COUNTS } from '../data/courseMeta';
import type { ArchitectureId } from '../types/course';
import { usePersistedState } from '../hooks/usePersistedState';
import { ArchitectureDecisionFlowchart, StranglerFigDiagram } from '../components/CompareVisuals';
import { ArchitectureIconBadge } from '../components/ArchitectureIcon';
import { CourseText } from '../components/CourseText';

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
  { id: 'cost', label: '3. Cost Intuition' },
  { id: 'sizing-adr', label: '4. Sizing & ADR Kit' },
] as const;

const COMPARISON_ROWS: {
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
    { label: 'Typical Datastore', render: (m) => m.comparisonProfile.typicalDatastore },
    { label: 'Best Used For', render: (m) => m.comparisonProfile.bestFor },
  ];

const HYBRID_COMBOS = [
  {
    architectures: ['modular-monolith', 'serverless'] as const,
    title: 'Modular Monolith + Serverless Workers',
    pattern: 'Startup Sweet Spot',
    detail:
      'Keep core auth, users, and billing in one clean Modular Monolith, while offloading spiky PDF exports, image thumbnails, and webhook handlers to Serverless functions.',
  },
  {
    architectures: ['modular-monolith', 'event-driven'] as const,
    title: 'Modular Monolith + Persistent Job Queue',
    pattern: 'Durable Async Without Microservices',
    detail:
      'Add Redis (BullMQ) or Postgres (pg-boss) so one codebase runs both fast HTTP handlers and crash-safe background email/report workers.',
  },
  {
    architectures: ['microservices', 'event-driven'] as const,
    title: 'Microservices + Event-Driven Backbone',
    pattern: 'Large-Scale Standard',
    detail:
      'Use synchronous HTTP/gRPC for user-facing reads (Search, Checkout), and publish domain events to Kafka/RabbitMQ so Billing, Analytics, and Notifications react without tight coupling.',
  },
] as const;

const STRANGLER_STEPS = [
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
] as const;

const DB_SPLIT_STEPS = [
  {
    step: '1. Break SQL JOINs & FKs',
    detail:
      'Replace cross-module foreign keys and JOINs with module API calls so tables are logically independent.',
  },
  {
    step: '2. Outbox / CDC Sync',
    detail:
      'Stream writes from old tables into the new DB via an Outbox or Debezium CDC (prefer over raw dual-writes, which drift on partial failures).',
  },
  {
    step: '3. Backfill & Shadow Reads',
    detail:
      'Copy past rows, then run shadow reads (query both DBs in the background, log diffs, and still return the old DB’s answer) until parity hits 100%.',
  },
  {
    step: '4. Cut Over & Retire',
    detail:
      'Flip live reads/writes to the new service DB, pause before deleting, then drop legacy tables safely.',
  },
] as const;

const ADR_TEMPLATE_MD = `# ADR-001: Choose Initial Backend Architecture

- **Date:** YYYY-MM-DD
- **Status:** Proposed | Accepted | Superseded
- **Owners:** Backend / Product Engineering

## 1. Context & Non-Functional Requirements (NFRs)
- **Team size & skills:** e.g., 5 TypeScript engineers, no dedicated SRE
- **Traffic profile:** e.g., ~25 avg QPS, ~150 peak QPS (~65M req/month)
- **Consistency & latency:** e.g., Strong ACID for billing; p95 < 250ms
- **Compliance / isolation:** e.g., B2B multi-tenant with Postgres RLS

## 2. Options Considered
1. **Modular Monolith** — Fast MVP velocity, ACID transactions, lowest ops overhead.
2. **Microservices** — High ops cost for 5 devs; premature without squad bottlenecks.
3. **Serverless** — Great for spiky PDF/webhook workers, heavier for relational CRUD.
4. **Event-Driven** — Unneeded broker overhead for core synchronous flows.

## 3. Decision
Adopt a **Modular Monolith** (Postgres with per-module schemas + ESLint boundaries) paired with a **persistent job queue / Serverless worker** for bursty async PDF exports.

## 4. Consequences & Revisit Triggers
- **Positive:** Single deploy pipeline, fast in-process integration tests, predictable cost.
- **Trade-offs:** Shared process blast radius — enforce worker separation for CPU-heavy tasks.
- **Revisit triggers (when to extract via Strangler Fig):**
  - Engineering org grows past ~30 developers colliding on deploys, OR
  - One module requires specialized hardware (GPU/ML) or 10x independent scaling.`;

type CompareStepId = (typeof COMPARE_STEPS)[number]['id'];

type TrafficTier = '10k' | '10m';

interface CostEstimateItem {
  id: ArchitectureId;
  name: string;
  monthlyRange: string;
  opsDriver: string;
  note: string;
  verdict: 'cheapest' | 'balanced' | 'pricey';
}

const COST_TIERS: Record<
  TrafficTier,
  { label: string; summary: string; takeaway: string; items: CostEstimateItem[] }
> = {
  '10k': {
    label: '10k req / month (Side Project / Early MVP)',
    summary:
      'Rough order-of-magnitude monthly cloud bill (compute + core infra, excluding engineering salaries) for a low-traffic or bursty early app.',
    takeaway:
      'At early scale, Serverless ($0–$10/mo) and a single Modular Monolith container ($15–$40/mo) win by a mile. Running Kubernetes or managed Kafka clusters for 10k requests burns hundreds of dollars on idle baseline overhead.',
    items: [
      {
        id: 'serverless',
        name: 'Serverless Functions',
        monthlyRange: '$0 – $10 / mo',
        opsDriver: 'Pay-per-request (mostly inside free tier)',
        note: 'Scales to zero overnight — ideal for prototypes, webhooks, and sporadic batch tasks.',
        verdict: 'cheapest',
      },
      {
        id: 'modular-monolith',
        name: 'Modular Monolith',
        monthlyRange: '$15 – $40 / mo',
        opsDriver: '1 small app container + 1 managed Postgres',
        note: 'Predictable flat bill with zero surprise traffic-spike invoices and minimal setup.',
        verdict: 'cheapest',
      },
      {
        id: 'event-driven',
        name: 'Event-Driven (Managed Broker + Workers)',
        monthlyRange: '$80 – $350 / mo',
        opsDriver: 'Always-on broker + consumer containers + DB',
        note: 'A tiny Redis/SQS queue inside a monolith is cheap, but a dedicated managed Kafka cluster has high idle cost.',
        verdict: 'balanced',
      },
      {
        id: 'microservices',
        name: 'Microservices Cluster',
        monthlyRange: '$250 – $900+ / mo',
        opsDriver: 'Multiple containers, load balancers, NAT gateways, separate DBs, observability',
        note: 'Fixed baseline infrastructure + platform engineering time far outweigh compute savings at low traffic.',
        verdict: 'pricey',
      },
    ],
  },
  '10m': {
    label: '10M req / month (Growing Production)',
    summary:
      'Rough order-of-magnitude monthly cloud bill at ~4–10 steady requests/sec (or spiky bursts totaling 10M requests/month).',
    takeaway:
      'At steady high volume, always-on containers (Modular Monolith or right-sized Microservices) become very cost-efficient per request, while Serverless costs depend heavily on execution duration and burstiness vs. 24/7 steady load.',
    items: [
      {
        id: 'modular-monolith',
        name: 'Modular Monolith',
        monthlyRange: '$120 – $350 / mo',
        opsDriver: '2–4 stateless replicas + pooled Postgres + Redis cache',
        note: 'Surprisingly far-reaching: a few well-indexed Node.js/Postgres nodes handle 10M+ req/mo comfortably.',
        verdict: 'cheapest',
      },
      {
        id: 'serverless',
        name: 'Serverless Functions',
        monthlyRange: '$80 – $450 / mo',
        opsDriver: 'Invocations + GB-seconds + API Gateway fees',
        note: 'Still very affordable if fast (<150ms) and bursty — but slow 2-second functions or unthrottled bots can spike bills fast.',
        verdict: 'balanced',
      },
      {
        id: 'event-driven',
        name: 'Event-Driven (Broker + Workers)',
        monthlyRange: '$300 – $1,200 / mo',
        opsDriver: 'Managed Kafka/RabbitMQ + auto-scaled consumer groups + storage',
        note: 'Pays for itself when buffering heavy fan-out spikes and protecting downstream databases from scaling up 5x.',
        verdict: 'balanced',
      },
      {
        id: 'microservices',
        name: 'Microservices Cluster',
        monthlyRange: '$800 – $3,000+ / mo',
        opsDriver: 'Per-service DBs, cross-AZ network transfer, tracing/log ingestion, SRE tooling',
        note: 'The cloud bill isn’t just CPU — cross-service traffic, multiple databases, and observability logs dominate costs.',
        verdict: 'pricey',
      },
    ],
  },
};

const isCompareViewMode = (v: unknown): v is 'guided' | 'all' => v === 'guided' || v === 'all';
const isCompareStepIdx = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < COMPARE_STEPS.length;
const isPriorityId = (v: unknown): v is string =>
  typeof v === 'string' && PRIORITY_FILTERS.some((p) => p.id === v);
const isTrafficTier = (v: unknown): v is TrafficTier => v === '10k' || v === '10m';

const SizingEstimator = memo(function SizingEstimator() {
  const [dau, setDau] = useState(25000);
  const [reqPerUser, setReqPerUser] = useState(40);
  const [peakMultiplier, setPeakMultiplier] = useState(5);
  const [payloadKb, setPayloadKb] = useState(12);

  const dailyRequests = dau * reqPerUser;
  const avgQps = dailyRequests / 86400;
  const peakQps = avgQps * peakMultiplier;
  const monthlyRequests = dailyRequests * 30;
  const dailyBandwidthGb = (dailyRequests * payloadKb) / (1024 * 1024);

  const sizingVerdict =
    peakQps < 200
      ? 'A single well-indexed Modular Monolith (1–2 replicas + Postgres) or Serverless handles this workload easily — prioritize team velocity over distributed complexity.'
      : peakQps < 2000
        ? 'A horizontally scaled Modular Monolith with Redis caching, read replicas, and async queues handles this comfortably; extract only genuinely hot or spiky slices.'
        : 'High sustained throughput! Plan for caching/CDN layers, read replicas or specialized stores, event-driven buffering for bursts, and independent scaling of hot services.';

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        Quantify Before You Architect
      </p>
      <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
        5-Minute Back-of-the-Envelope Sizing Estimator
      </h2>
      <p className="prose-measure mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <CourseText text="Before choosing distributed infrastructure, estimate your actual QPS, burstiness, and daily egress — most teams overestimate traffic by 10x." />
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
          <div>
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="dau-slider" className="text-slate-700 dark:text-slate-200">
                <CourseText text="Daily Active Users (DAU)" />
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                {dau.toLocaleString()}
              </span>
            </div>
            <input
              id="dau-slider"
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={dau}
              onChange={(e) => setDau(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold">
              <label htmlFor="rpu-slider" className="text-slate-700 dark:text-slate-200">
                API Requests / User / Day
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                {reqPerUser}
              </span>
            </div>
            <input
              id="rpu-slider"
              type="range"
              min={5}
              max={200}
              step={5}
              value={reqPerUser}
              onChange={(e) => setReqPerUser(Number(e.target.value))}
              className="mt-1.5 w-full accent-indigo-600"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="peak-slider" className="text-slate-700 dark:text-slate-200">
                  Peak Burst Multiplier
                </label>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {peakMultiplier}x
                </span>
              </div>
              <input
                id="peak-slider"
                type="range"
                min={2}
                max={20}
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(Number(e.target.value))}
                className="mt-1.5 w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <label htmlFor="payload-slider" className="text-slate-700 dark:text-slate-200">
                  Avg Payload Size
                </label>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {payloadKb} KB
                </span>
              </div>
              <input
                id="payload-slider"
                type="range"
                min={2}
                max={100}
                step={2}
                value={payloadKb}
                onChange={(e) => setPayloadKb(Number(e.target.value))}
                className="mt-1.5 w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#162033]">
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Average QPS
              </p>
              <p className="mt-1 font-mono text-lg font-extrabold text-slate-900 dark:text-white">
                {avgQps < 10 ? avgQps.toFixed(1) : Math.round(avgQps).toLocaleString()} req/s
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#162033]">
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Peak QPS
              </p>
              <p className="mt-1 font-mono text-lg font-extrabold text-indigo-600 dark:text-indigo-300">
                {peakQps < 10 ? peakQps.toFixed(1) : Math.round(peakQps).toLocaleString()}{' '}
                req/s
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#162033]">
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Monthly Volume
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {(monthlyRequests / 1_000_000).toFixed(1)}M req/mo
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-[#162033]">
              <p className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                Daily Egress
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900 dark:text-white">
                {dailyBandwidthGb.toFixed(1)} GB/day
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-3.5 text-xs leading-6 text-slate-800 dark:text-slate-100">
            <strong>Architecture Intuition: </strong>
            <CourseText text={sizingVerdict} />
          </div>
        </div>
      </div>
    </div>
  );
});

const AdrTemplateCard = memo(function AdrTemplateCard() {
  const [adrCopied, setAdrCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyAdr = async () => {
    try {
      await navigator.clipboard.writeText(ADR_TEMPLATE_MD);
      setAdrCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setAdrCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch {
      setAdrCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Communicating Trade-Offs
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            <CourseText text="Lightweight Architecture Decision Record (ADR) Template" interactive={false} />
          </h2>
          <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Document <strong>why</strong> you chose an architecture — and define explicit revisit triggers so
            future engineers know when to evolve it.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyAdr}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
        >
          {adrCopied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied ADR (.md)
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy ADR Template (.md)
            </>
          )}
        </button>
      </div>

      <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-4 font-mono text-xs leading-6 text-slate-200">
        {ADR_TEMPLATE_MD}
      </pre>
    </div>
  );
});

export function ComparePage() {
  const [viewMode, setViewMode] = usePersistedState<'guided' | 'all'>(
    'compare.viewMode',
    'guided',
    isCompareViewMode
  );
  const [stepIdx, setStepIdx] = usePersistedState<number>(
    'compare.stepIdx',
    0,
    isCompareStepIdx
  );
  const [activePriority, setActivePriority] = usePersistedState<string>(
    'compare.activePriority',
    'all',
    isPriorityId
  );
  const [trafficTier, setTrafficTier] = usePersistedState<TrafficTier>(
    'compare.trafficTier',
    '10k',
    isTrafficTier
  );

  const currentFilter =
    PRIORITY_FILTERS.find((p) => p.id === activePriority) ?? PRIORITY_FILTERS[0];
  const activeStep: CompareStepId = COMPARE_STEPS[stepIdx].id;
  const isVisible = (id: CompareStepId) => viewMode === 'all' || activeStep === id;
  const activeCostTier = COST_TIERS[trafficTier];

  const goToStep = (next: number) => {
    setStepIdx(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            Pick your primary constraint to highlight the best matches, explore real-world hybrids,
            and build order-of-magnitude cost intuition.
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
                    className={`border-b-2 pb-3 text-sm font-semibold transition ${isActive
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
              Showing all {COMPARE_STEPS.length} sections on one page
            </span>
          )}

          <button
            type="button"
            onClick={() =>
              startTransition(() => setViewMode((m) => (m === 'guided' ? 'all' : 'guided')))
            }
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
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${activePriority === filter.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-100 text-slate-700 hover:bg-stone-200 dark:bg-[#0f172a] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="prose-measure mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <CourseText text={currentFilter.tip} />
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
                        className={`p-4 transition ${isHighlighted
                          ? 'bg-indigo-500/10'
                          : isDimmed
                            ? 'opacity-40'
                            : ''
                          }`}
                      >
                        <Link
                          to={`/modules/${mod.id}`}
                          className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                        >
                          <ArchitectureIconBadge architectureId={mod.id} size="xs" />
                          <span>{mod.shortName}</span>
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
                {COMPARISON_ROWS.map((row) => (
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
                          className={`p-4 align-top text-[13px] leading-6 text-slate-700 transition dark:text-slate-200 ${isHighlighted
                            ? 'bg-indigo-500/[0.06] font-medium'
                            : isDimmed
                              ? 'opacity-40'
                              : ''
                            }`}
                        >
                          <CourseText text={row.render(mod)} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ArchitectureDecisionFlowchart />
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
            {HYBRID_COMBOS.map((combo) => (
              <div
                key={combo.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-slate-700/80 dark:bg-[#162033]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <ArchitectureIconBadge architectureId={combo.architectures[0]} size="sm" />
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">+</span>
                  <ArchitectureIconBadge architectureId={combo.architectures[1]} size="sm" />
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {combo.pattern}
                </p>
                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                  {combo.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <CourseText text={combo.detail} />
                </p>
              </div>
            ))}
          </div>

          {/* Strangler Fig Pattern Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-7 dark:border-slate-700/80 dark:bg-[#162033]">
            <div className="flex items-start gap-3">
              <ArchitectureIconBadge architectureId="hybrid" size="md" className="mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Evolutionary Migration · Avoid 9-Month Feature Freezes
                </p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
                  The Strangler Fig Pattern (Instead of a Big-Bang Rewrite)
                </h3>
              </div>
            </div>

            <StranglerFigDiagram />

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {STRANGLER_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
                >
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{s.step}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    <CourseText text={s.desc} />
                  </p>
                </div>
              ))}
            </div>

            {/* How the Database Splits Safely */}
            <div className="mt-6 border-t border-stone-200 pt-5 dark:border-slate-700/80">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                The Hardest Part · Splitting the Shared Database Safely
              </p>
              <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Routing HTTP URLs is the easy half of Strangler Fig. Extracting a module’s tables
                without downtime takes four deliberate steps:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {DB_SPLIT_STEPS.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      <CourseText text={item.step} />
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      <CourseText text={item.detail} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: Order-of-Magnitude Cost Intuition */}
      {isVisible('cost') && (
        <section className="space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Order-of-Magnitude Cost Modeling
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
                  Cloud Cost Intuition: 10k vs. 10M Requests / Month
                </h2>
              </div>

              <div className="inline-flex rounded-xl border border-stone-200 bg-stone-100 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-[#0f172a]">
                <button
                  type="button"
                  onClick={() => setTrafficTier('10k')}
                  className={`rounded-lg px-3.5 py-1.5 transition ${trafficTier === '10k'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  10k req / mo
                </button>
                <button
                  type="button"
                  onClick={() => setTrafficTier('10m')}
                  className={`rounded-lg px-3.5 py-1.5 transition ${trafficTier === '10m'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                >
                  10M req / mo
                </button>
              </div>
            </div>

            <p className="prose-measure mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {activeCostTier.summary}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {activeCostTier.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/modules/${item.id}`}
                      className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-300"
                    >
                      <ArchitectureIconBadge architectureId={item.id} size="sm" />
                      <span>{item.name}</span>
                    </Link>
                    <span
                      className={`font-mono text-sm font-extrabold ${item.verdict === 'cheapest'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : item.verdict === 'balanced'
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-amber-600 dark:text-amber-400'
                        }`}
                    >
                      {item.monthlyRange}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <strong>Main driver:</strong> <CourseText text={item.opsDriver} />
                  </p>
                  <p className="mt-2.5 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <CourseText text={item.note} />
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-4 text-sm leading-7 text-slate-800 dark:text-slate-100">
              <strong>Key Takeaway: </strong>
              <CourseText text={activeCostTier.takeaway} />
            </div>
          </div>
        </section>
      )}

      {/* STEP 4: 5-Minute NFR Sizing Calculator & ADR Template */}
      {isVisible('sizing-adr') && (
        <section className="space-y-6">
          <SizingEstimator />
          <AdrTemplateCard />
        </section>
      )}

      {/* Quiet Step Footer */}
      {viewMode === 'guided' && stepIdx < COMPARE_STEPS.length - 1 && (
        <footer className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {stepIdx > 0 ? (
            <button
              type="button"
              onClick={() => goToStep(stepIdx - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous: {COMPARE_STEPS[stepIdx - 1].label}
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => goToStep(stepIdx + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500"
          >
            Continue: {COMPARE_STEPS[stepIdx + 1].label}
            <ArrowRight className="h-4 w-4" />
          </button>
        </footer>
      )}

      {(viewMode === 'all' || stepIdx === COMPARE_STEPS.length - 1) && (
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {viewMode === 'guided' ? (
            <button
              type="button"
              onClick={() => goToStep(stepIdx - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cost Intuition
            </button>
          ) : (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Ready to test your judgment on {COURSE_COUNTS.simulatorScenarios} realistic company briefs?
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
