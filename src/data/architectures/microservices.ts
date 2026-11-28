import type { ArchitectureModule } from '../../types/course';

export const microservicesModule: ArchitectureModule = {
  id: 'microservices',
  order: 2,
  name: 'Microservices',
  shortName: 'Microservices',
  tagline: 'Independently deployable services, each owning its business capability and database.',
  accentColor: 'sky',
  beginnerSummary:
    'Microservices split a large backend into small, standalone network services (such as Catalog, Playback, and Billing) that each have their own codebase, deployment pipeline, and private database. Teams can scale and ship services independently — in exchange for much higher networking and operational complexity.',
  whenToUse: [
    'Large organizations (30+ engineers) where multiple autonomous teams need independent release schedules.',
    'Subsystems with wildly different scaling or hardware needs (e.g., CPU-heavy video transcoding vs. lightweight user profiles).',
    'High-availability systems where a bug in recommendations must never take down core video playback.',
    'Polyglot environments where one service genuinely benefits from Python/ML while another uses Node.js or Go.',
  ],
  whenToAvoid: [
    'Small teams (<10 devs) or early startups still figuring out product-market fit.',
    'No DevOps/platform expertise for distributed tracing, service discovery, and CI/CD.',
    'Tightly coupled workflows requiring complex multi-entity ACID database transactions.',
  ],
  scenario: {
    company: 'StreamFlix',
    domain: 'Global Video Streaming Platform',
    teamSize: '120+ engineers across 14 autonomous squads',
    trafficProfile: 'Millions of concurrent viewers with massive Friday-night playback peaks',
    story:
      'StreamFlix has dedicated teams for Video Playback, Personalized Recommendations, Billing, and Content Transcoding. When the Recommendations squad pushes an experimental ML ranking model on Friday afternoon, they cannot risk slowing down or crashing global video playback.',
    whyThisArchitecture:
      'Splitting Playback, Recommendations, and Billing into independent microservices lets Playback scale to hundreds of edge containers and survive even if the Recommendations service goes completely offline (falling back to a cached "Trending Now" list).',
  },
  diagram: {
    normalSummary:
      'Clients hit a single API Gateway, which routes requests to independent services. Crucially, each service talks ONLY to its own private database.',
    failureTitle: 'What happens when the Recommendations Service crashes?',
    failureSummary:
      'Because Playback uses strict timeouts and a graceful fallback, a crash in Recommendations stays isolated — users still watch videos seamlessly while seeing a cached "Trending" row.',
    nodes: [
      {
        id: 'client',
        label: 'TV / Mobile App',
        sublabel: 'Millions of Viewers',
        kind: 'client',
        x: 70,
        y: 170,
        beginnerSummary: 'Talks only to the API Gateway — never needs to know internal service addresses.',
        failureNote: 'Playback continues smoothly; the Home screen simply swaps personalized rows for cached Trending titles.',
      },
      {
        id: 'gateway',
        label: 'API Gateway',
        sublabel: 'Auth & Routing',
        kind: 'gateway',
        x: 230,
        y: 170,
        beginnerSummary: 'Validates JWT tokens, applies rate limits, and routes traffic to backend services.',
        failureNote: 'Applies timeouts and circuit breakers so one slow service never stalls all connections.',
      },
      {
        id: 'playback',
        label: 'Playback Svc',
        sublabel: 'Auto-scales 50x',
        kind: 'service',
        x: 440,
        y: 75,
        beginnerSummary: 'Serves video stream URLs and watch progress. Mission-critical and scaled independently.',
        failureNote: 'Unaffected! Completely isolated process and database from Recommendations.',
      },
      {
        id: 'recs',
        label: 'Recs Service',
        sublabel: 'ML Ranking',
        kind: 'service',
        x: 440,
        y: 175,
        beginnerSummary: 'Computes personalized "Because You Watched" carousels.',
        failureNote: 'CRASHED / SLOW: Gateway & callers time out quickly and return a cached fallback list.',
      },
      {
        id: 'billing',
        label: 'Billing Svc',
        sublabel: 'Subscriptions',
        kind: 'service',
        x: 440,
        y: 270,
        beginnerSummary: 'Handles plans, card renewals, and entitlement checks.',
        failureNote: 'Stays healthy and unaffected during a Recommendations outage.',
      },
      {
        id: 'db-play',
        label: 'Playback DB',
        sublabel: 'Private NoSQL',
        kind: 'database',
        x: 685,
        y: 75,
        beginnerSummary: 'Owned exclusively by Playback Service for ultra-fast resume-timestamp reads.',
        failureNote: 'Healthy — zero contention from other services.',
      },
      {
        id: 'db-recs',
        label: 'Recs Store',
        sublabel: 'Private Vector/Cache',
        kind: 'database',
        x: 685,
        y: 175,
        beginnerSummary: 'Owned exclusively by Recommendations Service.',
        failureNote: 'Unreachable while Recs Service is down, but no other service depends on it directly.',
      },
      {
        id: 'db-bill',
        label: 'Billing DB',
        sublabel: 'Private Postgres',
        kind: 'database',
        x: 685,
        y: 270,
        beginnerSummary: 'Strongly consistent SQL database owned strictly by Billing Service.',
        failureNote: 'Completely isolated from streaming traffic spikes.',
      },
    ],
    edges: [
      { from: 'client', to: 'gateway', label: 'HTTPS' },
      { from: 'gateway', to: 'playback', label: 'REST / gRPC' },
      { from: 'gateway', to: 'recs', label: 'Timeout 250ms', failsInFailureMode: true },
      { from: 'gateway', to: 'billing', label: 'REST' },
      { from: 'playback', to: 'db-play', label: 'Private' },
      { from: 'recs', to: 'db-recs', label: 'Private', failsInFailureMode: true },
      { from: 'billing', to: 'db-bill', label: 'Private' },
    ],
  },
  deepDiveConcepts: [
    {
      id: 'ms-sagas',
      badge: 'Distributed Transactions',
      title: 'The Saga Pattern & Compensating Actions',
      summary:
        'Because each microservice owns its own database, you cannot wrap Billing + Inventory + Shipping inside a single SQL transaction. Instead, teams use Sagas.',
      bulletPoints: [
        'Each service performs its own local transaction and passes control to the next step (via events or a central orchestrator).',
        'If step 3 fails (e.g., Shipping cannot fulfill), the Saga runs compensating actions in reverse — releasing inventory and issuing a refund.',
      ],
      keyTakeaway:
        'Sagas trade instant ACID rollback for eventual consistency — design explicit undo/refund steps for every multi-service workflow.',
      howToImplement: [
        {
          id: 'ms-durable-saga-state',
          label: 'Persist Saga State (Crash-Safe Rollbacks)',
          summary:
            'Never rely solely on an in-memory `try/catch` to run refunds — persist every Saga step in a `saga_runs` table (or durable workflow like Temporal/Step Functions) so crashes still recover.',
          steps: [
            'Create a `saga_runs (id, state, charge_id, updated_at)` table before calling Step 1.',
            'Update `state` after each remote call (`STARTED` → `CHARGED` → `COMPLETED` or `COMPENSATING` → `REFUNDED`).',
            'Run a lightweight recovery job every minute that finds sagas stuck in `CHARGED` or `COMPENSATING` for >2 minutes and triggers the idempotent refund automatically.',
          ],
          code: {
            filename: 'checkout-orchestrator/src/recoverStuckSagas.ts',
            snippet: `// Recovery worker catches crashes that happened right after charging
const stuck = await db.query(
  \`SELECT id, charge_id FROM saga_runs
   WHERE state IN ('CHARGED', 'COMPENSATING')
     AND updated_at < NOW() - INTERVAL '2 minutes' LIMIT 20\`
);
for (const saga of stuck) {
  await refundQueue.enqueue({ chargeId: saga.charge_id, idempotencyKey: \`\${saga.id}-refund\` });
}`,
          },
        },
      ],
    },
    {
      id: 'ms-cross-queries',
      badge: 'Querying Across Services',
      title: 'How to Join Data Across Separate Databases (BFF & Read Models)',
      summary:
        'Without cross-service SQL JOINs, beginners often wonder how to build screens that combine data from 3 services (like Order History + User Names + Video Titles).',
      bulletPoints: [
        'BFF (Backend-for-Frontend): A thin aggregation service tailored to your web/mobile UI that fetches from multiple services in parallel using batched endpoints.',
        'Local Read Model (CQRS): Subscribe to domain events and maintain a denormalized read table optimized for fast search/filtering.',
      ],
      keyTakeaway:
        'Never replace a SQL JOIN with a `for` loop of individual HTTP calls (N+1 network calls) — use batch APIs, BFF composition, or event-synced read models.',
    },
    {
      id: 'ms-circuit-breaker',
      badge: 'Resilience Patterns',
      title: 'Circuit Breakers & Bulkheads (Stopping Cascading Failures)',
      summary:
        'When a downstream service hangs, timeouts alone still waste threads on every incoming request. Circuit Breakers and Bulkheads protect your healthy services from sinking with a sick neighbor.',
      bulletPoints: [
        'Circuit Breaker states: Closed (normal traffic) → Open (after repeated failures, fail fast immediately with a fallback without hitting the dead service) → Half-Open (send a few probe requests to test recovery).',
        'Bulkhead Pattern: Like watertight ship compartments, give each downstream dependency its own capped connection/concurrency pool so a slow Recommendations service never exhausts Playback’s sockets.',
      ],
      keyTakeaway:
        'Failing fast with a cached fallback beats waiting 5 seconds for a guaranteed timeout — and gives struggling downstream services breathing room to recover.',
      howToImplement: [
        {
          id: 'ms-cb-opossum',
          label: 'Circuit Breaker in Node.js',
          summary:
            'Wrap flaky downstream calls in a battle-tested library like `opossum` (or `cockatiel`) with a strict timeout and cached fallback.',
          steps: [
            'Set a per-call timeout (e.g., `250ms`), a failure threshold (e.g., 50% errors), and a cooldown `resetTimeout` (e.g., `15_000ms`).',
            'Register a `.fallback()` that returns a safe cached response (`TRENDING_FALLBACK`) whenever the breaker is OPEN.',
            'Emit a metric/log on `open` and `close` events so your team gets alerted when a dependency degrades.',
          ],
          code: {
            filename: 'home-bff/src/clients/recsBreaker.ts',
            snippet: `import CircuitBreaker from 'opossum';

const recsBreaker = new CircuitBreaker(
  (userId: string) => fetchJsonWithTimeout(\`http://recs-svc/users/\${userId}/picks\`, 250),
  { timeout: 300, errorThresholdPercentage: 50, resetTimeout: 15_000 }
);
recsBreaker.fallback(() => TRENDING_FALLBACK);
recsBreaker.on('open', () => logger.warn('recs-svc breaker OPEN — serving fallback'));`,
          },
        },
        {
          id: 'ms-bulkhead-pool',
          label: 'Bulkhead (Capped Concurrency Pool)',
          summary:
            'Give each downstream dependency its own connection/concurrency cap so one slow service cannot steal all sockets from healthy services.',
          steps: [
            'Create separate HTTP connection pools (e.g., `undici.Pool` with `connections: 20`) or concurrency limiters (`p-limit(20)`) per downstream service.',
            'If `recs-svc` saturates its 20-request bulkhead, immediately reject/fallback the 21st call while `playback-svc` keeps its own dedicated 100-connection pool untouched.',
          ],
          code: {
            filename: 'home-bff/src/clients/bulkheads.ts',
            snippet: `import { Pool } from 'undici';

export const playbackPool = new Pool('http://playback-svc', { connections: 100 });
export const recsPool = new Pool('http://recs-svc', { connections: 20 }); // isolated cap!`,
          },
        },
      ],
    },
    {
      id: 'ms-api-versioning',
      badge: 'Independent Deploys',
      title: 'API Versioning & Backward-Compatible Contracts',
      summary:
        'True microservices must be deployable in any order without coordinating a company-wide release window. That only works when internal APIs evolve without breaking existing callers.',
      bulletPoints: [
        'Make JSON changes additive-only: add new optional fields instead of renaming or deleting live fields.',
        'Follow the Tolerant Reader pattern (ignore unknown fields you don’t need) and pair OpenAPI schemas with consumer-driven contract tests in CI.',
      ],
      keyTakeaway:
        'Treat every internal service API like a public API — breaking changes require a versioned rollout and a deprecation window, never a surprise deploy.',
    },
    {
      id: 'ms-protocols',
      badge: 'Communication Protocols',
      title: 'Choosing Protocols: REST vs. gRPC vs. GraphQL',
      summary:
        'Microservices don’t all have to speak plain REST/JSON — pick the protocol that matches who is calling whom and how strict the latency budget is.',
      bulletPoints: [
        'REST / JSON: Best default for public APIs, browser clients, and simple internal services (universal tooling & HTTP caching).',
        'gRPC / Protobuf: Ideal for high-throughput internal service-to-service hops — binary serialization, strict generated types, streaming, and built-in deadline propagation.',
        'GraphQL: Useful as a flexible BFF layer aggregating multiple microservices for web/mobile clients, but watch out for N+1 resolver storms, missing HTTP GET caching, and unbounded query depth.',
      ],
      keyTakeaway:
        'Use REST or a GraphQL BFF at the public edge, and reach for gRPC internally when strict typed contracts and low-latency binary calls matter.',
      howToImplement: [
        {
          id: 'ms-gql-dataloader',
          label: 'Fix GraphQL N+1 (DataLoader)',
          summary:
            'Create a fresh `DataLoader` per incoming GraphQL request to automatically batch dozens of individual field resolver lookups into one single batch call.',
          steps: [
            'Instantiate `new DataLoader(batchFn)` inside the GraphQL `context` factory (per request — never share one DataLoader globally or you will leak data across users!).',
            'Inside resolvers (e.g., `Invoice.user`), call `ctx.userLoader.load(invoice.userId)`.',
            'DataLoader waits one event-loop tick, deduplicates IDs, and sends a single `POST /users/batch` request.',
          ],
          code: {
            filename: 'graphql-bff/src/context.ts',
            snippet: `import DataLoader from 'dataloader';

export function createContext() {
  return {
    userLoader: new DataLoader(async (ids: readonly string[]) => {
      const users = await postJsonWithTimeout('http://users-svc/users/batch', { ids }, 300);
      const byId = new Map(users.map((u) => [u.id, u]));
      return ids.map((id) => byId.get(id) ?? null); // MUST preserve input order!
    }),
  };
}`,
          },
          watchOut:
            'Always return results in the EXACT same order and length as the input `ids` array, or DataLoader will attach User A’s data to User B’s invoice!',
        },
        {
          id: 'ms-gql-depth-caching',
          label: 'Fix GraphQL Depth DoS & GET Caching',
          summary:
            'Prevent malicious nested queries with depth/complexity caps, and unlock CDN caching with Persisted Queries over HTTP GET.',
          steps: [
            'Add a query depth limit (e.g., `graphql-depth-limit` with max depth `5`) and cost/complexity budget so attackers cannot send `{ user { friends { friends { ... } } } }`.',
            'Enable **Persisted Queries** (clients send a short SHA-256 query hash via HTTP `GET /graphql?extensions=...` instead of a giant `POST` body) so CDNs can cache public read responses.',
            'In production, optionally enforce a strict persisted-query allowlist so clients can only run pre-approved queries.',
          ],
          code: {
            filename: 'graphql-bff/src/server.ts',
            snippet: `import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)], // blocks deeply nested DoS queries
  persistedQueries: { ttl: 900 },   // enables cacheable GET requests by query hash
});`,
          },
        },
      ],
    },
    {
      id: 'ms-service-discovery-mesh',
      badge: 'Infrastructure Reality',
      title: 'Load Balancers, Service Discovery & Service Meshes',
      summary:
        'In a dynamic container cluster where IP addresses change every deploy, services need reliable routing, health checks, and encrypted service-to-service networking.',
      bulletPoints: [
        'L4 vs. L7 Load Balancing: L4 routes raw TCP packets fast; L7 inspects HTTP paths, headers, and JWTs to route `/billing/*` vs `/playback/*`.',
        'Service Discovery: Platforms like Kubernetes DNS let callers target stable names (`http://billing-svc`) that resolve only to pods passing Readiness health checks.',
        'Service Mesh (Envoy / Istio): Injects sidecar proxies for automatic mTLS, tracing, and retries — powerful at 40+ services, but unnecessary operational tax for small clusters.',
      ],
      keyTakeaway:
        'Start with standard platform DNS service discovery and an L7 API Gateway — adopt a Service Mesh only when managing dozens of polyglot services justifies the complexity.',
    },
    {
      id: 'ms-availability-boundaries',
      badge: 'Availability & Boundaries',
      title: 'Compounding Availability Math & Avoiding Nano-Services',
      summary:
        'Splitting services too finely (one service per database table) creates long synchronous call chains that actually make uptime WORSE than a monolith.',
      bulletPoints: [
        'Compounding Math: If an endpoint synchronously calls 5 microservices that are each 99.9% available, combined availability drops to 99.9%^5 ≈ 99.5% (~3.6 hours downtime/month instead of 43 minutes)!',
        'Conway’s Law & Bounded Contexts: Align services with autonomous teams and complete business capabilities (Checkout, Playback), never tiny entity-CRUD wrappers (`users-svc` + `addresses-svc`).',
      ],
      keyTakeaway:
        'Keep synchronous call chains shallow (1–2 hops), fall back gracefully on non-critical calls, and size services around real team boundaries.',
    },
  ],
  codeComparisons: [
    {
      id: 'ms-shared-db',
      title: 'Shared Database Anti-Pattern vs. Database-per-Service',
      subtitle: 'Microservices sharing one database lose their core superpower: independent deploys.',
      context:
        'StreamFlix’s Playback Service needs to verify whether a viewer’s subscription tier allows 4K UHD streaming.',
      problemTitle: 'Pitfall: Playback querying Billing’s database directly',
      problemFile: 'playback-service/src/checkAccess.ts',
      problemCode: `import { sharedPostgres } from '@streamflix/shared-db';

export async function canStream4K(userId: string): Promise<boolean> {
  // Reaches straight into Billing's private tables over a shared DB!
  const row = await sharedPostgres.queryOne(
    \`SELECT p.allows_4k, s.status
     FROM billing.subscriptions s
     JOIN billing.plans p ON p.id = s.plan_id
     WHERE s.user_id = $1\`,
    [userId]
  );

  return row?.status === 'active' && Boolean(row?.allows_4k);
}`,
      refactoredTitle: 'Refactored: Local read-cache synced via Billing API / events',
      refactoredFile: 'playback-service/src/checkAccess.ts',
      refactoredCode: `import { entitlementCache } from './db/entitlementCache';
import { billingClient } from './clients/billingClient';

export async function canStream4K(userId: string): Promise<boolean> {
  // 1. Fast check against Playback's OWN local entitlement cache
  const cached = await entitlementCache.get(userId);
  if (cached) return cached.maxQuality === '4K';

  // 2. Cache miss: call Billing's versioned HTTP API (not its DB)
  const entitlement = await billingClient.getEntitlement(userId, {
    timeoutMs: 400,
  });

  await entitlementCache.set(userId, entitlement, { ttlSeconds: 300 });
  return entitlement.maxQuality === '4K';
}`,
      annotations: [
        {
          id: 'ms-1-shared-db',
          label: '1. Shared Database Coupling',
          problemLines: [1, 11],
          refactoredLines: [1, 7],
          severity: 'high',
          problemExplanation:
            'Playback and Billing share one database connection and schema. If Billing migrates `plans` or gets slammed by renewal jobs, Playback crashes at Friday peak — a classic "distributed monolith".',
          refactoredExplanation:
            'Playback owns its own lightweight entitlement cache (updated via Billing events or short TTL). Billing can change its internal database completely without affecting Playback.',
        },
        {
          id: 'ms-1-api-contract',
          label: '2. Versioned API Boundary',
          problemLines: [13, 13],
          refactoredLines: [9, 15],
          severity: 'medium',
          problemExplanation:
            'Playback manually inspects raw billing columns (`status === active` AND `allows_4k`), leaking Billing business logic across services.',
          refactoredExplanation:
            'On a cache miss, Playback calls Billing’s stable HTTP contract (`getEntitlement`) with a strict timeout and caches the decision locally.',
        },
      ],
    },
    {
      id: 'ms-cascading-failure',
      title: 'Cascading Sync Failures vs. Timeouts & Graceful Fallbacks',
      subtitle: 'In distributed systems, every network call WILL eventually hang or fail.',
      context:
        'Building the StreamFlix home screen aggregates Continue Watching (Playback) and Personalized Picks (Recommendations).',
      problemTitle: 'Pitfall: Unbounded awaits where one slow service breaks the whole page',
      problemFile: 'home-bff/src/getHomeFeed.ts',
      problemCode: `export async function getHomeFeed(userId: string) {
  // Sequential awaits with NO timeouts!
  const continueWatching = await fetch(
    \`http://playback-svc/users/\${userId}/watching\`
  ).then((r) => r.json());

  // If Recs hangs for 30s or returns 500, the whole Home page fails
  const recommended = await fetch(
    \`http://recs-svc/users/\${userId}/picks\`
  ).then((r) => r.json());

  return { continueWatching, recommended };
}`,
      refactoredTitle: 'Refactored: Parallel calls with AbortSignal timeouts & fallback',
      refactoredFile: 'home-bff/src/getHomeFeed.ts',
      refactoredCode: `import { fetchJsonWithTimeout } from './http';
import { TRENDING_FALLBACK } from './fallbacks';

export async function getHomeFeed(userId: string) {
  // Run independent calls in parallel with strict per-call budgets
  const [watchingResult, recsResult] = await Promise.allSettled([
    fetchJsonWithTimeout(\`http://playback-svc/users/\${userId}/watching\`, 300),
    fetchJsonWithTimeout(\`http://recs-svc/users/\${userId}/picks\`, 250),
  ]);

  const continueWatching =
    watchingResult.status === 'fulfilled' ? watchingResult.value : [];

  // Degrade gracefully instead of showing an error screen!
  const recommended =
    recsResult.status === 'fulfilled' ? recsResult.value : TRENDING_FALLBACK;

  return { continueWatching, recommended, degraded: recsResult.status === 'rejected' };
}`,
      annotations: [
        {
          id: 'ms-2-timeouts',
          label: '1. Missing Timeouts & Sequential Waits',
          problemLines: [2, 10],
          refactoredLines: [5, 9],
          severity: 'high',
          problemExplanation:
            'Default `fetch()` calls can hang for minutes when a downstream service is overloaded. Waiting sequentially also doubles latency and ties up server sockets until the gateway collapses.',
          refactoredExplanation:
            '`Promise.allSettled` runs both requests in parallel with strict millisecond timeouts (300ms / 250ms), keeping p95 latency fast and predictable.',
        },
        {
          id: 'ms-2-fallback',
          label: '2. No Fault Isolation / Fallback',
          problemLines: [7, 12],
          refactoredLines: [14, 18],
          severity: 'high',
          problemExplanation:
            'Recommendations is a nice-to-have feature, yet an unhandled error there throws a 500 for the entire Home page — blocking users from hitting Play.',
          refactoredExplanation:
            'If Recommendations fails or times out, the feed gracefully substitutes `TRENDING_FALLBACK` and flags `degraded: true` for monitoring.',
        },
      ],
      howToImplement: [
        {
          id: 'ms-fetch-timeout-helper',
          label: 'Build fetchJsonWithTimeout()',
          summary:
            'Use Node.js’s built-in `AbortSignal.timeout(ms)` so hung sockets abort cleanly without manual `setTimeout` leaks.',
          steps: [
            'Pass `signal: AbortSignal.timeout(timeoutMs)` directly into `fetch()`.',
            'Always check `resp.ok` — `fetch()` does not reject on HTTP 500/503 responses by default!',
            'Forward `x-request-id` so the downstream service logs link back to this BFF request.',
          ],
          code: {
            filename: 'home-bff/src/http.ts',
            snippet: `export async function fetchJsonWithTimeout<T>(url: string, timeoutMs: number): Promise<T> {
  const resp = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!resp.ok) {
    throw new Error(\`Upstream \${url} failed with HTTP \${resp.status}\`);
  }
  return resp.json() as Promise<T>;
}`,
          },
        },
      ],
    },
    {
      id: 'ms-n-plus-one-bff',
      title: 'N+1 Network Calls vs. Batched BFF Composition',
      subtitle: 'Replacing a SQL JOIN with a loop of HTTP calls destroys latency and floods downstream services.',
      context:
        'StreamFlix’s Support BFF (Backend-for-Frontend) lists the 50 most recent billing invoices along with each subscriber’s display name from the Users service.',
      problemTitle: 'Pitfall: Fetching user details one-by-one inside a loop (50 HTTP hops!)',
      problemFile: 'support-bff/src/getRecentInvoices.ts',
      problemCode: `export async function getRecentInvoicesWithUsers() {
  const invoices = await fetch('http://billing-svc/invoices?limit=50').then((r) => r.json());

  // N+1 Network Call Anti-Pattern: 50 separate HTTP round-trips!
  const enriched = [];
  for (const inv of invoices) {
    const user = await fetch(\`http://users-svc/users/\${inv.userId}\`).then((r) => r.json());
    enriched.push({ ...inv, userName: user.name });
  }

  return enriched;
}`,
      refactoredTitle: 'Refactored: Single batched lookup inside the BFF with timeouts',
      refactoredFile: 'support-bff/src/getRecentInvoices.ts',
      refactoredCode: `export async function getRecentInvoicesWithUsers() {
  const invoices = await fetchJsonWithTimeout('http://billing-svc/invoices?limit=50', 300);
  const uniqueUserIds = [...new Set(invoices.map((i) => i.userId))];

  // 1 batched HTTP call instead of 50 sequential round-trips!
  const users = await postJsonWithTimeout('http://users-svc/users/batch', {
    ids: uniqueUserIds,
  }, 300);
  const byId = new Map(users.map((u) => [u.id, u]));

  return invoices.map((i) => ({ ...i, userName: byId.get(i.userId)?.name ?? 'Unknown' }));
}`,
      annotations: [
        {
          id: 'ms-3-n-plus-one',
          label: '1. N+1 Network Storm',
          problemLines: [4, 9],
          refactoredLines: [5, 9],
          severity: 'high',
          problemExplanation:
            'At 20ms per internal HTTP hop, 50 sequential calls add 1,000ms+ of latency and multiply traffic on `users-svc` by 50x for a single page load.',
          refactoredExplanation:
            'Sending one deduplicated `POST /users/batch` request resolves all 50 user names in a single 20ms round-trip and joins them in memory using a `Map`.',
        },
        {
          id: 'ms-3-dedupe',
          label: '2. Deduplicate & Bound Latency',
          problemLines: [1, 2],
          refactoredLines: [2, 3],
          severity: 'medium',
          problemExplanation:
            'If one customer appears on 10 of those 50 invoices, the naive loop fetches the exact same user profile 10 times with no timeout protection.',
          refactoredExplanation:
            'Deduplicating IDs with `Set` shrinks payload size, and applying a 300ms timeout protects the BFF from hanging.',
        },
      ],
    },
    {
      id: 'ms-http-idempotency-saga',
      title: 'Unsafe Retries & Stranded Charges vs. Idempotency Keys & Saga Undo',
      subtitle: 'Mutating multi-service HTTP flows need client Idempotency-Keys AND compensating undo steps.',
      context:
        'A StreamFlix viewer purchases a live Pay-Per-View bundle on flaky train Wi-Fi: the checkout orchestrator charges Billing, then unlocks the stream in Playback.',
      problemTitle: 'Pitfall: No Idempotency-Key and no compensating refund if Step 2 fails',
      problemFile: 'checkout-orchestrator/src/purchaseBundle.ts',
      problemCode: `export async function purchaseBundle(userId: string, bundleId: string) {
  // No Idempotency-Key: flaky Wi-Fi retry charges the card twice!
  const payment = await fetchJsonWithTimeout('http://billing-svc/charges', 500, {
    method: 'POST',
    body: { userId, bundleId },
  });

  // If entitlement activation fails below, the user's money is stranded!
  await fetchJsonWithTimeout('http://playback-svc/entitlements', 500, {
    method: 'POST',
    body: { userId, bundleId },
  });
  return { chargeId: payment.id };
}`,
      refactoredTitle: 'Refactored: Idempotency-Key + Durable Saga step & undo',
      refactoredFile: 'checkout-orchestrator/src/purchaseBundle.ts',
      refactoredCode: `export async function purchaseBundle(userId: string, bundleId: string, idemKey: string) {
  // 1. Forward client Idempotency-Key so retries never double-charge
  const payment = await postWithRetry('http://billing-svc/charges', {
    headers: { 'Idempotency-Key': idemKey },
    body: { userId, bundleId },
    timeoutMs: 500,
    backoffWithJitter: true,
  });
  // Persist saga step so a crash mid-flight still triggers recovery
  await sagaStore.recordStep(idemKey, 'CHARGED', { chargeId: payment.id });

  try {
    await postWithRetry('http://playback-svc/entitlements', {
      headers: { 'Idempotency-Key': \`\${idemKey}-entitle\` },
      body: { userId, bundleId },
      timeoutMs: 500,
    });
    await sagaStore.recordStep(idemKey, 'COMPLETED');
    return { chargeId: payment.id, status: 'completed' };
  } catch (err) {
    // 2. Durable Saga undo: enqueue idempotent refund (recovery worker catches crashes too)
    await sagaStore.enqueueCompensation(idemKey, { chargeId: payment.id });
    throw err;
  }
}`,
      annotations: [
        {
          id: 'ms-4-idempotency',
          label: '1. Duplicate HTTP Charge on Retry',
          problemLines: [2, 6],
          refactoredLines: [2, 8],
          severity: 'high',
          problemExplanation:
            'If the mobile app times out and retries `POST /purchase`, Billing sees a fresh `POST /charges` request and bills the viewer twice.',
          refactoredExplanation:
            'Passing a client-generated `Idempotency-Key` header lets Billing cache and replay the original charge result on retries, paired with jittered backoff to avoid retry storms.',
        },
        {
          id: 'ms-4-saga-undo',
          label: '2. Missing Durable Saga Compensation',
          problemLines: [8, 13],
          refactoredLines: [9, 24],
          severity: 'high',
          problemExplanation:
            'Because Billing and Playback own separate databases, there is no shared SQL rollback. If `playback-svc` returns 503 — or this orchestrator crashes mid-flight — the viewer paid for a match they cannot watch!',
          refactoredExplanation:
            'Persisting the `CHARGED` step in `sagaStore` and enqueueing a durable, idempotent refund guarantees Step 1 is cleanly compensated even if this process crashes before `catch` runs.',
        },
      ],
      howToImplement: [
        {
          id: 'ms-post-with-retry',
          label: 'Build postWithRetry() Safely',
          summary:
            'Retry ONLY transient failures (network errors, 429, 502/503/504) with exponential backoff + full jitter — never retry 4xx validation or card-declined errors.',
          steps: [
            'Require an `Idempotency-Key` before retrying any `POST` mutation.',
            'Stop immediately on `400`, `401`, `403`, `404`, or `422` (retrying permanent client errors wastes capacity and adds latency).',
            'Compute `delay = Math.random() * Math.min(maxMs, baseMs * 2 ** attempt)` so failing callers spread out instead of hammering together.',
          ],
          code: {
            filename: 'checkout-orchestrator/src/httpRetry.ts',
            snippet: `export async function postWithRetry(url: string, opts: { headers: Record<string, string>; body: unknown; timeoutMs: number }) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const resp = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json', ...opts.headers },
      body: JSON.stringify(opts.body), signal: AbortSignal.timeout(opts.timeoutMs),
    });
    if (resp.ok) return resp.json();
    if (resp.status < 500 && resp.status !== 429) throw new Error(\`Permanent \${resp.status}\`);
    await new Promise((r) => setTimeout(r, Math.random() * Math.min(2000, 100 * 2 ** attempt)));
  }
  throw new Error('Exhausted retries');
}`,
          },
        },
      ],
    },
  ],
  bestPractices: [
    {
      title: 'Database per Service (No Shared Schemas)',
      detail:
        'Each service owns its data store. Share data across boundaries via APIs or asynchronous events, never via cross-service SQL queries.',
    },
    {
      title: 'Set Timeouts, Retries with Backoff, and Fallbacks Everywhere',
      detail:
        'Treat every internal HTTP/gRPC call as untrusted network traffic that can hang, drop packets, or return 503.',
    },
    {
      title: 'Use Batch APIs, BFFs, or Read Models for Cross-Service Views',
      detail:
        'Aggregate data across services with batched lookups or event-synced read projections instead of chatty per-item loops.',
    },
    {
      title: 'Add Distributed Tracing (Correlation IDs) from Day One',
      detail:
        'Pass a `x-request-id` / OpenTelemetry trace ID through every hop so you can debug a request spanning 5 services.',
    },
    {
      title: 'Treat Internal APIs Like Public Contracts',
      detail:
        'Validate payloads at service boundaries, keep JSON schema evolution additive-only, and run automated contract tests so teams can deploy safely in any order.',
    },
    {
      title: 'Enforce Client Idempotency Keys on Mutating HTTP Endpoints',
      detail:
        'Accept an `Idempotency-Key` header on `POST` writes (charges, orders, bookings) and design Saga compensating actions to be idempotent too so retries never double-bill or double-refund.',
    },
  ],
  pitfalls: [
    {
      title: 'The Distributed Monolith',
      symptom: 'Shipping one small feature requires coordinating deploys across 4 services in a specific order.',
      fix: 'Use backward-compatible API versioning, eliminate shared databases, and merge overly chatty services back together.',
    },
    {
      title: 'Entity-Driven Nano-Services',
      symptom: 'Splitting by database table (`users-svc`, `addresses-svc`, `phones-svc`) creates 6-hop synchronous call chains and terrible compounding availability.',
      fix: 'Group tightly related data around business capabilities (Bounded Contexts) and Conway’s Law team ownership.',
    },
    {
      title: 'N+1 Network Calls',
      symptom: 'A dashboard endpoint takes 3 seconds because it fetches 40 records and loops over another service’s `GET /:id` endpoint.',
      fix: 'Expose batch endpoints (`POST /batch`), use a BFF aggregator, or maintain a local event-synced read model.',
    },
    {
      title: 'Shared "Common" Business-Logic NPM Packages',
      symptom: 'Publishing an internal `@company/core-logic` package used by 10 services forces all 10 services to bump versions, rebuild, and redeploy together on every rule tweak.',
      fix: 'Limit shared libraries to tiny, stable infrastructure helpers (logging, auth parsing) and duplicate small domain helpers rather than coupling deploys.',
    },
    {
      title: 'Microservice Envy at a 3-Person Startup',
      symptom: 'More time spent debugging Docker, CORS, Kubernetes, and broken local dev environments than building product features.',
      fix: 'Start with a Modular Monolith and extract individual services only when team size or scaling profiles demand it.',
    },
    {
      title: 'Retry Storms',
      symptom: 'A struggling service gets 10x more traffic because upstream services immediately retry failed calls in tight loops.',
      fix: 'Use exponential backoff with jitter and wrap failing dependencies in a Circuit Breaker.',
      howToImplement: {
        id: 'ms-retry-jitter-formula',
        label: 'Exponential Backoff + Full Jitter',
        summary:
          'Randomize retry delays so 500 failed requests do not synchronize and slam the recovering service on the exact same millisecond.',
        steps: [
          'Cap retries at 2–3 attempts (never retry indefinitely on synchronous HTTP requests).',
          'Compute `Math.random() * Math.min(maxDelayMs, baseMs * 2 ** attempt)` for full jitter.',
          'Only retry `502`/`503`/`504`, `429`, and network timeouts — never retry `400`/`401`/`403`/`404`.',
        ],
        code: {
          filename: 'shared/backoff.ts',
          snippet: `export function fullJitterDelayMs(attempt: number, baseMs = 100, maxMs = 2000) {
  const cap = Math.min(maxMs, baseMs * 2 ** attempt);
  return Math.floor(Math.random() * cap);
}`,
        },
      },
    },
    {
      title: 'Missing Deadline Propagation',
      symptom: 'Service A times out after 500ms and returns an error to the user, yet Service B and Service C keep running an expensive 10-second query nobody will ever read.',
      fix: 'Pass the remaining deadline budget (`x-deadline-ms` or gRPC deadline) down every hop and cancel work immediately once the budget expires.',
      howToImplement: {
        id: 'ms-deadline-prop',
        label: 'Propagate Remaining Timeout Budget',
        summary:
          'Pass remaining milliseconds (not wall-clock timestamps, which can suffer clock skew) down each hop and cancel downstream HTTP + SQL work once expired.',
        steps: [
          'At the edge/BFF, start with a total budget (e.g., `500ms`) and track `startedAt = performance.now()`.',
          'Before calling Service C, compute `remaining = budgetMs - (performance.now() - startedAt)`; if `remaining <= 20`, abort immediately without making the call.',
          'Forward `x-timeout-ms: remaining` to `AbortSignal.timeout(remaining)` and set Postgres `SET LOCAL statement_timeout` so DB work stops too.',
        ],
        code: {
          filename: 'service-b/src/callDownstream.ts',
          snippet: `export async function callServiceC(reqBudgetMs: number, startedAt: number) {
  const remaining = Math.floor(reqBudgetMs - (performance.now() - startedAt));
  if (remaining <= 20) throw new Error('Deadline expired before calling Service C');

  return fetch('http://service-c/query', {
    headers: { 'x-timeout-ms': String(remaining) },
    signal: AbortSignal.timeout(remaining),
  });
}`,
        },
      },
    },
  ],
  miniChecks: [
    {
      id: 'ms-check-1',
      prompt:
        'A fast-growing media company has 60 engineers split into Video Encoding (heavy GPU workloads), Search, and User Billing teams who want to deploy independently.',
      isGoodFit: true,
      explanation:
        'Strong fit! Independent teams + wildly different hardware/scaling profiles (GPU encoding vs. standard APIs) are textbook reasons to adopt Microservices.',
    },
    {
      id: 'ms-check-2',
      prompt:
        'Two college friends are launching a weekend event-ticketing prototype and have never used Docker or Kubernetes before.',
      isGoodFit: false,
      betterAlternative: 'modular-monolith',
      explanation:
        'Avoid Microservices here! Managing multiple repos, network failures, and distributed deployments will stall a 2-person team. A Modular Monolith (or Serverless for spiky endpoints) is far faster.',
    },
  ],
  practiceProjects: [
    {
      id: 'proj-ms-bookstore',
      architectureId: 'microservices',
      title: 'Mini Bookstore Backend (2 Services + Gateway)',
      difficulty: 'starter',
      estimatedTime: '3–5 hours',
      summary:
        'Build two tiny independent TypeScript services (`catalog-service` and `orders-service`), each with its own SQLite database, behind a lightweight Node API Gateway.',
      suggestedStack: ['Node.js + TypeScript', 'Fastify / Express', '2 separate SQLite DBs', 'Docker Compose (optional)'],
      folderStructure: `mini-bookstore/
├── gateway/             (port 3000: routes + timeouts)
├── catalog-service/     (port 3001 + catalog.db)
├── orders-service/      (port 3002 + orders.db)
└── docker-compose.yml`,
      milestones: [
        {
          id: 'ms-p1-m1',
          title: 'Build Catalog Service with its own database',
          detail: 'Expose `GET /books` and `GET /books/:id` backed exclusively by `catalog.db`.',
        },
        {
          id: 'ms-p1-m2',
          title: 'Build Orders Service calling Catalog over HTTP',
          detail: 'When creating an order, verify book price via `catalog-service` using an `AbortSignal.timeout(500)` call.',
        },
        {
          id: 'ms-p1-m3',
          title: 'Test fault isolation by killing Catalog Service',
          detail: 'Confirm existing orders can still be listed from `orders-service` while new orders return a clean 503 fallback.',
        },
        {
          id: 'ms-p1-m4',
          title: 'Break it on purpose: Retry a POST /orders with an Idempotency-Key',
          detail: 'Send the same `POST /orders` request twice with the same `Idempotency-Key` header and verify only one order is created while both requests share an `x-request-id` trace log.',
        },
      ],
      architectureRules: [
        '`orders-service` must NEVER open `catalog.db` — communicate strictly over HTTP.',
        'Propagate an `x-request-id` header from the Gateway to both services and log it on every request.',
      ],
      starterHints: [
        {
          id: 'ms-p1-hint-idem',
          label: 'Server-Side Idempotency Table (SQLite)',
          summary:
            'Store `idempotency_key TEXT UNIQUE` on your `orders` table (or a dedicated table) so duplicate `POST /orders` calls return the original order cleanly.',
          steps: [
            'Read `const key = req.headers["idempotency-key"]` and reject missing keys on `POST /orders` with `400`.',
            'Use `INSERT INTO orders (id, idempotency_key, ...) VALUES (...) ON CONFLICT(idempotency_key) DO NOTHING` and fetch the existing row if `changes === 0`.',
          ],
        },
        {
          id: 'ms-p1-hint-trace',
          label: 'Forwarding x-request-id',
          summary:
            'In the Gateway, generate `req.headers["x-request-id"] ?? crypto.randomUUID()` and pass it inside `fetch(..., { headers: { "x-request-id": id } })`.',
          steps: [
            'Echo `x-request-id` on the HTTP response header so curl/browser logs show it too.',
            'Include `{ service, requestId, status }` in every `console.log(JSON.stringify(...))` line.',
          ],
        },
      ],
    },
    {
      id: 'proj-ms-url-shortener',
      architectureId: 'microservices',
      title: 'URL Shortener + Independent Click Analytics Split',
      difficulty: 'stretch',
      estimatedTime: '1 weekend',
      summary:
        'Separate ultra-fast link redirects (`redirect-service`) from heavier click reporting (`analytics-service`) so analytics downtime never breaks links.',
      suggestedStack: ['Node.js + TypeScript', 'Redis + SQLite/Postgres', 'Docker Compose', 'OpenTelemetry or Request IDs'],
      folderStructure: `shortlink-microservices/
├── api-gateway/         (rate limiting + routing)
├── redirect-service/    (fast slug lookup + redirect)
├── analytics-service/   (click aggregation + stats API)
└── docker-compose.yml`,
      milestones: [
        {
          id: 'ms-p2-m1',
          title: 'Implement Redirect Service for low-latency lookups',
          detail: 'Support creating short URLs and redirecting `GET /:slug` in under 20ms using its own store.',
        },
        {
          id: 'ms-p2-m2',
          title: 'Build a separate Analytics Service with its own DB',
          detail: 'Accept click events (`POST /clicks`) and expose `GET /stats/:slug` showing counts by referrer/day.',
        },
        {
          id: 'ms-p2-m3',
          title: 'Make click tracking non-blocking with graceful failure',
          detail: 'If `analytics-service` is stopped or slow, `redirect-service` must still redirect the user instantly.',
        },
        {
          id: 'ms-p2-m4',
          title: 'Break it on purpose: Inject a 2s Analytics lag & measure p95 redirect latency',
          detail: 'Add a 2,000ms artificial delay inside `analytics-service` and prove `redirect-service` stays under 25ms p95 with circuit-breaker/timeout logs.',
        },
      ],
      architectureRules: [
        'Run each service in its own process/container with independent `package.json` dependencies.',
        'Simulate a 2-second artificial delay in `analytics-service` and prove `redirect-service` latency stays unaffected.',
      ],
      starterHints: [
        {
          id: 'ms-p2-hint-cb',
          label: 'Non-Blocking Click Tracking + Mini Circuit Breaker',
          summary:
            'Send the `302` redirect immediately and track clicks with a short 150ms timeout + failure counter that pauses outbound calls for 15 seconds after 3 timeouts.',
          steps: [
            'Send `res.redirect(302, targetUrl)` BEFORE awaiting analytics (or run `trackClick(slug).catch(...)` off the critical path).',
            'Track `consecutiveFails` and `openUntil`; skip `fetch()` while `Date.now() < openUntil` and log `breaker_open`.',
          ],
          code: {
            filename: 'redirect-service/src/trackClick.ts',
            snippet: `let fails = 0, openUntil = 0;
export async function trackClick(slug: string) {
  if (Date.now() < openUntil) return console.log(JSON.stringify({ event: 'analytics_breaker_open', slug }));
  try {
    await fetch('http://localhost:3002/clicks', {
      method: 'POST', body: JSON.stringify({ slug }), signal: AbortSignal.timeout(150),
    });
    fails = 0;
  } catch {
    if (++fails >= 3) openUntil = Date.now() + 15_000;
  }
}`,
          },
        },
      ],
    },
  ],
  comparisonProfile: {
    idealTeamSize: '30–500+ engineers',
    deploymentUnit: 'Many independent service containers',
    scalingStyle: 'Scale hot services independently',
    opsComplexity: 'High',
    devVelocityEarly: 'Low',
    faultIsolation: 'Very High',
    costAtIdle: 'Fixed (High)',
    dataConsistency: 'Eventual',
    typicalDatastore: 'Polyglot per service (Postgres, NoSQL, Redis, Search)',
    bestFor: 'Large multi-team orgs, independent scaling profiles, strict fault isolation',
  },
};
