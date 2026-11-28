import type { FoundationBlock } from '../types/course';

export const FOUNDATION_BLOCKS: FoundationBlock[] = [
  {
    id: 'client-http',
    name: 'Client, Server & Sync HTTP',
    icon: 'globe',
    oneLiner: 'A browser or mobile app sends a request and waits for the backend to reply.',
    realWorldAnalogy:
      'Like ordering at a coffee counter and standing there until the barista hands you your cup.',
    howItWorks:
      'Synchronous HTTP (REST/JSON) is simple, predictable, and easy to debug. For production scale, validate payloads at the boundary, cap list page sizes using cursor/keyset pagination (instead of slow `OFFSET 100000`), and accept an `Idempotency-Key` header on mutating `POST` requests (like checkout) so mobile retries never double-charge.',
    beginnerWatchOut:
      'Doing slow work (like generating a PDF or resizing a video) synchronously inside an HTTP request causes timeouts — and auto-retrying a `POST` request without an `Idempotency-Key` creates duplicate orders.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
    howToImplement: [
      {
        id: 'http-server-idempotency',
        label: 'Server-Side Idempotency-Key',
        summary:
          'Store each client-generated Idempotency-Key in your database so retried POST requests replay the original result instead of executing twice.',
        steps: [
          'Create an `idempotency_keys` table with a `UNIQUE (user_id, key)` constraint plus `status` (`IN_PROGRESS` | `DONE`) and `response_json` columns.',
          'At request start, insert the key with `ON CONFLICT DO NOTHING`; if a row already exists and is `DONE`, return the saved JSON immediately.',
          'If an identical key is still `IN_PROGRESS`, return `409 Conflict` (telling the client to retry shortly); once finished, save the response and expire old keys after 24 hours.',
        ],
        code: {
          filename: 'src/middleware/idempotency.ts',
          snippet: `// 1. Atomically claim the key (UNIQUE on user_id + idem_key)
const claimed = await db.queryOne(
  \`INSERT INTO idempotency_keys (user_id, idem_key, status)
   VALUES ($1, $2, 'IN_PROGRESS')
   ON CONFLICT (user_id, idem_key) DO NOTHING RETURNING idem_key\`,
  [userId, idemKey]
);

if (!claimed) {
  const existing = await db.getIdempotencyRecord(userId, idemKey);
  if (existing.status === 'DONE') return res.status(existing.http_status).json(existing.body);
  return res.status(409).json({ error: 'Request already in progress, retry shortly' });
}

// 2. Run mutation once, then persist response_body + status = 'DONE'`,
        },
        watchOut:
          'Also hash the request body and reject reuse if the same Idempotency-Key is sent with a different payload (prevents accidental cross-order replays).',
      },
      {
        id: 'http-cursor-pagination',
        label: 'Cursor Pagination',
        summary:
          'Replace slow `OFFSET` queries with a composite `(created_at, id)` cursor so page 500 is just as fast as page 1.',
        steps: [
          'Always include a unique tie-breaker column (`id`) alongside `created_at` so two rows created in the exact same millisecond are never skipped or duplicated.',
          'Fetch `limit + 1` rows; if you get an extra row, encode the last returned item as `nextCursor` (Base64 JSON).',
          'Enforce a strict server-side cap (e.g., `Math.min(reqLimit, 100)`) on every list endpoint.',
        ],
        code: {
          filename: 'src/repos/listTasks.sql',
          snippet: `SELECT id, title, created_at
FROM tasks
WHERE org_id = $1
  AND (created_at, id) < ($2, $3) -- composite cursor from previous page
ORDER BY created_at DESC, id DESC
LIMIT 51; -- request 50 + 1 to check if another page exists`,
        },
      },
    ],
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: 'shield',
    oneLiner: 'One front door that routes requests, checks auth tokens, and applies rate limits.',
    realWorldAnalogy:
      'A hotel concierge who checks your keycard and directs you to the right elevator without making you memorize floor layouts.',
    howItWorks:
      'Instead of making frontend apps talk directly to 12 internal services or 30 functions, an API Gateway exposes one clean URL, validates JWTs, enforces rate limits, and forwards requests to the right backend target.',
    beginnerWatchOut:
      'Do not put heavy business logic inside your API Gateway. Keep it focused on routing, authentication, and request protection.',
    relevantArchitectures: ['microservices', 'serverless'],
  },
  {
    id: 'databases',
    name: 'Databases & Data Ownership',
    icon: 'database',
    oneLiner: 'Where persistent state lives — and who is allowed to read or modify each table.',
    realWorldAnalogy:
      'Shared whiteboards work fine for a 4-person startup, but 10 teams erasing each other’s columns causes chaos.',
    howItWorks:
      'In a Modular Monolith, modules share one database engine while keeping table ownership separate. In Microservices, each service owns its own private database so teams can change schemas without breaking neighbors.',
    beginnerWatchOut:
      'Letting two independent services read and write the exact same database tables creates a "distributed monolith" — all the operational pain of microservices with none of the independence.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'event-driven'],
  },
  {
    id: 'queues-brokers',
    name: 'Message Queues & Event Brokers',
    icon: 'layers',
    oneLiner: 'A shock absorber that holds work or broadcasts facts so services do not block each other.',
    realWorldAnalogy:
      'A restaurant ticket rail: waiters clip orders up quickly and the kitchen cooks them at a steady pace, even during the dinner rush.',
    howItWorks:
      'A queue (like SQS or BullMQ) buffers tasks for workers to process asynchronously. An event broker (like Kafka, RabbitMQ, or EventBridge) broadcasts events like "OrderPlaced" so multiple independent consumers can react simultaneously.',
    beginnerWatchOut:
      'Queues usually deliver messages "at least once" — meaning the same message can arrive twice! Consumers must be idempotent so retries never double-charge a user.',
    relevantArchitectures: ['event-driven', 'serverless', 'microservices'],
  },
  {
    id: 'sync-vs-async',
    name: 'Synchronous vs. Asynchronous',
    icon: 'zap',
    oneLiner: 'Deciding whether the caller needs an answer right now or just confirmation that work is queued.',
    realWorldAnalogy:
      'Checking if a seat is available is synchronous (you wait). Receiving your boarding pass email is asynchronous (it arrives seconds later).',
    howItWorks:
      'Use synchronous calls when the user immediately needs the result (login, payment authorization). Use asynchronous workflows for side effects (emails, analytics, thumbnails, fraud checks) so failures in secondary features never break the main action.',
    beginnerWatchOut:
      'Asynchronous systems introduce "eventual consistency" — your UI should handle temporary states like "Processing..." rather than assuming instant completion.',
    relevantArchitectures: ['event-driven', 'serverless', 'microservices', 'modular-monolith'],
  },
  {
    id: 'stateless-scaling',
    name: 'Statelessness & Scaling',
    icon: 'scale',
    oneLiner: 'Growing by buying a bigger machine (vertical) or running more copies (horizontal).',
    realWorldAnalogy:
      'Hiring a faster cashier is vertical scaling; opening 5 identical checkout lanes is horizontal scaling.',
    howItWorks:
      'To run multiple copies of your backend behind a load balancer (or auto-scale serverless functions), your server code must be stateless — store sessions, files, and caches in external stores (Redis, S3, DB), never in server memory.',
    beginnerWatchOut:
      'Saving uploaded files to local disk or storing login sessions in an in-memory JS Map works on localhost, then randomly fails as soon as you deploy 2 instances or a serverless function restarts.',
    relevantArchitectures: ['serverless', 'microservices', 'modular-monolith'],
  },
  {
    id: 'caching',
    name: 'Caching (CDN & Redis Cache-Aside)',
    icon: 'cpu',
    oneLiner: 'Storing frequent read results in fast memory or at the network edge so your database does less work.',
    realWorldAnalogy:
      'Keeping the most popular menu items written on a chalkboard behind the register instead of walking to the storeroom every time someone asks.',
    howItWorks:
      'With the Cache-Aside pattern, your backend checks Redis first; on a cache miss, it queries the database, saves the result in Redis with a TTL (expiration time), and returns it. CDNs and browsers honor HTTP caching headers (`Cache-Control`, `ETag`, `stale-while-revalidate`) to serve public GET responses geographically close to users.',
    beginnerWatchOut:
      'Watch for Cache Stampedes (a popular key expires and 500 requests hit the DB at once — add small random TTL jitter), stale data after writes, and NEVER cache private user data in a shared public CDN key!',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
    howToImplement: [
      {
        id: 'cache-invalidation',
        label: 'Avoid Stale Data on Writes',
        summary:
          'Keep Redis accurate after updates by deleting the affected cache key right after the database commit succeeds.',
        steps: [
          'Write to your primary database first — never update Redis before the SQL transaction commits.',
          'Immediately `DEL` (invalidate) the affected key after commit so the next read repopulates fresh data cleanly (deleting avoids race conditions better than overwriting Redis).',
          'Always keep a reasonable fallback TTL (e.g., 5 minutes) so even if a delete fails during a network blip, stale data self-heals automatically.',
        ],
        code: {
          filename: 'src/modules/catalog/updatePrice.ts',
          snippet: `export async function updateProductPrice(productId: string, priceCents: number) {
  await db.query('UPDATE products SET price_cents = $1 WHERE id = $2', [priceCents, productId]);
  // Delete instead of SET so concurrent writers cannot overwrite newer values
  await redis.del(\`catalog:product:\${productId}\`);
}`,
        },
      },
      {
        id: 'cache-cdn-headers',
        label: 'Safe CDN Headers',
        summary:
          'Explicitly label authenticated responses as `private, no-store` so a CDN edge node never serves User A’s invoice to User B.',
        steps: [
          'Set `Cache-Control: private, no-store` by default on any route that reads `Authorization` headers or session cookies.',
          'Only enable `public, s-maxage=...` on truly anonymous/shared endpoints (e.g., public catalog pages, blog posts, static assets).',
          'Add `stale-while-revalidate=30` on public GETs so the CDN serves fast cached content while refreshing quietly in the background.',
        ],
        code: {
          filename: 'src/middleware/cacheHeaders.ts',
          snippet: `// Authenticated user/tenant routes — NEVER share on a public CDN
res.setHeader('Cache-Control', 'private, no-store');

// Public catalog GET route — edge caches 60s, refreshes quietly in background
res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=30');`,
        },
      },
      {
        id: 'cache-stampede-singleflight',
        label: 'Hot-Key Stampede Guard',
        summary:
          'TTL jitter spreads out *many* keys expiring together, while request coalescing (singleflight) stops 500 requests from rebuilding the *same* hot key at once.',
        steps: [
          'For an in-process Node server, store the in-flight DB promise in a `Map<key, Promise>` so 50 concurrent misses await the exact same single SQL query.',
          'Across multiple server replicas, acquire a short Redis mutex (`SET lock:key 1 NX PX 3000`) or use `stale-while-revalidate` so only 1 replica queries Postgres.',
          'Pair with random TTL jitter (`300 + Math.random() * 30`) so bulk-loaded keys expire smoothly over time.',
        ],
        code: {
          filename: 'src/shared/singleflightCache.ts',
          snippet: `const inflight = new Map<string, Promise<unknown>>();

export async function getOrLoad<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  if (!inflight.has(key)) {
    const p = loader().then(async (val) => {
      const ttl = 300 + Math.floor(Math.random() * 30);
      await redis.set(key, JSON.stringify(val), 'EX', ttl);
      return val;
    }).finally(() => inflight.delete(key));
    inflight.set(key, p);
  }
  return inflight.get(key) as Promise<T>;
}`,
        },
      },
    ],
  },
  {
    id: 'rate-limiting-backpressure',
    name: 'Rate Limiting & Backpressure',
    icon: 'gauge',
    oneLiner: 'Protecting backends from traffic floods and stopping fast producers from overwhelming slow consumers.',
    realWorldAnalogy:
      'A bouncer letting people into a club at a steady pace (rate limiting) and pausing entry when the room is full (backpressure).',
    howItWorks:
      'Rate limiters cap requests per user/IP (e.g., 100 req/min via a token bucket) to block scrapers, accidental infinite loops, and noisy neighbors. Backpressure ensures that when workers fall behind, upstream queues bound their size, slow intake, or shed non-critical load instead of running out of memory.',
    beginnerWatchOut:
      'A queue absorbs temporary spikes, NOT permanent overload! If producers push 500 jobs/sec forever while workers only process 100/sec, the queue grows unbounded until delays hit hours or brokers crash.',
    relevantArchitectures: ['serverless', 'microservices', 'event-driven', 'modular-monolith'],
    howToImplement: [
      {
        id: 'rl-backpressure-shedding',
        label: 'Bounded Queue & Load Shedding',
        summary:
          'Cap queue depth before enqueuing so sustained overload degrades gracefully with HTTP 503 instead of crashing your broker.',
        steps: [
          'For sustained overload (inflow > outflow), autoscale worker replicas first or batch work more efficiently.',
          'Set a hard max queue depth (e.g., 5,000 waiting jobs) and reject low-priority requests fast with `503 Service Unavailable` + `Retry-After`.',
          'Alert when queue age/depth climbs for >5 minutes so you spot permanent capacity shortages early.',
        ],
        code: {
          filename: 'src/routes/enqueueExport.ts',
          snippet: `const waiting = await exportQueue.getWaitingCount();
if (waiting >= 5_000) {
  res.setHeader('Retry-After', '30');
  return res.status(503).json({ error: 'Export queue busy — please retry in 30s' });
}
await exportQueue.add('csv-export', { orgId, userId });
return res.status(202).json({ status: 'queued' });`,
        },
      },
      {
        id: 'rl-outbound-429',
        label: 'Outbound 429 Throttling',
        summary:
          'When workers call rate-limited external APIs (Stripe, HubSpot, OpenAI), throttle concurrency and respect `Retry-After` so valid jobs do not burn through retries.',
        steps: [
          'Configure a strict concurrency / rate limiter on the worker queue matching the vendor’s RPM quota (e.g., BullMQ `limiter: { max: 50, duration: 1000 }` or SQS reserved concurrency).',
          'Check for HTTP `429 Too Many Requests` explicitly and read the `Retry-After` header (in seconds) instead of throwing a normal fatal error.',
          'Re-schedule the job with the requested delay + small random jitter without counting it as a poison-pill failure.',
        ],
        code: {
          filename: 'src/workers/callExternalApi.ts',
          snippet: `const resp = await fetch(partnerUrl, { method: 'POST', body: JSON.stringify(job.data) });

if (resp.status === 429) {
  const retrySec = Number(resp.headers.get('retry-after') ?? 5);
  const jitterMs = Math.floor(Math.random() * 1000);
  // Delay job cleanly instead of burning retries into the DLQ
  await job.moveToDelayed(Date.now() + retrySec * 1000 + jitterMs);
  return;
}`,
        },
      },
    ],
  },
  {
    id: 'observability',
    name: 'Observability, Health Checks & Graceful Shutdown',
    icon: 'activity',
    oneLiner: 'Seeing what your backend is doing in production — and shutting down safely without dropping live requests.',
    realWorldAnalogy:
      'An airplane cockpit combines black-box logs, live speed/altitude gauges, and flight-path radar so pilots spot trouble before an engine stalls.',
    howItWorks:
      'Production observability rests on 3 pillars: Structured JSON Logs (searchable events with a correlationId), Metrics (request rate, error rate, and p50/p95/p99 latency), and Distributed Traces (following one request across services). Expose separate Liveness ("is the process alive?") and Readiness ("can it take traffic?") health checks, and listen for SIGTERM to drain in-flight HTTP requests and queue jobs before exiting.',
    beginnerWatchOut:
      'Never rely on average latency! An "80ms average" can hide a miserable p99 of 4.2 seconds for your slowest 1% of users. And killing containers abruptly on deploy drops active payments and half-finished queue jobs.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
    howToImplement: [
      {
        id: 'obs-health-shutdown',
        label: 'Health Checks & SIGTERM Drain',
        summary:
          'Expose separate `/healthz` and `/readyz` routes and drain in-flight HTTP requests & DB pools cleanly on `SIGTERM`.',
        steps: [
          '`/healthz` (Liveness) checks only that the event loop responds — never query Postgres inside Liveness, or a brief DB blip will restart every container in a death loop.',
          '`/readyz` (Readiness) returns `503` while shutting down or if the DB ping fails, telling the load balancer to stop sending new traffic immediately.',
          'On `SIGTERM`, mark `isShuttingDown = true`, wait briefly for the load balancer to drain, call `server.close()`, close worker & DB pools, and exit `0`.',
        ],
        code: {
          filename: 'src/serverLifecycle.ts',
          snippet: `let isShuttingDown = false;

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
app.get('/readyz', async (_req, res) => {
  if (isShuttingDown) return res.status(503).json({ ready: false });
  await db.query('SELECT 1'); // short 500ms timeout
  return res.status(200).json({ ready: true });
});

process.on('SIGTERM', async () => {
  isShuttingDown = true;
  await new Promise((r) => server.close(r)); // finish in-flight HTTP calls
  await worker.close();                      // finish active queue jobs
  await db.end();
  process.exit(0);
});`,
        },
      },
      {
        id: 'obs-correlation-id',
        label: 'Propagate x-request-id',
        summary:
          'Generate or forward one `x-request-id` across every log line and downstream HTTP/event call so you can trace a request end-to-end.',
        steps: [
          'In entry middleware, read `req.headers["x-request-id"]` or create a fresh `crypto.randomUUID()`.',
          'Store it in `AsyncLocalStorage` (or attach to `req.log`) so every structured JSON log line automatically includes `requestId` and `durationMs`.',
          'Pass `headers: { "x-request-id": requestId }` on every outbound `fetch` and include `correlationId` in every emitted event envelope.',
        ],
        code: {
          filename: 'src/middleware/requestId.ts',
          snippet: `import { randomUUID } from 'node:crypto';

export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const start = performance.now();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    console.log(JSON.stringify({ requestId, path: req.path, status: res.statusCode, ms: Math.round(performance.now() - start) }));
  });
  next();
}`,
        },
      },
    ],
  },
  {
    id: 'security-auth',
    name: 'Auth, Trust Boundaries & Webhook Security',
    icon: 'lock',
    oneLiner: 'How user identity, internal service calls, secrets, and external webhooks stay trustworthy across architectures.',
    realWorldAnalogy:
      'A concert checks your ticket at the front gate (edge auth), gives staff backstage badges for restricted rooms (service auth), and verifies sealed VIP deliveries (webhook signatures).',
    howItWorks:
      'Separate Authentication ("who are you?") from Authorization ("can you touch this record?"). Monoliths often use server-side sessions (easy instant logout via Redis/DB), while Microservices and Serverless favor short-lived signed JWTs verified at the API Gateway paired with RBAC/ABAC permission checks on every resource query. Verify internal callers with mTLS or service tokens, load keys from a Secrets Manager (never Git), and verify external webhooks via HMAC signatures + timestamp replay checks.',
    beginnerWatchOut:
      'Checking only "is the user logged in?" without verifying resource ownership causes IDOR vulnerabilities (User A reading User B’s invoice by changing `/invoices/42` to `/invoices/43`). On public webhooks, skipping HMAC verification lets anyone forge payment events.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
    howToImplement: [
      {
        id: 'sec-webhook-hmac',
        label: 'Webhook HMAC & Replay Check',
        summary:
          'Verify incoming Stripe/GitHub webhooks using the exact raw request bytes, a timing-safe comparison, and a 5-minute timestamp window.',
        steps: [
          'Capture the **raw request buffer** before any JSON body parser runs (re-stringifying parsed JSON can change whitespace/key order and break signatures).',
          'Reject requests whose signed timestamp header is older than 5 minutes to block captured replay attacks.',
          'Compute `HMAC-SHA256` with your webhook secret and compare using `crypto.timingSafeEqual` (never `===`).',
        ],
        code: {
          filename: 'src/shared/verifyWebhook.ts',
          snippet: `import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyWebhook(rawBody: Buffer, sigHex: string, timestampSec: number, secret: string) {
  // 1. Block replay attacks older than 5 minutes
  if (Math.abs(Date.now() / 1000 - timestampSec) > 300) return false;

  // 2. Hash exact raw bytes + timestamp with your secret
  const expected = createHmac('sha256', secret)
    .update(\`\${timestampSec}.\`)
    .update(rawBody)
    .digest();
  const actual = Buffer.from(sigHex, 'hex');

  // 3. Constant-time comparison prevents timing leaks
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}`,
        },
        watchOut:
          'Always verify the signature BEFORE parsing JSON or enqueueing the job — and still deduplicate by webhook event ID because providers retry valid deliveries.',
      },
      {
        id: 'sec-jwt-revocation',
        label: 'Instant JWT Revocation',
        summary:
          'Stateless JWTs cannot be "deleted" until they expire — combine short access TTLs with a lightweight revocation check for instant logout/offboarding.',
        steps: [
          'Issue short-lived access JWTs (5–15 minutes) paired with revocable refresh tokens stored in Postgres or Redis.',
          'When an admin revokes a terminated employee or a user clicks "Log out all devices," delete their refresh tokens AND set a tiny Redis key `revoked:user:{id}` (with TTL = access token lifetime).',
          'Check that fast Redis key (or a `tokenVersion` integer) at the API Gateway or on sensitive endpoints so access stops immediately.',
        ],
        code: {
          filename: 'src/auth/verifyAccess.ts',
          snippet: `const payload = verifyJwt(token, PUBLIC_KEY); // exp <= 10 min
const revokedBefore = await redis.get(\`revoked:user:\${payload.sub}\`);

if (revokedBefore && payload.iat < Number(revokedBefore)) {
  return res.status(401).json({ error: 'Session revoked — please sign in again' });
}`,
        },
      },
    ],
  },
  {
    id: 'zero-downtime-migrations',
    name: 'Zero-Downtime Database Migrations',
    icon: 'git-branch',
    oneLiner: 'Evolving live database schemas safely while old and new backend instances run side-by-side.',
    realWorldAnalogy:
      'Building a new bridge lane next to the old one, routing cars over gradually, and demolishing the old lane only after zero cars use it.',
    howItWorks:
      'Use the Expand-and-Contract pattern across rolling deploys: (1) Expand — add the new nullable column or table first; (2) Dual-write & backfill existing rows while old code still works; (3) Switch reads to the new column in the next deploy; (4) Contract — drop the obsolete column only after every old server instance is gone.',
    beginnerWatchOut:
      'Renaming or dropping a live column in a single deployment immediately breaks every still-running server container before the rollout finishes, causing instant 500 errors.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
  },
  {
    id: 'testing-strategies',
    name: 'Testing Strategies by Architecture',
    icon: 'flask-conical',
    oneLiner: 'How testing shifts from fast in-process suites to contract tests and failure drills as systems become distributed.',
    realWorldAnalogy:
      'Testing a bicycle takes one ride down the block; testing an airline means inspecting each engine separately AND verifying the cockpit instruments agree on the exact same signals.',
    howItWorks:
      'In a Modular Monolith, fast in-process integration tests against a real local Postgres/SQLite container verify whole workflows in seconds. In Microservices and Event-Driven systems, spinning up 15 services locally is slow and flaky — teams rely on Consumer-Driven Contract Tests (OpenAPI / Pact / JSON Schema) to guarantee producer and consumer payloads match, paired with focused unit tests on pure domain logic.',
    beginnerWatchOut:
      'Mocking every network call and database query makes tests pass with 100% green checkmarks while hiding real JSON serialization bugs, broken SQL queries, missing timeouts, and duplicate-message crashes!',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
  },
  {
    id: 'concurrency-locking',
    name: 'Concurrency Control & Race Conditions',
    icon: 'key-round',
    oneLiner: 'Stopping two simultaneous users from booking the last seat or double-spending the same balance.',
    realWorldAnalogy:
      'Two travel agents reading "1 seat left" on a whiteboard at the same time and both selling it — unless the booking desk locks the row or checks the version number before writing.',
    howItWorks:
      'Idempotency stops retries of the SAME request, but Concurrency Control handles TWO DIFFERENT users colliding on the same record. Prefer atomic conditional SQL updates (`UPDATE stock SET qty = qty - 1 WHERE id = $1 AND qty >= 1`), Optimistic Locking (include `WHERE version = $expected` and retry on conflict), or Pessimistic Locking (`SELECT ... FOR UPDATE`) for short high-contention rows.',
    beginnerWatchOut:
      'Reading a balance in JavaScript (`if (balance >= 50)`), doing work, and then writing `balance - 50` is a classic read-modify-write race condition! And avoid Redis distributed locks unless you truly need cross-system coordination — clock drift and GC pauses can let two workers hold the "lock" simultaneously.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
    howToImplement: [
      {
        id: 'conc-optimistic-locking',
        label: 'Optimistic Locking Retry / 409',
        summary:
          'For multi-field edits, guard your SQL `UPDATE` with `WHERE version = $expected` and handle 0 updated rows explicitly.',
        steps: [
          'Add an integer `version` column (default `1`) to mutable records.',
          'Include `AND version = $expectedVersion` in your `UPDATE` and increment `version = version + 1`.',
          'If `rowCount === 0`, another writer beat you — either return `409 Conflict` so the UI refreshes, or automatically re-read & retry up to 3 times.',
        ],
        code: {
          filename: 'src/repos/updateInvoice.ts',
          snippet: `const updated = await db.queryOne(
  \`UPDATE invoices
   SET status = $1, total_cents = $2, version = version + 1
   WHERE id = $3 AND org_id = $4 AND version = $5
   RETURNING id, version\`,
  [nextStatus, totalCents, invoiceId, orgId, expectedVersion]
);
if (!updated) {
  throw new HttpError(409, 'Record was modified by another request — refresh and retry');
}`,
        },
      },
      {
        id: 'conc-fencing-tokens',
        label: 'Fencing Tokens (Distributed Locks)',
        summary:
          'When you truly need a cross-system distributed lock, pair it with a monotonically increasing fencing token checked by storage.',
        steps: [
          'Prefer a single database row lock or unique constraint first — most apps never need Redis locks.',
          'If a lock service (e.g., etcd / Postgres lease table) grants Worker A a lock, it also returns an ever-increasing number (`fencingToken = 33`).',
          'Pass `fencingToken` on every downstream write (`WHERE last_token < $token`); if Worker A pauses for GC and Worker B acquires token `34`, Worker A’s stale write `33` is safely rejected!',
        ],
        code: {
          filename: 'src/workers/fencedWrite.sql',
          snippet: `-- Downstream storage rejects delayed writes from an expired lock holder
UPDATE shared_resources
SET payload = $1, last_fencing_token = $2
WHERE id = $3 AND last_fencing_token < $2;`,
        },
      },
    ],
  },
  {
    id: 'realtime-push',
    name: 'Real-Time Delivery: Polling, SSE & WebSockets',
    icon: 'radio',
    oneLiner: 'How clients get updates after a `202 Accepted` response — or stream live maps, chat, and AI tokens.',
    realWorldAnalogy:
      'Short polling is repeatedly asking "is dinner ready?"; SSE is a one-way kitchen pager that buzzes you when ready; WebSockets is an open two-way phone call.',
    howItWorks:
      'Match complexity to your update frequency: Short Polling (simple `GET /jobs/:id` every 2s) works great for PDF exports; Server-Sent Events (SSE) streams one-way server updates over plain HTTP (ideal for LLM token streaming & live notifications); WebSockets enable full two-way low-latency traffic (chat, live collaboration); Webhooks push server-to-server events to external partners.',
    beginnerWatchOut:
      'Persistent WebSocket connections are stateful! When you scale to 4 backend servers, User A on Server 1 cannot message User B on Server 2 unless servers broadcast via Redis Pub/Sub or a broker — and standard stateless Serverless functions cannot hold long-lived WebSockets directly without a managed gateway.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
    howToImplement: [
      {
        id: 'rt-ws-drain-jitter',
        label: 'Graceful WS Drain & Jittered Reconnect',
        summary:
          'Prevent massive reconnect storms during deploys by closing sockets in staggered batches on the server and reconnecting with jittered backoff on the client.',
        steps: [
          'Server-side on `SIGTERM`: stop accepting new WebSockets, then close existing sockets in small staggered batches over 15–30 seconds with close code `1012` (Service Restart).',
          'Client-side on `onclose`: never reconnect immediately in a tight loop — compute `Math.min(30_000, 500 * 2 ** attempt)` plus random jitter.',
          'Reset `attempt = 0` once the connection stays healthy for a few seconds, and fetch missed messages since `lastEventId`.',
        ],
        code: {
          filename: 'src/client/reconnectSocket.ts',
          snippet: `function scheduleReconnect(attempt: number) {
  const baseMs = Math.min(30_000, 500 * 2 ** attempt);
  // Full jitter spreads 250,000 clients smoothly across the backoff window
  const delayMs = Math.floor(Math.random() * baseMs);
  setTimeout(() => connectWebSocket(attempt + 1), delayMs);
}`,
        },
      },
    ],
  },
  {
    id: 'db-choice-scaling',
    name: 'Choosing & Scaling Databases (SQL, NoSQL & Lag)',
    icon: 'hard-drive',
    oneLiner: 'Why databases bottleneck before app servers — and how to pick and scale storage without premature sharding.',
    realWorldAnalogy:
      'A well-organized filing cabinet (Postgres) handles almost any office until you need a specialized index desk (Search), a high-speed ticker tape (Time-Series), or separate branch offices (Sharding).',
    howItWorks:
      'Start with relational SQL (PostgreSQL) for strong ACID consistency and flexible queries; adopt specialized stores (Polyglot Persistence: Redis for KV/cache, OpenSearch for full-text search, DynamoDB/Cassandra for massive predictable key lookups) only when access patterns demand it. Scale in order: fix indexes & N+1 queries → scale vertically + add caching → add Read Replicas → partition large tables → shard only as a last resort.',
    beginnerWatchOut:
      'Read Replicas lag behind the primary by milliseconds to seconds! If a user saves their profile and immediately reloads from a replica, they may see stale data ("read-your-own-writes" bug) unless post-write reads route to the primary. Under CAP trade-offs during a network split, distributed stores must choose between strict consistency and accepting writes.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
    howToImplement: [
      {
        id: 'db-read-your-writes',
        label: 'Read-Your-Own-Writes Routing',
        summary:
          'Avoid stale post-write reads without sending 100% of traffic to your primary database.',
        steps: [
          'Easiest win: return the updated record directly in the `POST`/`PATCH` response so the frontend updates state without an immediate `GET`.',
          'Route user-critical flows (checkout, settings, RBAC permissions) strictly to the primary, and send only analytics, search, and public feeds to Read Replicas.',
          'If a user redirects right after a write, set a tiny 5-second `read_primary_until` cookie/timestamp so only that user’s next few `GET` requests hit the primary.',
        ],
        code: {
          filename: 'src/shared/dbRouter.ts',
          snippet: `export function pickReadDb(req: { cookies?: { read_primary_until?: string } }) {
  const stickUntil = Number(req.cookies?.read_primary_until ?? 0);
  // Sticky primary for 5s after this user wrote; everyone else uses replica
  return Date.now() < stickUntil ? primaryDb : replicaDb;
}`,
        },
      },
      {
        id: 'db-cap-guide',
        label: 'Practical CAP Trade-Off Guide',
        summary:
          'When a network partition splits two database nodes, pick CP (reject stale writes) or AP (stay writable, reconcile later) per business feature.',
        steps: [
          'Choose **CP (Consistency over Availability)** for money, seat/inventory counts, and security permissions — better to show a temporary retry error than double-spend or grant revoked access.',
          'Choose **AP (Availability over Consistency)** for social feeds, view counters, shopping carts, and read caches — brief staleness is harmless compared to downtime.',
          'Most beginner apps start with a single primary Postgres (strong consistency) + Multi-AZ failover, avoiding multi-primary split-brain conflicts altogether.',
        ],
      },
    ],
  },
  {
    id: 'safe-deployments',
    name: 'Safe Deployments & Feature Flags',
    icon: 'rocket',
    oneLiner: 'Releasing new code gradually with instant rollback — and separating code deployment from feature launch.',
    realWorldAnalogy:
      'Opening a new restaurant menu to 5% of tables first (Canary) or keeping the old kitchen warm until the new kitchen proves steady (Blue-Green).',
    howItWorks:
      'Rolling deploys replace containers a few at a time; Blue-Green deploys stand up a full new environment and flip load-balancer traffic instantly for fast rollback; Canary releases route 1% → 10% → 100% of live traffic while watching error/p99 metrics. Feature Flags decouple deployment (pushing safe dark code to production) from release (toggling a feature on for beta users without redeploying).',
    beginnerWatchOut:
      'Remember that during Rolling and Canary deploys, old and new versions of your backend run simultaneously — so database schemas and internal JSON/event payloads must stay backward-compatible across at least two releases!',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
  },
  {
    id: 'multi-tenancy',
    name: 'Multi-Tenancy & Tenant Isolation (B2B SaaS)',
    icon: 'building',
    oneLiner: 'Safely serving hundreds of customer organizations on shared infrastructure without cross-tenant leaks or noisy neighbors.',
    realWorldAnalogy:
      'Apartments in one building (shared DB + `tenant_id`), separate wings with locked doors (schema-per-tenant), or standalone houses for VIPs (database-per-tenant).',
    howItWorks:
      'Most SaaS apps start with a Shared Database + `tenant_id` column enforced by PostgreSQL Row-Level Security (RLS) so a forgotten `WHERE` clause cannot leak another company’s data. Regulated enterprise tiers can graduate to Schema-per-Tenant or dedicated Database-per-Tenant ("silo") isolation. Always scope rate limits, queue fairness, and Redis cache keys (`tenant:{id}:projects`) per tenant.',
    beginnerWatchOut:
      'One enterprise customer running a massive bulk import can starve every small customer on shared queues or DB pools ("noisy neighbor" problem). Apply per-tenant rate limits and move heavy exports to isolated workers.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless'],
    howToImplement: [
      {
        id: 'mt-postgres-rls-local',
        label: 'Postgres RLS + Pooler Safety (SET LOCAL)',
        summary:
          'Enable Row-Level Security on tenant tables and always set tenant context with `SET LOCAL` inside a transaction so connection poolers never leak Tenant A into Tenant B.',
        steps: [
          'Enable RLS and define a policy requiring `tenant_id = current_setting(\'app.tenant_id\', true)::uuid` on every multi-tenant table (use a non-superuser app DB role so RLS is enforced!).',
          'Wrap every tenant-scoped query in a transaction and run `SET LOCAL` (transaction-scoped), NEVER plain `SET` (connection-scoped).',
          'Why `SET LOCAL` matters: transaction-mode poolers (PgBouncer / RDS Proxy) hand the same physical connection to another tenant right after commit — `SET LOCAL` resets automatically at commit/rollback.',
        ],
        code: {
          filename: 'src/shared/withTenant.ts',
          snippet: `-- 1. One-time SQL migration:
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY tenant_isolation ON projects
--   USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

// 2. Per-request wrapper (safe with PgBouncer & Serverless!)
export async function withTenant<T>(tenantId: string, fn: (tx: DbClient) => Promise<T>) {
  return db.transaction(async (tx) => {
    await tx.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]); // true = SET LOCAL
    return fn(tx);
  });
}`,
        },
        watchOut:
          'PostgreSQL superusers and table owners bypass RLS by default unless you run `ALTER TABLE ... FORCE ROW LEVEL SECURITY` and connect with a restricted application DB role.',
      },
      {
        id: 'mt-queue-fairness',
        label: 'Multi-Tenant Queue Fairness',
        summary:
          'Prevent one enterprise tenant uploading 100,000 jobs from stalling every smaller customer waiting in the same FIFO queue.',
        steps: [
          'Split queues by workload class: fast interactive jobs (`emails`, `webhooks`) never share a queue with heavy batch jobs (`bulk-imports`, `csv-exports`).',
          'Use fair/group-based scheduling (e.g., BullMQ Pro Groups, SQS Fair Queues, or capping max active jobs per `tenantId` in Redis) so workers round-robin across tenants.',
          'Set per-tenant rate limits at intake so noisy tenants queue politely at their own tier limit.',
        ],
      },
    ],
  },
  {
    id: 'availability-dr',
    name: 'High Availability, SLOs & Disaster Recovery',
    icon: 'heart-pulse',
    oneLiner: 'Designing past single points of failure and quantifying acceptable downtime and data loss.',
    realWorldAnalogy:
      'Having a spare tire and roadside assistance (Multi-AZ failover) plus cloud-backed photos (off-site backups) — sized to how fast you actually need to be back on the road.',
    howItWorks:
      'Eliminate single points of failure by running 2+ stateless app replicas and Multi-AZ managed databases with automatic failover before ever considering costly Multi-Region setups. Define SLOs (e.g., 99.9% = ~43 min downtime/month) backed by an Error Budget, and set RPO (max acceptable data loss, e.g., 5 min of writes) and RTO (max acceptable recovery time, e.g., 30 min) verified by real restore drills.',
    beginnerWatchOut:
      'Availability compounds downward across synchronous chains! Calling 5 sequential microservices that are each 99.9% reliable drops your combined endpoint availability to 99.9%^5 ≈ 99.5% (~3.6 hours of downtime/month) unless you decouple or degrade gracefully. And an untested database backup is not a backup.',
    relevantArchitectures: ['modular-monolith', 'microservices', 'serverless', 'event-driven'],
  },
];

