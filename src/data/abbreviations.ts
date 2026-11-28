export type TermCategory =
  | 'architecture'
  | 'data'
  | 'networking'
  | 'security'
  | 'reliability'
  | 'ops'
  | 'general';

export interface TermDrawerGuide {
  plainEnglish: string;
  howItsUsed: string[];
  example?: {
    filename: string;
    snippet: string;
  };
  watchOut?: string;
  relatedTerms?: string[];
}

export interface AbbreviationEntry {
  id: string;
  term: string;
  aliases?: string[];
  fullName: string;
  shortTooltip: string;
  category: TermCategory;
  drawer?: TermDrawerGuide;
}

export const ABBREVIATIONS: AbbreviationEntry[] = [
  // =========================================================================
  // ARCHITECTURE & SYSTEM PATTERNS
  // =========================================================================
  {
    id: 'api',
    term: 'API',
    aliases: ['APIs'],
    fullName: 'Application Programming Interface',
    shortTooltip: 'A defined contract of endpoints or functions that lets software talk to software.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'An API is the menu of allowed requests a backend exposes (like `GET /books` or `billingApi.checkQuota()`). Callers rely on the contract without needing to know how the database or internals work.',
      howItsUsed: [
        'Web and mobile frontends call HTTP APIs to read and mutate server state safely.',
        'Modules and microservices communicate strictly through public APIs instead of sharing database tables.',
      ],
      example: {
        filename: 'src/routes/books.ts',
        snippet: `app.get('/api/books/:id', async (req, res) => {
  const book = await catalogRepo.findById(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found' });
  return res.status(200).json({ id: book.id, title: book.title, priceCents: book.priceCents });
});`,
      },
      relatedTerms: ['rest', 'grpc', 'dto', 'http'],
    },
  },
  {
    id: 'eda',
    term: 'EDA',
    fullName: 'Event-Driven Architecture',
    shortTooltip: 'Producers emit past-tense facts to a broker and independent consumers react asynchronously.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'Instead of Service A synchronously commanding 5 downstream services, Service A publishes one immutable fact (like `TripCompleted`) to a broker so any number of consumers react independently.',
      howItsUsed: [
        'Fan-out workflows where one action triggers emails, billing, analytics, and loyalty updates.',
        'High-throughput streams (IoT, delivery tracking) that must stay resilient when one consumer slows down.',
      ],
      example: {
        filename: 'src/events/tripCompleted.ts',
        snippet: `// Producer emits a past-tense fact (via Outbox) — doesn't know who listens
await outbox.save('trip.completed', {
  eventId: crypto.randomUUID(),
  tripId: 'trip_42',
  fareCents: 1850,
});`,
      },
      watchOut: 'Always pair EDA with idempotent consumers because brokers deliver messages at least once.',
      relatedTerms: ['dlq', 'cqrs', 'cdc', 'sqs'],
    },
  },
  {
    id: 'bff',
    term: 'BFF',
    fullName: 'Backend-for-Frontend',
    shortTooltip: 'A thin aggregation layer tailored to one UI (web or mobile) that batches microservice calls.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'A BFF sits between a specific frontend app (e.g., Mobile vs. Admin Web) and your internal microservices, fetching from multiple services in parallel and shaping one clean payload.',
      howItsUsed: [
        'Replaces chatty browser waterfalls with 1 fast server-side batched request.',
        'Applies per-service timeouts and graceful fallbacks so one sick service never breaks the page.',
      ],
      example: {
        filename: 'home-bff/src/getHome.ts',
        snippet: `const [profile, recs] = await Promise.allSettled([
  fetchJsonWithTimeout('http://users-svc/me', 250),
  fetchJsonWithTimeout('http://recs-svc/picks', 250),
]);
return {
  profile: profile.status === 'fulfilled' ? profile.value : null,
  picks: recs.status === 'fulfilled' ? recs.value : TRENDING_FALLBACK,
};`,
      },
      relatedTerms: ['api', 'rest', 'grpc'],
    },
  },
  {
    id: 'cqrs',
    term: 'CQRS',
    fullName: 'Command Query Responsibility Segregation',
    shortTooltip: 'Separating write models (commands) from query-optimized read projections (views).',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'CQRS lets your write database stay clean and normalized while a separate read table (or search index) stays pre-joined and lightning-fast for complex dashboards and filtering.',
      howItsUsed: [
        'Syncing events from Billing and Users into one denormalized support dashboard table.',
        'Keeping heavy full-text search (OpenSearch) separate from transactional Postgres writes.',
      ],
      example: {
        filename: 'read-model/src/onInvoicePaid.ts',
        snippet: `// Event consumer updates a pre-joined read table optimized for fast UI queries
await readDb.query(
  \`INSERT INTO invoice_summary_view (invoice_id, user_name, status)
   VALUES ($1, $2, 'PAID')
   ON CONFLICT (invoice_id) DO UPDATE SET status = 'PAID'\`,
  [evt.invoiceId, evt.userName]
);`,
      },
      watchOut: 'You do not need full Event Sourcing to use CQRS — normal Postgres + an async read view is plenty.',
      relatedTerms: ['eda', 'bff', 'cdc'],
    },
  },
  {
    id: 'crud',
    term: 'CRUD',
    fullName: 'Create, Read, Update, Delete',
    shortTooltip: 'The four basic persistence operations performed on application data.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'CRUD describes standard data-management apps (like managing projects, invoices, or user profiles) where endpoints mostly create, fetch, update, and delete database rows.',
      howItsUsed: [
        'Maps naturally to HTTP methods: `POST` (Create), `GET` (Read), `PATCH`/`PUT` (Update), `DELETE` (Delete).',
        'Cohesive CRUD apps usually thrive in a Modular Monolith rather than distributed microservices.',
      ],
      example: {
        filename: 'src/modules/projects/routes.ts',
        snippet: `app.post('/projects', createProject);      // Create
app.get('/projects/:id', getProject);      // Read
app.patch('/projects/:id', updateProject); // Update
app.delete('/projects/:id', deleteProject);// Delete`,
      },
      relatedTerms: ['rest', 'acid', 'sql'],
    },
  },
  {
    id: 'dto',
    term: 'DTO',
    aliases: ['DTOs'],
    fullName: 'Data Transfer Object',
    shortTooltip: 'A plain, minimal data object passed across module or API boundaries instead of raw DB models.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'A DTO is a simple plain JSON/TypeScript shape (like `{ id, name, planTier }`) returned from a module or API so internal database columns, passwords, and ORM handles never leak out.',
      howItsUsed: [
        'Returned by `publicApi.ts` in a Modular Monolith so callers stay decoupled from ORM tables.',
        'Prevents accidentally exposing sensitive columns like `passwordHash` in HTTP responses.',
      ],
      example: {
        filename: 'src/modules/users/publicApi.ts',
        snippet: `export interface UserSummaryDto {
  id: string;
  displayName: string;
}

export async function getUserSummary(id: string): Promise<UserSummaryDto | null> {
  const row = await userRepo.findById(id);
  return row ? { id: row.id, displayName: row.display_name } : null;
}`,
      },
      relatedTerms: ['orm', 'api', 'pii'],
    },
  },
  {
    id: 'faas',
    term: 'FaaS',
    fullName: 'Function as a Service',
    shortTooltip: 'Cloud execution model (AWS Lambda, Cloudflare Workers) that runs stateless functions on demand.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'FaaS lets you deploy single functions triggered by HTTP requests, file uploads, or queues. The cloud handles scaling from zero to hundreds of instances and bills strictly per millisecond used.',
      howItsUsed: [
        'Spiky or intermittent jobs: image resizing, PDF exports, webhook intake, scheduled cron tasks.',
        'Not ideal for long-lived stateful WebSockets or steady 24/7 heavy compute.',
      ],
      example: {
        filename: 'functions/health.ts',
        snippet: `// Stateless handler — never rely on local RAM or /tmp surviving between runs
export async function handler() {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
}`,
      },
      relatedTerms: ['sdk', 's3', 'sqs', 'vpc'],
    },
  },
  {
    id: 'adr',
    term: 'ADR',
    aliases: ['ADRs'],
    fullName: 'Architecture Decision Record',
    shortTooltip: 'A short 1-page doc capturing why an architecture choice was made and when to revisit it.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'An ADR is a lightweight Markdown file committed right in your repo explaining the context, options considered, final choice, and concrete revisit triggers.',
      howItsUsed: [
        'Stops teams from endlessly re-debating why they chose a Modular Monolith or Kafka 6 months later.',
        'Defines measurable triggers (e.g., "extract Reports if PDF bursts push checkout p99 > 400ms").',
      ],
      example: {
        filename: 'docs/ADR-001-architecture.md',
        snippet: `# ADR-001: Start With a Modular Monolith
- Status: Accepted
- Context: 5 engineers, strong ACID billing needs, tight seed budget.
- Decision: Single TypeScript API + Postgres module schemas + BullMQ worker.
- Revisit When: Org exceeds ~30 devs or a slice needs 10x independent scaling.`,
      },
      relatedTerms: ['nfr', 'slo'],
    },
  },
  {
    id: 'nfr',
    term: 'NFR',
    aliases: ['NFRs'],
    fullName: 'Non-Functional Requirement',
    shortTooltip: 'System qualities like latency, uptime, throughput, security, and cost constraints.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'While functional requirements say *what* an app does ("book an appointment"), NFRs define *how well* it must run ("p95 under 250ms, 99.9% uptime, strict tenant isolation").',
      howItsUsed: [
        'NFRs—not features—are what actually dictate whether you need a Monolith, Microservices, Serverless, or EDA.',
        'Documented upfront inside every Architecture Decision Record (ADR).',
      ],
      example: {
        filename: 'docs/nfr-checklist.md',
        snippet: `- Throughput: ~25 avg QPS, ~150 peak QPS
- Latency: p95 < 250ms for checkout, async < 15s for PDF exports
- Consistency: Strong ACID for payments; eventual OK for emails
- Availability: 99.9% SLO (~43 min/month error budget)`,
      },
      relatedTerms: ['adr', 'qps', 'slo', 'p95'],
    },
  },
  {
    id: 'saas',
    term: 'SaaS',
    fullName: 'Software as a Service',
    shortTooltip: 'Cloud-hosted subscription software serving many customer organizations from shared infrastructure.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'A SaaS backend serves multiple paying customer companies ("tenants") from one deployed application, requiring strict tenant isolation and per-customer billing quotas.',
      howItsUsed: [
        'Every database query and Redis key is scoped by `org_id` / `tenant_id`.',
        'Usually starts as a Modular Monolith with PostgreSQL Row-Level Security (RLS).',
      ],
      example: {
        filename: 'src/repos/projects.ts',
        snippet: `// Always scope SaaS queries by the authenticated tenantId
export function listProjects(tenantId: string) {
  return db.query('SELECT id, name FROM projects WHERE tenant_id = $1', [tenantId]);
}`,
      },
      relatedTerms: ['rls', 'idor', 'rbac'],
    },
  },

  // =========================================================================
  // DATA, DATABASES & STREAMING
  // =========================================================================
  {
    id: 'acid',
    term: 'ACID',
    fullName: 'Atomicity, Consistency, Isolation, Durability',
    shortTooltip: 'Database transaction guarantees ensuring multi-step writes succeed or roll back cleanly together.',
    category: 'data',
    drawer: {
      plainEnglish:
        'ACID means a database transaction is all-or-nothing (Atomic), keeps rules valid (Consistent), prevents concurrent writers from corrupting each other (Isolated), and survives power loss once committed (Durable).',
      howItsUsed: [
        'Money transfers, seat bookings, and saving an order + Outbox row in one guaranteed step.',
        'Easy inside a single SQL database; requires Sagas when split across microservice databases.',
      ],
      example: {
        filename: 'src/modules/billing/transfer.ts',
        snippet: `await db.transaction(async (tx) => {
  await tx.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
  await tx.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
  // If line 2 fails, line 1 rolls back automatically — zero lost money!
});`,
      },
      relatedTerms: ['sql', 'wal', 'cap'],
    },
  },
  {
    id: 'sql',
    term: 'SQL',
    fullName: 'Structured Query Language',
    shortTooltip: 'Standard language for querying and mutating relational databases like PostgreSQL and SQLite.',
    category: 'data',
    drawer: {
      plainEnglish:
        'SQL databases store structured data in tables with schemas, indexes, joins, and strong ACID transactions—making PostgreSQL the strongest default database for most backends.',
      howItsUsed: [
        'Core business data: users, orders, billing, permissions, and transactional Outbox tables.',
        'Always use parameterized placeholders (`$1`, `$2`) instead of string interpolation to stop SQL injection.',
      ],
      example: {
        filename: 'src/repos/findOrder.ts',
        snippet: `// Parameterized SQL prevents SQL injection automatically
const order = await db.queryOne(
  'SELECT id, total_cents, status FROM orders WHERE id = $1 AND org_id = $2',
  [orderId, orgId]
);`,
      },
      watchOut: 'Never concatenate user input into SQL strings (`WHERE id = "${input}"`).',
      relatedTerms: ['acid', 'nosql', 'rls', 'orm'],
    },
  },
  {
    id: 'nosql',
    term: 'NoSQL',
    fullName: 'Non-Relational Database',
    shortTooltip: 'Schema-flexible stores (DynamoDB, MongoDB, Redis, Cassandra) optimized for specific access patterns.',
    category: 'data',
    drawer: {
      plainEnglish:
        'NoSQL covers key-value, document, wide-column, and graph databases built for ultra-fast predictable lookups or massive horizontal scale—trading away flexible SQL joins.',
      howItsUsed: [
        'High-scale key lookups like video watch progress, session caches, or IoT time-series data.',
        'Design tables around your exact query patterns upfront rather than ad-hoc joins.',
      ],
      example: {
        filename: 'playback-svc/src/saveProgress.ts',
        snippet: `// Fast key-value / document write keyed directly by userId + videoId
await dynamo.putItem({
  TableName: 'watch_progress',
  Item: { pk: \`USER#\${userId}\`, sk: \`VIDEO#\${videoId}\`, positionSec: 842 },
});`,
      },
      relatedTerms: ['sql', 'kv', 'cap'],
    },
  },
  {
    id: 'db',
    term: 'DB',
    aliases: ['DBs'],
    fullName: 'Database',
    shortTooltip: 'Persistent storage engine where your application’s durable state lives.',
    category: 'data',
    drawer: {
      plainEnglish:
        'A database stores durable state outside your stateless app containers so restarts, crashes, and horizontal scaling never lose user data.',
      howItsUsed: [
        'Use a connection pool (`Pool`) so requests reuse TCP connections instead of reconnecting every call.',
        'Keep strict ownership: per-module schemas in a Modular Monolith, or private DBs per Microservice.',
      ],
      example: {
        filename: 'src/shared/db.ts',
        snippet: `import { Pool } from 'pg';

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  statement_timeout: 5_000,
});`,
      },
      relatedTerms: ['sql', 'nosql', 'rds', 'acid'],
    },
  },
  {
    id: 'rls',
    term: 'RLS',
    fullName: 'Row-Level Security',
    shortTooltip: 'PostgreSQL engine rule that automatically filters every query by the current tenant ID.',
    category: 'data',
    drawer: {
      plainEnglish:
        'PostgreSQL RLS enforces multi-tenant isolation inside the database itself so even if a developer forgets `WHERE tenant_id = $1`, Postgres refuses to return another customer’s rows.',
      howItsUsed: [
        'Define a `CREATE POLICY` referencing `current_setting("app.tenant_id", true)`.',
        'Set the tenant context with transaction-scoped `SET LOCAL` (safe with PgBouncer/RDS Proxy!).',
      ],
      example: {
        filename: 'src/shared/withTenant.ts',
        snippet: `// Migration: ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
// CREATE POLICY p_tenant ON projects USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

export async function withTenant<T>(tenantId: string, fn: (tx: Db) => Promise<T>) {
  return db.transaction(async (tx) => {
    await tx.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]); // SET LOCAL
    return fn(tx);
  });
}`,
      },
      watchOut: 'Never use session-wide `SET` through transaction-mode poolers — always use `SET LOCAL` inside a transaction.',
      relatedTerms: ['saas', 'idor', 'sql', 'rds'],
    },
  },
  {
    id: 'orm',
    term: 'ORM',
    fullName: 'Object-Relational Mapper',
    shortTooltip: 'Library (Prisma, Drizzle, TypeORM) that maps database tables to typed code objects.',
    category: 'data',
    drawer: {
      plainEnglish:
        'An ORM lets you query SQL tables with TypeScript autocomplete and migrations instead of hand-writing boilerplate SQL—just watch out for hidden N+1 queries and giant shared entity classes.',
      howItsUsed: [
        'Speeds up CRUD development and catches column typos at compile time.',
        'Keep ORM models private inside each module and return plain DTOs across boundaries.',
      ],
      example: {
        filename: 'src/modules/projects/repo.ts',
        snippet: `// Typed ORM query scoped strictly to one module & tenant
const projects = await prisma.project.findMany({
  where: { orgId },
  select: { id: true, name: true }, // return minimal fields, not full relations
  take: 50,
});`,
      },
      watchOut: 'Avoid importing one giant 40-column ORM `User` model across every module.',
      relatedTerms: ['sql', 'dto', 'fk'],
    },
  },
  {
    id: 'fk',
    term: 'FK',
    aliases: ['FKs'],
    fullName: 'Foreign Key',
    shortTooltip: 'A SQL constraint linking a column in one table to the primary key of another table.',
    category: 'data',
    drawer: {
      plainEnglish:
        'A Foreign Key tells SQL to guarantee referential integrity (e.g., an `order.user_id` must point to a real row in `users`). Great inside one module; remove cross-module FKs before extracting a microservice.',
      howItsUsed: [
        'Keeps related tables inside the same domain module consistent automatically.',
        'Replaced by plain ID references + API/event validation when splitting databases.',
      ],
      example: {
        filename: 'migrations/002_tasks.sql',
        snippet: `CREATE TABLE projects_tasks (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects_boards(id) ON DELETE CASCADE,
  assignee_user_id UUID NOT NULL -- no cross-module FK to auth.users!
);`,
      },
      relatedTerms: ['sql', 'acid', 'orm'],
    },
  },
  {
    id: 'cdc',
    term: 'CDC',
    fullName: 'Change Data Capture',
    shortTooltip: 'Streaming committed database inserts/updates straight from the DB log into a broker.',
    category: 'data',
    drawer: {
      plainEnglish:
        'Tools like Debezium read PostgreSQL’s internal Write-Ahead Log (WAL) and automatically stream committed row changes to Kafka with sub-second latency and zero polling load on your primary DB.',
      howItsUsed: [
        'High-scale upgrade from polling an `outbox_events` table.',
        'Syncing legacy monolith tables into a brand-new microservice database during Strangler Fig migration.',
      ],
      example: {
        filename: 'debezium/outbox-connector.json',
        snippet: `{
  "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
  "table.include.list": "public.outbox_events",
  "transforms": "outbox",
  "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter"
}`,
      },
      relatedTerms: ['wal', 'eda', 'cqrs'],
    },
  },
  {
    id: 'wal',
    term: 'WAL',
    fullName: 'Write-Ahead Log',
    shortTooltip: 'Append-only journal databases write to first for crash recovery, replication, and CDC.',
    category: 'data',
    drawer: {
      plainEnglish:
        'Before PostgreSQL modifies table pages on disk, it appends the change to its sequential WAL. That single log powers crash recovery, Read Replicas, point-in-time backups, and Debezium CDC.',
      howItsUsed: [
        'Guarantees Durability in ACID transactions if power fails mid-write.',
        'Streamed asynchronously to Read Replicas (causing brief replication lag) and CDC connectors.',
      ],
      example: {
        filename: 'postgresql.conf',
        snippet: `# Required to stream row changes to Read Replicas & Debezium CDC
wal_level = logical
archive_mode = on   # enables point-in-time recovery (low RPO)`,
      },
      relatedTerms: ['cdc', 'acid', 'rpo'],
    },
  },
  {
    id: 'cap',
    term: 'CAP',
    fullName: 'Consistency, Availability, Partition Tolerance',
    shortTooltip: 'During a network split between DB nodes, distributed stores must pick Consistency (CP) or Availability (AP).',
    category: 'data',
    drawer: {
      plainEnglish:
        'Networks always drop packets eventually (Partition Tolerance is mandatory), so during a split a distributed database must choose: reject writes to stay strictly accurate (CP), or keep accepting writes and reconcile later (AP).',
      howItsUsed: [
        'Pick **CP** for payments, seat inventory, and RBAC permissions where stale writes cause real damage.',
        'Pick **AP** for caches, view counters, and social feeds where staying online beats instant perfection.',
      ],
      example: {
        filename: 'docs/consistency-matrix.ts',
        snippet: `const CONSISTENCY_BY_FEATURE = {
  payments: 'CP (Primary Postgres ACID — reject if primary unreachable)',
  seatBooking: 'CP (Atomic conditional SQL UPDATE)',
  viewCounters: 'AP (Redis / async batch sync — brief lag is fine)',
};`,
      },
      relatedTerms: ['cp', 'ap', 'acid', 'nosql'],
    },
  },
  {
    id: 'cp',
    term: 'CP',
    fullName: 'Consistency + Partition Tolerance',
    shortTooltip: 'CAP mode that refuses potentially stale writes during a network split to keep data exact.',
    category: 'data',
    drawer: {
      plainEnglish:
        'A CP system prioritizes correctness over uptime during a network partition: if nodes cannot confirm quorum/primary agreement, it returns an error rather than risking double-spends or split-brain corruption.',
      howItsUsed: [
        'Financial ledgers, promo seat pools, and security permission checks.',
        'Implemented via a single strongly consistent primary SQL database or Raft/Paxos quorum.',
      ],
      example: {
        filename: 'src/billing/debit.ts',
        snippet: `// CP write: strictly hits primary DB; fails closed if primary is unreachable
const row = await primaryDb.queryOne(
  'UPDATE wallets SET cents = cents - $1 WHERE id = $2 AND cents >= $1 RETURNING cents',
  [amountCents, walletId]
);`,
      },
      relatedTerms: ['cap', 'ap', 'acid'],
    },
  },
  {
    id: 'ap',
    term: 'AP',
    fullName: 'Availability + Partition Tolerance',
    shortTooltip: 'CAP mode that stays online and accepts reads/writes during a network split, reconciling later.',
    category: 'data',
    drawer: {
      plainEnglish:
        'An AP system keeps serving requests even if replicas fall out of sync during a network blip—trading instant accuracy for uptime via eventual consistency.',
      howItsUsed: [
        'Product recommendation carousels, analytics counters, DNS caches, and read replicas.',
        'Pair with idempotent merges or timestamps so nodes converge cleanly once healed.',
      ],
      example: {
        filename: 'src/recs/getPicks.ts',
        snippet: `// AP fallback: serve slightly stale cached list rather than showing a 500 error
const picks = await fetchRecs().catch(() => cache.getStale('trending:global'));`,
      },
      relatedTerms: ['cap', 'cp', 'ttl'],
    },
  },
  {
    id: 'kv',
    term: 'KV',
    fullName: 'Key-Value Store',
    shortTooltip: 'Ultra-fast lookup store (Redis, Cloudflare KV) mapping simple string keys to values.',
    category: 'data',
    drawer: {
      plainEnglish:
        'A Key-Value store acts like a networked hash map (`get(key)` / `set(key, val)`) with sub-millisecond reads—ideal for caches, sessions, rate-limit buckets, and feature flags.',
      howItsUsed: [
        'Cache-Aside layer in front of Postgres with a TTL + jitter.',
        'Shared stateless session store and Redis Pub/Sub fan-out across horizontally scaled servers.',
      ],
      example: {
        filename: 'src/shared/cache.ts',
        snippet: `// Prefix keys by tenant & domain, and always attach a TTL!
await redis.set(\`tenant:\${orgId}:plan\`, JSON.stringify(plan), 'EX', 300);
const cached = await redis.get(\`tenant:\${orgId}:plan\`);`,
      },
      relatedTerms: ['ttl', 'nosql', 'cdn'],
    },
  },
  {
    id: 'ttl',
    term: 'TTL',
    fullName: 'Time To Live',
    shortTooltip: 'Expiration duration (in seconds) after which a cached key or token automatically vanishes.',
    category: 'data',
    drawer: {
      plainEnglish:
        'TTL tells Redis, CDNs, or DNS how long a cached copy stays valid before expiring—guaranteeing stale data self-heals and memory does not fill up forever.',
      howItsUsed: [
        'Add small random jitter (`300 + random(0..30)`) so bulk-loaded keys do not expire at the exact same second.',
        'Used on short-lived JWTs and revocation keys so security state expires automatically.',
      ],
      example: {
        filename: 'src/shared/setWithJitter.ts',
        snippet: `export function setCached(key: string, value: unknown, baseSeconds = 300) {
  const jitter = Math.floor(Math.random() * 30);
  return redis.set(key, JSON.stringify(value), 'EX', baseSeconds + jitter);
}`,
      },
      relatedTerms: ['kv', 'cdn', 'jwt'],
    },
  },
  {
    id: 'dlq',
    term: 'DLQ',
    aliases: ['DLQs'],
    fullName: 'Dead Letter Queue',
    shortTooltip: 'A side queue where repeatedly failing or malformed ("poison pill") messages move safely.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'A DLQ catches messages that fail validation or exhaust their retry limit so one broken payload cannot stall an entire queue partition forever.',
      howItsUsed: [
        'Route permanent schema errors straight to the DLQ; retry transient 503 errors N times first.',
        'Attach an automated alert on `dlq_depth > 0`, fix the bug, and redrive messages safely.',
      ],
      example: {
        filename: 'src/workers/consume.ts',
        snippet: `try {
  await processOrder(OrderSchema.parse(msg.body));
} catch (err) {
  if (err instanceof ZodError || msg.attempts >= 3) {
    await queue.send('orders.dlq', { original: msg.body, error: String(err) });
    return; // ack so healthy messages keep flowing
  }
  throw err; // retry transient failure
}`,
      },
      relatedTerms: ['eda', 'sqs', 'fifo'],
    },
  },
  {
    id: 'sqs',
    term: 'SQS',
    fullName: 'Amazon Simple Queue Service',
    shortTooltip: 'Managed point-to-point message queue that buffers background jobs for workers.',
    category: 'data',
    drawer: {
      plainEnglish:
        'SQS is a fully managed job queue: producers push jobs, workers poll and delete each job once finished, and failed jobs automatically retry and move to a Dead Letter Queue.',
      howItsUsed: [
        'Smooths out spiky workloads in Serverless & Modular Monolith apps without managing brokers.',
        'Use Standard SQS for high throughput (at-least-once) or SQS FIFO when per-entity ordering matters.',
      ],
      example: {
        filename: 'src/shared/enqueue.ts',
        snippet: `await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.JOBS_QUEUE_URL,
  MessageBody: JSON.stringify({ eventId: crypto.randomUUID(), assetId }),
}));`,
      },
      relatedTerms: ['sns', 'fifo', 'dlq', 'faas'],
    },
  },
  {
    id: 'sns',
    term: 'SNS',
    fullName: 'Amazon Simple Notification Service',
    shortTooltip: 'Managed Pub/Sub topic that broadcasts each event to multiple subscribed queues at once.',
    category: 'data',
    drawer: {
      plainEnglish:
        'SNS fans out one published event to many subscribers simultaneously—most commonly paired with one SQS queue per consumer ("SNS + SQS fan-out") so each consumer buffers and retries independently.',
      howItsUsed: [
        'Lightweight managed Event-Driven fan-out without operating a Kafka cluster.',
        'Note: unlike Kafka, SNS does not retain past events for late subscribers to replay.',
      ],
      example: {
        filename: 'src/events/publishOrder.ts',
        snippet: `// 1 publish fans out to Payments SQS, Receipts SQS, and Analytics SQS
await sns.send(new PublishCommand({
  TopicArn: process.env.ORDER_TOPIC_ARN,
  Message: JSON.stringify({ eventType: 'OrderPlaced', orderId }),
}));`,
      },
      relatedTerms: ['sqs', 'eda', 'dlq'],
    },
  },
  {
    id: 'fifo',
    term: 'FIFO',
    fullName: 'First-In, First-Out',
    shortTooltip: 'Queue ordering mode that delivers messages strictly in the order they were sent per group.',
    category: 'data',
    drawer: {
      plainEnglish:
        'A FIFO queue preserves strict order within each `MessageGroupId` (e.g., `tripId`), ensuring `TripStarted` is processed before `TripCompleted` for the same ride.',
      howItsUsed: [
        'Set `MessageGroupId` to the entity ID (`orderId` / `tripId`) so different entities still run in parallel.',
        'Always still guard state transitions defensively in SQL in case a message is redriven from a DLQ.',
      ],
      example: {
        filename: 'src/events/sendFifo.ts',
        snippet: `await sqs.send(new SendMessageCommand({
  QueueUrl: process.env.TRIPS_FIFO_URL,
  MessageGroupId: trip.id,        // ordered per trip, parallel across trips
  MessageDeduplicationId: eventId,
  MessageBody: JSON.stringify(tripEvent),
}));`,
      },
      relatedTerms: ['sqs', 'eda', 'dlq'],
    },
  },
  {
    id: 's3',
    term: 'S3',
    aliases: ['R2'],
    fullName: 'Object Storage (AWS S3 / Cloudflare R2)',
    shortTooltip: 'Durable, cheap cloud blob storage for images, PDFs, backups, and Claim Check payloads.',
    category: 'data',
    drawer: {
      plainEnglish:
        'Object storage (Amazon S3, Cloudflare R2, GCS) stores arbitrary files (images, PDFs, exports) outside your servers so app containers stay stateless and message brokers stay lightweight.',
      howItsUsed: [
        'Use Presigned URLs so browsers upload large files straight to S3/R2 (bypassing API payload caps).',
        'Powers the Claim Check pattern: store 15MB files in S3 and pass only the small object key through Kafka/SQS.',
      ],
      example: {
        filename: 'src/storage/claimCheck.ts',
        snippet: `const key = \`uploads/\${assetId}.pdf\`;
await s3.putObject({ Bucket: BUCKET, Key: key, Body: pdfBuffer });
// Send tiny storage key in the event — never the 15MB binary!
await queue.send({ type: 'PDF_UPLOADED', assetId, storageKey: key });`,
      },
      watchOut: 'When triggering serverless functions on S3 uploads, write outputs to a different prefix (`processed/`) to prevent infinite billing loops!',
      relatedTerms: ['uri', 'faas', 'eda'],
    },
  },
  {
    id: 'rds',
    term: 'RDS',
    fullName: 'Amazon Relational Database Service',
    shortTooltip: 'Managed cloud SQL database service (Postgres/MySQL) with automated backups and Multi-AZ failover.',
    category: 'data',
    drawer: {
      plainEnglish:
        'Managed SQL services like AWS RDS handle OS patching, automated backups, Read Replicas, and Multi-AZ failover—and pair with RDS Proxy / PgBouncer to pool thousands of serverless connections safely.',
      howItsUsed: [
        'Point Serverless functions at a pooled proxy URL (`RDS Proxy` / `PgBouncer`) instead of opening direct TCP connections per invocation.',
        'Enable Multi-AZ for automatic failover without manual intervention.',
      ],
      example: {
        filename: 'src/shared/dbPool.ts',
        snippet: `const pool = new Pool({
  connectionString: process.env.RDS_PROXY_URL, // pools 500 Lambdas into ~20 DB conns
  max: 2,
});`,
      },
      relatedTerms: ['db', 'rls', 'multi-az', 'vpc'],
    },
  },
  {
    id: 'json',
    term: 'JSON',
    aliases: ['JSONB'],
    fullName: 'JavaScript Object Notation',
    shortTooltip: 'Lightweight human-readable text format for API payloads, logs, and event envelopes.',
    category: 'data',
    drawer: {
      plainEnglish:
        'JSON is the universal data format for REST APIs, structured logs, and event messages (`JSONB` is PostgreSQL’s fast binary-indexed JSON column type).',
      howItsUsed: [
        'Always validate incoming untrusted JSON at API/consumer boundaries using a schema library like Zod.',
        'Keep JSON schema changes additive-only (add optional fields; never rename/drop live fields).',
      ],
      example: {
        filename: 'src/schemas/order.ts',
        snippet: `import { z } from 'zod';

export const CreateOrderSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});`,
      },
      relatedTerms: ['rest', 'api', 'grpc'],
    },
  },

  // =========================================================================
  // NETWORKING, PROTOCOLS & REALTIME
  // =========================================================================
  {
    id: 'http',
    term: 'HTTP',
    aliases: ['HTTPS'],
    fullName: 'Hypertext Transfer Protocol (Secure)',
    shortTooltip: 'Request-response web protocol (HTTPS adds TLS encryption) used by APIs and browsers.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'HTTP is the request-response protocol powering web APIs (`GET`, `POST`, `PATCH`, `DELETE`) with standard status codes (`200`, `202`, `401`, `409`, `429`, `503`). HTTPS wraps HTTP inside TLS encryption.',
      howItsUsed: [
        'Return `202 Accepted` when offloading slow jobs to a background queue.',
        'Always set strict timeouts (`AbortSignal.timeout`) on outbound HTTP calls between services.',
      ],
      example: {
        filename: 'src/shared/http.ts',
        snippet: `const resp = await fetch('https://api.example.com/v1/orders', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'idempotency-key': idemKey },
  body: JSON.stringify({ itemId }),
  signal: AbortSignal.timeout(500),
});`,
      },
      relatedTerms: ['rest', 'tls', 'sse', 'cors'],
    },
  },
  {
    id: 'rest',
    term: 'REST',
    fullName: 'Representational State Transfer',
    shortTooltip: 'Resource-oriented HTTP API style using standard verbs (GET/POST/PATCH/DELETE) and JSON.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'REST structures APIs around nouns/resources (`/invoices`, `/books/:id`) and standard HTTP verbs + status codes, giving you universal tooling and built-in HTTP caching for free.',
      howItsUsed: [
        'Best default for public APIs, web/mobile backends, and straightforward internal services.',
        'Version breaking changes explicitly (`/v1/`, `/v2/`) and evolve payloads additively.',
      ],
      example: {
        filename: 'src/routes/invoices.ts',
        snippet: `app.get('/v1/invoices', listInvoices);        // 200 OK
app.post('/v1/invoices', createInvoice);      // 201 Created (or 202 Accepted)
app.get('/v1/invoices/:id', getInvoice);      // 200 OK or 404 Not Found`,
      },
      relatedTerms: ['http', 'json', 'grpc', 'crud'],
    },
  },
  {
    id: 'grpc',
    term: 'gRPC',
    fullName: 'Google Remote Procedure Call',
    shortTooltip: 'High-speed binary RPC protocol over HTTP/2 with strict Protobuf contracts and deadlines.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'gRPC lets internal microservices call each other like typed functions over HTTP/2 using compact binary Protobuf serialization—faster than JSON and built with native deadline propagation.',
      howItsUsed: [
        'Ideal for high-throughput internal service-to-service hops across polyglot teams (Go, TypeScript, Python).',
        'Not directly browser-friendly—keep REST or GraphQL at the public edge.',
      ],
      example: {
        filename: 'proto/billing.proto',
        snippet: `syntax = "proto3";
service BillingService {
  rpc GetEntitlement (EntitlementRequest) returns (EntitlementReply);
}
message EntitlementRequest { string user_id = 1; }
message EntitlementReply { string max_quality = 1; }`,
      },
      relatedTerms: ['rpc', 'rest', 'http'],
    },
  },
  {
    id: 'rpc',
    term: 'RPC',
    aliases: ['RPCs'],
    fullName: 'Remote Procedure Call',
    shortTooltip: 'Calling a function on another networked server as if it were a local method.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'RPC models communication as action verbs (`chargeCard()`, `reserveSeat()`) over a network—used by gRPC, tRPC, and JSON-RPC.',
      howItsUsed: [
        'Great for tight internal service contracts where strict generated types beat REST conventions.',
        'Remember: unlike a local function call, a remote RPC can hang, time out, or partially succeed!',
      ],
      example: {
        filename: 'src/clients/billingRpc.ts',
        snippet: `// Always pass a strict deadline on any remote RPC call
const entitlement = await billingRpc.getEntitlement(
  { userId },
  { deadline: Date.now() + 300 }
);`,
      },
      relatedTerms: ['grpc', 'rest', 'http'],
    },
  },
  {
    id: 'apq',
    term: 'APQ',
    fullName: 'Automatic Persisted Queries',
    shortTooltip: 'GraphQL technique sending a short query hash over HTTP GET so CDNs can cache responses.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'Standard GraphQL sends large `POST` bodies that CDNs cannot cache. APQ lets clients send a tiny SHA-256 hash over `GET`, shrinking request sizes and enabling edge CDN caching.',
      howItsUsed: [
        'Enabled in GraphQL BFF servers (like Apollo/Yoga) alongside `Cache-Control` headers.',
        'Pairs well with query depth limits and persisted-query allowlists in production.',
      ],
      example: {
        filename: 'graphql-bff/src/server.ts',
        snippet: `const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: { ttl: 900 }, // clients query via GET + SHA-256 hash
});`,
      },
      relatedTerms: ['cdn', 'bff', 'sha-256'],
    },
  },
  {
    id: 'sse',
    term: 'SSE',
    fullName: 'Server-Sent Events',
    shortTooltip: 'One-way open HTTP stream allowing a server to push live updates (like AI tokens) to browsers.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'SSE streams real-time text events from server to browser over plain HTTP with automatic browser reconnection—far simpler than WebSockets when you only need server-to-client push.',
      howItsUsed: [
        'LLM token streaming, live job progress bars after `202 Accepted`, and notification feeds.',
        'Works cleanly over standard HTTP/2 proxies and load balancers.',
      ],
      example: {
        filename: 'src/routes/streamJob.ts',
        snippet: `app.get('/jobs/:id/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.write(\`data: \${JSON.stringify({ status: 'processing', pct: 40 })}\\n\\n\`);
});`,
      },
      relatedTerms: ['ws', 'http', 'ttft', 'llm'],
    },
  },
  {
    id: 'ws',
    term: 'WS',
    fullName: 'WebSockets',
    shortTooltip: 'Persistent two-way TCP connection between client and server for low-latency live apps.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'WebSockets upgrade an HTTP request into a long-lived, two-way channel so both client and server can push messages instantaneously (chat, collaborative cursors, multiplayer games).',
      howItsUsed: [
        'When running 2+ servers, broadcast room messages across nodes using Redis Pub/Sub.',
        'Drain sockets in staggered batches during deploys and reconnect clients with jittered backoff.',
      ],
      example: {
        filename: 'src/realtime/roomHub.ts',
        snippet: `// Cross-server fan-out so User A on Pod 1 reaches User B on Pod 2
ws.on('message', (raw) => redisPub.publish(\`room:\${roomId}\`, raw.toString()));
redisSub.on('message', (channel, msg) => broadcastLocalSockets(channel, msg));`,
      },
      relatedTerms: ['sse', 'tcp', 'kv'],
    },
  },
  {
    id: 'cdn',
    term: 'CDN',
    aliases: ['CDNs'],
    fullName: 'Content Delivery Network',
    shortTooltip: 'Global edge servers that cache static files and public GET API responses close to users.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'A CDN (Cloudflare, CloudFront, Fastly) places edge servers worldwide so users fetch images, JS bundles, and cacheable public GET responses from ~15ms away instead of crossing an ocean.',
      howItsUsed: [
        'Controlled via `Cache-Control` headers (`public, s-maxage=60, stale-while-revalidate=30`).',
        'Dramatically cuts database load and egress bills for read-heavy public pages.',
      ],
      example: {
        filename: 'src/routes/publicCatalog.ts',
        snippet: `// Public route: CDN caches for 60s
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
// Private route: ALWAYS prevent shared CDN caching!
// res.setHeader('Cache-Control', 'private, no-store');`,
      },
      watchOut: 'Never allow a shared CDN to cache authenticated user-specific responses.',
      relatedTerms: ['ttl', 'kv', 'waf', 'http'],
    },
  },
  {
    id: 'dns',
    term: 'DNS',
    fullName: 'Domain Name System',
    shortTooltip: 'Phonebook translating human names (`billing-svc`, `api.site.com`) into live server IP addresses.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'DNS maps stable service names to dynamic container/server IPs. Inside Kubernetes or cloud VPCs, internal DNS automatically routes `http://billing-svc` only to pods passing Readiness checks.',
      howItsUsed: [
        'Default service discovery in Microservices before ever considering a complex Service Mesh.',
        'Controls public failover and Blue-Green or regional traffic routing.',
      ],
      example: {
        filename: 'src/clients/billingClient.ts',
        snippet: `// Call the stable cluster DNS name — never hardcode container IP addresses!
const resp = await fetch('http://billing-svc/v1/entitlements/' + userId, {
  signal: AbortSignal.timeout(400),
});`,
      },
      relatedTerms: ['ip', 'lb', 'l7'],
    },
  },
  {
    id: 'l4',
    term: 'L4',
    fullName: 'Layer 4 (Transport Load Balancing)',
    shortTooltip: 'Fast TCP/UDP packet routing that forwards connections without inspecting HTTP paths or headers.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'An L4 Load Balancer operates at the TCP/UDP transport layer—forwarding raw connections with ultra-low latency because it does not parse HTTP URLs, cookies, or JWTs.',
      howItsUsed: [
        'Ideal for raw TCP workloads (databases, Kafka brokers, high-throughput WebSocket/game servers).',
        'Pair with L7 when you need path routing like `/api/billing/*` vs. `/api/reports/*`.',
      ],
      example: {
        filename: 'infra/lb-choice.md',
        snippet: `# L4 (TCP) -> forwards port 443/5432 directly to healthy targets (fastest)
# L7 (HTTP) -> inspects URL path (/api/reports/*) & headers to route per service`,
      },
      relatedTerms: ['l7', 'lb', 'tcp'],
    },
  },
  {
    id: 'l7',
    term: 'L7',
    fullName: 'Layer 7 (Application Load Balancing)',
    shortTooltip: 'HTTP-aware load balancer/proxy that routes traffic by URL path, headers, or host.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'An L7 Load Balancer (ALB, NGINX, Envoy, API Gateway) reads HTTP paths and headers—allowing it to route `/api/reports/*` to an extracted worker while `/api/*` stays on your monolith.',
      howItsUsed: [
        'Foundation of the Strangler Fig migration pattern (shift one route at a time with zero client changes).',
        'Powers Canary percentage splits (95% v1 / 5% v2) and edge TLS termination.',
      ],
      example: {
        filename: 'gateway/nginx.conf',
        snippet: `location /api/reports/ { proxy_pass http://report-worker:3002; }
location /api/         { proxy_pass http://core-monolith:3001; }`,
      },
      relatedTerms: ['l4', 'lb', 'http', 'tls'],
    },
  },
  {
    id: 'lb',
    term: 'LB',
    fullName: 'Load Balancer',
    shortTooltip: 'Traffic distributor spreading incoming requests across multiple healthy stateless replicas.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'A Load Balancer sits in front of your backend instances, checks each server’s `/readyz` endpoint, and sends live traffic only to healthy replicas—enabling horizontal scaling and zero-downtime deploys.',
      howItsUsed: [
        'Flips traffic instantaneously in Blue-Green deployments or gradually in Canary rollouts.',
        'Requires backend servers to be stateless (no local in-memory sessions or disk uploads).',
      ],
      example: {
        filename: 'src/routes/readyz.ts',
        snippet: `// LB stops routing traffic here the moment /readyz returns 503 during deploy
app.get('/readyz', (_req, res) => {
  res.status(isShuttingDown ? 503 : 200).json({ ready: !isShuttingDown });
});`,
      },
      relatedTerms: ['l7', 'l4', 'sigterm'],
    },
  },
  {
    id: 'tcp',
    term: 'TCP',
    fullName: 'Transmission Control Protocol',
    shortTooltip: 'Reliable byte-stream transport layer under HTTP, WebSockets, and SQL database connections.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'TCP guarantees ordered, reliable packet delivery—but opening a brand-new TCP + TLS handshake takes multiple round-trips (50–200ms), which is why reusing connection pools is essential.',
      howItsUsed: [
        'Reuse HTTP Keep-Alive agents and Postgres connection pools instead of reconnecting per request.',
        'Critical in Serverless functions where 300 concurrent invocations opening raw TCP sockets will exhaust Postgres.',
      ],
      example: {
        filename: 'functions/dbPool.ts',
        snippet: `// Initialize Pool ONCE at module scope so warm runs reuse TCP sockets
const pool = new Pool({ connectionString: process.env.POOLED_DATABASE_URL, max: 2 });`,
      },
      relatedTerms: ['tls', 'http', 'rds'],
    },
  },
  {
    id: 'tls',
    term: 'TLS',
    fullName: 'Transport Layer Security',
    shortTooltip: 'Cryptographic protocol encrypting traffic in transit (the "S" in HTTPS).',
    category: 'security',
    drawer: {
      plainEnglish:
        'TLS encrypts data traveling across the internet or internal networks and verifies server identity via digital certificates so attackers cannot eavesdrop or tamper with requests.',
      howItsUsed: [
        'Terminated at your CDN, Load Balancer, or API Gateway for public HTTPS traffic.',
        'Upgrade to mutual TLS (mTLS) when both caller and server must prove identity.',
      ],
      example: {
        filename: 'src/shared/dbSsl.ts',
        snippet: `const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }, // always verify server certificates in prod!
});`,
      },
      relatedTerms: ['mtls', 'http', 'tcp'],
    },
  },
  {
    id: 'mtls',
    term: 'mTLS',
    fullName: 'Mutual Transport Layer Security',
    shortTooltip: 'Two-way TLS where both the calling microservice and receiving server verify each other’s certificates.',
    category: 'security',
    drawer: {
      plainEnglish:
        'In standard HTTPS/TLS only the server proves its identity. With mTLS, the calling service also presents a signed client certificate—preventing unauthorized internal traffic even inside a private network.',
      howItsUsed: [
        'Secures sensitive service-to-service traffic (e.g., Fintech PCI zones) automatically via a Service Mesh or internal CA.',
      ],
      example: {
        filename: 'src/clients/mtlsAgent.ts',
        snippet: `import { Agent } from 'undici';

export const mtlsDispatcher = new Agent({
  connect: { cert: clientCertPem, key: clientKeyPem, ca: internalRootCaPem },
});`,
      },
      relatedTerms: ['tls', 'pci', 'iam'],
    },
  },
  {
    id: 'cors',
    term: 'CORS',
    fullName: 'Cross-Origin Resource Sharing',
    shortTooltip: 'Browser security headers controlling which frontend domains may call your backend API.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'Browsers block JavaScript on `app.example.com` from reading responses from `api.example.com` unless the backend explicitly returns `Access-Control-Allow-Origin` for trusted origins.',
      howItsUsed: [
        'Whitelist your exact frontend origins instead of `*` whenever cookies or auth headers are sent.',
      ],
      example: {
        filename: 'src/middleware/cors.ts',
        snippet: `app.register(cors, {
  origin: ['https://app.pulseboard.io'],
  credentials: true,
});`,
      },
      relatedTerms: ['http', 'api'],
    },
  },
  {
    id: 'ip',
    term: 'IP',
    fullName: 'Internet Protocol (Address)',
    shortTooltip: 'Numeric network address identifying a client or server machine on a network.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'Every device and container communicates using an IP address. In cloud clusters, container IPs change every deploy—so always connect via DNS names and key edge rate limits by client IP + user ID.',
      howItsUsed: [
        'Rate-limiting anonymous login/public endpoints per client IP to block scrapers and bots.',
        'Configure `trust proxy` carefully so attackers cannot spoof `X-Forwarded-For` headers.',
      ],
      example: {
        filename: 'src/middleware/rateLimit.ts',
        snippet: `// Key anonymous rate limits by verified proxy IP (never raw spoofable headers)
const bucketKey = \`rl:ip:\${req.ip}\`;
const count = await redis.incr(bucketKey);
if (count === 1) await redis.expire(bucketKey, 60);
if (count > 100) return res.status(429).json({ error: 'Too many requests' });`,
      },
      relatedTerms: ['dns', 'waf', 'ddos'],
    },
  },
  {
    id: 'uri',
    term: 'URI',
    aliases: ['URL', 'URLs'],
    fullName: 'Uniform Resource Identifier / Locator',
    shortTooltip: 'Address string pointing to a web endpoint (`https://...`) or storage object (`s3://...`).',
    category: 'networking',
    drawer: {
      plainEnglish:
        'A URL is a web address (like `https://api.app.com/v1/orders`), while URI is the broader term also covering storage pointers like `s3://uploads-bucket/doc_42.pdf` used in the Claim Check pattern.',
      howItsUsed: [
        'Issue short-lived presigned S3/R2 URLs so browsers upload large binaries directly to storage.',
        'Pass compact object URIs inside events instead of pushing megabyte files through Kafka.',
      ],
      example: {
        filename: 'src/events/invoiceReady.ts',
        snippet: `await broker.publish('invoice.generated', {
  invoiceId: 'inv_99',
  pdfUri: 's3://invoices-prod/2026/inv_99.pdf', // tiny pointer, not raw PDF bytes
});`,
      },
      relatedTerms: ['s3', 'http', 'rest'],
    },
  },
  {
    id: 'mime',
    term: 'MIME',
    fullName: 'Multipurpose Internet Mail Extensions (Media Type)',
    shortTooltip: 'Standard content type label like `application/json` or `image/png` describing payload format.',
    category: 'networking',
    drawer: {
      plainEnglish:
        'MIME types tell browsers and backends what kind of bytes are being sent (`image/jpeg`, `application/pdf`, `application/json`). Always validate uploaded MIME types against a strict allowlist.',
      howItsUsed: [
        'Reject dangerous or unexpected file uploads before signing S3 URLs or resizing images.',
      ],
      example: {
        filename: 'src/uploads/validate.ts',
        snippet: `const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
if (!ALLOWED_MIMES.has(contentType)) {
  throw new HttpError(415, 'Unsupported media type');
}`,
      },
      relatedTerms: ['http', 's3'],
    },
  },

  // =========================================================================
  // SECURITY, AUTH & COMPLIANCE
  // =========================================================================
  {
    id: 'jwt',
    term: 'JWT',
    aliases: ['JWTs'],
    fullName: 'JSON Web Token',
    shortTooltip: 'Cryptographically signed stateless token carrying user identity (`sub`, `role`, `exp`).',
    category: 'security',
    drawer: {
      plainEnglish:
        'A JWT is a signed Base64 token sent in `Authorization: Bearer <token>`. Any API Gateway or microservice can verify its signature locally without querying an auth database on every request.',
      howItsUsed: [
        'Keep access JWTs short-lived (5–15 min) paired with revocable refresh tokens.',
        'Never put secrets or sensitive PII inside a JWT—its payload is Base64-encoded, NOT encrypted!',
      ],
      example: {
        filename: 'src/middleware/authJwt.ts',
        snippet: `import jwt from 'jsonwebtoken';

const claims = jwt.verify(bearerToken, PUBLIC_KEY, { algorithms: ['RS256'] });
req.auth = { userId: claims.sub, orgId: claims.orgId, role: claims.role };`,
      },
      watchOut: 'Because JWTs are stateless, pair short expirations with a fast Redis revocation key when instant logout/offboarding is required.',
      relatedTerms: ['rbac', 'sso', 'mfa', 'hmac'],
    },
  },
  {
    id: 'hmac',
    term: 'HMAC',
    fullName: 'Hash-Based Message Authentication Code',
    shortTooltip: 'Secret-key cryptographic signature proving a webhook payload was not forged or altered.',
    category: 'security',
    drawer: {
      plainEnglish:
        'Webhook senders like Stripe and GitHub hash the raw request body with a shared secret key (`HMAC-SHA256`) and send the signature in a header so your backend can verify authenticity.',
      howItsUsed: [
        'Always hash the exact **raw request buffer** before JSON parsing.',
        'Compare digests using `crypto.timingSafeEqual` and reject stale timestamps (>5 min old).',
      ],
      example: {
        filename: 'src/shared/verifyHmac.ts',
        snippet: `import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyHmac(rawBody: Buffer, sigHex: string, secret: string) {
  const expected = createHmac('sha256', secret).update(rawBody).digest();
  const actual = Buffer.from(sigHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}`,
      },
      relatedTerms: ['sha-256', 'jwt', 'tls'],
    },
  },
  {
    id: 'sha-256',
    term: 'SHA-256',
    aliases: ['SHA'],
    fullName: 'Secure Hash Algorithm 256-bit',
    shortTooltip: 'One-way cryptographic hash producing a fixed 256-bit fingerprint for integrity and signatures.',
    category: 'security',
    drawer: {
      plainEnglish:
        'SHA-256 turns any input bytes into a unique 64-character hex fingerprint—changing even 1 bit completely changes the output. Used for webhook HMACs, GraphQL persisted query hashes, and idempotency payload checks.',
      howItsUsed: [
        'Hashing request payloads to ensure an `Idempotency-Key` is not reused with a different body.',
        'Never use bare SHA-256 for user passwords—use slow salted hashes like Argon2id or bcrypt!',
      ],
      example: {
        filename: 'src/shared/hashBody.ts',
        snippet: `import { createHash } from 'node:crypto';

export const sha256Hex = (input: string) =>
  createHash('sha256').update(input).digest('hex');`,
      },
      relatedTerms: ['hmac', 'apq'],
    },
  },
  {
    id: 'idor',
    term: 'IDOR',
    fullName: 'Insecure Direct Object Reference',
    shortTooltip: 'Authorization bug where User A accesses User B’s record just by changing an ID in the URL.',
    category: 'security',
    drawer: {
      plainEnglish:
        'IDOR happens when an endpoint checks "is this user logged in?" but forgets to check "does this user/tenant own invoice #43?"—allowing trivial cross-customer data leaks.',
      howItsUsed: [
        'Always pass the verified `orgId`/`userId` from the auth token into every repository `WHERE` clause.',
        'Backstop with PostgreSQL Row-Level Security (RLS) in multi-tenant SaaS apps.',
      ],
      example: {
        filename: 'src/modules/billing/getInvoice.ts',
        snippet: `// SAFE: binds both resource ID and verified auth orgId in SQL
const invoice = await db.queryOne(
  'SELECT * FROM invoices WHERE id = $1 AND org_id = $2',
  [req.params.id, req.auth.orgId]
);
if (!invoice) return res.status(404).json({ error: 'Not found' });`,
      },
      relatedTerms: ['rls', 'rbac', 'saas'],
    },
  },
  {
    id: 'rbac',
    term: 'RBAC',
    fullName: 'Role-Based Access Control',
    shortTooltip: 'Authorization model granting permissions based on user roles (e.g., `admin`, `editor`, `viewer`).',
    category: 'security',
    drawer: {
      plainEnglish:
        'RBAC assigns each user a role within an organization and checks whether that role is allowed to perform an action (like deleting a project or managing billing).',
      howItsUsed: [
        'Great default for 90% of B2B SaaS apps; combine with tenant ownership checks to prevent IDOR.',
        'Graduate to ABAC when rules depend on dynamic attributes (region, time, approval amount).',
      ],
      example: {
        filename: 'src/middleware/requireRole.ts',
        snippet: `export const requireRole = (...allowed: string[]) => (req, res, next) => {
  if (!allowed.includes(req.auth.role)) {
    return res.status(403).json({ error: 'Insufficient role permissions' });
  }
  next();
};`,
      },
      relatedTerms: ['abac', 'idor', 'jwt'],
    },
  },
  {
    id: 'abac',
    term: 'ABAC',
    fullName: 'Attribute-Based Access Control',
    shortTooltip: 'Fine-grained authorization checking attributes of user, resource, and context (not just role).',
    category: 'security',
    drawer: {
      plainEnglish:
        'While RBAC checks "is this user a Manager?", ABAC evaluates dynamic rules like "can approve expenses ONLY if `expense.department === user.department` AND `expense.amount < 5000`."',
      howItsUsed: [
        'Complex enterprise policies involving ownership, resource status, department, or region.',
      ],
      example: {
        filename: 'src/auth/canApproveExpense.ts',
        snippet: `export function canApproveExpense(user: UserCtx, expense: Expense): boolean {
  return user.role === 'manager'
    && user.department === expense.department
    && expense.amountCents <= 500_000;
}`,
      },
      relatedTerms: ['rbac', 'idor'],
    },
  },
  {
    id: 'iam',
    term: 'IAM',
    fullName: 'Identity and Access Management',
    shortTooltip: 'Cloud permission system controlling which functions/services may access specific buckets or tables.',
    category: 'security',
    drawer: {
      plainEnglish:
        'Cloud IAM defines exact machine-to-machine permissions (e.g., "Resize Fn can read `uploads/*` and write `processed/*`, and touch NOTHING else").',
      howItsUsed: [
        'Apply Least Privilege: give every serverless function its own narrow IAM role—never share one admin role.',
      ],
      example: {
        filename: 'infra/resize-fn-iam.json',
        snippet: `{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::snapresize-bucket/uploads/*"
}`,
      },
      relatedTerms: ['faas', 's3', 'kms'],
    },
  },
  {
    id: 'waf',
    term: 'WAF',
    fullName: 'Web Application Firewall',
    shortTooltip: 'Edge security shield blocking bots, SQL injection patterns, and traffic floods before your app.',
    category: 'security',
    drawer: {
      plainEnglish:
        'A WAF runs in front of your API Gateway or CDN, automatically dropping malicious scrapers, DDoS floods, and common exploits before they invoke your Serverless functions or hit your database.',
      howItsUsed: [
        'Essential defense against "Denial-of-Wallet" bot floods on pay-per-request Serverless APIs.',
      ],
      example: {
        filename: 'infra/waf-rate-rule.json',
        snippet: `{
  "Name": "BlockBotFloods",
  "Statement": { "RateBasedStatement": { "Limit": 500, "AggregateKeyType": "IP" } },
  "Action": { "Block": {} }
}`,
      },
      relatedTerms: ['ddos', 'cdn', 'ip'],
    },
  },
  {
    id: 'ddos',
    term: 'DDoS',
    aliases: ['DoS'],
    fullName: 'Distributed Denial of Service',
    shortTooltip: 'Attack (or accidental client loop) flooding a backend with traffic until it crashes or spikes bills.',
    category: 'security',
    drawer: {
      plainEnglish:
        'A DoS/DDoS flood overwhelms CPU, database connections, or serverless concurrency—whether caused by malicious bots, unbounded GraphQL queries, or 6 thin-event consumers hammering your own producer API.',
      howItsUsed: [
        'Mitigate with edge WAF rules, token-bucket rate limits (`429`), concurrency caps, and query depth limits.',
      ],
      example: {
        filename: 'src/middleware/protect.ts',
        snippet: `// Cap payload size & request rate at the edge before heavy work runs
app.use(express.json({ limit: '100kb' }));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));`,
      },
      relatedTerms: ['waf', 'ip', 'cdn'],
    },
  },
  {
    id: 'pii',
    term: 'PII',
    fullName: 'Personally Identifiable Information',
    shortTooltip: 'Sensitive user data (email, phone, address, SSN) requiring encryption and careful privacy controls.',
    category: 'security',
    drawer: {
      plainEnglish:
        'PII is any data that can identify a real person. Never dump raw PII into plain application logs or long-lived immutable Kafka topics where GDPR deletion becomes painful.',
      howItsUsed: [
        'Emit only opaque `userId` values in logs and events; store PII in an encrypted reference store (or crypto-shred).',
      ],
      example: {
        filename: 'src/shared/logger.ts',
        snippet: `// Log opaque IDs — redact emails/tokens automatically
logger.info({ userId: user.id, orderId: order.id }, 'Order confirmed');
// NEVER: logger.info({ email: user.email, card: req.body.cardNumber });`,
      },
      relatedTerms: ['gdpr', 'dek', 'kms', 'dto'],
    },
  },
  {
    id: 'gdpr',
    term: 'GDPR',
    fullName: 'General Data Protection Regulation',
    shortTooltip: 'EU privacy law granting users the "right to be forgotten" (erasing their personal data).',
    category: 'security',
    drawer: {
      plainEnglish:
        'GDPR requires systems to minimize personal data collection and permanently erase or anonymize a user’s PII on request—which conflicts with storing raw emails inside immutable 90-day event logs.',
      howItsUsed: [
        'Keep PII in mutable encrypted tables (or encrypt event PII with per-user erasable DEKs via crypto-shredding).',
      ],
      example: {
        filename: 'src/modules/privacy/eraseUser.ts',
        snippet: `// Crypto-shredding: deleting the user's DEK renders past encrypted log PII unreadable
await db.transaction(async (tx) => {
  await tx.query('DELETE FROM user_encryption_keys WHERE user_id = $1', [userId]);
  await tx.query("UPDATE users SET email = NULL, name = 'Deleted User' WHERE id = $1", [userId]);
});`,
      },
      relatedTerms: ['pii', 'dek', 'kms'],
    },
  },
  {
    id: 'dek',
    term: 'DEK',
    fullName: 'Data Encryption Key',
    shortTooltip: 'Per-record or per-user symmetric encryption key used to encrypt PII (and erased for crypto-shredding).',
    category: 'security',
    drawer: {
      plainEnglish:
        'In envelope encryption, each user gets their own fast AES Data Encryption Key (DEK), which is itself encrypted by your cloud KMS master key. Deleting one user’s DEK erases their encrypted history instantly.',
      howItsUsed: [
        'Powers crypto-shredding for GDPR compliance in immutable event logs and backups.',
      ],
      example: {
        filename: 'src/crypto/encryptField.ts',
        snippet: `import { createCipheriv, randomBytes } from 'node:crypto';

export function encryptWithDek(plaintext: string, dek: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', dek, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { iv: iv.toString('hex'), tag: cipher.getAuthTag().toString('hex'), data: enc.toString('hex') };
}`,
      },
      relatedTerms: ['kms', 'gdpr', 'pii'],
    },
  },
  {
    id: 'kms',
    term: 'KMS',
    fullName: 'Key Management Service',
    shortTooltip: 'Managed cloud vault (AWS KMS, GCP KMS) that securely stores master keys and encrypts DEKs.',
    category: 'security',
    drawer: {
      plainEnglish:
        'KMS holds your root encryption keys inside tamper-resistant hardware so master keys never live in `.env` files or Git repos.',
      howItsUsed: [
        'Generates and unwraps per-user DEKs and encrypts database/S3 secrets at rest.',
      ],
      example: {
        filename: 'src/crypto/kms.ts',
        snippet: `const { Plaintext, CiphertextBlob } = await kms.send(
  new GenerateDataKeyCommand({ KeyId: process.env.KMS_KEY_ID, KeySpec: 'AES_256' })
); // Store CiphertextBlob in DB; use Plaintext DEK in memory only`,
      },
      relatedTerms: ['dek', 'iam', 'gdpr'],
    },
  },
  {
    id: 'pci',
    term: 'PCI',
    fullName: 'Payment Card Industry (PCI-DSS)',
    shortTooltip: 'Strict security compliance standard governing any system that stores or handles credit card numbers.',
    category: 'security',
    drawer: {
      plainEnglish:
        'Any server or database touching raw card numbers falls under heavy PCI audits. Most teams minimize PCI scope either by using Stripe Elements/tokens or isolating card processing in one locked-down microservice.',
      howItsUsed: [
        'Beginners: let Stripe/Adyen tokenize cards in the browser so raw card numbers NEVER touch your backend.',
        'Large fintechs: isolate card vaults into dedicated Microservices + private network zones.',
      ],
      example: {
        filename: 'src/billing/charge.ts',
        snippet: `// Pass an opaque Stripe paymentMethodId — never raw PAN/CVV numbers!
await stripe.paymentIntents.create(
  { amount: 1999, currency: 'usd', payment_method: paymentMethodId, confirm: true },
  { idempotencyKey }
);`,
      },
      relatedTerms: ['soc2', 'mtls', 'pii'],
    },
  },
  {
    id: 'soc2',
    term: 'SOC2',
    fullName: 'System and Organization Controls 2',
    shortTooltip: 'B2B security audit verifying access controls, encryption, change review, and audit logging.',
    category: 'security',
    drawer: {
      plainEnglish:
        'Enterprise B2B customers ask for SOC2 compliance to prove your SaaS enforces tenant isolation, least-privilege access, instant employee offboarding, and tamper-evident audit logs.',
      howItsUsed: [
        'Log security-sensitive changes (role updates, exports, logins) to an append-only `audit_logs` table.',
        'Revoke terminated users’ access immediately (no slow async RBAC propagation).',
      ],
      example: {
        filename: 'src/modules/audit/logAction.ts',
        snippet: `await db.query(
  \`INSERT INTO audit_logs (org_id, actor_id, action, target_id)
   VALUES ($1, $2, $3, $4)\`,
  [orgId, actorId, 'ROLE_REVOKED', targetUserId]
);`,
      },
      relatedTerms: ['rbac', 'rls', 'sso', 'pci'],
    },
  },
  {
    id: 'sso',
    term: 'SSO',
    fullName: 'Single Sign-On',
    shortTooltip: 'Enterprise login (SAML/OIDC) letting employees sign into your SaaS with Okta or Google Workspace.',
    category: 'security',
    drawer: {
      plainEnglish:
        'SSO delegates password and MFA checks to a customer company’s identity provider (Okta, Azure AD, Google), so IT admins can revoke a departing employee’s access from one central dashboard.',
      howItsUsed: [
        'Usually integrated via OIDC/SAML libraries or auth providers (WorkOS, Auth0, Clerk, Firebase Auth).',
      ],
      example: {
        filename: 'src/auth/oidcCallback.ts',
        snippet: `// Exchange verified OIDC code for claims, then create a local tenant session
const { sub, email } = await verifyOidcIdToken(code);
const session = await createSession({ providerSub: sub, email, orgId });`,
      },
      relatedTerms: ['jwt', 'mfa', 'soc2'],
    },
  },
  {
    id: 'mfa',
    term: 'MFA',
    fullName: 'Multi-Factor Authentication',
    shortTooltip: 'Requiring a second proof of identity (passkey, authenticator app) beyond just a password.',
    category: 'security',
    drawer: {
      plainEnglish:
        'MFA protects accounts even when passwords are leaked by requiring a second factor (authenticator TOTP code or WebAuthn passkey) owned strictly by the Auth module.',
      howItsUsed: [
        'Keep MFA secrets isolated in the Auth bounded context—Billing and Projects never touch them.',
      ],
      example: {
        filename: 'src/modules/auth/verifyMfa.ts',
        snippet: `const valid = verifyTotpCode(userAuth.mfaSecret, req.body.code);
if (!valid) return res.status(401).json({ error: 'Invalid MFA code' });`,
      },
      relatedTerms: ['sso', 'jwt', 'soc2'],
    },
  },

  // =========================================================================
  // RELIABILITY, PERFORMANCE & OPS
  // =========================================================================
  {
    id: 'p95',
    term: 'p95',
    aliases: ['p50', 'p99'],
    fullName: 'Latency Percentiles (p50 / p95 / p99)',
    shortTooltip: 'Response time met by 50%, 95%, or 99% of requests — exposes tail slowness averages hide.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'An "80ms average" can hide a brutal 4-second delay for 1 in 100 users. `p50` is the median user experience, while `p95` and `p99` measure your slowest 5% and 1% tail latency.',
      howItsUsed: [
        'Always set alerts and performance budgets on p95/p99 latency—never on averages.',
        'One synchronous unindexed query or cold start shows up immediately in p99.',
      ],
      example: {
        filename: 'src/metrics/recordLatency.ts',
        snippet: `const start = performance.now();
await next();
const durationMs = Math.round(performance.now() - start);
// Feed into Prometheus/OpenTelemetry histogram to compute p50/p95/p99
httpDurationHistogram.record(durationMs, { route: req.routePath });`,
      },
      relatedTerms: ['slo', 'qps', 'ttft'],
    },
  },
  {
    id: 'slo',
    term: 'SLO',
    aliases: ['SLOs'],
    fullName: 'Service Level Objective',
    shortTooltip: 'Internal reliability target (e.g., 99.9% uptime = ~43 min/mo budget) guiding engineering trade-offs.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'An SLO defines how reliable a service needs to be (like 99.9% success rate or p95 < 250ms). The remaining gap (0.1%) is your **Error Budget**—when it runs low, pause features and harden reliability.',
      howItsUsed: [
        'Remember compounding math: 5 sequential 99.9% sync calls drop combined uptime to `0.999^5 ≈ 99.5%`!',
      ],
      example: {
        filename: 'src/ops/availabilityMath.ts',
        snippet: `// Compounding availability across N synchronous microservice hops
const combinedAvailability = (perServiceSlo: number, hops: number) =>
  Math.pow(perServiceSlo, hops); // (0.999)^5 = 0.9950 (~3.6 hrs downtime/mo!)`,
      },
      relatedTerms: ['sla', 'p95', 'sre', 'nfr'],
    },
  },
  {
    id: 'sla',
    term: 'SLA',
    aliases: ['SLAs'],
    fullName: 'Service Level Agreement',
    shortTooltip: 'External legal/commercial uptime promise to customers (usually looser than internal SLOs).',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'An SLA is the binding contract with customers (often carrying billing credits if breached). Always set your internal SLO stricter than your public SLA so alarms fire before you break promises.',
      howItsUsed: [
        'Example: Promise customers a 99.5% SLA while engineering targets an internal 99.9% SLO.',
      ],
      example: {
        filename: 'docs/reliability-targets.md',
        snippet: `- Customer SLA: 99.5% monthly uptime (contractual)
- Internal SLO: 99.9% monthly uptime (triggers reliability sprint before SLA risk)`,
      },
      relatedTerms: ['slo', 'rpo', 'rto', 'sre'],
    },
  },
  {
    id: 'rpo',
    term: 'RPO',
    fullName: 'Recovery Point Objective',
    shortTooltip: 'Maximum acceptable amount of data loss (measured in time, e.g., 5 minutes) in a disaster.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'RPO answers: *"If the database burns down right now, how many minutes of recent writes can we afford to lose?"* Nightly backups = 24-hour RPO; continuous WAL archiving = near-zero RPO.',
      howItsUsed: [
        'Determines backup frequency and synchronous vs. asynchronous database replication.',
      ],
      example: {
        filename: 'infra/backup-policy.md',
        snippet: `- RPO = 5 min -> Continuous Postgres WAL archiving to off-site S3
- Verify quarterly by restoring into a staging database!`,
      },
      relatedTerms: ['rto', 'wal', 'multi-az'],
    },
  },
  {
    id: 'rto',
    term: 'RTO',
    fullName: 'Recovery Time Objective',
    shortTooltip: 'Maximum acceptable downtime (e.g., 30 minutes) to get the system back online after a failure.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'RTO answers: *"How quickly must we be back up after a major outage?"* Automated Multi-AZ failover achieves ~1–2 minute RTO, while restoring a huge backup manually may take hours.',
      howItsUsed: [
        'Test your real RTO with regular restore drills—an untested backup is not a backup.',
      ],
      example: {
        filename: 'infra/dr-drill.md',
        snippet: `# Quarterly DR Drill
1. Restore latest snapshot + WAL into isolated staging RDS
2. Measure elapsed time (must stay < 30 min RTO)
3. Run smoke tests on login & checkout`,
      },
      relatedTerms: ['rpo', 'multi-az', 'slo'],
    },
  },
  {
    id: 'multi-az',
    term: 'Multi-AZ',
    aliases: ['AZ'],
    fullName: 'Multiple Availability Zones',
    shortTooltip: 'Running replicas across separate physical data centers in one region for automatic failover.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'Cloud regions contain isolated data centers called Availability Zones (AZs) with independent power and cooling. Running 2+ stateless app pods + a Multi-AZ database survives an entire data-center outage automatically.',
      howItsUsed: [
        'Best high-availability default—far cheaper and simpler than Multi-Region active-active.',
        'Watch cross-AZ data transfer fees in chatty microservice clusters!',
      ],
      example: {
        filename: 'infra/rds-ha.tf',
        snippet: `resource "aws_db_instance" "primary" {
  engine   = "postgres"
  multi_az = true # synchronous standby in a separate physical data center
}`,
      },
      relatedTerms: ['rto', 'rpo', 'rds', 'lb'],
    },
  },
  {
    id: 'sigterm',
    term: 'SIGTERM',
    fullName: 'Signal Terminate',
    shortTooltip: 'Graceful shutdown OS signal sent before stopping a container so live requests can finish.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'Before Kubernetes or a cloud host replaces a container during a deploy, it sends `SIGTERM` and waits ~30 seconds. Handling `SIGTERM` drains active payments and queue jobs instead of snapping connections mid-flight.',
      howItsUsed: [
        'Flip `/readyz` to `503`, close the HTTP server to new traffic, finish in-flight requests/jobs, close DB pools, and exit `0`.',
      ],
      example: {
        filename: 'src/shutdown.ts',
        snippet: `process.on('SIGTERM', async () => {
  isShuttingDown = true; // /readyz now returns 503
  await new Promise((done) => server.close(done));
  await db.end();
  process.exit(0);
});`,
      },
      relatedTerms: ['lb', 'ws'],
    },
  },
  {
    id: 'ci-cd',
    term: 'CI/CD',
    aliases: ['CI', 'CD'],
    fullName: 'Continuous Integration / Continuous Delivery',
    shortTooltip: 'Automated pipelines that lint, test, check contracts, and safely deploy code on every commit.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'CI automatically runs typechecks, unit/contract tests, and module boundary lints on every pull request. CD automates safe rollouts (Rolling, Blue-Green, or Canary) to production.',
      howItsUsed: [
        'Enforces Modular Monolith import boundaries (`eslint`) and Event Schema Registry checks before merge.',
        'Microservices require independent CI/CD pipelines per service so squads never block each other.',
      ],
      example: {
        filename: '.github/workflows/ci.yml',
        snippet: `steps:
  - run: npm ci
  - run: npm run lint       # blocks cross-module boundary leaks
  - run: npm run typecheck
  - run: npm test           # unit + contract tests`,
      },
      relatedTerms: ['sre', 'adr'],
    },
  },
  {
    id: 'qps',
    term: 'QPS',
    fullName: 'Queries Per Second',
    shortTooltip: 'Throughput metric measuring how many requests or queries arrive every second.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'QPS measures live traffic intensity (`dailyRequests / 86,400`). Always multiply average QPS by a peak burst factor (3x–10x) when sizing your backend—most early apps are far below 200 peak QPS.',
      howItsUsed: [
        'Guides architecture sizing before over-engineering distributed infrastructure.',
      ],
      example: {
        filename: 'scripts/estimateQps.ts',
        snippet: `const dailyRequests = dau * requestsPerUserPerDay;
const avgQps = dailyRequests / 86_400;
const peakQps = avgQps * 5; // plan for 5x rush-hour spikes`,
      },
      relatedTerms: ['dau', 'rpm', 'nfr'],
    },
  },
  {
    id: 'dau',
    term: 'DAU',
    fullName: 'Daily Active Users',
    shortTooltip: 'Number of unique users interacting with your application in a typical day.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'DAU is the starting input for back-of-the-envelope capacity planning: multiply DAU by requests per user per day, divide by 86,400 seconds, and you instantly know your average QPS.',
      howItsUsed: [
        '25,000 DAU × 40 req/day = 1M req/day ≈ 11.6 avg QPS — easily handled by one Modular Monolith!',
      ],
      example: {
        filename: 'scripts/sizing.ts',
        snippet: `const avgQps = (25_000 * 40) / 86_400; // ~11.6 req/sec`,
      },
      relatedTerms: ['qps', 'nfr'],
    },
  },
  {
    id: 'rpm',
    term: 'RPM',
    fullName: 'Requests Per Minute',
    shortTooltip: 'Rate-limit unit commonly used by third-party APIs (like LLM providers and CRMs).',
    category: 'ops',
    drawer: {
      plainEnglish:
        'External APIs (OpenAI, HubSpot, Stripe) cap how many requests your workers can make per minute (RPM). Unthrottled bursts trigger HTTP `429 Too Many Requests`.',
      howItsUsed: [
        'Match your worker queue’s rate limiter to the provider’s RPM quota and delay `429` responses via `Retry-After`.',
      ],
      example: {
        filename: 'src/workers/llmQueue.ts',
        snippet: `// BullMQ worker capped to respect a 300 RPM (5 req/sec) LLM quota
const worker = new Worker('embed-docs', processDoc, {
  limiter: { max: 5, duration: 1_000 },
});`,
      },
      relatedTerms: ['qps', 'llm', 'dlq'],
    },
  },
  {
    id: 'ttft',
    term: 'TTFT',
    fullName: 'Time To First Token',
    shortTooltip: 'How fast an AI/LLM endpoint starts streaming the first words back to the user.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'For LLM chat apps, waiting 15 seconds for the entire answer feels broken. Streaming tokens over SSE drops perceived wait to TTFT (<1 second) while the rest of the answer types in live.',
      howItsUsed: [
        'Use Server-Sent Events (SSE) on a lightweight web/streaming service for interactive AI chat.',
      ],
      example: {
        filename: 'src/routes/chatStream.ts',
        snippet: `res.setHeader('Content-Type', 'text/event-stream');
for await (const chunk of llm.stream(prompt)) {
  res.write(\`data: \${JSON.stringify({ token: chunk.text })}\\n\\n\`);
}
res.end();`,
      },
      relatedTerms: ['sse', 'llm', 'p95'],
    },
  },
  {
    id: 'llm',
    term: 'LLM',
    aliases: ['LLMs'],
    fullName: 'Large Language Model',
    shortTooltip: 'AI model (like Gemini or GPT) with slow streaming responses and strict RPM rate limits.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'LLM APIs behave very differently from fast SQL queries: calls take 5–40 seconds, stream tokens incrementally, and enforce strict RPM quotas—making hybrid async pipelines + SSE streaming essential.',
      howItsUsed: [
        'Use Event-Driven rate-limited workers for batch ingestion (OCR → Chunk → Embed) and SSE for live chat.',
      ],
      example: {
        filename: 'src/ai/embedWithBackoff.ts',
        snippet: `const resp = await fetch(EMBED_API, { method: 'POST', body: JSON.stringify({ text }) });
if (resp.status === 429) {
  await job.moveToDelayed(Date.now() + Number(resp.headers.get('retry-after') ?? 5) * 1000);
}`,
      },
      relatedTerms: ['sse', 'ttft', 'rpm', 'eda'],
    },
  },
  {
    id: 'ml',
    term: 'ML',
    fullName: 'Machine Learning',
    shortTooltip: 'Predictive/ranking models (often Python/GPU) frequently isolated from core web request paths.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'ML ranking, fraud detection, or recommendation services often run in Python on specialized CPU/GPU hardware—one of the cleanest reasons to isolate them behind a timeout + fallback.',
      howItsUsed: [
        'Always wrap non-critical ML calls (like recommendations) in a short timeout + cached fallback.',
      ],
      example: {
        filename: 'home-bff/src/getPicks.ts',
        snippet: `const picks = await fetchJsonWithTimeout('http://recs-ml-svc/rank', 250)
  .catch(() => TRENDING_FALLBACK);`,
      },
      relatedTerms: ['bff', 'llm'],
    },
  },
  {
    id: 'iot',
    term: 'IoT',
    fullName: 'Internet of Things',
    shortTooltip: 'Connected physical devices (sensors, thermostats) emitting continuous telemetry streams.',
    category: 'architecture',
    drawer: {
      plainEnglish:
        'IoT platforms ingest tens of thousands of sensor readings per second—a textbook fit for Event-Driven streams (Kafka/Event Hubs) partitioned by `deviceId` with independent alerting vs. archival consumers.',
      howItsUsed: [
        'Partition events by `deviceId` so each device’s readings stay strictly ordered.',
      ],
      example: {
        filename: 'ingest/src/publishReading.ts',
        snippet: `await kafkaProducer.send({
  topic: 'sensor.readings',
  messages: [{ key: reading.deviceId, value: JSON.stringify(reading) }],
});`,
      },
      relatedTerms: ['eda', 'fifo', 'qps'],
    },
  },
  {
    id: 'io',
    term: 'I/O',
    fullName: 'Input / Output',
    shortTooltip: 'Waiting on networks, databases, or disks (non-blocking in Node.js) vs. heavy CPU computation.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'Node.js handles thousands of concurrent I/O operations (waiting on Postgres, Redis, or HTTP) effortlessly on one thread—but heavy synchronous CPU work (PDF/CSV hashing) freezes the entire event loop.',
      howItsUsed: [
        'Keep HTTP routes I/O-bound and push heavy CPU jobs into background worker processes or Serverless workers.',
      ],
      example: {
        filename: 'src/routes/export.ts',
        snippet: `// Fast I/O-bound route: enqueues heavy CPU job in <5ms
await reportQueue.add('csv-export', { orgId });
return res.status(202).json({ status: 'queued' });`,
      },
      relatedTerms: ['oom', 'gc', 'faas'],
    },
  },
  {
    id: 'oom',
    term: 'OOM',
    fullName: 'Out of Memory',
    shortTooltip: 'Crash (SIGKILL) when a server or queue buffers too much data in RAM and exceeds its memory limit.',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'When a container loads an entire 100,000-row export or unbounded in-memory queue into RAM, the OS kills the process instantly (`OOMKilled`), dropping all live requests.',
      howItsUsed: [
        'Stream large files/CSVs chunk-by-chunk, enforce max page limits, and bound queue depths.',
      ],
      example: {
        filename: 'src/workers/streamCsv.ts',
        snippet: `// Stream rows directly to S3 instead of building a huge string in RAM
for await (const row of db.cursor('SELECT id, title FROM tasks WHERE org_id = $1', [orgId])) {
  uploadStream.write(\`\${row.id},\${row.title}\\n\`);
}`,
      },
      relatedTerms: ['gc', 'io', 's3'],
    },
  },
  {
    id: 'gc',
    term: 'GC',
    fullName: 'Garbage Collection',
    shortTooltip: 'Automatic memory cleanup in Node/Java/Go that can briefly pause execution ("stop-the-world").',
    category: 'reliability',
    drawer: {
      plainEnglish:
        'Managed runtimes periodically pause your app for milliseconds (or seconds under heavy allocation) to reclaim unused RAM—which can cause p99 latency spikes or let a distributed Redis lock expire mid-work!',
      howItsUsed: [
        'Avoid allocating giant temporary arrays in HTTP handlers; use Fencing Tokens if relying on distributed locks.',
      ],
      example: {
        filename: 'src/workers/fencedUpdate.sql',
        snippet: `-- Even if Worker A pauses for GC and its lock expires, stale token writes fail safely
UPDATE jobs SET result = $1, last_token = $2 WHERE id = $3 AND last_token < $2;`,
      },
      relatedTerms: ['oom', 'p95'],
    },
  },
  {
    id: 'vpc',
    term: 'VPC',
    fullName: 'Virtual Private Cloud',
    shortTooltip: 'Isolated private cloud network where databases and internal services run off the public internet.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'A VPC shields private databases (like RDS Postgres) from the public internet. Only attach Serverless functions to a VPC when they actually need private DB access (otherwise use HTTP proxies or keep them outside).',
      howItsUsed: [
        'Databases sit in private subnets; API Gateways and Load Balancers sit in public subnets.',
      ],
      example: {
        filename: 'infra/vpc-layout.md',
        snippet: `Public Subnet  -> API Gateway / L7 Load Balancer / NAT Gateway
Private Subnet -> App Containers / RDS Postgres / Redis (no public IP)`,
      },
      relatedTerms: ['eni', 'nat', 'rds', 'iam'],
    },
  },
  {
    id: 'eni',
    term: 'ENI',
    fullName: 'Elastic Network Interface',
    shortTooltip: 'Virtual network card attached to cloud compute instances or VPC-connected serverless functions.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'When a serverless function joins a private VPC, the cloud maps it through a virtual network interface (ENI). Keep non-DB functions outside the VPC to keep cold starts and network setup minimal.',
      howItsUsed: [
        'AWS Hyperplane ENIs made VPC Lambdas much faster, though skipping unnecessary VPC attachments is still cleaner.',
      ],
      relatedTerms: ['vpc', 'faas', 'nat'],
    },
  },
  {
    id: 'nat',
    term: 'NAT',
    fullName: 'Network Address Translation (Gateway)',
    shortTooltip: 'Network router letting private-subnet servers make outbound internet calls (e.g., to Stripe).',
    category: 'ops',
    drawer: {
      plainEnglish:
        'Containers inside a private VPC subnet have no public IP—a NAT Gateway lets them reach external APIs (Stripe, SendGrid) securely, though NAT gateways carry fixed monthly + per-GB charges.',
      howItsUsed: [
        'Account for NAT Gateway fees when estimating Microservices / private-VPC cloud bills.',
      ],
      relatedTerms: ['vpc', 'ip', 'dns'],
    },
  },
  {
    id: 'sdk',
    term: 'SDK',
    aliases: ['SDKs'],
    fullName: 'Software Development Kit',
    shortTooltip: 'Official client library (e.g., AWS SDK v3, Stripe SDK) for calling cloud or partner services.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'An SDK wraps raw HTTP auth and retries into typed methods. In Serverless functions, import small modular SDK v3 sub-packages and initialize the client **outside** the handler for fast cold starts.',
      howItsUsed: [
        'Import `@aws-sdk/client-s3` (tiny) instead of monolithic bundles, and hoist `new S3Client()` to module scope.',
      ],
      example: {
        filename: 'functions/upload.ts',
        snippet: `import { S3Client } from '@aws-sdk/client-s3'; // modular v3 import

const s3 = new S3Client({}); // initialized ONCE per warm container!
export async function handler() { /* reuse s3 */ }`,
      },
      relatedTerms: ['faas', 's3', 'api'],
    },
  },
  {
    id: 'sre',
    term: 'SRE',
    fullName: 'Site Reliability Engineering',
    shortTooltip: 'Engineering discipline managing production uptime, SLOs, observability, and deployment safety.',
    category: 'ops',
    drawer: {
      plainEnglish:
        'SRE applies software engineering to infrastructure—automating CI/CD, alerts, distributed tracing, and disaster recovery drills. Microservices usually require dedicated SRE/platform support.',
      howItsUsed: [
        'Tracks the 4 Golden Signals: Latency (p95/p99), Traffic (QPS), Errors, and Saturation.',
      ],
      relatedTerms: ['slo', 'sla', 'ci-cd', 'p95'],
    },
  },
  {
    id: 'uuid',
    term: 'UUID',
    fullName: 'Universally Unique Identifier',
    shortTooltip: '128-bit random unique ID (`550e8400-...`) safe to generate independently without a central DB.',
    category: 'data',
    drawer: {
      plainEnglish:
        'UUIDs (especially `crypto.randomUUID()` or time-sortable UUIDv7) let clients, gateways, and producers generate globally unique IDs for `eventId`, `Idempotency-Key`, and `x-request-id` without coordinating with one database.',
      howItsUsed: [
        'Assign every emitted event an `eventId: crypto.randomUUID()` for consumer deduplication.',
        'Prefer UUIDv7 (time-ordered) over random UUIDv4 for high-write SQL primary keys to keep B-tree indexes compact.',
      ],
      example: {
        filename: 'src/shared/ids.ts',
        snippet: `import { randomUUID } from 'node:crypto';

const requestId = req.headers['x-request-id'] ?? randomUUID();`,
      },
      relatedTerms: ['eda', 'http', 'sql'],
    },
  },

  // =========================================================================
  // TOOLTIP-ONLY EVERYDAY / DOMAIN ABBREVIATIONS (clean hover, zero click clutter)
  // =========================================================================
  {
    id: 'ai',
    term: 'AI',
    fullName: 'Artificial Intelligence',
    shortTooltip: 'Machine-driven reasoning, generation, and classification systems (including LLMs and ML models).',
    category: 'general',
  },
  {
    id: 'aws',
    term: 'AWS',
    fullName: 'Amazon Web Services',
    shortTooltip: 'Cloud provider offering managed services like Lambda (FaaS), S3, SQS, SNS, and RDS.',
    category: 'ops',
  },
  {
    id: 'b2b',
    term: 'B2B',
    fullName: 'Business-to-Business',
    shortTooltip: 'Software sold to companies/organizations (typically multi-tenant with org roles and billing).',
    category: 'general',
  },
  {
    id: 'cpu',
    term: 'CPU',
    fullName: 'Central Processing Unit',
    shortTooltip: 'Main compute processor — heavy synchronous CPU loops freeze Node.js’s single event loop.',
    category: 'ops',
  },
  {
    id: 'crm',
    term: 'CRM',
    fullName: 'Customer Relationship Management',
    shortTooltip: 'Sales/lead tracking platform like HubSpot or Salesforce (often synced via async webhooks).',
    category: 'general',
  },
  {
    id: 'csv',
    term: 'CSV',
    fullName: 'Comma-Separated Values',
    shortTooltip: 'Plain-text spreadsheet format often generated asynchronously in background export workers.',
    category: 'general',
  },
  {
    id: 'dr',
    term: 'DR',
    fullName: 'Disaster Recovery',
    shortTooltip: 'Plans, backups, and failover drills for restoring service after major outages (RPO & RTO).',
    category: 'reliability',
  },
  {
    id: 'gb',
    term: 'GB',
    fullName: 'Gigabyte',
    shortTooltip: 'Unit of data/memory (~1 billion bytes); serverless bills compute in GB-seconds.',
    category: 'ops',
  },
  {
    id: 'gpu',
    term: 'GPU',
    fullName: 'Graphics Processing Unit',
    shortTooltip: 'Specialized parallel hardware used for AI inference, ML training, and video encoding.',
    category: 'ops',
  },
  {
    id: 'hr',
    term: 'HR',
    fullName: 'Human Resources',
    shortTooltip: 'Employee directory, leave approvals, and payroll management domain.',
    category: 'general',
  },
  {
    id: 'id',
    term: 'ID',
    aliases: ['IDs'],
    fullName: 'Identifier',
    shortTooltip: 'Unique reference key (like `userId`, `tripId`, or `eventId`) pointing to a specific record or request.',
    category: 'general',
  },
  {
    id: 'it',
    term: 'IT',
    fullName: 'Information Technology',
    shortTooltip: 'Organization’s internal systems, access management, and security operations team.',
    category: 'general',
  },
  {
    id: 'js',
    term: 'JS',
    fullName: 'JavaScript',
    shortTooltip: 'Dynamic language powering web browsers and Node.js backend runtimes.',
    category: 'general',
  },
  {
    id: 'kb',
    term: 'KB',
    fullName: 'Kilobyte',
    shortTooltip: 'Unit of data (~1,024 bytes), commonly used to measure average API JSON payload sizes.',
    category: 'ops',
  },
  {
    id: 'mvp',
    term: 'MVP',
    fullName: 'Minimum Viable Product',
    shortTooltip: 'Lean first launch built quickly to validate real customer value before heavy scaling.',
    category: 'general',
  },
  {
    id: 'npm',
    term: 'NPM',
    fullName: 'Node Package Manager',
    shortTooltip: 'JavaScript/TypeScript package registry and dependency manager.',
    category: 'ops',
  },
  {
    id: 'ocr',
    term: 'OCR',
    fullName: 'Optical Character Recognition',
    shortTooltip: 'Extracting searchable text from scanned receipts, images, or PDFs (CPU-heavy background work).',
    category: 'general',
  },
  {
    id: 'os',
    term: 'OS',
    fullName: 'Operating System',
    shortTooltip: 'Underlying server software (e.g., Linux) that managed Serverless platforms patch for you.',
    category: 'ops',
  },
  {
    id: 'pdf',
    term: 'PDF',
    aliases: ['PDFs'],
    fullName: 'Portable Document Format',
    shortTooltip: 'Fixed-layout document format; generating PDFs is CPU-heavy and belongs off the HTTP request path.',
    category: 'general',
  },
  {
    id: 'png',
    term: 'PNG',
    fullName: 'Portable Network Graphics',
    shortTooltip: 'Lossless image format commonly resized/generated in async media worker functions.',
    category: 'general',
  },
  {
    id: 'pos',
    term: 'POS',
    fullName: 'Point of Sale',
    shortTooltip: 'In-store/restaurant order terminal software that receives live online order updates.',
    category: 'general',
  },
  {
    id: 'ram',
    term: 'RAM',
    fullName: 'Random Access Memory',
    shortTooltip: 'Fast volatile server memory — cleared immediately on server crash or container restart.',
    category: 'ops',
  },
  {
    id: 'sam',
    term: 'SAM',
    fullName: 'AWS Serverless Application Model',
    shortTooltip: 'Framework and CLI for defining and deploying AWS Lambda functions, APIs, and queues.',
    category: 'ops',
  },
  {
    id: 'sms',
    term: 'SMS',
    fullName: 'Short Message Service',
    shortTooltip: 'Text messaging alerts usually sent asynchronously via a consumer so Checkout never waits.',
    category: 'general',
  },
  {
    id: 'tldr',
    term: 'TL;DR',
    fullName: 'Too Long; Didn’t Read',
    shortTooltip: 'Quick 2-sentence summary of the core takeaway.',
    category: 'general',
  },
  {
    id: 'ts',
    term: 'TS',
    fullName: 'TypeScript',
    shortTooltip: 'Statically typed superset of JavaScript used throughout this course’s backend examples.',
    category: 'general',
  },
  {
    id: 'tv',
    term: 'TV',
    fullName: 'Television',
    shortTooltip: 'Smart TV / living-room client app consuming backend APIs.',
    category: 'general',
  },
  {
    id: 'uhd',
    term: 'UHD',
    fullName: 'Ultra High Definition (4K)',
    shortTooltip: 'High-bitrate 4K video tier checked against user subscription entitlements.',
    category: 'general',
  },
  {
    id: 'ui',
    term: 'UI',
    fullName: 'User Interface',
    shortTooltip: 'Visual screens and interactive controls users see in the web or mobile app.',
    category: 'general',
  },
  {
    id: 'ux',
    term: 'UX',
    fullName: 'User Experience',
    shortTooltip: 'Overall responsiveness, clarity, and feel of the product for end users.',
    category: 'general',
  },
  {
    id: 'vip',
    term: 'VIP',
    fullName: 'Very Important Person',
    shortTooltip: 'High-tier or enterprise customer requiring dedicated isolation or priority SLAs.',
    category: 'general',
  },
  {
    id: 'vm',
    term: 'VM',
    aliases: ['VMs'],
    fullName: 'Virtual Machine',
    shortTooltip: 'Always-on virtual cloud server running an operating system and backend process.',
    category: 'ops',
  },
];

// Fast O(1) lookup by id or exact matched token
export const ABBREVIATION_BY_ID: Record<string, AbbreviationEntry> = {};
export const ABBREVIATION_BY_TOKEN: Record<string, AbbreviationEntry> = {};

const allTokens: string[] = [];

for (const entry of ABBREVIATIONS) {
  ABBREVIATION_BY_ID[entry.id] = entry;
  const tokens = [entry.term, ...(entry.aliases ?? [])];
  for (const token of tokens) {
    ABBREVIATION_BY_TOKEN[token] = entry;
    allTokens.push(token);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sort longest-first so CI/CD beats CI, Multi-AZ beats AZ, HTTPS beats HTTP, NoSQL beats SQL, etc.
const sortedTokens = [...new Set(allTokens)].sort((a, b) => b.length - a.length);

// Match tokens only when NOT immediately preceded or followed by an alphanumeric/underscore char
export const ABBREVIATION_REGEX = new RegExp(
  `(?<![A-Za-z0-9_])(${sortedTokens.map(escapeRegExp).join('|')})(?![A-Za-z0-9_])`,
  'g'
);
