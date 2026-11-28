import { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { CourseText } from './CourseText';

type BreakerState = 'closed' | 'open' | 'half-open';

const BREAKER_FAILURE_THRESHOLD = 3;

export function CircuitBreakerLab() {
  const [state, setState] = useState<BreakerState>('closed');
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [lastEvent, setLastEvent] = useState(
    'Healthy: calls flow normally to Recommendations Service (~45ms).'
  );

  const handleHealthyCall = () => {
    if (state === 'open') {
      setLastEvent(
        'Short-circuited! Breaker is OPEN — returned cached Trending fallback in 5ms without calling the struggling service.'
      );
      return;
    }
    if (state === 'half-open') {
      setState('closed');
      setConsecutiveFailures(0);
      setLastEvent(
        'Probe succeeded! Breaker transitioned HALF-OPEN → CLOSED. Full live traffic resumed (~45ms).'
      );
      return;
    }
    setConsecutiveFailures(0);
    setLastEvent('200 OK from Recommendations Service in 45ms. Failure counter reset to 0.');
  };

  const handleInjectFailure = () => {
    if (state === 'open') {
      setLastEvent(
        'Protected! Breaker is already OPEN — caller received cached fallback in 5ms instead of hanging for 5,000ms.'
      );
      return;
    }
    if (state === 'half-open') {
      setState('open');
      setConsecutiveFailures(BREAKER_FAILURE_THRESHOLD);
      setLastEvent(
        'Probe failed! Breaker snapped HALF-OPEN → OPEN again so the sick dependency gets another cooldown window.'
      );
      return;
    }

    const nextFailures = consecutiveFailures + 1;
    setConsecutiveFailures(nextFailures);
    if (nextFailures >= BREAKER_FAILURE_THRESHOLD) {
      setState('open');
      setLastEvent(
        `3 consecutive timeouts hit! Breaker tripped CLOSED → OPEN. All new requests now fail fast with cached fallback (5ms).`
      );
    } else {
      setLastEvent(
        `Timeout #${nextFailures} of ${BREAKER_FAILURE_THRESHOLD} (500ms budget exhausted). ${
          BREAKER_FAILURE_THRESHOLD - nextFailures
        } more before tripping OPEN.`
      );
    }
  };

  const handleAdvanceCooldown = () => {
    if (state !== 'open') return;
    setState('half-open');
    setLastEvent(
      'Cooldown expired! Breaker moved OPEN → HALF-OPEN. Next request acts as a single probe to test recovery.'
    );
  };

  const handleReset = () => {
    setState('closed');
    setConsecutiveFailures(0);
    setLastEvent('Reset to CLOSED: calls flow normally to Recommendations Service (~45ms).');
  };

  const stateBadge =
    state === 'closed'
      ? { label: 'CLOSED (Normal)', classes: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' }
      : state === 'open'
      ? { label: 'OPEN (Fail-Fast Fallback)', classes: 'bg-rose-500/20 text-rose-700 dark:text-rose-300' }
      : { label: 'HALF-OPEN (Probing)', classes: 'bg-amber-500/20 text-amber-700 dark:text-amber-300' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Interactive Resilience Lab
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            Circuit Breaker State Machine (Closed → Open → Half-Open)
          </h2>
          <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Inject failures to trip the breaker open, observe fast fallbacks, then fast-forward the
            cooldown to test recovery safely.
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-bold ${stateBadge.classes}`}>
          {stateBadge.label}
        </span>
      </div>

      {/* Live State-Machine SVG Diagram */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-3.5">
        <svg
          viewBox="0 0 720 175"
          className="h-auto w-full min-w-[500px]"
          role="img"
          aria-label="Live Circuit Breaker state machine diagram showing Closed, Open, and Half-Open transitions"
        >
          {/* Transition: CLOSED -> OPEN */}
          <path
            d="M 192 78 C 235 32, 265 32, 290 74"
            fill="none"
            stroke={state === 'open' ? '#f43f5e' : '#475569'}
            strokeWidth={state === 'open' ? 2.6 : 1.6}
            strokeDasharray="6 5"
            className={state === 'open' ? 'animate-flow-fast' : undefined}
          />
          <text x="242" y="34" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={state === 'open' ? '#fda4af' : '#94a3b8'}>
            3 failures →
          </text>

          {/* Transition: OPEN -> HALF-OPEN */}
          <path
            d="M 432 78 C 475 32, 505 32, 530 74"
            fill="none"
            stroke={state === 'half-open' ? '#f59e0b' : '#475569'}
            strokeWidth={state === 'half-open' ? 2.6 : 1.6}
            strokeDasharray="6 5"
            className={state === 'half-open' ? 'animate-flow' : undefined}
          />
          <text x="482" y="34" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={state === 'half-open' ? '#fcd34d' : '#94a3b8'}>
            Cooldown expires →
          </text>

          {/* Transition: HALF-OPEN -> CLOSED (bottom arc) */}
          <path
            d="M 600 120 C 510 166, 210 166, 120 120"
            fill="none"
            stroke={state === 'closed' ? '#10b981' : '#334155'}
            strokeWidth={state === 'closed' ? 2.2 : 1.5}
            strokeDasharray="6 5"
          />
          <text x="360" y="164" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6ee7b7">
            ← Probe succeeds (Resume traffic)
          </text>

          {/* Transition: HALF-OPEN -> OPEN (probe fails) */}
          <path
            d="M 530 112 C 500 132, 465 132, 432 112"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="1.4"
            strokeDasharray="4 4"
          />
          <text x="482" y="138" textAnchor="middle" fontSize="9" fill="#fda4af">
            ← Probe fails
          </text>

          {/* Node 1: CLOSED */}
          <rect
            x="44"
            y="62"
            width="148"
            height="56"
            rx="12"
            fill={state === 'closed' ? '#064e3b' : '#0f172a'}
            stroke={state === 'closed' ? '#10b981' : '#334155'}
            strokeWidth={state === 'closed' ? 2.6 : 1.4}
          />
          <text x="118" y="86" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f8fafc">
            1. CLOSED
          </text>
          <text x="118" y="104" textAnchor="middle" fontSize="9.5" fill={state === 'closed' ? '#6ee7b7' : '#94a3b8'}>
            Normal (~45ms) · {consecutiveFailures}/{BREAKER_FAILURE_THRESHOLD} fails
          </text>

          {/* Node 2: OPEN */}
          <rect
            x="286"
            y="62"
            width="148"
            height="56"
            rx="12"
            fill={state === 'open' ? '#4c0519' : '#0f172a'}
            stroke={state === 'open' ? '#f43f5e' : '#334155'}
            strokeWidth={state === 'open' ? 2.6 : 1.4}
          />
          <text x="360" y="86" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f8fafc">
            2. OPEN
          </text>
          <text x="360" y="104" textAnchor="middle" fontSize="9.5" fill={state === 'open' ? '#fda4af' : '#94a3b8'}>
            Fail-Fast Fallback (5ms)
          </text>

          {/* Node 3: HALF-OPEN */}
          <rect
            x="528"
            y="62"
            width="148"
            height="56"
            rx="12"
            fill={state === 'half-open' ? '#451a03' : '#0f172a'}
            stroke={state === 'half-open' ? '#f59e0b' : '#334155'}
            strokeWidth={state === 'half-open' ? 2.6 : 1.4}
          />
          <text x="602" y="86" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f8fafc">
            3. HALF-OPEN
          </text>
          <text x="602" y="104" textAnchor="middle" fontSize="9.5" fill={state === 'half-open' ? '#fcd34d' : '#94a3b8'}>
            1 Probe Request
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleInjectFailure}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-500"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Inject Downstream Failure ({consecutiveFailures}/{BREAKER_FAILURE_THRESHOLD})
        </button>

        <button
          type="button"
          onClick={handleHealthyCall}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Send Healthy Request
        </button>

        <button
          type="button"
          disabled={state !== 'open'}
          onClick={handleAdvanceCooldown}
          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Zap className="h-3.5 w-3.5" />
          Fast-Forward 30s Cooldown
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-stone-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs leading-6 text-slate-700 dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:text-slate-200">
        <strong>Latest Request Log: </strong>
        {lastEvent}
      </div>
    </div>
  );
}

export function AvailabilityAndOutboxLab() {
  const [hops, setHops] = useState(5);
  const [perServiceSlo, setPerServiceSlo] = useState<99.5 | 99.9 | 99.95>(99.9);
  const [crashInjected, setCrashInjected] = useState(false);

  const combinedRatio = Math.pow(perServiceSlo / 100, hops);
  const combinedPercent = (combinedRatio * 100).toFixed(2);
  const minutesPerMonth = 30 * 24 * 60;
  const downtimeMinutes = Math.round((1 - combinedRatio) * minutesPerMonth);
  const singleServiceDowntime = Math.round((1 - perServiceSlo / 100) * minutesPerMonth);

  return (
    <div className="space-y-6">
      {/* Part A: Compounding Availability Math */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Availability Math Calculator
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            Why Long Synchronous Microservice Chains Hurt Uptime
          </h2>
          <p className="prose-measure mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Slide the number of synchronous downstream calls required to answer one request and see
            how reliability compounds downward.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <label htmlFor="sync-hops-slider" className="text-slate-700 dark:text-slate-200">
                  Synchronous Service Hops
                </label>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                  {hops} {hops === 1 ? 'service' : 'services'}
                </span>
              </div>
              <input
                id="sync-hops-slider"
                type="range"
                min={1}
                max={10}
                value={hops}
                onChange={(e) => setHops(Number(e.target.value))}
                className="mt-2 w-full accent-indigo-600"
              />
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <CourseText text="Per-Service SLO" />
              </p>
              <div className="flex flex-wrap gap-2">
                {([99.5, 99.9, 99.95] as const).map((slo) => (
                  <button
                    key={slo}
                    type="button"
                    onClick={() => setPerServiceSlo(slo)}
                    className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                      perServiceSlo === slo
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {slo}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Combined Endpoint Uptime
              </span>
              <span className="font-mono text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                {combinedPercent}%
              </span>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-700 dark:text-slate-200">
              <strong>Formula:</strong>{' '}
              <code className="font-mono">
                ({perServiceSlo}%)^{hops}
              </code>{' '}
              ≈ <strong>{downtimeMinutes} min/month</strong> of expected downtime (vs.{' '}
              <strong>{singleServiceDowntime} min/month</strong> for a single service or async
              decoupled boundary).
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Activity className="h-3.5 w-3.5 shrink-0" />
              Keep sync chains ≤ 2 hops; offload side effects to queues or cached fallbacks.
            </p>
          </div>
        </div>
      </div>

      {/* Part B: Dual-Write vs. Outbox Crash Simulator */}
      <div className="border-t border-stone-200 pt-6 dark:border-slate-700/80">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Crash Consistency Lab
            </span>
            <h3 className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">
              Dual-Write Bug vs. Transactional Outbox
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setCrashInjected((prev) => !prev)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition ${
              crashInjected
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {crashInjected
              ? 'Reset Normal Execution'
              : 'Simulate Crash Right After DB Commit'}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-3.5">
          <svg
            viewBox="0 0 720 155"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label="Visual comparison of Dual-Write losing an event on crash versus Transactional Outbox preserving it atomically"
          >
            {/* Top: Dual-Write */}
            <text x="16" y="22" fontSize="10.5" fontWeight="800" fill={crashInjected ? '#fda4af' : '#cbd5e1'}>
              1. DUAL-WRITE (Two separate operations)
            </text>
            <rect x="16" y="32" width="118" height="36" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.4" />
            <text x="75" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">Trip Service</text>

            <line x1="134" y1="50" x2="210" y2="50" stroke="#10b981" strokeWidth="2" />
            <rect x="214" y="32" width="144" height="36" rx="8" fill="#312e81" stroke="#10b981" strokeWidth="1.4" />
            <text x="286" y="54" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">DB Commit ✓</text>

            <line
              x1="358"
              y1="50"
              x2="490"
              y2="50"
              stroke={crashInjected ? '#f43f5e' : '#38bdf8'}
              strokeWidth="2"
              strokeDasharray="5 5"
              className={crashInjected ? undefined : 'animate-flow'}
            />
            {crashInjected && (
              <g>
                <rect x="384" y="36" width="84" height="26" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.4" />
                <text x="426" y="53" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fda4af">✕ CRASH!</text>
              </g>
            )}

            <rect
              x="494"
              y="32"
              width="206"
              height="36"
              rx="8"
              fill={crashInjected ? '#1f0a12' : '#064e3b'}
              stroke={crashInjected ? '#f43f5e' : '#10b981'}
              strokeWidth="1.4"
            />
            <text x="597" y="54" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={crashInjected ? '#fda4af' : '#ecfdf5'}>
              {crashInjected ? 'Broker: Event Lost Forever' : 'Broker: TripCompleted'}
            </text>

            {/* Bottom: Transactional Outbox */}
            <text x="16" y="96" fontSize="10.5" fontWeight="800" fill="#6ee7b7">
              2. TRANSACTIONAL OUTBOX (Atomic DB Write + Relay)
            </text>
            <rect x="16" y="106" width="118" height="36" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.4" />
            <text x="75" y="128" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">Trip Service</text>

            <line x1="134" y1="124" x2="174" y2="124" stroke="#10b981" strokeWidth="2" />

            <rect x="178" y="102" width="234" height="44" rx="10" fill="#052e16" stroke="#10b981" strokeWidth="1.8" />
            <text x="295" y="120" textAnchor="middle" fontSize="10" fontWeight="800" fill="#6ee7b7">
              1 Atomic SQL Transaction ✓
            </text>
            <text x="295" y="136" textAnchor="middle" fontSize="9.5" fill="#ecfdf5">
              UPDATE trips + INSERT outbox_events
            </text>

            <line x1="412" y1="124" x2="490" y2="124" stroke="#10b981" strokeWidth="2" strokeDasharray="6 5" className="animate-flow" />
            <text x="451" y="116" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6ee7b7">
              {crashInjected ? 'Relay recovers' : 'Relay / CDC'}
            </text>

            <rect x="494" y="106" width="206" height="36" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="597" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">
              Broker: Guaranteed Delivery ✓
            </text>
          </svg>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div
            className={`rounded-xl border p-4 transition ${
              crashInjected
                ? 'border-rose-500/40 bg-rose-500/10'
                : 'border-stone-200 bg-stone-50 dark:border-slate-700/80 dark:bg-[#0f172a]/70'
            }`}
          >
            <p className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>1. Naive Dual-Write (DB then Broker)</span>
              {crashInjected && (
                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Event Lost!
                </span>
              )}
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
              {crashInjected
                ? 'Postgres committed `status = COMPLETED`, then the container crashed before `broker.publish()` ran. Payments NEVER hears about the ride (silent revenue loss).'
                : 'Works only on the happy path when neither the process nor the broker blips between step 1 and step 2.'}
            </p>
          </div>

          <div
            className={`rounded-xl border p-4 transition ${
              crashInjected
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-stone-200 bg-stone-50 dark:border-slate-700/80 dark:bg-[#0f172a]/70'
            }`}
          >
            <p className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>2. Transactional Outbox + Relay</span>
              {crashInjected && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Zero Loss!
                </span>
              )}
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <CourseText
                text={
                  crashInjected
                    ? 'Trip update and `outbox_events` row committed atomically inside ONE SQL transaction. When the relay restarts (using `SKIP LOCKED` or CDC), it publishes `TripCompleted` safely.'
                    : 'Both the state change and the outbound event live in the same database transaction — atomic by design.'
                }
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