export const BEGINNER_GLOSSARY = [
  {
    term: 'Coupling',
    meaning:
      'How tightly two pieces of code or two services depend on each other. High coupling means changing A unexpectedly breaks B.',
  },
  {
    term: 'Idempotency',
    meaning:
      'Running the exact same operation twice produces the same final result as running it once (essential for payment webhooks and queue retries).',
  },
  {
    term: 'Cold Start',
    meaning:
      'The brief delay (tens to hundreds of milliseconds) when a serverless platform spins up a brand-new container for an idle function.',
  },
  {
    term: 'Eventual Consistency',
    meaning:
      'After an update happens, all parts of the system will agree on the latest state after a short delay rather than in the exact same millisecond.',
  },
  {
    term: 'Blast Radius',
    meaning:
      'How much of your application goes down when one component crashes or receives a bad deploy.',
  },
  {
    term: 'Distributed Monolith',
    meaning:
      'A common anti-pattern where a system is split into many microservices, yet they must all be deployed together because they are tightly coupled.',
  },
  {
    term: 'Cache Stampede',
    meaning:
      'When a hot cached entry expires and hundreds of concurrent requests miss the cache simultaneously, slamming the database.',
  },
  {
    term: 'Backpressure',
    meaning:
      'A mechanism where a busy consumer signals upstream producers to slow down or shed load instead of crashing from an unbounded backlog.',
  },
  {
    term: 'Saga Pattern',
    meaning:
      'A sequence of local transactions across microservices where each step has a compensating action (like a refund) to undo work if a later step fails.',
  },
  {
    term: 'Strangler Fig Pattern',
    meaning:
      'Safely migrating a legacy monolith by incrementally routing one feature at a time to new services instead of doing a risky big-bang rewrite.',
  },
  {
    term: 'p95 / p99 Tail Latency',
    meaning:
      'The response time threshold met by 95% or 99% of requests — exposes slow worst-case user experiences that averages hide.',
  },
  {
    term: 'Expand-and-Contract Migration',
    meaning:
      'A zero-downtime DB migration strategy: add new columns first, dual-write and backfill, switch reads, then drop old columns in a later deploy.',
  },
  {
    term: 'Circuit Breaker',
    meaning:
      'A resilience guard (Closed → Open → Half-Open) that temporarily stops calling a failing dependency so it can recover instead of collapsing your app.',
  },
  {
    term: 'Claim Check Pattern',
    meaning:
      'Uploading large files (PDFs, videos) to object storage like S3 and sending only the small file URI/key through a message broker.',
  },
  {
    term: 'Contract Testing',
    meaning:
      'Automated CI tests verifying that a service or event producer’s actual JSON payloads match what its downstream consumers expect — without running all services together.',
  },
  {
    term: 'Deadline Propagation',
    meaning:
      'Passing a request’s remaining timeout budget across downstream microservice calls so Service C stops wasted work if the user already timed out at Service A.',
  },
  {
    term: 'Optimistic Locking',
    meaning:
      'Preventing lost concurrent updates by including a `version` column in your SQL `UPDATE ... WHERE version = $old` and retrying or rejecting if another writer modified the row first.',
  },
  {
    term: 'Race Condition',
    meaning:
      'A bug where two concurrent requests read the same state (e.g., "1 seat left") and both write updates simultaneously, corrupting balances or double-booking inventory.',
  },
  {
    term: 'SSE (Server-Sent Events)',
    meaning:
      'A lightweight, one-way HTTP stream allowing a server to push real-time updates (like LLM tokens or job progress) to a browser without full WebSocket complexity.',
  },
  {
    term: 'WebSockets',
    meaning:
      'A persistent, two-way TCP connection between client and server for low-latency real-time features like chat or collaborative editing — requires pub/sub fan-out across multiple servers.',
  },
  {
    term: 'Replication Lag',
    meaning:
      'The brief delay between writing data to a primary database and that change appearing on a read replica — can cause stale "read-your-own-writes" bugs if not routed carefully.',
  },
  {
    term: 'Sharding',
    meaning:
      'Horizontally splitting one giant database across multiple independent servers by a shard key (e.g., `tenantId`) — powerful for extreme scale, but breaks cross-shard joins and transactions.',
  },
  {
    term: 'Bounded Context',
    meaning:
      'A Domain-Driven Design boundary inside which a business term (like "Account" or "Order") has one clear meaning, data model, and owning team or module.',
  },
  {
    term: 'Conway’s Law',
    meaning:
      'The observation that software architectures mirror the communication structure of the teams that build them — align service boundaries with autonomous team boundaries.',
  },
  {
    term: 'CDC (Change Data Capture)',
    meaning:
      'Streaming committed database changes straight from the database’s write-ahead log (e.g., via Debezium) into an event broker or new microservice database without polling.',
  },
  {
    term: 'CQRS & Event Sourcing',
    meaning:
      'CQRS separates write models from query-optimized read models; Event Sourcing stores all state strictly as an append-only log of events. Neither is required just to use Event-Driven Architecture.',
  },
  {
    term: 'Canary / Blue-Green Deploy',
    meaning:
      'Low-risk release patterns: Canary shifts a small % of traffic (1% → 10% → 100%) to verify metrics; Blue-Green flips all traffic between two identical environments for instant rollback.',
  },
  {
    term: 'RPO & RTO',
    meaning:
      'Disaster recovery targets: RPO (Recovery Point Objective) is the maximum acceptable data loss (e.g., 5 minutes); RTO (Recovery Time Objective) is the maximum acceptable downtime to restore.',
  },
  {
    term: 'CAP Theorem',
    meaning:
      'During a network partition (split) between distributed database nodes, a store must choose between Consistency (rejecting writes that could be stale) or Availability (accepting writes and reconciling later).',
  },
  {
    term: 'Postgres RLS (Row-Level Security)',
    meaning:
      'A PostgreSQL policy that automatically filters every SQL query by `tenant_id` inside the database engine — pair with transaction-scoped `SET LOCAL` when using connection poolers.',
  },
  {
    term: 'Crypto-Shredding',
    meaning:
      'Encrypting a user’s PII fields inside immutable event logs with a unique per-user key stored in a mutable key table; deleting that key on GDPR erasure makes historical log entries permanently unreadable.',
  },
  {
    term: 'Fencing Token',
    meaning:
      'A monotonically increasing number issued with a distributed lock so downstream databases reject delayed writes from an expired or GC-paused lock holder.',
  },
  {
    term: 'Shadow Reads',
    meaning:
      'Reading from both an old and new database during a migration, logging any mismatches in the background while still returning the old database’s response to users until 100% parity is proven.',
  },
  {
    term: 'DataLoader (Batching)',
    meaning:
      'A per-request batching utility (popular in GraphQL BFFs) that collects individual `getUser(id)` resolver lookups from one tick and sends a single batched `POST /users/batch` query to eliminate N+1 storms.',
  },
];
