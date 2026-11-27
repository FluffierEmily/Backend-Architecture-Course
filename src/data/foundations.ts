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
];
