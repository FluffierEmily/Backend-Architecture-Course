import { ARCHITECTURE_MODULES } from './architectures';
import type { PracticeProject } from '../types/course';

export const HYBRID_CAPSTONE_PROJECTS: PracticeProject[] = [
  {
    id: 'proj-hybrid-strangler-extract',
    architectureId: 'hybrid',
    title: 'Strangler Fig Capstone: Extract a Heavy Report Slice from a Monolith',
    difficulty: 'stretch',
    estimatedTime: '1 weekend',
    summary:
      'Start with a healthy Modular Monolith (Auth, Orders, Reports), then use the Strangler Fig pattern to extract ONLY the CPU-heavy PDF report export into a queue-triggered Serverless/standalone worker with zero downtime.',
    suggestedStack: [
      'Node.js + TypeScript',
      'Fastify (Gateway + Monolith)',
      'SQLite / PostgreSQL',
      'BullMQ / SQS + Serverless Worker',
    ],
    folderStructure: `strangler-capstone/
├── gateway/               (L7 proxy: routes /api/reports/* -> worker intake)
├── core-monolith/         (Auth + Orders + Outbox, stays simple!)
├── report-worker/         (Extracted async PDF generator + own job DB)
└── ADR-001-extract-reports.md`,
    milestones: [
      {
        id: 'hyb-p1-m1',
        title: 'Write a 1-page ADR justifying the extraction',
        detail:
          'Document the current bottleneck (PDF bursts stalling Checkout p99), options considered, and revisit triggers before writing code.',
      },
      {
        id: 'hyb-p1-m2',
        title: 'Put a thin L7 reverse proxy in front of the monolith',
        detail:
          'Route all `/api/*` traffic through the gateway so clients never change URLs when `/api/reports/*` moves.',
      },
      {
        id: 'hyb-p1-m3',
        title: 'Extract PDF generation behind a `202 Accepted` queue + job status endpoint',
        detail:
          'Move CPU-heavy export code into `report-worker` with its own private job-status store and short-polling/SSE progress endpoint.',
      },
      {
        id: 'hyb-p1-m4',
        title: 'Decouple data access (zero cross-DB SQL JOINs)',
        detail:
          'Have the monolith pass a compact snapshot or Claim Check storage key in the job payload so the worker never touches the monolith’s Orders tables.',
      },
      {
        id: 'hyb-p1-m5',
        title: 'Break it on purpose: Flood 50 heavy reports while hitting Checkout',
        detail:
          'Trigger 50 concurrent PDF exports while hammering `POST /api/orders` (with `Idempotency-Key`) and verify Checkout stays under 100ms p95 even if `report-worker` is stopped.',
      },
    ],
    architectureRules: [
      'Keep Auth and Orders inside the Modular Monolith — do NOT do a big-bang rewrite into microservices.',
      'The extracted worker must never open the monolith’s database directly.',
    ],
  },
];

export const ALL_PRACTICE_PROJECTS: PracticeProject[] = [
  ...ARCHITECTURE_MODULES.flatMap((m) => m.practiceProjects),
  ...HYBRID_CAPSTONE_PROJECTS,
];
