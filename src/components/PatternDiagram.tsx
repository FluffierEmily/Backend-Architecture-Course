interface PatternDiagramProps {
  conceptId: string;
}

const PATTERN_META: Record<string, { caption: string; ariaLabel: string }> = {
  'mm-bounded-contexts': {
    caption: 'Shared mega-model coupling vs. clean Bounded Contexts sharing only an immutable userId',
    ariaLabel: 'Diagram comparing a shared monolithic User table against isolated Auth, Billing, and Projects bounded contexts',
  },
  'ms-sagas': {
    caption: 'Saga forward local transactions (green) and reverse idempotent compensating actions (rose)',
    ariaLabel: 'Saga workflow diagram showing Reserve Stock, Charge Card, failed Shipping, and compensating Refund and Release steps',
  },
  'ms-cross-queries': {
    caption: 'Avoiding cross-service SQL JOINs: parallel batched BFF calls vs. event-synced CQRS Read Model',
    ariaLabel: 'Diagram comparing BFF parallel batch aggregation with an event-synced CQRS local read model',
  },
  'sl-edge-vs-regional': {
    caption: 'Why Edge compute + a distant single-region DB loses to co-located Regional compute on multi-query routes',
    ariaLabel: 'Latency comparison diagram of Tokyo Edge function making four cross-ocean queries versus a regional function next to the primary database',
  },
  'eda-queue-vs-log': {
    caption: 'Queue (delete on ack) vs. Pub/Sub (live broadcast) vs. Replayable Event Log (independent offsets)',
    ariaLabel: 'Three-lane diagram comparing Point-to-Point Queue, Pub/Sub fanout, and a replayable Kafka-style Event Log with consumer offsets',
  },
  'eda-choreography-vs-orchestration': {
    caption: 'Choreography (decoupled fan-out) vs. Orchestration (explicit multi-step state tracker)',
    ariaLabel: 'Side-by-side diagram comparing event choreography via a broker with centralized workflow orchestration',
  },
};

export function hasPatternDiagram(conceptId: string): boolean {
  return conceptId in PATTERN_META;
}

