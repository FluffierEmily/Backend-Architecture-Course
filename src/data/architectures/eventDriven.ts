import type { ArchitectureModule } from '../../types/course';

export const eventDrivenModule: ArchitectureModule = {
  id: 'event-driven',
  order: 4,
  name: 'Event-Driven Architecture (EDA)',
  shortName: 'Event-Driven',
  tagline: 'Producers broadcast facts ("what happened") and independent consumers react asynchronously.',
  accentColor: 'emerald',
  beginnerSummary:
    'In Event-Driven Architecture, components do not directly command each other ("Billing, charge this card!"). Instead, a producer publishes an immutable fact ("TripCompleted") to an event broker like Kafka, RabbitMQ, or EventBridge. Any number of independent consumers subscribe and react at their own pace.',
  whenToUse: [
    'One business action triggers many independent downstream reactions (receipts, notifications, analytics, fraud checks).',
    'High-throughput real-time streams (IoT telemetry, live delivery tracking, financial activity feeds).',
    'Systems that must stay resilient when downstream consumers temporarily slow down or go offline.',
    'Decoupling multiple teams so new features can subscribe to existing events without modifying the producer.',
  ],
  whenToAvoid: [
    'Simple request-response CRUD apps where the user immediately needs a synchronous answer from one database.',
    'Workflows that are hard to reason about without strong immediate consistency across steps.',
    'Very small teams with no need for fan-out or asynchronous resilience — adding a broker adds real debugging overhead.',
  ],
  scenario: {
    company: 'SwiftRide',
    domain: 'Real-Time Ride-Hailing & Dispatch Platform',
    teamSize: '35 engineers across Trip, Payments, Safety, and Growth teams',
    trafficProfile: 'Thousands of ride status updates per second during rush hour & rainstorms',
    story:
      'Whenever a rider finishes a trip on SwiftRide, five different systems care: Payments charges the card, Receipts emails an invoice, Driver Earnings updates payout balances, Surge Analytics recalculates city demand, and Safety logs trip telemetry.',
    whyThisArchitecture:
      'Instead of Trip Service synchronously calling 5 brittle endpoints, Trip Service publishes one `TripCompleted` event to the broker. Each consumer processes it independently — so even if the Email service goes down for 20 minutes during rush hour, messages safely queue up and riders still complete trips.',
  },
  diagram: {
    normalSummary:
      'Trip Service writes the completed trip and publishes a `TripCompleted` event to the Event Broker. Four independent consumers fan out and react in parallel without knowing about each other.',
    failureTitle: 'What happens when the Receipts / Email consumer goes down?',
    failureSummary:
      'Trip completion and Payments keep running without a hitch! The Event Broker safely buffers unprocessed `TripCompleted` events for the Receipts consumer until it recovers.',
    nodes: [
      {
        id: 'client',
        label: 'Driver App',
        sublabel: 'Tap "End Trip"',
        kind: 'client',
        x: 70,
        y: 170,
        beginnerSummary: 'Driver marks the trip complete and gets instant confirmation.',
        failureNote: 'Still gets a fast 200 OK — totally unaffected by downstream email outages.',
      },
      {
        id: 'producer',
        label: 'Trip Service',
        sublabel: 'Event Producer',
        kind: 'service',
        x: 235,
        y: 170,
        beginnerSummary: 'Saves trip state and emits a `TripCompleted` event via an Outbox.',
        failureNote: 'Keeps publishing events normally; does not even know Receipts is down.',
      },
      {
        id: 'broker',
        label: 'Event Broker',
        sublabel: 'Kafka / RabbitMQ',
        kind: 'queue',
        x: 430,
        y: 170,
        beginnerSummary: 'Durable message backbone that fans out every event to all subscribed consumer groups.',
        failureNote: 'Buffers unread events safely on disk for the offline Receipts consumer so nothing is lost.',
      },
      {
        id: 'payments',
        label: 'Payments',
        sublabel: 'Idempotent Consumer',
        kind: 'service',
        x: 665,
        y: 60,
        beginnerSummary: 'Charges the rider’s card once using the `tripId` as an idempotency key.',
        failureNote: 'Healthy — processes payments immediately without waiting for Receipts.',
      },
      {
        id: 'receipts',
        label: 'Receipts / Email',
        sublabel: 'Consumer Group B',
        kind: 'service',
        x: 665,
        y: 170,
        beginnerSummary: 'Generates PDF receipts and emails riders asynchronously.',
        failureNote: 'OFFLINE: Events stay queued in the broker and automatically catch up once Receipts restarts.',
      },
      {
        id: 'analytics',
        label: 'Live Analytics',
        sublabel: 'Consumer Group C',
        kind: 'service',
        x: 665,
        y: 280,
        beginnerSummary: 'Updates surge-pricing heatmaps and driver demand dashboards in real time.',
        failureNote: 'Healthy — keeps ingesting trip events smoothly.',
      },
    ],
    edges: [
      { from: 'client', to: 'producer', label: 'POST /complete' },
      { from: 'producer', to: 'broker', label: 'TripCompleted', async: true },
      { from: 'broker', to: 'payments', label: 'Sub A', async: true },
      { from: 'broker', to: 'receipts', label: 'Buffered!', async: true, buffersInFailureMode: true },
      { from: 'broker', to: 'analytics', label: 'Sub C', async: true },
    ],
  },
  deepDiveConcepts: [
    {
      id: 'eda-queue-vs-log',
      badge: 'Broker Mental Model',
      title: 'Message Queue vs. Pub/Sub vs. Replayable Event Log',
      summary:
        'Beginners often treat SQS, RabbitMQ, and Kafka as interchangeable — but they behave very differently after a consumer reads a message.',
      bulletPoints: [
        'Point-to-Point Queue (SQS, BullMQ): Each job is processed by ONE worker and then deleted. Great for background tasks.',
        'Pub/Sub Topic (SNS, RabbitMQ Fanout): Broadcasts each event to all currently subscribed queues; once delivered, it’s gone.',
        'Event Log / Stream (Kafka, Redpanda, Kinesis): Stores events in an append-only log for days or months so brand-new consumers can replay historical events from offset 0.',
      ],
      keyTakeaway:
        'Pick a simple Queue for 1-to-1 background jobs, Pub/Sub for multi-consumer fan-out, and an Event Log (Kafka) when you need high-throughput streams or historical replay.',
    },
    {
      id: 'eda-delivery-semantics',
      badge: 'Delivery Guarantees',
      title: 'At-Most-Once vs. At-Least-Once vs. "Effectively Once"',
      summary:
        'Over an unreliable network, true magical "exactly-once delivery" does not exist automatically — you choose a delivery guarantee and design around it.',
      bulletPoints: [
        'At-Most-Once: Fire-and-forget. Fast, zero duplicates, but messages can be lost (okay for non-critical metrics).',
        'At-Least-Once (Default): Broker retries until acknowledged. Nothing is lost, but duplicates WILL happen.',
        'Effectively Once: Combine Producer Transactional Outbox + At-Least-Once Broker + Idempotent Consumer.',
      ],
      keyTakeaway:
        'Assume at-least-once delivery everywhere: Outbox prevents lost events, and Idempotency prevents duplicate side effects.',
    },
    {
      id: 'eda-fat-thin-claim-check',
      badge: 'Event Payload Design',
      title: 'Fat vs. Thin Events & The Claim Check Pattern',
      summary:
        'Deciding how much data to pack into an event directly impacts coupling, privacy, and broker health.',
      bulletPoints: [
        'Thin Notification Events (`{ tripId }`): Tiny and always fresh, but if 6 consumers immediately query the producer API back, you can accidentally DDoS your own producer.',
        'Fat Events (Event-Carried State Transfer): Include the key fields consumers need (`tripId`, `fareCents`, `city`) so consumers work offline — just avoid stuffing mutable secrets or sensitive PII inside long-lived logs.',
        'Claim Check Pattern: Never push 15MB PDFs or images through Kafka/RabbitMQ. Upload the file to S3/R2 first and put only the small file URI/key in the event.',
      ],
      keyTakeaway:
        'Include the compact business snapshot consumers need, keep PII out of immutable logs, and use the Claim Check pattern for any large binary.',
    },
    {
      id: 'eda-choreography-vs-orchestration',
      badge: 'Workflow Control',
      title: 'Choreography vs. Orchestration (Avoiding Event Spaghetti)',
      summary:
        'Pure event choreography ("each service reacts on its own") feels effortless for 3 consumers — until a complex 8-step business flow becomes impossible to trace or debug.',
      bulletPoints: [
        'Choreography shines for independent side-effect fan-out: `TripCompleted` → Receipts, Analytics, Loyalty, Driver Earnings.',
        'Orchestration shines for strict multi-step business workflows with branching, timeouts, and refunds (e.g., checkout sagas) where one coordinator tracks state explicitly.',
      ],
      keyTakeaway:
        'Use choreography for decoupled fan-out across domains, and switch to an explicit orchestrator when you need one clear place to see "where is this order stuck right now?"',
    },
    {
      id: 'eda-schema-evolution',
      badge: 'Contract Governance',
      title: 'Event Schema Evolution & Schema Registries',
      summary:
        'In Event-Driven systems, a single producer may feed 6 independent consumers running different code versions — renaming or removing an event field breaks downstream teams silently.',
      bulletPoints: [
        'Enforce backward-compatible, additive-only changes: add new optional fields with safe defaults; never rename, delete, or change the type of an existing field in place.',
        'Use a Schema Registry (JSON Schema, Avro, or Protobuf) in CI to block breaking producer changes before deploy, and only introduce a new event version (`trip.completed.v2`) when semantics truly change.',
      ],
      keyTakeaway:
        'Events live in queues and logs far longer than HTTP requests — treat every published event schema as a permanent contract.',
    },
    {
      id: 'eda-outbox-skip-locked-cdc',
      badge: 'Reliable Publishing',
      title: 'Outbox Relay Concurrency (SKIP LOCKED) vs. Change Data Capture (CDC)',
      summary:
        'Writing to an `outbox_events` table solves the dual-write bug — next, you must publish those rows reliably even when running multiple relay workers at scale.',
      bulletPoints: [
        'Polling Relay (`FOR UPDATE SKIP LOCKED`): Simple to operate — multiple worker replicas claim disjoint batches of `PENDING` rows without stepping on each other.',
        'Change Data Capture (CDC / Debezium): Streams committed outbox inserts directly from PostgreSQL’s write-ahead log (WAL) to Kafka with sub-second latency and zero polling load on your primary DB.',
      ],
      keyTakeaway:
        'Start with a `FOR UPDATE SKIP LOCKED` polling relay; upgrade to WAL-based CDC (Debezium) when high throughput or ultra-low publish latency justifies extra infra.',
    },
    {
      id: 'eda-vs-cqrs-event-sourcing',
      badge: 'Clearing Up Confusion',
      title: 'EDA vs. CQRS vs. Event Sourcing (Don’t Conflate Them!)',
      summary:
        'Beginners often assume adopting Event-Driven Architecture requires full Event Sourcing — it does not! They are three distinct patterns with very different complexity budgets.',
      bulletPoints: [
        'Event-Driven Architecture (EDA): Services still store normal mutable rows in Postgres and publish domain events so others can react asynchronously.',
        'CQRS (Command Query Responsibility Segregation): Separates write tables from query-optimized read projections (e.g., syncing events into an Elasticsearch search index).',
        'Event Sourcing: Replaces mutable database state entirely with an append-only event log as the sole source of truth — great for ledgers/audit domains, but painful for schema migrations and GDPR deletes.',
      ],
      keyTakeaway:
        'Use EDA freely for decoupling and CQRS selectively for heavy read views, but treat full Event Sourcing as an advanced niche tool — not a default.',
    },
  ],
  codeComparisons: [
    {
      id: 'eda-idempotency',
      title: 'Non-Idempotent Consumer vs. Idempotency Key Guard',
      subtitle: 'Brokers guarantee "at-least-once" delivery — expect every event to arrive twice eventually.',
      context:
        'SwiftRide’s Payments consumer receives `TripCompleted` events and charges the rider’s credit card. Network hiccups occasionally cause the broker to redeliver the same event.',
      problemTitle: 'Pitfall: Blindly charging the card every time the event arrives',
      problemFile: 'payments-consumer/src/onTripCompleted.ts',
      problemCode: `import { stripe } from './stripe';
import { ledgerDb } from './db';

export async function onTripCompleted(event: {
  eventId: string;
  tripId: string;
  riderId: string;
  fareCents: number;
}) {
  // Danger: If the broker retries after a brief timeout,
  // the rider gets charged TWICE for the exact same ride!
  await stripe.charges.create({
    customer: event.riderId,
    amount: event.fareCents,
  });

  await ledgerDb.recordCharge(event.tripId, event.fareCents);
}`,
      refactoredTitle: 'Refactored: Atomic event claim + downstream idempotency key',
      refactoredFile: 'payments-consumer/src/onTripCompleted.ts',
      refactoredCode: `import { stripe } from './stripe';
import { ledgerDb } from './db';

export async function onTripCompleted(event: {
  eventId: string;
  tripId: string;
  riderId: string;
  fareCents: number;
}) {
  // 1. Atomic claim (UNIQUE on event_id) prevents concurrent race conditions!
  const claimed = await ledgerDb.claimEventOnce(event.eventId);
  if (!claimed) {
    return { skipped: true, reason: 'duplicate_event' };
  }

  // 2. Pass an idempotency key to downstream payment APIs too
  await stripe.charges.create(
    { customer: event.riderId, amount: event.fareCents },
    { idempotencyKey: \`trip-charge-\${event.tripId}\` }
  );

  await ledgerDb.recordCharge(event.tripId, event.eventId, event.fareCents);
}`,
      annotations: [
        {
          id: 'eda-1-dup-charge',
          label: '1. Double-Charge & Check-Then-Act Race',
          problemLines: [10, 15],
          refactoredLines: [10, 14],
          severity: 'high',
          problemExplanation:
            'If the consumer crashes right after `stripe.charges.create()` — or two duplicate deliveries arrive simultaneously — the rider gets charged twice for the exact same ride!',
          refactoredExplanation:
            'Atomically claiming `eventId` via `INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING` eliminates the check-then-act race window and makes duplicates harmless no-ops.',
        },
        {
          id: 'eda-1-stripe-key',
          label: '2. Downstream Idempotency Key',
          problemLines: [12, 15],
          refactoredLines: [16, 22],
          severity: 'medium',
          problemExplanation:
            'Even if your local DB is fast, a crash between Stripe and `ledgerDb` still leaves no proof that Stripe already charged the card.',
          refactoredExplanation:
            'Passing `idempotencyKey: "trip-charge-<tripId>"` ensures Stripe itself refuses to charge the same trip twice across retries.',
        },
      ],
      howToImplement: [
        {
          id: 'eda-inbox-pattern',
          label: 'Atomic Inbox Pattern (For DB-Only Consumers)',
          summary:
            'When a consumer updates your own database (like decrementing inventory), put the `processed_events` insert and domain `UPDATE` inside ONE SQL transaction.',
          steps: [
            'Create `processed_events (event_id TEXT PRIMARY KEY, processed_at TIMESTAMPTZ DEFAULT NOW())`.',
            'Inside one transaction, run `INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING event_id`.',
            'If 0 rows return, commit and exit early — otherwise run your domain `UPDATE` in the exact same transaction so they succeed or roll back atomically.',
          ],
          code: {
            filename: 'inventory-consumer/src/onOrderPlaced.ts',
            snippet: `await db.transaction(async (tx) => {
  const claimed = await tx.queryOne(
    \`INSERT INTO processed_events (event_id) VALUES ($1)
     ON CONFLICT (event_id) DO NOTHING RETURNING event_id\`,
    [event.eventId]
  );
  if (!claimed) return; // duplicate delivery — safe no-op!

  await tx.query('UPDATE inventory SET qty = qty - $1 WHERE sku = $2', [event.qty, event.sku]);
});`,
          },
        },
      ],
    },
    {
      id: 'eda-dual-write',
      title: 'The Dual-Write Bug vs. Transactional Outbox Pattern',
      subtitle: 'Writing to a database AND publishing to a broker in two separate steps can silently lose events.',
      context:
        'When a driver taps "End Trip", Trip Service must mark the trip as `COMPLETED` in Postgres AND emit `TripCompleted` to Kafka/RabbitMQ.',
      problemTitle: 'Pitfall: Updating DB and publishing to broker as two unrelated calls',
      problemFile: 'trip-service/src/completeTrip.ts',
      problemCode: `import { db } from './db';
import { broker } from './broker';

export async function completeTrip(tripId: string, fareCents: number) {
  // Step 1: Succeeds and commits to Postgres
  await db.query(
    'UPDATE trips SET status = $1, fare_cents = $2 WHERE id = $3',
    ['COMPLETED', fareCents, tripId]
  );

  // Step 2: What if the server crashes or broker blips right here?
  // Trip is marked COMPLETED, yet Payments NEVER gets notified!
  await broker.publish('trip.completed', { tripId, fareCents });
}`,
      refactoredTitle: 'Refactored: Saving Trip + Outbox Event in ONE DB transaction',
      refactoredFile: 'trip-service/src/completeTrip.ts',
      refactoredCode: `import { db } from './db';

export async function completeTrip(tripId: string, fareCents: number) {
  // Both writes succeed or roll back TOGETHER atomically
  await db.transaction(async (tx) => {
    await tx.query(
      'UPDATE trips SET status = $1, fare_cents = $2 WHERE id = $3',
      ['COMPLETED', fareCents, tripId]
    );

    // A background relay worker reads pending outbox rows & publishes safely
    await tx.query(
      \`INSERT INTO outbox_events (event_type, payload, status)
       VALUES ($1, $2, 'PENDING')\`,
      ['trip.completed', JSON.stringify({ tripId, fareCents })]
    );
  });
}`,
      annotations: [
        {
          id: 'eda-2-split',
          label: '1. Unreliable Dual Write',
          problemLines: [5, 13],
          refactoredLines: [4, 10],
          severity: 'high',
          problemExplanation:
            'A database and a message broker cannot share a simple transaction. If the process crashes between lines 9 and 13, the trip is complete in Postgres but the `trip.completed` event is lost forever (free rides!).',
          refactoredExplanation:
            'Writing the trip update and the event record inside a single SQL transaction guarantees they either both commit or both roll back.',
        },
        {
          id: 'eda-2-outbox',
          label: '2. Guaranteed Event Delivery',
          problemLines: [11, 13],
          refactoredLines: [11, 16],
          severity: 'medium',
          problemExplanation:
            'If the broker is briefly unreachable, the driver’s "End Trip" button fails even though the database is healthy.',
          refactoredExplanation:
            'A lightweight Outbox Relay worker polls `outbox_events` (or streams WAL changes) and publishes to the broker with retries until confirmed.',
        },
      ],
    },
    {
      id: 'eda-replay-disaster',
      title: 'Event Replay Side-Effect Disaster vs. Isolated Backfill',
      subtitle: 'Replaying old events onto a shared live topic can accidentally email or charge thousands of users.',
      context:
        'SwiftRide launches a brand-new City Heatmap Analytics service and wants to populate it with the last 100,000 completed trips.',
      problemTitle: 'Pitfall: Re-publishing historical trips to the shared live topic',
      problemFile: 'scripts/backfillAnalytics.ts',
      problemCode: `// Replaying 100,000 old trips onto the LIVE shared topic to backfill Analytics!
export async function backfillAnalytics(oldTrips: Trip[]) {
  for (const trip of oldTrips) {
    // DANGER: Receipts & Push consumers ALSO subscribe to 'trip.completed'!
    await broker.publish('trip.completed', {
      tripId: trip.id,
      riderEmail: trip.riderEmail,
    });
  }
}`,
      refactoredTitle: 'Refactored: Dedicated backfill channel (or isolated Kafka consumer group)',
      refactoredFile: 'scripts/backfillAnalytics.ts',
      refactoredCode: `// Option A (Kafka): Point ONLY the new Analytics consumer group to offset 0
// Option B (Dedicated backfill topic): Isolate replays from live side-effect consumers
export async function backfillAnalytics(oldTrips: Trip[]) {
  for (const trip of oldTrips) {
    // Publish to a dedicated backfill channel — never the live user-facing topic
    await broker.publish('analytics.trip.backfill', {
      tripId: trip.id,
      meta: { isReplay: true, targetConsumer: 'analytics' },
    });
  }
}`,
      annotations: [
        {
          id: 'eda-3-spam',
          label: '1. Unintended Side Effects on Live Consumers',
          problemLines: [4, 8],
          refactoredLines: [5, 9],
          severity: 'high',
          problemExplanation:
            'Every consumer subscribed to `trip.completed` receives those 100,000 replayed events — causing the Email/Push consumer to spam riders with months-old trip receipts!',
          refactoredExplanation:
            'Routing backfill events to a dedicated `analytics.trip.backfill` topic (and tagging `meta.isReplay: true`) guarantees Payments and Receipts never wake up.',
        },
        {
          id: 'eda-3-kafka-group',
          label: '2. Leveraging Event Log Consumer Groups',
          problemLines: [1, 3],
          refactoredLines: [1, 2],
          severity: 'medium',
          problemExplanation:
            'Manually re-emitting old database rows onto a shared pub/sub topic mixes live traffic with historical bulk backfills.',
          refactoredExplanation:
            'With a replayable event log like Kafka, a brand-new consumer group simply reads from offset 0 independently without re-publishing anything to existing consumers.',
        },
      ],
    },
    {
      id: 'eda-outbox-relay-locking',
      title: 'Naive Outbox Poller vs. SKIP LOCKED Batch Relay & Versioned Envelope',
      subtitle: 'Scaling an outbox relay without row locking causes duplicate publish storms and brittle payloads.',
      context:
        'SwiftRide runs 3 Outbox Relay worker containers for high availability, polling `outbox_events` every 200ms to publish `trip.completed` to Kafka.',
      problemTitle: 'Pitfall: Uncoordinated pollers grabbing identical rows & raw payloads',
      problemFile: 'trip-service/src/outboxRelay.ts',
      problemCode: `export async function pollAndPublishOutbox() {
  // Danger: Two relay replicas select the EXACT same pending rows!
  const rows = await db.query(
    \`SELECT id, event_type, payload FROM outbox_events
     WHERE status = 'PENDING' LIMIT 50\`
  );

  for (const row of rows) {
    // Unversioned raw payload breaks consumers when fields evolve
    await broker.publish(row.event_type, row.payload);
    await db.query(\`UPDATE outbox_events SET status = 'PUBLISHED' WHERE id = $1\`, [row.id]);
  }
}`,
      refactoredTitle: 'Refactored: Short SKIP LOCKED claim + publish outside DB lock',
      refactoredFile: 'trip-service/src/outboxRelay.ts',
      refactoredCode: `export async function pollAndPublishOutbox() {
  // 1. Short DB tx claims disjoint rows with SKIP LOCKED (no network call inside tx!)
  const rows = await db.query(
    \`UPDATE outbox_events SET status = 'PROCESSING', locked_until = NOW() + INTERVAL '30s'
     WHERE id IN (
       SELECT id FROM outbox_events
       WHERE status = 'PENDING' OR (status = 'PROCESSING' AND locked_until < NOW())
       ORDER BY created_at ASC LIMIT 50 FOR UPDATE SKIP LOCKED
     ) RETURNING id, event_type, correlation_id, payload, attempts\`
  );

  // 2. Publish outside the DB lock with a versioned envelope & failure cap
  for (const row of rows) {
    try {
      await broker.publish(row.event_type, {
        eventId: row.id, schemaVersion: 2, correlationId: row.correlation_id, data: row.payload,
      });
      await db.query(\`UPDATE outbox_events SET status = 'PUBLISHED' WHERE id = $1\`, [row.id]);
    } catch {
      const nextStatus = row.attempts >= 4 ? 'FAILED' : 'PENDING';
      await db.query(\`UPDATE outbox_events SET status = $1, attempts = attempts + 1 WHERE id = $2\`, [nextStatus, row.id]);
    }
  }
}`,
      annotations: [
        {
          id: 'eda-4-skip-locked',
          label: '1. Duplicate Contention & Long DB Locks',
          problemLines: [2, 6],
          refactoredLines: [2, 10],
          severity: 'high',
          problemExplanation:
            'Plain `SELECT ... WHERE status = PENDING` returns identical rows to all 3 relay replicas. Worse, holding a SQL transaction open while making 50 network calls to Kafka pins database connections!',
          refactoredExplanation:
            'A single fast `UPDATE ... FOR UPDATE SKIP LOCKED RETURNING` claims an exclusive batch with a 30s lease (so crashed relays auto-recover) and immediately releases the DB lock before network I/O.',
        },
        {
          id: 'eda-4-envelope',
          label: '2. Versioned Envelope & Poison-Row Cap',
          problemLines: [8, 12],
          refactoredLines: [12, 23],
          severity: 'medium',
          problemExplanation:
            'Publishing raw unversioned payloads without `eventId`, `schemaVersion`, or `correlationId` breaks tracing and schema evolution — and one unpublishable row retries forever.',
          refactoredExplanation:
            'Publishing outside the lock with a standard versioned envelope and capping `attempts` (`FAILED` after 5 tries) keeps relay workers healthy without blocking other events.',
        },
      ],
      howToImplement: [
        {
          id: 'eda-outbox-schema-cleanup',
          label: 'Outbox Table Schema, Index & Cleanup',
          summary:
            'Add a partial index on `PENDING` rows so polling stays O(1), and schedule periodic cleanup so `PUBLISHED` rows never bloat Postgres to millions of rows.',
          steps: [
            'Create `outbox_events` with `status`, `attempts`, `locked_until`, and `correlation_id` columns.',
            'Add a **partial index** `WHERE status IN (\'PENDING\', \'PROCESSING\')` so Postgres only indexes the tiny active backlog.',
            'Run a daily cron job deleting `PUBLISHED` rows older than 7 days (or partition by day) to keep disk and vacuuming healthy.',
          ],
          code: {
            filename: 'migrations/001_outbox_events.sql',
            snippet: `CREATE TABLE outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  correlation_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_outbox_active ON outbox_events (created_at)
  WHERE status IN ('PENDING', 'PROCESSING');`,
          },
        },
      ],
    },
  ],
  bestPractices: [
    {
      title: 'Name Events as Past-Tense Facts, Not Commands',
      detail:
        'Use `TripCompleted` or `OrderPlaced` (facts) rather than `ChargeRider` (command) so producers stay decoupled from who listens.',
    },
    {
      title: 'Design Every Consumer to Be Idempotent',
      detail:
        'Include a unique `eventId` and `occurredAt` timestamp in every envelope, and track processed IDs so retries are always safe.',
    },
    {
      title: 'Isolate Replays & Backfills from Side-Effect Consumers',
      detail:
        'Use dedicated consumer groups on event logs (Kafka) or separate backfill topics so replaying history never triggers duplicate emails, SMS, or card charges.',
    },
    {
      title: 'Always Configure Dead Letter Queues (DLQs) & Lag Alerts',
      detail:
        'Malformed "poison pill" events should move to a DLQ after N retries, and consumer lag alerts should fire before backlogs grow silently.',
    },
    {
      title: 'Wrap Events in a Standard Schema-Validated Envelope',
      detail:
        'Use a consistent envelope (`eventId`, `eventType`, `schemaVersion`, `occurredAt`, `correlationId`, `source`, `data`) validated with Zod, JSON Schema, or Avro.',
    },
    {
      title: 'Use the Claim Check Pattern for Large Payloads',
      detail:
        'Store large attachments (PDFs, images, exports) in S3/object storage and pass only the lightweight storage key inside the event message.',
    },
    {
      title: 'Evolve Event Schemas Backward-Compatibly (Additive-Only)',
      detail:
        'Add new optional fields instead of renaming or dropping live properties, and enforce schema compatibility checks in CI with a Schema Registry.',
    },
  ],
  pitfalls: [
    {
      title: 'Event Replay Side-Effect Disaster',
      symptom: 'Replaying old events to rebuild an analytics table accidentally triggers the Email or Billing consumer for thousands of past customers.',
      fix: 'Use isolated consumer groups on durable logs (Kafka) or publish backfills to a dedicated non-live topic.',
    },
    {
      title: 'Breaking Event Schema Changes Without Versioning',
      symptom: 'Producer renames `fareCents` to `amountCents`, instantly crashing 4 downstream consumers and flooding the Dead Letter Queue.',
      fix: 'Keep schema updates additive-only (publish both fields during transition) or bump to a new versioned topic (`trip.completed.v2`) with consumer migration windows.',
    },
    {
      title: 'Storing Sensitive PII in Immutable Event Logs',
      symptom: 'A customer invokes their GDPR "right to be forgotten," but their raw email and address are permanently baked into 90 days of immutable Kafka topics.',
      fix: 'Keep raw PII in an encrypted reference store (emit only `userId`) or encrypt per-user fields with erasable keys (crypto-shredding).',
      howToImplement: {
        id: 'eda-crypto-shredding',
        label: 'How Crypto-Shredding Works',
        summary:
          'When an event must carry PII in an immutable log, encrypt PII fields with a unique per-user key stored in a normal mutable database table.',
        steps: [
          'Keep a mutable `user_encryption_keys (user_id, dek_ciphertext)` table protected by your KMS.',
          'Before publishing an event, encrypt only PII fields (`email`, `address`) with that user’s DEK while leaving `userId`, `fareCents`, and `city` readable for analytics.',
          'When a user requests GDPR deletion, delete their row in `user_encryption_keys` — historical Kafka events stay intact structurally, while the PII becomes permanently unreadable ciphertext.',
        ],
        watchOut:
          'Simplest default for beginners: omit raw PII from events altogether and emit only `userId`, fetching contact details from an encrypted profile service (with short caching) only in consumers that truly need it.',
      },
    },
    {
      title: 'Passing Large Blobs Inside Messages',
      symptom: 'Publishing 15MB PDFs or images straight into RabbitMQ/Kafka spikes broker memory, hits message size caps, and stalls other consumers.',
      fix: 'Apply the Claim Check Pattern: upload binaries to object storage and emit only the small URI/key.',
    },
    {
      title: 'Silent Consumer Lag & Poison Pill Stalls',
      symptom: 'One malformed message retries forever and blocks its entire partition while consumer lag quietly grows to hours with nobody alerted.',
      fix: 'Cap retries, route unparseable poison pills to a Dead Letter Queue, and set automated alerts on both consumer lag and DLQ depth.',
      howToImplement: {
        id: 'eda-dlq-routing-redrive',
        label: 'Poison Pill Routing & Safe DLQ Redrive',
        summary:
          'Send permanent schema/validation errors straight to the DLQ (zero wasted retries), retry transient outages up to N times, and replay DLQ messages safely once fixed.',
        steps: [
          'Validate payloads at consumer entry (e.g., with Zod). On `ValidationError`, publish immediately to `<topic>.dlq` with `{ originalEvent, error, failedAt }` and ack the main queue.',
          'On transient errors (`503`, DB timeout), retry with exponential backoff up to N attempts (e.g., 3–5) before moving to the DLQ.',
          'To **redrive (replay)** after deploying a fix: inspect 1 DLQ message, test replay on 1–5 messages first, then redrive in throttled batches (your idempotent consumer keeps retries safe!).',
        ],
        code: {
          filename: 'consumers/handleMessage.ts',
          snippet: `try {
  const parsed = TripEventSchema.parse(rawMsg); // throws ZodError if malformed
  await processTrip(parsed);
} catch (err) {
  const isPermanent = err instanceof ZodError;
  if (isPermanent || rawMsg.attempts >= 3) {
    await broker.publish('trip.completed.dlq', { rawMsg, reason: String(err) });
    return; // ack original so partition keeps moving!
  }
  throw err; // transient error -> broker retries with backoff
}`,
        },
      },
    },
    {
      title: 'Event Spaghetti (Hard-to-Trace Pinball Chains)',
      symptom: 'Event A triggers B which triggers C and D across 6 services, and nobody knows the full flow anymore.',
      fix: 'Keep event chains shallow, introduce an orchestrator for complex multi-step workflows, and propagate a `correlationId` across every emitted event.',
    },
    {
      title: 'Assuming Strict Global Ordering',
      symptom: '`TripCompleted` arrives before `TripStarted` due to parallel consumers, corrupting status fields.',
      fix: 'Partition events by entity ID (e.g., `tripId`) and guard state transitions defensively.',
      howToImplement: {
        id: 'eda-defensive-state-guard',
        label: 'Guard State Transitions in SQL',
        summary:
          'Even with partition keys (Kafka key / SQS FIFO `MessageGroupId`), retries can still deliver an older event late — enforce monotonic state/version checks in SQL.',
        steps: [
          'Include a monotonic `entityVersion` (or sequence number) on every event emitted for that entity.',
          'Only apply an update if the incoming version is newer (`WHERE last_version < $incomingVersion`) AND the transition is legal (e.g., never regress `COMPLETED` back to `STARTED`).',
          'If 0 rows update because a newer state is already stored, log and ack the stale event safely.',
        ],
        code: {
          filename: 'consumers/updateTripStatus.sql',
          snippet: `-- Stale/out-of-order TripStarted (version 1) cannot overwrite TripCompleted (version 2)
UPDATE trip_projections
SET status = $1, last_version = $2
WHERE trip_id = $3
  AND last_version < $2
  AND status <> 'COMPLETED';`,
        },
      },
    },
  ],
  miniChecks: [
    {
      id: 'eda-check-1',
      prompt:
        'When a customer places an order, 5 separate systems (Inventory, Fraud Detection, Loyalty Points, Warehouse Dispatch, and Email) all need to react without slowing down checkout.',
      isGoodFit: true,
      explanation:
        'Classic Event-Driven fit! Broadcasting one `OrderPlaced` event lets all 5 consumers react independently and absorb spikes without delaying checkout.',
    },
    {
      id: 'eda-check-2',
      prompt:
        'A simple internal admin tool lets 3 managers edit product prices in a single Postgres table and view the updated table immediately.',
      isGoodFit: false,
      betterAlternative: 'modular-monolith',
      explanation:
        'Overkill for EDA. There is no fan-out or high-throughput async pipeline — introducing Kafka or RabbitMQ here only adds complexity and eventual-consistency bugs.',
    },
  ],
  practiceProjects: [
    {
      id: 'proj-eda-order-fanout',
      architectureId: 'event-driven',
      title: 'Order Confirmation Fan-Out Pipeline',
      difficulty: 'starter',
      estimatedTime: '3–4 hours',
      summary:
        'Build one tiny Order Producer that emits `OrderPlaced` events into Redis Streams or RabbitMQ, plus 3 independent TypeScript consumers (Receipts, Inventory, Email Simulator).',
      suggestedStack: ['Node.js + TypeScript', 'Redis Streams or RabbitMQ (Docker)', 'SQLite for deduplication'],
      folderStructure: `order-fanout-eda/
├── producer/            (POST /orders -> emits OrderPlaced)
├── consumers/
│   ├── receipts.ts      (writes receipt log)
│   ├── inventory.ts     (decrements stock safely)
│   └── emailer.ts       (simulates flaky email server)
└── docker-compose.yml   (redis or rabbitmq)`,
      milestones: [
        {
          id: 'eda-p1-m1',
          title: 'Create the Order Producer with a typed event envelope',
          detail: 'Emit `{ eventId, type: "OrderPlaced", occurredAt, payload }` whenever `POST /orders` is called.',
        },
        {
          id: 'eda-p1-m2',
          title: 'Run 3 independent consumer scripts in separate terminals',
          detail: 'Verify one order triggers all 3 consumers without the producer knowing any of them exist.',
        },
        {
          id: 'eda-p1-m3',
          title: 'Simulate a duplicate event & verify idempotency',
          detail: 'Publish the exact same `eventId` twice and prove `inventory.ts` only decrements stock once.',
        },
        {
          id: 'eda-p1-m4',
          title: 'Break it on purpose: Evolve the schema & test tolerant consumers',
          detail: 'Add a new optional `couponCode` field to `OrderPlaced` (`schemaVersion: 2`) and confirm older consumers continue processing safely without crashing.',
        },
      ],
      architectureRules: [
        'Stop `emailer.ts`, place 3 orders, then restart `emailer.ts` — it must catch up and process the missed events.',
        'Every consumer must be safe to receive the exact same event multiple times.',
      ],
    },
    {
      id: 'proj-eda-expense-hub',
      architectureId: 'event-driven',
      title: 'Live Shared-Expense & Budget Alert Hub',
      difficulty: 'stretch',
      estimatedTime: '1 weekend',
      summary:
        'Emit `ExpenseAdded` events via a mini Transactional Outbox to power real-time group balances, monthly budget-threshold alerts, and an immutable audit log.',
      suggestedStack: ['Node.js + TypeScript', 'PostgreSQL or SQLite (Outbox)', 'RabbitMQ / BullMQ / Redis Streams'],
      folderStructure: `expense-eda-hub/
├── expense-api/         (writes expense + outbox row in 1 tx)
├── outbox-relay/        (polls pending rows -> publishes to broker)
├── consumers/
│   ├── balance-calc/    (updates who-owes-whom view)
│   ├── budget-alerts/   (flags >80% monthly spend)
│   └── audit-log/       (append-only history)
└── docker-compose.yml`,
      milestones: [
        {
          id: 'eda-p2-m1',
          title: 'Implement the Transactional Outbox write',
          detail: 'Insert into `expenses` and `outbox_events` inside one single database transaction.',
        },
        {
          id: 'eda-p2-m2',
          title: 'Build the Outbox Relay publisher',
          detail: 'Poll `PENDING` outbox rows every 500ms, publish to your broker, and mark rows `PUBLISHED`.',
        },
        {
          id: 'eda-p2-m3',
          title: 'Add a Dead Letter Queue for bad payloads',
          detail: 'Send a malformed expense event and verify it moves to a DLQ after 3 retries instead of crashing the consumer.',
        },
        {
          id: 'eda-p2-m4',
          title: 'Break it on purpose: Stop the broker for 30s during writes',
          detail: 'Shut down RabbitMQ/Redis while submitting 5 new expenses, restart the broker, and verify the Outbox Relay delivers all 5 events with zero data loss.',
        },
      ],
      architectureRules: [
        'Never publish to the broker inside the HTTP handler directly — always go through the Outbox table.',
        'Attach a `correlationId` to every event so you can trace one expense across all three consumer logs.',
      ],
      starterHints: [
        {
          id: 'eda-p2-hint-dlq',
          label: 'Outbox Table + DLQ Routing Starter',
          summary:
            'Use a simple `attempts` counter and Zod schema check in your consumer so malformed payloads move to `expenses.dlq` after 3 retries without crashing.',
          steps: [
            'Create `outbox_events (id, event_type, correlation_id, payload, status, attempts, created_at)` in SQLite/Postgres.',
            'In your relay, claim pending rows, publish `{ eventId, correlationId, data }`, and mark `PUBLISHED`.',
            'In each consumer, route Zod parse errors or `attempts >= 3` to an `expenses.dlq` stream/queue and ack the bad message.',
          ],
        },
      ],
    },
  ],
  comparisonProfile: {
    idealTeamSize: '10–200+ engineers',
    deploymentUnit: 'Producers + Event Broker + Consumers',
    scalingStyle: 'Scale consumers independently per topic/queue',
    opsComplexity: 'High',
    devVelocityEarly: 'Medium',
    faultIsolation: 'Very High',
    costAtIdle: 'Broker + Workers',
    dataConsistency: 'Eventual',
    typicalDatastore: 'Durable Broker Log (Kafka/RabbitMQ) + per-consumer stores',
    bestFor: 'Real-time fan-out, decoupled multi-consumer workflows, burst-resilient pipelines',
  },
};
