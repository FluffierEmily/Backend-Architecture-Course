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
      refactoredTitle: 'Refactored: Deduplicating with an idempotency key',
      refactoredFile: 'payments-consumer/src/onTripCompleted.ts',
      refactoredCode: `import { stripe } from './stripe';
import { ledgerDb } from './db';

export async function onTripCompleted(event: {
  eventId: string;
  tripId: string;
  riderId: string;
  fareCents: number;
}) {
  // 1. Check if we already processed this unique event / trip
  const alreadyProcessed = await ledgerDb.hasProcessedEvent(event.eventId);
  if (alreadyProcessed) {
    return { skipped: true, reason: 'duplicate_event' };
  }

  // 2. Pass an idempotency key to downstream payment APIs too
  await stripe.charges.create(
    { customer: event.riderId, amount: event.fareCents },
    { idempotencyKey: \`trip-charge-\${event.tripId}\` }
  );

  await ledgerDb.recordChargeAndEvent(event.tripId, event.eventId, event.fareCents);
}`,
      annotations: [
        {
          id: 'eda-1-dup-charge',
          label: '1. Double-Charge on Retry',
          problemLines: [10, 15],
          refactoredLines: [10, 14],
          severity: 'high',
          problemExplanation:
            'If the consumer crashes right after `stripe.charges.create()` but before acknowledging the message, the broker redelivers `TripCompleted` and charges the rider a second time!',
          refactoredExplanation:
            'Checking a unique `eventId` (backed by a database UNIQUE constraint) makes duplicate deliveries harmless no-ops.',
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
  ],
  pitfalls: [
    {
      title: 'Event Replay Side-Effect Disaster',
      symptom: 'Replaying old events to rebuild an analytics table accidentally triggers the Email or Billing consumer for thousands of past customers.',
      fix: 'Use isolated consumer groups on durable logs (Kafka) or publish backfills to a dedicated non-live topic.',
    },
    {
      title: 'Event Spaghetti (Hard-to-Trace Pinball Chains)',
      symptom: 'Event A triggers B which triggers C and D across 6 services, and nobody knows the full flow anymore.',
      fix: 'Keep event chains shallow, document event contracts centrally, and propagate a `correlationId` across every emitted event.',
    },
    {
      title: 'Assuming Strict Global Ordering',
      symptom: '`TripCompleted` arrives before `TripStarted` due to parallel consumers, corrupting status fields.',
      fix: 'Partition events by entity ID (e.g., `tripId`) and guard state transitions defensively.',
    },
    {
      title: 'Forgetting Eventual Consistency in the UI',
      symptom: 'Frontend immediately fetches `/receipt` right after `/complete` and shows a 404 because the async consumer took 300ms.',
      fix: 'Design UI states for "Generating receipt..." and push updates via polling, SSE, or WebSockets.',
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
      ],
      architectureRules: [
        'Never publish to the broker inside the HTTP handler directly — always go through the Outbox table.',
        'Attach a `correlationId` to every event so you can trace one expense across all three consumer logs.',
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
    bestFor: 'Real-time fan-out, decoupled multi-consumer workflows, burst-resilient pipelines',
  },
};
