interface FoundationDiagramProps {
  blockId: string;
}

const DIAGRAM_META: Record<string, { caption: string; ariaLabel: string }> = {
  'sync-vs-async': {
    caption: 'Synchronous blocking wait vs. fast 202 Accepted + queue-buffered worker',
    ariaLabel: 'Timeline comparing synchronous blocking HTTP requests to asynchronous queue processing',
  },
  caching: {
    caption: 'Cache-Aside flow: fast Redis HIT (~2ms) vs. DB MISS (~40ms) with TTL jitter',
    ariaLabel: 'Cache-Aside diagram showing cache hit and cache miss paths with Redis and Postgres',
  },
  'rate-limiting-backpressure': {
    caption: 'Token-bucket rate limiting at the edge + bounded queue backpressure downstream',
    ariaLabel: 'Diagram showing rate limiting shedding excess traffic and bounded queues protecting slow workers',
  },
  'zero-downtime-migrations': {
    caption: 'Expand-and-Contract: 4 zero-downtime rollout stages while v1 & v2 coexist',
    ariaLabel: 'Four-stage zero-downtime database migration timeline from expand to contract',
  },
  'concurrency-locking': {
    caption: 'Read-Modify-Write race condition vs. single atomic conditional SQL update',
    ariaLabel: 'Comparison diagram of a double-booking race condition versus an atomic SQL update',
  },
  'realtime-push': {
    caption: 'How updates flow: Short Polling vs. SSE vs. WebSockets vs. Webhooks',
    ariaLabel: 'Four-lane comparison of short polling, Server-Sent Events, WebSockets, and webhooks',
  },
  'db-choice-scaling': {
    caption: 'Primary writes, async replication lag (~50ms), and routing critical reads safely',
    ariaLabel: 'Primary database and read replica diagram illustrating replication lag and read routing',
  },
  'safe-deployments': {
    caption: 'Minimizing blast radius with Canary traffic splits vs. Blue-Green instant flips',
    ariaLabel: 'Deployment strategy diagram comparing Canary percentage routing and Blue-Green switching',
  },
  'multi-tenancy': {
    caption: 'Tenant isolation spectrum: Shared DB + RLS vs. Schema-per-Tenant vs. DB-per-Tenant',
    ariaLabel: 'Comparison of shared database with row-level security, schema-per-tenant, and database-per-tenant isolation',
  },
};

export function hasFoundationDiagram(blockId: string): boolean {
  return blockId in DIAGRAM_META;
}

