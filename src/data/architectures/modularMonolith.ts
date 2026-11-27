import type { ArchitectureModule } from '../../types/course';

export const modularMonolithModule: ArchitectureModule = {
  id: 'modular-monolith',
  order: 1,
  name: 'Modular Monolith',
  shortName: 'Modular Monolith',
  tagline: 'One deployable app, strictly divided into clean, independent business modules.',
  accentColor: 'indigo',
  beginnerSummary:
    'A Modular Monolith runs as a single backend application and deploys as one unit, but its internal codebase is organized by business domain (such as Billing, Projects, and Auth) with strict boundaries. You get the speed and simplicity of a monolith without turning your codebase into spaghetti.',
  whenToUse: [
    'Early-to-mid stage startups and small-to-medium teams (1–25 engineers).',
    'Domains that are still evolving where business boundaries may shift.',
    'Apps needing strong ACID database transactions across features with low operational overhead.',
    'When shipping features quickly matters more than scaling one component to millions of requests.',
  ],
  whenToAvoid: [
    'Huge engineering organizations (50+ devs) stepping on each other’s release trains.',
    'Workloads where one feature needs radically different hardware (e.g., GPU video transcoding vs. simple CRUD).',
    'Strict compliance requirements forcing physical network isolation between subsystems.',
  ],
  scenario: {
    company: 'PulseBoard',
    domain: 'B2B Team Project Management SaaS',
    teamSize: '5 full-stack & backend engineers',
    trafficProfile: 'Steady weekday business traffic (~40 requests/sec)',
    story:
      'PulseBoard helps small agencies track projects, tasks, team permissions, and monthly subscriptions. Two months ago they nearly jumped straight to 6 microservices, until they realized they would spend half their week managing Kubernetes and network retries instead of talking to customers.',
    whyThisArchitecture:
      'With 5 engineers, deploying one TypeScript API divided into isolated modules (Auth, Projects, Billing, Notifications) lets them ship daily, run local tests in seconds, and extract a single module into a separate service later only if real traffic demands it.',
  },
  diagram: {
    normalSummary:
      'Requests enter one HTTP server and route to clean domain modules. Modules talk through explicit public TypeScript interfaces rather than reaching into each other’s database tables.',
    failureTitle: 'What happens if a module throws an unhandled error or leaks memory?',
    failureSummary:
      'Because all modules share one process, a memory leak or crash in one module can bring down the entire app — though good error boundaries and multiple stateless replicas reduce the impact.',
    nodes: [
      {
        id: 'client',
        label: 'Web App',
        sublabel: 'Browser / Mobile',
        kind: 'client',
        x: 75,
        y: 170,
        beginnerSummary: 'Sends standard HTTPS requests to a single backend API URL.',
        failureNote: 'Users see a 502/503 if the single process crashes without healthy replicas.',
      },
      {
        id: 'router',
        label: 'HTTP Router',
        sublabel: 'Express / Fastify',
        kind: 'gateway',
        x: 245,
        y: 170,
        beginnerSummary: 'Authenticates requests and hands them to the right internal domain module.',
        failureNote: 'Shares the same Node.js process as the modules behind it.',
      },
      {
        id: 'projects',
        label: 'Projects Module',
        sublabel: 'Public API + Logic',
        kind: 'module',
        x: 455,
        y: 75,
        beginnerSummary: 'Owns boards and tasks. Calls Billing through BillingApi — never queries billing tables directly.',
        failureNote: 'Throws a caught error normally, but an unguarded crash impacts the shared process.',
      },
      {
        id: 'billing',
        label: 'Billing Module',
        sublabel: 'Plans & Quotas',
        kind: 'module',
        x: 455,
        y: 170,
        beginnerSummary: 'Single source of truth for subscription limits, invoices, and plan upgrades.',
        failureNote: 'If Billing has a memory leak, it starves Projects and Notifications in the same process.',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        sublabel: 'In-Process Listener',
        kind: 'module',
        x: 455,
        y: 265,
        beginnerSummary: 'Listens to internal domain events (e.g., TaskAssigned) to send emails cleanly.',
        failureNote: 'Slow email retries inside the process can tie up memory if not offloaded carefully.',
      },
      {
        id: 'db',
        label: 'Shared Postgres',
        sublabel: 'Separate Schemas',
        kind: 'database',
        x: 690,
        y: 170,
        beginnerSummary: 'One database server for simplicity, logically split into schemas (projects.*, billing.*) owned by each module.',
        failureNote: 'One heavy unindexed query in Projects can slow down Billing queries on the same DB.',
      },
    ],
    edges: [
      { from: 'client', to: 'router', label: 'HTTPS' },
      { from: 'router', to: 'projects', label: 'In-process' },
      { from: 'router', to: 'billing', label: 'In-process', failsInFailureMode: true },
      { from: 'projects', to: 'billing', label: 'Module API', failsInFailureMode: true },
      { from: 'projects', to: 'notifications', label: 'Domain Event', async: true },
      { from: 'projects', to: 'db', label: 'projects.*' },
      { from: 'billing', to: 'db', label: 'billing.*', failsInFailureMode: true },
    ],
  },
  deepDiveConcepts: [
    {
      id: 'mm-in-process-reliability',
      badge: 'Reliability Caveat',
      title: 'In-Process Events vs. Persistent Job Queues',
      summary:
        'An in-process event bus keeps modules decoupled inside one Node.js server, but events held only in RAM vanish immediately if the server crashes or restarts mid-deploy.',
      bulletPoints: [
        'Safe for in-process events: updating non-critical caches, local audit logs, or lightweight UI notifications.',
        'Use a persistent queue (BullMQ, pg-boss, or a Postgres Outbox table) for anything that MUST NOT be lost: billing receipts, password reset emails, or webhook deliveries.',
      ],
      keyTakeaway:
        'You don’t need microservices to get durable async jobs — a Modular Monolith paired with one Redis/Postgres job queue handles 95% of real-world background work.',
    },
    {
      id: 'mm-event-loop',
      badge: 'Node.js Runtime',
      title: 'Protecting the Shared Event Loop',
      summary:
        'Because all modules share one Node.js process, CPU-heavy work (large CSV exports, PDF rendering, slow synchronous crypto) in a single module freezes incoming HTTP requests for EVERY module at once.',
      bulletPoints: [
        'Keep HTTP request handlers I/O-bound and fast.',
        'Offload heavy CPU jobs to a separate worker process (sharing the same repo!) or Node Worker Threads.',
      ],
      keyTakeaway:
        'Shared process = shared blast radius for CPU spikes and memory leaks. Isolate heavy compute into background worker processes.',
    },
    {
      id: 'mm-boundary-enforcement',
      badge: 'CI & Architecture Hygiene',
      title: 'Enforcing Boundaries & Background Workers in Practice',
      summary:
        'Good intentions fade under deadlines. Real Modular Monoliths stay clean because CI blocks bad imports automatically and heavy jobs run in a separate worker process from the same repo.',
      bulletPoints: [
        'Use `eslint-plugin-boundaries`, `dependency-cruiser`, or TypeScript project references so CI rejects any import reaching past another module’s `publicApi.ts`.',
        'Run two processes from the same codebase: `node dist/web.js` for fast HTTP traffic and `node dist/worker.js` for scheduled reports, email batches, and heavy exports.',
      ],
      keyTakeaway:
        'Automate boundary checks in CI and separate HTTP vs. worker processes — that single habit prevents 90% of monoliths from decaying into spaghetti.',
    },
  ],
  codeComparisons: [
    {
      id: 'mm-cross-module-db',
      title: 'Cross-Module Database Coupling vs. Module Public API',
      subtitle: 'Keep each module’s database tables private behind a clean interface.',
      context:
        'When a user creates a new project in PulseBoard, the Projects module must verify whether their workspace plan allows more projects.',
      problemTitle: 'Pitfall: Reaching straight into Billing’s SQL tables',
      problemFile: 'src/modules/projects/createProject.ts',
      problemCode: `import { db } from '../../shared/db';

export async function createProject(orgId: string, name: string) {
  // Directly querying another module's internal tables!
  const sub = await db.query(
    \`SELECT plan_tier, max_projects, status
     FROM billing_subscriptions
     WHERE org_id = $1\`,
    [orgId]
  );

  if (!sub || sub.status !== 'active') {
    throw new Error('Subscription inactive');
  }

  const count = await db.projects.count({ orgId });
  if (count >= sub.max_projects) {
    throw new Error('Upgrade your plan to add more projects');
  }

  return db.projects.insert({ orgId, name });
}`,
      refactoredTitle: 'Refactored: Calling Billing’s explicit public contract',
      refactoredFile: 'src/modules/projects/createProject.ts',
      refactoredCode: `import { billingApi } from '../billing/publicApi';
import { projectRepo } from './projectRepo';

export async function createProject(orgId: string, name: string) {
  const currentCount = await projectRepo.countByOrg(orgId);

  // Ask Billing through its public contract — no SQL peeking
  const quota = await billingApi.checkProjectQuota({
    orgId,
    currentProjectCount: currentCount,
  });

  if (!quota.allowed) {
    throw new Error(quota.reason);
  }

  return projectRepo.insert({ orgId, name });
}`,
      annotations: [
        {
          id: 'mm-1-sql-leak',
          label: '1. Hidden Table Coupling',
          problemLines: [4, 10],
          refactoredLines: [1, 1],
          severity: 'high',
          problemExplanation:
            'The Projects module queries `billing_subscriptions` directly. If the Billing team renames `max_projects` or switches to add-on seats, the Projects module silently breaks at runtime.',
          refactoredExplanation:
            'Projects imports only `billingApi` from Billing’s public entrypoint. Billing can refactor its tables or pricing rules freely without breaking any other module.',
        },
        {
          id: 'mm-1-business-rules',
          label: '2. Duplicated Business Rules',
          problemLines: [12, 19],
          refactoredLines: [7, 15],
          severity: 'medium',
          problemExplanation:
            'Projects now re-implements Billing’s rules (`status === active`, comparing `max_projects`). What about grace periods or enterprise overrides? Those rules end up copy-pasted everywhere.',
          refactoredExplanation:
            'Billing owns 100% of quota logic inside `checkProjectQuota()`. Projects just checks `quota.allowed` — and if Billing is ever extracted into a microservice later, only `billingApi` changes to an HTTP call.',
        },
      ],
    },
    {
      id: 'mm-god-service',
      title: 'Tangled Side Effects vs. In-Process Domain Events',
      subtitle: 'Prevent circular imports by decoupling secondary reactions from core writes.',
      context:
        'When a PulseBoard task is marked complete, the system needs to notify watchers, update weekly team stats, and trigger Slack integrations.',
      problemTitle: 'Pitfall: One giant function importing every other module',
      problemFile: 'src/modules/projects/completeTask.ts',
      problemCode: `import { emailService } from '../notifications/emailService';
import { slackClient } from '../integrations/slackClient';
import { analyticsRepo } from '../analytics/analyticsRepo';
import { taskRepo } from './taskRepo';

export async function completeTask(taskId: string, userId: string) {
  const task = await taskRepo.markDone(taskId);

  // Every new feature keeps bloating this core function
  await emailService.sendTaskCompleted(task.assigneeEmail, task.title);
  await slackClient.postMessage(task.channelId, \`Done: \${task.title}\`);
  await analyticsRepo.incrementCompleted(task.orgId, userId);

  return task;
}`,
      refactoredTitle: 'Refactored: Publishing a typed in-process domain event',
      refactoredFile: 'src/modules/projects/completeTask.ts',
      refactoredCode: `import { domainEvents } from '../../shared/domainEvents';
import { taskRepo } from './taskRepo';

export async function completeTask(taskId: string, userId: string) {
  const task = await taskRepo.markDone(taskId);

  // Projects only announces a fact; listeners subscribe independently
  domainEvents.publish('task.completed', {
    taskId: task.id,
    orgId: task.orgId,
    completedBy: userId,
    title: task.title,
  });

  return task;
}`,
      annotations: [
        {
          id: 'mm-2-imports',
          label: '1. Spiderweb Imports',
          problemLines: [1, 3],
          refactoredLines: [1, 1],
          severity: 'high',
          problemExplanation:
            'Projects imports internals of Notifications, Integrations, and Analytics. Soon Analytics imports Projects, creating circular dependencies and slow, brittle tests.',
          refactoredExplanation:
            'Projects depends only on a tiny typed `domainEvents` bus. Other modules subscribe to `task.completed` on their own without Projects even knowing they exist.',
        },
        {
          id: 'mm-2-fragility',
          label: '2. Fragile Inline Side Effects',
          problemLines: [9, 12],
          refactoredLines: [7, 13],
          severity: 'medium',
          problemExplanation:
            'If Slack’s API times out on line 11, `completeTask()` throws an error and analytics never updates — even though the task was already completed!',
          refactoredExplanation:
            'Each listener handles its own errors independently. Note: for mission-critical work that must survive server crashes/restarts, persist these events in a job queue (BullMQ/pg-boss) instead of memory.',
        },
      ],
    },
    {
      id: 'mm-event-loop-blocking',
      title: 'Blocking the Shared Event Loop vs. Background Worker Queue',
      subtitle: 'One CPU-heavy route inside a Node.js monolith can freeze every other module.',
      context:
        'A PulseBoard enterprise customer clicks "Export All 80,000 Tasks to CSV" right while other teams are logging in and updating boards.',
      problemTitle: 'Pitfall: Heavy synchronous loop freezing the shared Node.js thread',
      problemFile: 'src/modules/reports/exportReport.ts',
      problemCode: `import { taskRepo } from '../projects/taskRepo';

export async function exportOrgReport(orgId: string) {
  const tasks = await taskRepo.findAllForOrg(orgId); // 80,000 rows

  // Synchronous CPU-heavy loop blocks Node's single event loop!
  let csv = 'id,title,status,hash\\n';
  for (const t of tasks) {
    const digest = slowSyncHash(t.notes); // blocks main thread
    csv += \`\${t.id},"\${t.title}",\${t.status},\${digest}\\n\`;
  }

  // Auth, Billing & Projects ALL freeze for 4 seconds while this runs!
  return csv;
}`,
      refactoredTitle: 'Refactored: Enqueueing heavy work onto a persistent background worker',
      refactoredFile: 'src/modules/reports/exportReport.ts',
      refactoredCode: `import { reportQueue } from '../../shared/jobQueue';

export async function requestOrgReport(orgId: string, requestedBy: string) {
  // Enqueue into a persistent worker queue (e.g. BullMQ / pg-boss)
  const job = await reportQueue.add('export-org-csv', {
    orgId,
    requestedBy,
  });

  // Main HTTP event loop stays responsive (<10ms) for all modules!
  return {
    jobId: job.id,
    status: 'queued',
  };
}`,
      annotations: [
        {
          id: 'mm-3-blocking',
          label: '1. Event-Loop Starvation',
          problemLines: [6, 11],
          refactoredLines: [4, 8],
          severity: 'high',
          problemExplanation:
            'Node.js runs JavaScript on a single main thread. Spending 4 seconds hashing 80,000 rows synchronously halts incoming HTTP requests across Auth, Billing, and Projects simultaneously.',
          refactoredExplanation:
            'Pushing a tiny job payload onto a persistent queue hands the heavy CPU work to a dedicated background worker process (deployed from the same repo) so web traffic never stalls.',
        },
        {
          id: 'mm-3-fast-reply',
          label: '2. Crash-Safe Async Response',
          problemLines: [13, 14],
          refactoredLines: [10, 14],
          severity: 'medium',
          problemExplanation:
            'If the user closes their browser or the server restarts mid-export, the work fails and may leak memory.',
          refactoredExplanation:
            'Returning `{ jobId, status: "queued" }` replies in milliseconds, survives server restarts, and notifies the user once the file is ready.',
        },
      ],
    },
  ],
  bestPractices: [
    {
      title: 'Organize Folders by Domain, Not by Technical Layer',
      detail:
        'Group files as `modules/billing/*` and `modules/projects/*` rather than putting every controller in one giant `controllers/` folder.',
    },
    {
      title: 'Enforce Module Boundaries Automatically',
      detail:
        'Use ESLint import rules (like `eslint-plugin-boundaries`) so CI fails immediately if one module imports another module’s internal files.',
    },
    {
      title: 'Give Each Module Its Own Database Schema or Table Prefix',
      detail:
        'Even inside one PostgreSQL instance, separate schemas (`billing.*`, `projects.*`) make table ownership obvious and future extraction painless.',
    },
    {
      title: 'Use a Persistent Queue for Critical Background Work',
      detail:
        'In-memory events disappear on restart. Back emails, reports, and webhooks with a persistent queue (BullMQ / pg-boss) and run heavy CPU jobs in a separate worker process.',
    },
    {
      title: 'Return Plain DTOs Across Module Boundaries',
      detail:
        'Expose simple TypeScript data objects from `publicApi.ts` rather than raw ORM entities with lazy-loaded database handles that leak persistence coupling.',
    },
    {
      title: 'Route Heavy Reporting Queries to a Read Replica',
      detail:
        'Point analytics dashboards and bulk CSV exports at a read replica so expensive read queries never starve core transactional writes.',
    },
  ],
  pitfalls: [
    {
      title: 'The "Big Ball of Mud" Drift',
      symptom: 'Developers take shortcuts under deadline pressure and import helpers/repositories across folders.',
      fix: 'Expose one `publicApi.ts` file per module and block deep cross-module imports in your linter.',
    },
    {
      title: 'Blocking the Shared Event Loop',
      symptom: 'One heavy report export or image resize makes login and unrelated endpoints time out for every user.',
      fix: 'Move CPU-intensive tasks out of the HTTP process into background worker processes or Worker Threads.',
    },
    {
      title: 'Losing In-Process Events on Crash or Deploy',
      symptom: 'Welcome emails or billing syncs randomly vanish whenever a container restarts during a rolling deploy.',
      fix: 'Persist critical events in a database Outbox table or durable job queue instead of fire-and-forget RAM emitters.',
    },
    {
      title: 'Shared Mega-ORM Models',
      symptom: 'Every module imports one giant 40-column `User` or `Organization` ORM class with cascading relations, turning every schema tweak into a repo-wide refactor.',
      fix: 'Keep each module’s persistence model focused on its own columns and pass lightweight DTOs across module boundaries.',
    },
    {
      title: 'Cross-Module Long Transactions & DB Locks',
      symptom: 'Wrapping calls across 4 modules inside one long database transaction triggers lock contention, slow checkouts, and random deadlocks.',
      fix: 'Keep SQL transactions small and scoped to one module’s tables; coordinate secondary side effects after commit via events or a job queue.',
    },
    {
      title: 'Premature Extraction to Microservices',
      symptom: 'Splitting a clean 3-developer monolith into 8 network services before hitting any real team or scaling bottleneck.',
      fix: 'Wait until a specific module genuinely needs independent deploys or dedicated scaling before extracting it.',
    },
  ],
  miniChecks: [
    {
      id: 'mm-check-1',
      prompt:
        'A 4-person startup is building an MVP for a veterinary clinic scheduling & invoicing app with a 10-week launch deadline.',
      isGoodFit: true,
      explanation:
        'Great fit! A Modular Monolith gives a 4-person team maximum shipping speed, simple local debugging, and easy ACID transactions across appointments and invoices — while keeping modules clean as the product matures.',
    },
    {
      id: 'mm-check-2',
      prompt:
        'An international bank has 90 backend engineers across 12 autonomous teams working in Java, Go, and Python who must deploy independently dozens of times a day.',
      isGoodFit: false,
      betterAlternative: 'microservices',
      explanation:
        'Not the best fit. At 90 engineers and multiple programming languages, a single deployable monolith becomes an organizational bottleneck — Microservices fit this team structure much better.',
    },
  ],
  practiceProjects: [
    {
      id: 'proj-mm-habits',
      architectureId: 'modular-monolith',
      title: 'Personal Habit & Streak Tracker API',
      difficulty: 'starter',
      estimatedTime: '2–4 hours',
      summary:
        'Build a single TypeScript REST API organized into three strictly isolated modules: Users, Habits, and Streaks.',
      suggestedStack: ['Node.js + TypeScript', 'Fastify or Express', 'SQLite (better-sqlite3 / Prisma)', 'ESLint boundaries'],
      folderStructure: `habit-tracker/
├── src/
│   ├── shared/
│   │   ├── db.ts
│   │   └── eventBus.ts
│   ├── modules/
│   │   ├── users/       (publicApi.ts, repo.ts, routes.ts)
│   │   ├── habits/      (publicApi.ts, repo.ts, routes.ts)
│   │   └── streaks/     (publicApi.ts, listener.ts, repo.ts)
│   └── server.ts`,
      milestones: [
        {
          id: 'mm-p1-m1',
          title: 'Set up the 3 domain module folders',
          detail: 'Create `users`, `habits`, and `streaks` folders, each with its own `publicApi.ts` entrypoint.',
        },
        {
          id: 'mm-p1-m2',
          title: 'Implement habit check-ins via `habits` module',
          detail: 'Expose `POST /habits/:id/check-in` and save check-ins into a `habits_checkins` table.',
        },
        {
          id: 'mm-p1-m3',
          title: 'Decouple streak calculation with an in-process event',
          detail: 'Emit `habit.checkedIn` on `shared/eventBus.ts` so `streaks` updates streak counts without `habits` importing `streaks`.',
        },
      ],
      architectureRules: [
        'Never import another module’s `repo.ts` directly — only import from `publicApi.ts`.',
        'Prefix every table with its module name (`users_*`, `habits_*`, `streaks_*`) and forbid cross-module SQL JOINs.',
      ],
    },
    {
      id: 'proj-mm-library',
      architectureId: 'modular-monolith',
      title: 'Neighborhood Library & Book-Lending Portal',
      difficulty: 'stretch',
      estimatedTime: '1 weekend',
      summary:
        'Manage book inventory, member accounts, borrowing periods, and automatic late fines across four well-bounded modules.',
      suggestedStack: ['Node.js + TypeScript', 'Fastify', 'PostgreSQL (separate schemas)', 'Vitest'],
      folderStructure: `library-monolith/
├── src/
│   ├── shared/
│   │   └── domainEvents.ts
│   ├── modules/
│   │   ├── catalog/     (books & copies)
│   │   ├── members/     (cards & standing)
│   │   ├── loans/       (checkout & returns)
│   │   └── fines/       (overdue calculation)
│   └── app.ts`,
      milestones: [
        {
          id: 'mm-p2-m1',
          title: 'Model private schemas for Catalog and Members',
          detail: 'Expose `catalogApi.reserveCopy()` and `membersApi.isEligibleToBorrow()` as explicit contracts.',
        },
        {
          id: 'mm-p2-m2',
          title: 'Orchestrate book checkout inside the Loans module',
          detail: 'Check member eligibility and reserve a book copy through module interfaces — zero direct table reads.',
        },
        {
          id: 'mm-p2-m3',
          title: 'Trigger overdue fines via a `loan.returnedLate` event',
          detail: 'Have the Fines module listen for late returns, create a fine record, and expose unpaid totals back to Members.',
        },
        {
          id: 'mm-p2-m4',
          title: 'Add an automated boundary check test',
          detail: 'Write a quick Vitest or ESLint rule verifying no file imports another module’s private internals.',
        },
      ],
      architectureRules: [
        'Loans may call `catalogApi` and `membersApi`, but Catalog and Members must never import from Loans.',
        'All four modules deploy as one Node.js server with one single `npm start` command.',
      ],
    },
  ],
  comparisonProfile: {
    idealTeamSize: '1–25 engineers',
    deploymentUnit: 'Single app binary / container',
    scalingStyle: 'Replicate whole app horizontally',
    opsComplexity: 'Low',
    devVelocityEarly: 'High',
    faultIsolation: 'Moderate',
    costAtIdle: 'Fixed (Low)',
    dataConsistency: 'Strong (ACID)',
    bestFor: 'Startups, SaaS MVPs, evolving domains, fast shipping with low ops overhead',
  },
};
