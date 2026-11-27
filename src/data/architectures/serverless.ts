import type { ArchitectureModule } from '../../types/course';

export const serverlessModule: ArchitectureModule = {
  id: 'serverless',
  order: 3,
  name: 'Serverless',
  shortName: 'Serverless',
  tagline: 'Pay-per-execution functions that scale automatically from zero to massive bursts.',
  accentColor: 'amber',
  beginnerSummary:
    'In a Serverless architecture, you write small stateless functions (AWS Lambda, Cloudflare Workers, Vercel Functions) triggered by HTTP requests, file uploads, queues, or schedules. The cloud provider runs servers for you, scales instantly during spikes, and charges $0 when traffic is idle.',
  whenToUse: [
    'Unpredictable, spiky, or intermittent workloads (e.g., idle overnight, 50x bursts during drops).',
    'Background processing pipelines: image resizing, PDF generation, webhook handlers, scheduled cron jobs.',
    'Tiny teams that want near-zero server maintenance and pay-for-what-you-use pricing.',
    'Rapid prototypes and Glue APIs connecting managed cloud services (S3, Auth, Stripe, DB).',
  ],
  whenToAvoid: [
    'Steady, high-volume 24/7 compute workloads where always-on containers are significantly cheaper.',
    'Long-running jobs exceeding function execution limits (e.g., 2-hour video renders or persistent WebSocket game servers).',
    'Ultra-low latency financial trading APIs that cannot tolerate occasional cold starts.',
  ],
  scenario: {
    company: 'SnapResize',
    domain: 'On-Demand Image & Document Processing Pipeline',
    teamSize: '2 indie engineers',
    trafficProfile: 'Near-zero traffic at 3 AM, sudden 10,000-upload bursts during e-commerce sales',
    story:
      'SnapResize powers product thumbnails and PDF invoice watermarks for online stores. Running 20 beefy servers 24/7 just to survive 15-minute flash sales would burn their entire budget, yet a single small server crashes during bursts.',
    whyThisArchitecture:
      'Triggering stateless serverless functions on S3 file uploads and queue messages lets SnapResize scale to hundreds of parallel workers in seconds, pay almost nothing during quiet hours, and skip managing OS patches or load balancers.',
  },
  diagram: {
    normalSummary:
      'An Upload Intake function immediately returns a signed upload URL. Uploading to Object Storage automatically triggers parallel Resize Functions that scale up and down on demand.',
    failureTitle: 'What happens during a sudden 50x upload spike?',
    failureSummary:
      'Stateless functions spin up in parallel automatically — BUT if every new function opens a direct TCP database connection, the traditional SQL database becomes the bottleneck unless you use pooling or a queue!',
    nodes: [
      {
        id: 'client',
        label: 'Storefront App',
        sublabel: 'Spiky Uploads',
        kind: 'client',
        x: 75,
        y: 170,
        beginnerSummary: 'Requests a quick upload URL, then uploads files directly to cloud storage.',
        failureNote: 'Upload requests stay fast because heavy image resizing does not block HTTP.',
      },
      {
        id: 'gateway',
        label: 'API Gateway',
        sublabel: 'HTTP Trigger',
        kind: 'gateway',
        x: 240,
        y: 95,
        beginnerSummary: 'Routes incoming HTTP requests to tiny serverless intake functions.',
        failureNote: 'Absorbs burst traffic easily and invokes functions in parallel.',
      },
      {
        id: 'intake',
        label: 'Intake Fn',
        sublabel: 'Thin & Fast',
        kind: 'function',
        x: 430,
        y: 95,
        beginnerSummary: 'Validates auth, creates a job record, and returns a signed upload URL in ~40ms.',
        failureNote: 'Scales to 100+ instances instantly; cold starts may add ~150ms on brand-new instances.',
      },
      {
        id: 'queue',
        label: 'Storage / Queue',
        sublabel: 'Event Trigger',
        kind: 'queue',
        x: 240,
        y: 250,
        beginnerSummary: 'When a file lands in S3 or a job hits SQS, it triggers worker functions with automatic retries.',
        failureNote: 'Smoothly buffers 10,000 image jobs with concurrency limits so downstream DBs stay safe.',
      },
      {
        id: 'worker',
        label: 'Resize Fn (xN)',
        sublabel: 'Auto-Scaled Workers',
        kind: 'function',
        x: 450,
        y: 250,
        beginnerSummary: 'Processes thumbnails and watermarks in parallel, billing only for exact milliseconds used.',
        failureNote: 'Without concurrency caps & DB pooling, 500 parallel functions can exhaust database connections!',
      },
      {
        id: 'db',
        label: 'Pooled DB / Store',
        sublabel: 'Metadata & Assets',
        kind: 'database',
        x: 685,
        y: 170,
        beginnerSummary: 'Stores asset status via a serverless-friendly connection proxy or HTTP API.',
        failureNote: 'Protected when functions reuse clients & use a connection pooler; crashes without one!',
      },
    ],
    edges: [
      { from: 'client', to: 'gateway', label: 'POST /upload' },
      { from: 'gateway', to: 'intake', label: 'Invoke' },
      { from: 'client', to: 'queue', label: 'Direct Upload', async: true },
      { from: 'queue', to: 'worker', label: 'Trigger (capped)', async: true, buffersInFailureMode: true },
      { from: 'intake', to: 'db', label: 'Save Job' },
      { from: 'worker', to: 'db', label: 'Update Status', failsInFailureMode: true },
    ],
  },
  deepDiveConcepts: [
    {
      id: 'sl-denial-of-wallet',
      badge: 'Security & Cost',
      title: 'Preventing "Denial-of-Wallet" Attacks',
      summary:
        'Traditional servers crash when flooded by bots or buggy client loops; serverless functions auto-scale to handle the flood — and send you the bill at the end of the month.',
      bulletPoints: [
        'Put strict API Gateway rate limits and WAF rules in front of every public endpoint.',
        'Set hard account/function concurrency limits and cloud budget alarms so a bug cannot spin up 10,000 runaway invocations overnight.',
      ],
      keyTakeaway:
        'Infinite auto-scaling without rate limits and concurrency caps is an infinite credit card swipe.',
    },
    {
      id: 'sl-durable-workflows',
      badge: 'Long-Running Jobs',
      title: 'Durable Workflows Beyond the 15-Minute Limit',
      summary:
        'Single serverless functions have strict execution limits (typically 10s–15min). Multi-step flows — like "wait 24 hours, send reminder email, charge card" — should never sleep inside a function.',
      bulletPoints: [
        'Use a workflow orchestrator (AWS Step Functions, Inngest, Temporal, or Cloudflare Workflows) to pause between steps at $0 compute cost.',
        'Each step gets automatic retries, state persistence, and clean visual debugging.',
      ],
      keyTakeaway:
        'Never pay a serverless function to `sleep()` or wait on another slow function — orchestrate multi-step flows with queues or durable workflows.',
    },
  ],
  codeComparisons: [
    {
      id: 'sl-db-pool',
      title: 'Connection Exhaustion vs. Reusing Clients Outside the Handler',
      subtitle: 'Serverless containers get reused across warm invocations — initialize clients once!',
      context:
        'SnapResize’s `recordAssetStatus` function runs whenever a thumbnail finishes processing. During a flash sale, 300 invocations run concurrently.',
      problemTitle: 'Pitfall: Opening a brand-new DB connection on every invocation',
      problemFile: 'functions/recordAssetStatus.ts',
      problemCode: `import { Client } from 'pg';

export async function handler(event: { assetId: string; url: string }) {
  // Created fresh on EVERY single request!
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();

  await db.query(
    'UPDATE assets SET thumb_url = $1, status = $2 WHERE id = $3',
    [event.url, 'ready', event.assetId]
  );

  // If the query throws above, this connection leaks forever!
  await db.end();
  return { ok: true };
}`,
      refactoredTitle: 'Refactored: Module-scope pooled/HTTP client reused across warm runs',
      refactoredFile: 'functions/recordAssetStatus.ts',
      refactoredCode: `import { Pool } from 'pg';

// Created ONCE per container lifecycle & reused across warm invocations
const pool = new Pool({
  connectionString: process.env.POOLED_DATABASE_URL, // e.g. PgBouncer / RDS Proxy
  max: 2, // Keep per-function connections tiny!
  idleTimeoutMillis: 10_000,
});

export async function handler(event: { assetId: string; url: string }) {
  await pool.query(
    'UPDATE assets SET thumb_url = $1, status = $2 WHERE id = $3',
    [event.url, 'ready', event.assetId]
  );

  return { ok: true };
}`,
      annotations: [
        {
          id: 'sl-1-reconnect',
          label: '1. Slow Handshake Every Run',
          problemLines: [4, 6],
          refactoredLines: [3, 8],
          severity: 'high',
          problemExplanation:
            'Opening a fresh TCP + TLS database handshake inside `handler()` adds 50–200ms to every invocation and quickly hits PostgreSQL’s `max_connections` limit during traffic spikes.',
          refactoredExplanation:
            'Initializing a tiny `Pool` (`max: 2`) outside the handler lets warm Lambda/Function containers reuse connections — and pointing at a connection pooler protects your DB during 300x bursts.',
        },
        {
          id: 'sl-1-leak',
          label: '2. Leaked Connections on Error',
          problemLines: [13, 14],
          refactoredLines: [10, 16],
          severity: 'medium',
          problemExplanation:
            'If `db.query()` throws an error, `db.end()` never runs — leaking open sockets until your database refuses all new traffic.',
          refactoredExplanation:
            'Using `pool.query()` automatically returns connections to the pool even if a query throws, keeping error paths clean and leak-free.',
        },
      ],
    },
    {
      id: 'sl-fat-sync',
      title: 'Fat Synchronous Function vs. Thin Intake + Async Queue',
      subtitle: 'Don’t make HTTP callers wait while a serverless function crunches heavy media.',
      context:
        'A SnapResize merchant uploads a 15MB high-res catalog photo and expects 4 resized thumbnails plus a watermarked PDF.',
      problemTitle: 'Pitfall: Doing slow CPU work synchronously inside an HTTP endpoint',
      problemFile: 'functions/uploadAndProcess.ts',
      problemCode: `export async function handler(req: { fileBuffer: Buffer; assetId: string }) {
  await saveOriginalToStorage(req.assetId, req.fileBuffer);

  // Heavy CPU work inside the HTTP request!
  const sizes = [200, 600, 1200, 2000];
  for (const width of sizes) {
    const resized = await resizeImageCpuHeavy(req.fileBuffer, width);
    await saveThumbToStorage(req.assetId, width, resized);
  }
  await generateWatermarkedPdf(req.assetId);

  // API Gateway times out at 29s — user gets a 504 error!
  return { statusCode: 200, body: JSON.stringify({ status: 'done' }) };
}`,
      refactoredTitle: 'Refactored: Fast 202 Accepted intake + background worker queue',
      refactoredFile: 'functions/intakeUpload.ts',
      refactoredCode: `import { jobQueue } from '../shared/queue';

export async function handler(req: { fileKey: string; assetId: string }) {
  // 1. Validate & enqueue lightweight job metadata (< 50ms)
  await jobQueue.send({
    type: 'PROCESS_ASSET_VARIANTS',
    assetId: req.assetId,
    fileKey: req.fileKey,
    sizes: [200, 600, 1200, 2000],
  });

  // 2. Reply immediately — worker functions process & retry in background
  return {
    statusCode: 202,
    body: JSON.stringify({ assetId: req.assetId, status: 'processing' }),
  };
}`,
      annotations: [
        {
          id: 'sl-2-timeout',
          label: '1. HTTP Timeout & Double-Billing Risk',
          problemLines: [4, 12],
          refactoredLines: [4, 10],
          severity: 'high',
          problemExplanation:
            'Running 4 image resizes and PDF generation inline risks hitting API Gateway’s 29s timeout. Worse, if step 4 fails, steps 1–3 are wasted and the user has to re-upload the 15MB file.',
          refactoredExplanation:
            'The HTTP function does one fast thing: validate and enqueue a tiny JSON job. Background worker functions process the heavy work with automatic retries and a Dead Letter Queue.',
        },
        {
          id: 'sl-2-status',
          label: '2. Clear Async Contract (202 Accepted)',
          problemLines: [13, 13],
          refactoredLines: [12, 16],
          severity: 'medium',
          problemExplanation:
            'Returning `200 OK` only after all work finishes forces the browser to spin endlessly and makes mobile clients drop the connection.',
          refactoredExplanation:
            'Returning `202 Accepted` with `{ status: "processing" }` immediately frees the client to show a smooth progress indicator.',
        },
      ],
    },
    {
      id: 'sl-fn-chaining',
      title: 'Synchronous Function Chaining vs. Queue / Workflow Handoff',
      subtitle: 'Calling Function B synchronously from Function A makes you pay twice for idle waiting time.',
      context:
        'When a SnapResize user buys extra image credits, the checkout function saves the order, generates a PDF invoice, and emails a receipt.',
      problemTitle: 'Pitfall: Function A invoking Functions B & C synchronously',
      problemFile: 'functions/checkoutHandler.ts',
      problemCode: `import { invokeLambda } from './cloudSdk';

export async function checkoutHandler(order: { id: string; total: number }) {
  await saveOrder(order);

  // Function A sits IDLE waiting & paying while Function B & C execute!
  await invokeLambda('generate-invoice-fn', { orderId: order.id });
  await invokeLambda('send-receipt-email-fn', { orderId: order.id });

  // Double-billed compute + combined timeout risk!
  return { statusCode: 200, body: JSON.stringify({ orderId: order.id }) };
}`,
      refactoredTitle: 'Refactored: Publishing to a queue / workflow so Checkout exits fast',
      refactoredFile: 'functions/checkoutHandler.ts',
      refactoredCode: `import { workflowQueue } from '../shared/queue';

export async function checkoutHandler(order: { id: string; total: number }) {
  await saveOrder(order);

  // Hand off downstream steps asynchronously — exit immediately!
  await workflowQueue.publish('order.confirmed', {
    orderId: order.id,
    total: order.total,
  });

  // Zero idle wait time; invoice & email functions scale & retry independently
  return { statusCode: 202, body: JSON.stringify({ orderId: order.id, status: 'confirmed' }) };
}`,
      annotations: [
        {
          id: 'sl-3-double-bill',
          label: '1. Double-Billing for Idle Waits',
          problemLines: [6, 8],
          refactoredLines: [6, 10],
          severity: 'high',
          problemExplanation:
            'Serverless bills by execution duration (`GB-seconds`). While `checkoutHandler` awaits `generate-invoice-fn` and `send-receipt-email-fn`, you are paying for BOTH functions simultaneously — and if email fails, checkout crashes!',
          refactoredExplanation:
            'Publishing one `order.confirmed` message takes ~15ms and terminates `checkoutHandler` immediately. Downstream functions run independently with built-in retries.',
        },
        {
          id: 'sl-3-decoupled',
          label: '2. Eliminating Coupled Timeouts',
          problemLines: [10, 11],
          refactoredLines: [12, 13],
          severity: 'medium',
          problemExplanation:
            'Chaining synchronous functions stacks their cold starts and timeouts together, making HTTP requests brittle.',
          refactoredExplanation:
            'Checkout stays fast and reliable even if the PDF generator is temporarily slow — use a durable workflow (Step Functions / Inngest) if steps must run in strict sequence.',
        },
      ],
    },
  ],
  bestPractices: [
    {
      title: 'Keep Functions Small, Stateless, and Single-Purpose',
      detail:
        'Smaller bundles mean faster cold starts, tighter security permissions (least privilege), and easier testing.',
    },
    {
      title: 'Initialize SDK & DB Clients Outside the Handler',
      detail:
        'Cloud providers keep warm execution containers alive between invocations; reusing module-scope clients cuts latency dramatically.',
    },
    {
      title: 'Enforce Rate Limits, Concurrency Caps & Spend Alerts',
      detail:
        'Protect public endpoints from Denial-of-Wallet attacks with API Gateway throttling, max concurrency ceilings, and automated billing alarms.',
    },
    {
      title: 'Use Queues or Durable Workflows Instead of Sync Function Chaining',
      detail:
        'Never have one serverless function sit idle awaiting another; connect multi-step jobs via queues, EventBridge, or Step Functions/Inngest.',
    },
  ],
  pitfalls: [
    {
      title: 'Denial-of-Wallet Attacks & Infinite Trigger Loops',
      symptom: 'An unthrottled endpoint hit by bots — or an S3 upload function writing back to the same input prefix — triggers millions of invocations and a huge cloud bill.',
      fix: 'Enable API Gateway rate limiting, set account concurrency caps & billing alerts, and always write S3 outputs to a separate bucket/prefix (`uploads/` → `processed/`).',
    },
    {
      title: 'Synchronous Lambda-Calling-Lambda Chains',
      symptom: 'High latency and double compute charges because Function A waits around while Function B runs.',
      fix: 'Hand off work asynchronously via SQS, EventBridge, or a durable workflow engine.',
    },
    {
      title: 'Storing State in Memory or Local `/tmp`',
      symptom: 'In-memory rate limiters or cached files disappear randomly because requests hit different containers.',
      fix: 'Keep state in external managed stores (Redis, DynamoDB, Postgres, S3).',
    },
    {
      title: 'Ignoring Cold Starts on User-Facing Critical Paths',
      symptom: 'Occasional 1–2 second stalls on login or checkout endpoints after quiet periods.',
      fix: 'Trim heavy npm dependencies, keep bundles lean, or use edge runtimes / provisioned concurrency on latency-critical routes.',
    },
  ],
  miniChecks: [
    {
      id: 'sl-check-1',
      prompt:
        'An accounting tool generates monthly PDF tax summaries on the 1st of every month — idle 29 days, then 40,000 PDFs in 2 hours.',
      isGoodFit: true,
      explanation:
        'Ideal Serverless workload! You pay virtually $0 for 29 days of the month, then scale out automatically to crunch 40,000 PDFs in parallel.',
    },
    {
      id: 'sl-check-2',
      prompt:
        'A real-time multiplayer action game requires persistent WebSocket connections running a 60Hz physics loop for 20-minute matches.',
      isGoodFit: false,
      betterAlternative: 'microservices',
      explanation:
        'Poor fit for Serverless. Short-lived stateless functions aren’t built for stateful, long-lived 60Hz game loops — dedicated stateful game servers or container services fit far better.',
    },
  ],
  practiceProjects: [
    {
      id: 'proj-sl-thumbnail',
      architectureId: 'serverless',
      title: 'On-Demand Image Thumbnail & Watermark Function',
      difficulty: 'starter',
      estimatedTime: '2–3 hours',
      summary:
        'Deploy a single stateless TypeScript function that resizes uploaded images or adds a text watermark on demand with zero always-on servers.',
      suggestedStack: ['TypeScript', 'Vercel Functions / Cloudflare Workers / AWS SAM', 'Sharp or Canvas', 'Object Storage (R2/S3)'],
      folderStructure: `snap-watermark/
├── api/
│   ├── health.ts        (fast sanity check)
│   └── watermark.ts     (stateless processing handler)
├── lib/
│   └── storageClient.ts (initialized outside handler!)
└── package.json`,
      milestones: [
        {
          id: 'sl-p1-m1',
          title: 'Create a stateless `watermark.ts` endpoint',
          detail: 'Accept an image URL or multipart upload, validate file type & size (< 5MB), and return a resized image.',
        },
        {
          id: 'sl-p1-m2',
          title: 'Hoist reusable clients outside the handler',
          detail: 'Initialize your storage/HTTP client at module top-level and log cold vs. warm invocation timing.',
        },
        {
          id: 'sl-p1-m3',
          title: 'Add strict timeout & input guardrails',
          detail: 'Reject oversized images cleanly with `413 Payload Too Large` before allocating memory.',
        },
      ],
      architectureRules: [
        'Do not rely on local disk files surviving between requests — treat every invocation as potentially brand new.',
        'Measure and log execution duration (`ms`) on every call to build intuition for serverless billing.',
      ],
    },
    {
      id: 'proj-sl-webhooks',
      architectureId: 'serverless',
      title: 'GitHub / Stripe Webhook-to-Discord Notifier',
      difficulty: 'stretch',
      estimatedTime: '1 weekend',
      summary:
        'Build a two-function pipeline: a fast intake function verifies webhook signatures and replies `202`, while a queued worker formats and posts Discord/Slack alerts.',
      suggestedStack: ['TypeScript', 'AWS SAM / Serverless Framework / Upstash QStash', 'Zod', 'Discord/Slack Webhook'],
      folderStructure: `webhook-notifier/
├── src/
│   ├── functions/
│   │   ├── intakeWebhook.ts  (verify HMAC + enqueue)
│   │   └── deliverAlert.ts   (format + post + retry)
│   └── shared/
│       └── verifySignature.ts
└── template.yaml / vercel.json`,
      milestones: [
        {
          id: 'sl-p2-m1',
          title: 'Implement HMAC signature verification in Intake',
          detail: 'Reject unsigned/tampered webhook requests with `401` in under 30ms.',
        },
        {
          id: 'sl-p2-m2',
          title: 'Push validated payloads to a queue and return `202`',
          detail: 'Never wait for Discord/Slack’s API inside the webhook receiver so Stripe/GitHub never marks your endpoint as failing.',
        },
        {
          id: 'sl-p2-m3',
          title: 'Build the async worker with retry & DLQ handling',
          detail: 'Simulate a Discord 500 error and verify the job retries automatically without losing the event.',
        },
      ],
      architectureRules: [
        'Keep `intakeWebhook` under 100ms p95 — zero external third-party HTTP calls in the intake path.',
        'Include an event ID check so duplicate webhook deliveries don’t spam the same Discord alert twice.',
      ],
    },
  ],
  comparisonProfile: {
    idealTeamSize: '1–15 engineers (or any team for event glue)',
    deploymentUnit: 'Individual stateless functions',
    scalingStyle: 'Automatic per-request scale to zero & burst',
    opsComplexity: 'Low',
    devVelocityEarly: 'High',
    faultIsolation: 'High',
    costAtIdle: 'Near Zero',
    dataConsistency: 'Per-Function / Mixed',
    bestFor: 'Spiky traffic, scheduled jobs, webhooks, media/file processing, zero-idle cost',
  },
};