export function FoundationDiagram({ blockId }: FoundationDiagramProps) {
  const meta = DIAGRAM_META[blockId];
  if (!meta) return null;

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120] p-3.5">
      <div className="overflow-x-auto">
        {blockId === 'sync-vs-async' && (
          <svg
            viewBox="0 0 720 220"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Top Lane: Sync */}
            <text x="16" y="24" fontSize="11" fontWeight="700" fill="#fda4af">
              SYNCHRONOUS (User waits 3,200ms)
            </text>
            <rect x="16" y="36" width="110" height="44" rx="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="71" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f8fafc">Client</text>

            <line x1="126" y1="50" x2="226" y2="50" stroke="#94a3b8" strokeWidth="1.8" />
            <text x="176" y="44" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">POST /export</text>

            <rect x="230" y="36" width="130" height="44" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="295" y="55" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f8fafc">API Server</text>
            <text x="295" y="70" textAnchor="middle" fontSize="9" fill="#fda4af">Thread blocked...</text>

            <line x1="360" y1="58" x2="460" y2="58" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" className="animate-flow-fast" />
            <text x="410" y="48" textAnchor="middle" fontSize="9.5" fill="#fda4af">Waits 3.2s</text>

            <rect x="464" y="36" width="170" height="44" rx="10" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.5" />
            <text x="549" y="55" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ffe4e6">Render PDF + Email</text>
            <text x="549" y="70" textAnchor="middle" fontSize="9" fill="#fda4af">Timeout risk under load!</text>

            <line x1="226" y1="68" x2="126" y2="68" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="176" y="83" textAnchor="middle" fontSize="9" fill="#fda4af">200 OK (3.2s later)</text>

            {/* Divider */}
            <line x1="16" y1="108" x2="704" y2="108" stroke="#1e293b" strokeWidth="1" />

            {/* Bottom Lane: Async */}
            <text x="16" y="132" fontSize="11" fontWeight="700" fill="#6ee7b7">
              ASYNCHRONOUS (Replies 202 in 30ms — work runs safely off-path)
            </text>
            <rect x="16" y="144" width="110" height="44" rx="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="71" y="170" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f8fafc">Client</text>

            <line x1="126" y1="158" x2="226" y2="158" stroke="#94a3b8" strokeWidth="1.8" />
            <text x="176" y="152" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">POST /export</text>
            <line x1="226" y1="176" x2="126" y2="176" stroke="#10b981" strokeWidth="2" />
            <text x="176" y="191" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6ee7b7">202 Accepted (30ms)</text>

            <rect x="230" y="144" width="120" height="44" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
            <text x="290" y="163" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f8fafc">API Server</text>
            <text x="290" y="178" textAnchor="middle" fontSize="9" fill="#a5b4fc">Enqueues job</text>

            <line x1="350" y1="166" x2="412" y2="166" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />

            <rect x="416" y="144" width="108" height="44" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="470" y="163" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ecfdf5">Job Queue</text>
            <text x="470" y="178" textAnchor="middle" fontSize="9" fill="#6ee7b7">Durable buffer</text>

            <line x1="524" y1="166" x2="578" y2="166" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />

            <rect x="582" y="144" width="122" height="44" rx="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="643" y="163" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f0f9ff">Worker</text>
            <text x="643" y="178" textAnchor="middle" fontSize="9" fill="#7dd3fc">Retries + DLQ</text>
          </svg>
        )}

        {blockId === 'caching' && (
          <svg
            viewBox="0 0 720 205"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            <rect x="20" y="76" width="130" height="52" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />
            <text x="85" y="99" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f8fafc">Backend API</text>
            <text x="85" y="115" textAnchor="middle" fontSize="9.5" fill="#a5b4fc">GET /catalog/42</text>

            {/* Step 1: Check Redis */}
            <line x1="150" y1="90" x2="278" y2="54" stroke="#10b981" strokeWidth="2" strokeDasharray="6 5" className="animate-flow" />
            <text x="205" y="58" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6ee7b7">1. Check Cache</text>

            <rect x="282" y="24" width="160" height="54" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="362" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ecfdf5">Redis Cache</text>
            <text x="362" y="65" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">HIT: Return in ~2ms</text>

            {/* Fast Hit badge */}
            <rect x="478" y="28" width="218" height="46" rx="10" fill="#052e16" stroke="#10b981" strokeWidth="1.2" />
            <text x="587" y="48" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#6ee7b7">Cache HIT Path (90%+ reads)</text>
            <text x="587" y="64" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Database untouched · ~2ms latency</text>
            <line x1="442" y1="51" x2="478" y2="51" stroke="#10b981" strokeWidth="1.6" />

            {/* Step 2: Miss -> DB */}
            <line x1="150" y1="114" x2="278" y2="152" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 5" className="animate-flow" />
            <text x="200" y="150" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fcd34d">2. On MISS → Query</text>

            <rect x="282" y="126" width="160" height="54" rx="10" fill="#312e81" stroke="#a78bfa" strokeWidth="1.6" />
            <text x="362" y="150" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f5f3ff">Primary Postgres</text>
            <text x="362" y="167" textAnchor="middle" fontSize="9.5" fill="#c4b5fd">Source of truth (~40ms)</text>

            {/* Step 3: Populate with TTL + Jitter */}
            <path d="M 442 153 C 470 153, 470 104, 362 78" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeDasharray="5 4" className="animate-flow" />
            <rect x="478" y="124" width="218" height="58" rx="10" fill="#172554" stroke="#38bdf8" strokeWidth="1.2" />
            <text x="587" y="144" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#7dd3fc">3. Save with TTL + Jitter</text>
            <text x="587" y="160" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">TTL = 300s + random(0..30s)</text>
            <text x="587" y="174" textAnchor="middle" fontSize="9" fill="#94a3b8">Prevents Cache Stampedes</text>
          </svg>
        )}

        {blockId === 'rate-limiting-backpressure' && (
          <svg
            viewBox="0 0 720 190"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            <rect x="16" y="64" width="115" height="54" rx="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="73" y="88" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f8fafc">Spike / Bots</text>
            <text x="73" y="104" textAnchor="middle" fontSize="9.5" fill="#fda4af">1,000 req/sec</text>

            <line x1="131" y1="91" x2="180" y2="91" stroke="#f59e0b" strokeWidth="2.2" strokeDasharray="5 5" className="animate-flow-fast" />

            <rect x="184" y="54" width="144" height="74" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.6" />
            <text x="256" y="78" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#fef3c7">Rate Limiter</text>
            <text x="256" y="94" textAnchor="middle" fontSize="9.5" fill="#fcd34d">Token Bucket (100/s)</text>
            <text x="256" y="112" textAnchor="middle" fontSize="9" fill="#fda4af">Excess → HTTP 429</text>

            {/* Shed load branch */}
            <line x1="256" y1="128" x2="256" y2="154" stroke="#f43f5e" strokeWidth="1.6" strokeDasharray="4 3" />
            <rect x="190" y="156" width="132" height="24" rx="6" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
            <text x="256" y="172" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fda4af">Shed Excess (429)</text>

            <line x1="328" y1="91" x2="380" y2="91" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />

            <rect x="384" y="54" width="146" height="74" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="457" y="78" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#ecfdf5">Bounded Queue</text>
            <text x="457" y="94" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">Max Depth = 5,000</text>
            <text x="457" y="112" textAnchor="middle" fontSize="9" fill="#cbd5e1">Never grows to OOM</text>

            <line x1="530" y1="91" x2="578" y2="91" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" className="animate-flow-slow" />

            <rect x="582" y="64" width="122" height="54" rx="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
            <text x="643" y="88" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#f0f9ff">Workers</text>
            <text x="643" y="104" textAnchor="middle" fontSize="9.5" fill="#7dd3fc">Steady 100/sec</text>

            {/* Backpressure signal */}
            <path d="M 643 64 C 643 20, 457 20, 457 52" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="4 4" />
            <text x="550" y="24" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fcd34d">← Backpressure (slow intake if full)</text>
          </svg>
        )}

        {blockId === 'zero-downtime-migrations' && (
          <svg
            viewBox="0 0 720 175"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {[
              { x: 16, step: '1. EXPAND', title: 'Add nullable col', sub: 'v1 code keeps working', color: '#38bdf8', bg: '#0c4a6e' },
              { x: 192, step: '2. DUAL-WRITE', title: 'Write old + new', sub: 'Backfill past rows', color: '#818cf8', bg: '#1e1b4b' },
              { x: 368, step: '3. SWITCH READS', title: 'v2 reads new col', sub: 'Zero 500s on rollout', color: '#10b981', bg: '#064e3b' },
              { x: 544, step: '4. CONTRACT', title: 'Drop old column', sub: 'Only after 0 v1 pods', color: '#f59e0b', bg: '#451a03' },
            ].map((phase, i) => (
              <g key={phase.step}>
                <rect x={phase.x} y="32" width="156" height="86" rx="10" fill={phase.bg} stroke={phase.color} strokeWidth="1.6" />
                <text x={phase.x + 78} y="54" textAnchor="middle" fontSize="10" fontWeight="800" fill={phase.color}>
                  {phase.step}
                </text>
                <text x={phase.x + 78} y="78" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f8fafc">
                  {phase.title}
                </text>
                <text x={phase.x + 78} y="98" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">
                  {phase.sub}
                </text>
                {i < 3 && (
                  <line x1={phase.x + 156} y1="75" x2={phase.x + 176} y2="75" stroke="#64748b" strokeWidth="2" />
                )}
              </g>
            ))}
            <rect x="192" y="132" width="332" height="28" rx="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="358" y="150" textAnchor="middle" fontSize="10" fontWeight="600" fill="#e2e8f0">
              Old v1 &amp; New v2 servers safely run side-by-side during rolling deploy
            </text>
          </svg>
        )}

        {blockId === 'concurrency-locking' && (
          <svg
            viewBox="0 0 720 215"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Left: Race Bug */}
            <rect x="14" y="14" width="336" height="186" rx="12" fill="#1f0a12" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="30" y="36" fontSize="11" fontWeight="800" fill="#fda4af">PITFALL: Read-Modify-Write Race</text>

            <rect x="30" y="48" width="140" height="32" rx="7" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="100" y="68" textAnchor="middle" fontSize="10.5" fill="#f8fafc">User A: SELECT → 1</text>

            <rect x="194" y="58" width="140" height="32" rx="7" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="264" y="78" textAnchor="middle" fontSize="10.5" fill="#f8fafc">User B: SELECT → 1</text>

            <rect x="30" y="102" width="140" height="32" rx="7" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="100" y="122" textAnchor="middle" fontSize="10" fill="#ffe4e6">User A: SET qty = 0 ✓</text>

            <rect x="194" y="112" width="140" height="32" rx="7" fill="#4c0519" stroke="#f43f5e" strokeWidth="1.2" />
            <text x="264" y="132" textAnchor="middle" fontSize="10" fill="#ffe4e6">User B: SET qty = 0 ✓</text>

            <text x="182" y="182" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fda4af">
              ✕ Both succeeded! Last seat sold TWICE!
            </text>

            {/* Right: Atomic Conditional Update */}
            <rect x="370" y="14" width="336" height="186" rx="12" fill="#05211a" stroke="#10b981" strokeWidth="1.2" />
            <text x="386" y="36" fontSize="11" fontWeight="800" fill="#6ee7b7">SAFE: Atomic Conditional SQL / Version Lock</text>

            <rect x="386" y="50" width="304" height="38" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.4" />
            <text x="538" y="67" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ecfdf5">
              UPDATE seats SET qty = qty - 1
            </text>
            <text x="538" y="81" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">
              WHERE id = $1 AND qty &gt;= 1 (DB row-locked!)
            </text>

            <rect x="386" y="106" width="144" height="44" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
            <text x="458" y="125" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">User A (1st)</text>
            <text x="458" y="141" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">1 row updated ✓</text>

            <rect x="546" y="106" width="144" height="44" rx="8" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.2" />
            <text x="618" y="125" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#f8fafc">User B (2nd)</text>
            <text x="618" y="141" textAnchor="middle" fontSize="9.5" fill="#fcd34d">0 rows → Sold Out</text>

            <text x="538" y="182" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6ee7b7">
              ✓ Exactly 1 winner — zero overselling
            </text>
          </svg>
        )}

        {blockId === 'realtime-push' && (
          <svg
            viewBox="0 0 720 225"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {[
              {
                y: 16,
                name: 'Short Polling',
                use: 'Async PDF/job status',
                arrow: 'Client asks every 2s: "Done yet?" ⇄',
                color: '#94a3b8',
                bg: '#1e293b',
              },
              {
                y: 68,
                name: 'SSE (HTTP Stream)',
                use: 'LLM tokens & live alerts',
                arrow: 'One-way open HTTP push: Server → → → Client',
                color: '#38bdf8',
                bg: '#0c4a6e',
              },
              {
                y: 120,
                name: 'WebSockets',
                use: 'Chat & multiplayer',
                arrow: 'Full two-way persistent socket: Client ⇄ ⇄ Server',
                color: '#10b981',
                bg: '#064e3b',
              },
              {
                y: 172,
                name: 'Webhooks',
                use: 'Stripe / GitHub callbacks',
                arrow: 'Server-to-Server HTTP POST + HMAC signature →',
                color: '#f59e0b',
                bg: '#451a03',
              },
            ].map((row) => (
              <g key={row.name}>
                <rect x="16" y={row.y} width="152" height="40" rx="8" fill={row.bg} stroke={row.color} strokeWidth="1.4" />
                <text x="92" y={row.y + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">
                  {row.name}
                </text>
                <text x="92" y={row.y + 32} textAnchor="middle" fontSize="9" fill="#cbd5e1">
                  {row.use}
                </text>

                <rect x="184" y={row.y} width="520" height="40" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="1.2" />
                <text x="444" y={row.y + 24} textAnchor="middle" fontSize="11" fontWeight="600" fill={row.color}>
                  {row.arrow}
                </text>
              </g>
            ))}
          </svg>
        )}

        {blockId === 'db-choice-scaling' && (
          <svg
            viewBox="0 0 720 195"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            <rect x="20" y="68" width="136" height="58" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.6" />
            <text x="88" y="93" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f8fafc">Backend App</text>
            <text x="88" y="110" textAnchor="middle" fontSize="9.5" fill="#a5b4fc">Read/Write Router</text>

            {/* Writes + post-write reads -> Primary */}
            <line x1="156" y1="84" x2="292" y2="52" stroke="#10b981" strokeWidth="2" />
            <text x="220" y="54" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6ee7b7">Writes + Fresh Reads</text>

            <rect x="296" y="24" width="166" height="54" rx="10" fill="#312e81" stroke="#a78bfa" strokeWidth="1.6" />
            <text x="379" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f5f3ff">Primary Postgres</text>
            <text x="379" y="64" textAnchor="middle" fontSize="9.5" fill="#c4b5fd">All ACID Writes</text>

            {/* Async replication lag */}
            <line x1="379" y1="78" x2="379" y2="120" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 5" className="animate-flow" />
            <rect x="400" y="88" width="150" height="22" rx="6" fill="#451a03" stroke="#f59e0b" strokeWidth="1" />
            <text x="475" y="103" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fcd34d">Async Lag (~10–200ms)</text>

            {/* Heavy Analytics -> Read Replica */}
            <line x1="156" y1="112" x2="292" y2="148" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" className="animate-flow" />
            <text x="218" y="150" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#7dd3fc">Dashboards &amp; Exports</text>

            <rect x="296" y="122" width="166" height="54" rx="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.6" />
            <text x="379" y="146" textAnchor="middle" fontSize="12" fontWeight="700" fill="#f0f9ff">Read Replicas (xN)</text>
            <text x="379" y="162" textAnchor="middle" fontSize="9.5" fill="#7dd3fc">Eventually consistent</text>

            {/* Note Box */}
            <rect x="500" y="122" width="204" height="54" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <text x="602" y="143" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fcd34d">Avoid Stale Reads!</text>
            <text x="602" y="160" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Route post-write reads to Primary</text>
          </svg>
        )}

        {blockId === 'safe-deployments' && (
          <svg
            viewBox="0 0 720 190"
            className="h-auto w-full min-w-[500px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Left: Canary */}
            <rect x="14" y="14" width="336" height="162" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <text x="30" y="36" fontSize="11" fontWeight="800" fill="#7dd3fc">CANARY RELEASE (Gradual % Shift)</text>

            <rect x="30" y="76" width="84" height="44" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.4" />
            <text x="72" y="102" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">Router</text>

            <line x1="114" y1="88" x2="210" y2="68" stroke="#10b981" strokeWidth="2.4" />
            <text x="160" y="68" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6ee7b7">95% traffic</text>
            <rect x="214" y="48" width="120" height="38" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.4" />
            <text x="274" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ecfdf5">v1 (Stable)</text>

            <line x1="114" y1="108" x2="210" y2="130" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" className="animate-flow" />
            <text x="160" y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#fcd34d">5% canary</text>
            <rect x="214" y="112" width="120" height="38" rx="8" fill="#451a03" stroke="#f59e0b" strokeWidth="1.4" />
            <text x="274" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fef3c7">v2 (Watch p99)</text>

            {/* Right: Blue-Green */}
            <rect x="370" y="14" width="336" height="162" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <text x="386" y="36" fontSize="11" fontWeight="800" fill="#6ee7b7">BLUE-GREEN (Instant Traffic Flip)</text>

            <rect x="386" y="76" width="84" height="44" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.4" />
            <text x="428" y="102" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">LB Switch</text>

            <line x1="470" y1="88" x2="566" y2="68" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="518" y="68" textAnchor="middle" fontSize="9.5" fill="#94a3b8">Standby (0%)</text>
            <rect x="570" y="48" width="120" height="38" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.2" />
            <text x="630" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#bae6fd">Blue (v1)</text>

            <line x1="470" y1="108" x2="566" y2="130" stroke="#10b981" strokeWidth="2.6" />
            <text x="518" y="138" textAnchor="middle" fontSize="10" fontWeight="700" fill="#6ee7b7">100% Live</text>
            <rect x="570" y="112" width="120" height="38" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
            <text x="630" y="135" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ecfdf5">Green (v2)</text>
          </svg>
        )}

        {blockId === 'multi-tenancy' && (
          <svg
            viewBox="0 0 720 185"
            className="h-auto w-full min-w-[520px]"
            role="img"
            aria-label={meta.ariaLabel}
          >
            {/* Model 1: Shared DB + RLS */}
            <rect x="16" y="16" width="218" height="154" rx="12" fill="#0f172a" stroke="#6366f1" strokeWidth="1.4" />
            <text x="125" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill="#a5b4fc">1. Shared DB + RLS</text>
            <rect x="34" y="50" width="182" height="72" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
            <text x="125" y="72" textAnchor="middle" fontSize="10" fill="#e0e7ff">Row: tenant_id = A</text>
            <text x="125" y="90" textAnchor="middle" fontSize="10" fill="#7dd3fc">Row: tenant_id = B</text>
            <text x="125" y="108" textAnchor="middle" fontSize="10" fill="#6ee7b7">Row: tenant_id = C</text>
            <text x="125" y="142" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Lowest cost · Best SaaS default</text>
            <text x="125" y="157" textAnchor="middle" fontSize="9" fill="#94a3b8">Enforce Postgres RLS</text>

            {/* Model 2: Schema per tenant */}
            <rect x="251" y="16" width="218" height="154" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
            <text x="360" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill="#7dd3fc">2. Schema-per-Tenant</text>
            <rect x="269" y="50" width="182" height="72" rx="8" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="281" y="60" width="74" height="52" rx="6" fill="#082f49" stroke="#7dd3fc" strokeWidth="1" />
            <text x="318" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#e0f2fe">org_a.*</text>
            <rect x="365" y="60" width="74" height="52" rx="6" fill="#082f49" stroke="#7dd3fc" strokeWidth="1" />
            <text x="402" y="90" textAnchor="middle" fontSize="10" fontWeight="700" fill="#e0f2fe">org_b.*</text>
            <text x="360" y="142" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Stronger logical separation</text>
            <text x="360" y="157" textAnchor="middle" fontSize="9" fill="#94a3b8">Migrations run per schema</text>

            {/* Model 3: DB per tenant */}
            <rect x="486" y="16" width="218" height="154" rx="12" fill="#0f172a" stroke="#10b981" strokeWidth="1.4" />
            <text x="595" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill="#6ee7b7">3. DB-per-Tenant (Silo)</text>
            <rect x="504" y="54" width="84" height="64" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
            <text x="546" y="90" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">DB A</text>
            <rect x="602" y="54" width="84" height="64" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
            <text x="644" y="90" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#ecfdf5">DB B</text>
            <text x="595" y="142" textAnchor="middle" fontSize="9.5" fill="#cbd5e1">Max compliance &amp; zero noisy</text>
            <text x="595" y="157" textAnchor="middle" fontSize="9" fill="#94a3b8">Higher infra cost (Enterprise)</text>
          </svg>
        )}
      </div>
      <figcaption className="mt-2 px-1 text-[11px] font-medium text-slate-400">
        Visual model: {meta.caption}
      </figcaption>
    </figure>
  );
}