export function PatternDiagram({ conceptId }: PatternDiagramProps) {
  const meta = PATTERN_META[conceptId];
  if (!meta) return null;

  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120] p-2.5 sm:p-3.5">
      <div className="mb-1.5 flex items-center justify-end px-1 text-[10px] font-medium text-slate-400 sm:hidden">
        Swipe diagram ↔
      </div>
      <div className="overflow-x-auto">
        {conceptId === 'mm-bounded-contexts' && (
          <svg
            viewBox="0 0 720 195"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Left: Tangled God Model */}
            <rect x="14" y="14" width="290" height="168" rx="12" fill="#1f0a12" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="159" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fda4af">
              PITFALL: Shared 40-Column User Model
            </text>
            <rect x="44" y="50" width="230" height="72" rx="10" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.4" />
            <text x="159" y="72" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ffe4e6">User (God ORM Entity)</text>
            <text x="159" y="90" textAnchor="middle" fontSize="9.5" fill="#fda4af">passwordHash, stripeId, planTier,</text>
            <text x="159" y="106" textAnchor="middle" fontSize="9.5" fill="#fda4af">assignedTasks[], mfaSecret...</text>
            <text x="159" y="148" textAnchor="middle" fontSize="10" fill="#fda4af">
              Any schema tweak breaks all 3 modules!
            </text>

            {/* Right: Clean Bounded Contexts */}
            <rect x="326" y="14" width="380" height="168" rx="12" fill="#05211a" stroke="#10b981" strokeWidth="1.2" />
            <text x="516" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill="#6ee7b7">
              CLEAN: Bounded Contexts (Shared userId only)
            </text>

            {[
              { x: 342, title: 'Auth', fields: 'userId, email, hash', stroke: '#818cf8', bg: '#1e1b4b' },
              { x: 462, title: 'Billing', fields: 'userId, plan, seats', stroke: '#38bdf8', bg: '#0c4a6e' },
              { x: 582, title: 'Projects', fields: 'userId, displayName', stroke: '#10b981', bg: '#064e3b' },
            ].map((ctx) => (
              <g key={ctx.title}>
                <rect x={ctx.x} y="52" width="108" height="76" rx="9" fill={ctx.bg} stroke={ctx.stroke} strokeWidth="1.4" />
                <text x={ctx.x + 54} y="75" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f8fafc">
                  {ctx.title}
                </text>
                <text x={ctx.x + 54} y="96" textAnchor="middle" fontSize="9" fill="#cbd5e1">
                  {ctx.fields}
                </text>
                <text x={ctx.x + 54} y="114" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={ctx.stroke}>
                  Private schema
                </text>
              </g>
            ))}

            <text x="516" y="156" textAnchor="middle" fontSize="10" fill="#6ee7b7">
              Each module evolves its tables freely behind publicApi.ts
            </text>
          </svg>
        )}

        {conceptId === 'ms-sagas' && (
          <svg
            viewBox="0 0 720 190"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Forward Path */}
            <text x="18" y="24" fontSize="10.5" fontWeight="800" fill="#6ee7b7">
              FORWARD LOCAL TRANSACTIONS
            </text>

            <rect x="18" y="36" width="184" height="50" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="110" y="57" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ecfdf5">1. Inventory Svc</text>
            <text x="110" y="74" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">Reserve stock ✓</text>

            <line x1="202" y1="61" x2="262" y2="61" stroke="#10b981" strokeWidth="2" />

            <rect x="266" y="36" width="184" height="50" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="358" y="57" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ecfdf5">2. Billing Svc</text>
            <text x="358" y="74" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">Charge card ✓</text>

            <line x1="450" y1="61" x2="510" y2="61" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 4" className="animate-flow-fast" />

            <rect x="514" y="36" width="188" height="50" rx="10" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.8" />
            <text x="608" y="57" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ffe4e6">3. Shipping Svc</text>
            <text x="608" y="74" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fda4af">✕ Out of Carrier Quota!</text>

            {/* Reverse Compensating Actions */}
            <path d="M 608 86 L 608 142 L 454 142" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 4" className="animate-flow" />

            <rect x="266" y="116" width="184" height="50" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="358" y="137" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fef3c7">← 2b. Refund Card</text>
            <text x="358" y="154" textAnchor="middle" fontSize="9.5" fill="#fcd34d">Idempotent compensation</text>

            <line x1="266" y1="142" x2="206" y2="142" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" className="animate-flow" />

            <rect x="18" y="116" width="184" height="50" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="110" y="137" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fef3c7">← 1b. Release Stock</text>
            <text x="110" y="154" textAnchor="middle" fontSize="9.5" fill="#fcd34d">Order marked FAILED</text>
          </svg>
        )}

        {conceptId === 'ms-cross-queries' && (
          <svg
            viewBox="0 0 720 195"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Left: BFF Parallel Batch */}
            <rect x="14" y="14" width="336" height="168" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <text x="30" y="36" fontSize="11" fontWeight="800" fill="#7dd3fc">OPTION A: BFF Parallel Batching</text>

            <rect x="28" y="80" width="90" height="46" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.4" />
            <text x="73" y="101" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">Web BFF</text>
            <text x="73" y="116" textAnchor="middle" fontSize="8.5" fill="#a5b4fc">Promise.all</text>

            <line x1="118" y1="94" x2="196" y2="70" stroke="#38bdf8" strokeWidth="1.8" />
            <line x1="118" y1="112" x2="196" y2="134" stroke="#38bdf8" strokeWidth="1.8" />

            <rect x="200" y="50" width="134" height="36" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.3" />
            <text x="267" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f0f9ff">GET /invoices?limit=50</text>

            <rect x="200" y="116" width="134" height="36" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.3" />
            <text x="267" y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f0f9ff">POST /users/batch</text>

            <text x="182" y="170" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">2 hops total (vs. 51 N+1 HTTP calls)</text>

            {/* Right: CQRS Read Model */}
            <rect x="370" y="14" width="336" height="168" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
            <text x="386" y="36" fontSize="11" fontWeight="800" fill="#6ee7b7">OPTION B: Event-Synced CQRS View</text>

            <rect x="384" y="52" width="108" height="34" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
            <text x="438" y="73" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">Billing Events</text>

            <rect x="384" y="100" width="108" height="34" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
            <text x="438" y="121" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">User Events</text>

            <line x1="492" y1="69" x2="544" y2="94" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 4" className="animate-flow" />
            <line x1="492" y1="117" x2="544" y2="100" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 4" className="animate-flow" />

            <rect x="548" y="64" width="142" height="62" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="619" y="88" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ecfdf5">Local Read DB</text>
            <text x="619" y="105" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">Pre-joined view</text>
            <text x="619" y="119" textAnchor="middle" fontSize="8.5" fill="#cbd5e1">1 fast local query!</text>

            <text x="538" y="170" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Zero live cross-service hops on read</text>
          </svg>
        )}

        {conceptId === 'sl-edge-vs-regional' && (
          <svg
            viewBox="0 0 720 205"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Top: Edge + Distant DB Trap */}
            <text x="16" y="22" fontSize="10.5" fontWeight="800" fill="#fda4af">
              TRAP: Edge Function (Tokyo) + Single Primary DB (us-east-1) = 610ms!
            </text>
            <rect x="16" y="34" width="104" height="44" rx="9" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.4" />
            <text x="68" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">User</text>
            <text x="68" y="69" textAnchor="middle" fontSize="9" fill="#cbd5e1">Tokyo</text>

            <line x1="120" y1="56" x2="180" y2="56" stroke="#10b981" strokeWidth="2" />
            <text x="150" y="49" textAnchor="middle" fontSize="9" fill="#6ee7b7">10ms</text>

            <rect x="184" y="34" width="124" height="44" rx="9" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="246" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fef3c7">Edge Worker</text>
            <text x="246" y="69" textAnchor="middle" fontSize="9" fill="#fcd34d">Tokyo</text>

            <line x1="308" y1="56" x2="554" y2="56" stroke="#f43f5e" strokeWidth="2.4" strokeDasharray="6 5" className="animate-flow-fast" />
            <rect x="352" y="38" width="158" height="22" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
            <text x="431" y="53" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fda4af">4 SQL queries × 150ms = 600ms</text>

            <rect x="558" y="34" width="146" height="44" rx="9" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
            <text x="631" y="54" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5f3ff">Primary Postgres</text>
            <text x="631" y="69" textAnchor="middle" fontSize="9" fill="#c4b5fd">us-east-1</text>

            {/* Divider */}
            <line x1="16" y1="102" x2="704" y2="102" stroke="#1e293b" strokeWidth="1" />

            {/* Bottom: Regional Co-Located */}
            <text x="16" y="126" fontSize="10.5" fontWeight="800" fill="#6ee7b7">
              FAST: Co-Located Regional Function (us-east-1) + Primary DB = 158ms!
            </text>
            <rect x="16" y="138" width="104" height="44" rx="9" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.4" />
            <text x="68" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">User</text>
            <text x="68" y="173" textAnchor="middle" fontSize="9" fill="#cbd5e1">Tokyo</text>

            <line x1="120" y1="160" x2="366" y2="160" stroke="#38bdf8" strokeWidth="2" />
            <text x="243" y="152" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#7dd3fc">1 ocean round-trip (150ms)</text>

            <rect x="370" y="138" width="128" height="44" rx="9" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="434" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ecfdf5">Regional Fn</text>
            <text x="434" y="173" textAnchor="middle" fontSize="9" fill="#6ee7b7">us-east-1</text>

            <line x1="498" y1="160" x2="554" y2="160" stroke="#10b981" strokeWidth="2.4" />
            <text x="526" y="150" textAnchor="middle" fontSize="9" fontWeight="700" fill="#6ee7b7">4×2ms</text>

            <rect x="558" y="138" width="146" height="44" rx="9" fill="#312e81" stroke="#a78bfa" strokeWidth="1.5" />
            <text x="631" y="158" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f5f3ff">Primary Postgres</text>
            <text x="631" y="173" textAnchor="middle" fontSize="9" fill="#c4b5fd">us-east-1</text>
          </svg>
        )}

        {conceptId === 'eda-queue-vs-log' && (
          <svg
            viewBox="0 0 720 225"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Lane 1: Queue */}
            <rect x="14" y="12" width="142" height="54" rx="9" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.3" />
            <text x="85" y="35" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">1. Queue (SQS)</text>
            <text x="85" y="52" textAnchor="middle" fontSize="9" fill="#cbd5e1">1-to-1 · Deleted on ack</text>
            <rect x="174" y="18" width="230" height="42" rx="8" fill="#0f172a" stroke="#475569" strokeWidth="1.2" />
            <text x="289" y="43" textAnchor="middle" fontSize="10" fill="#cbd5e1">[Job 1] → [Job 2] → [Job 3]</text>
            <line x1="404" y1="39" x2="466" y2="39" stroke="#94a3b8" strokeWidth="1.8" />
            <rect x="470" y="18" width="234" height="42" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.3" />
            <text x="587" y="43" textAnchor="middle" fontSize="10" fontWeight="700" fill="#e0e7ff">Single Worker Pool (consumed once)</text>

            {/* Lane 2: Pub/Sub */}
            <rect x="14" y="82" width="142" height="54" rx="9" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.3" />
            <text x="85" y="105" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f0f9ff">2. Pub/Sub (SNS)</text>
            <text x="85" y="122" textAnchor="middle" fontSize="9" fill="#7dd3fc">Live fan-out · No replay</text>
            <rect x="174" y="88" width="230" height="42" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <text x="289" y="113" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7dd3fc">Broadcast: TripCompleted</text>
            <line x1="404" y1="100" x2="466" y2="96" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 4" className="animate-flow" />
            <line x1="404" y1="118" x2="466" y2="122" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 4" className="animate-flow" />
            <rect x="470" y="84" width="112" height="24" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.1" />
            <text x="526" y="100" textAnchor="middle" fontSize="9.5" fill="#f0f9ff">Payments</text>
            <rect x="592" y="84" width="112" height="24" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.1" />
            <text x="648" y="100" textAnchor="middle" fontSize="9.5" fill="#f0f9ff">Receipts</text>
            <text x="587" y="126" textAnchor="middle" fontSize="9" fill="#94a3b8">Late subscribers miss past events</text>

            {/* Lane 3: Replayable Event Log */}
            <rect x="14" y="152" width="142" height="60" rx="9" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="85" y="176" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ecfdf5">3. Event Log</text>
            <text x="85" y="194" textAnchor="middle" fontSize="9" fill="#6ee7b7">Kafka · Retained &amp; replayable</text>

            {[0, 1, 2, 3, 4].map((offset) => (
              <g key={offset}>
                <rect x={174 + offset * 48} y="162" width="42" height="34" rx="6" fill="#052e16" stroke="#10b981" strokeWidth="1.2" />
                <text x={195 + offset * 48} y="183" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#6ee7b7">
                  #{offset}
                </text>
              </g>
            ))}

            <text x="195" y="212" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fcd34d">▲ New ML Group (replays #0)</text>
            <text x="387" y="212" textAnchor="middle" fontSize="9" fontWeight="700" fill="#7dd3fc">▲ Payments (#4)</text>

            <rect x="470" y="160" width="234" height="44" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.3" />
            <text x="587" y="179" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ecfdf5">Independent Consumer Offsets</text>
            <text x="587" y="195" textAnchor="middle" fontSize="9" fill="#6ee7b7">Replay history without re-triggering live subs</text>
          </svg>
        )}

        {conceptId === 'eda-choreography-vs-orchestration' && (
          <svg
            viewBox="0 0 720 190"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Left: Choreography */}
            <rect x="14" y="14" width="336" height="162" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.2" />
            <text x="30" y="36" fontSize="11" fontWeight="800" fill="#6ee7b7">CHOREOGRAPHY (Decoupled Fan-Out)</text>

            <rect x="122" y="54" width="120" height="34" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.4" />
            <text x="182" y="75" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">Event Broker</text>

            <line x1="148" y1="88" x2="72" y2="116" stroke="#10b981" strokeWidth="1.6" strokeDasharray="5 4" className="animate-flow" />
            <line x1="182" y1="88" x2="182" y2="116" stroke="#10b981" strokeWidth="1.6" strokeDasharray="5 4" className="animate-flow" />
            <line x1="216" y1="88" x2="292" y2="116" stroke="#10b981" strokeWidth="1.6" strokeDasharray="5 4" className="animate-flow" />

            {[
              { x: 28, label: 'Receipts' },
              { x: 138, label: 'Analytics' },
              { x: 248, label: 'Loyalty' },
            ].map((c) => (
              <g key={c.label}>
                <rect x={c.x} y="118" width="88" height="32" rx="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
                <text x={c.x + 44} y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">{c.label}</text>
              </g>
            ))}

            {/* Right: Orchestration */}
            <rect x="370" y="14" width="336" height="162" rx="12" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2" />
            <text x="386" y="36" fontSize="11" fontWeight="800" fill="#a5b4fc">ORCHESTRATION (Strict Multi-Step Flow)</text>

            <rect x="460" y="52" width="156" height="38" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />
            <text x="538" y="75" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#e0e7ff">Workflow Orchestrator</text>

            <line x1="496" y1="90" x2="430" y2="116" stroke="#818cf8" strokeWidth="1.8" />
            <line x1="538" y1="90" x2="538" y2="116" stroke="#818cf8" strokeWidth="1.8" />
            <line x1="580" y1="90" x2="646" y2="116" stroke="#818cf8" strokeWidth="1.8" />

            {[
              { x: 384, label: '1. Reserve' },
              { x: 494, label: '2. Charge' },
              { x: 604, label: '3. Ship' },
            ].map((s) => (
              <g key={s.label}>
                <rect x={s.x} y="118" width="88" height="32" rx="7" fill="#1e293b" stroke="#818cf8" strokeWidth="1.2" />
                <text x={s.x + 44} y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">{s.label}</text>
              </g>
            ))}
          </svg>
        )}
      </div>
      <figcaption className="mt-2 px-1 text-[11px] font-medium text-slate-400">
        Visual pattern: {meta.caption}
      </figcaption>
    </figure>
  );
}
