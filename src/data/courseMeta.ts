import type { ArchitectureId } from '../types/course';

export interface ArchitectureMeta {
  id: ArchitectureId;
  order: number;
  name: string;
  shortName: string;
  tagline: string;
  company: string;
  domain: string;
  codeComparisonsCount: number;
  practiceProjectsCount: number;
}

export const ARCHITECTURE_META: ArchitectureMeta[] = [
  {
    id: 'modular-monolith',
    order: 1,
    name: 'Modular Monolith',
    shortName: 'Modular Monolith',
    tagline: 'One deployable app, strictly divided into clean, independent business modules.',
    company: 'PulseBoard',
    domain: 'B2B Team Project Management SaaS',
    codeComparisonsCount: 4,
    practiceProjectsCount: 2,
  },
  {
    id: 'microservices',
    order: 2,
    name: 'Microservices',
    shortName: 'Microservices',
    tagline: 'Independently deployable services, each owning its business capability and database.',
    company: 'StreamFlix',
    domain: 'Global Video Streaming Platform',
    codeComparisonsCount: 4,
    practiceProjectsCount: 2,
  },
  {
    id: 'serverless',
    order: 3,
    name: 'Serverless',
    shortName: 'Serverless',
    tagline: 'Pay-per-execution functions that scale automatically from zero to massive bursts.',
    company: 'SnapResize',
    domain: 'On-Demand Image & Document Processing Pipeline',
    codeComparisonsCount: 3,
    practiceProjectsCount: 2,
  },
  {
    id: 'event-driven',
    order: 4,
    name: 'Event-Driven Architecture (EDA)',
    shortName: 'Event-Driven',
    tagline: 'Producers broadcast facts ("what happened") and independent consumers react asynchronously.',
    company: 'SwiftRide',
    domain: 'Real-Time Ride-Hailing & Dispatch Platform',
    codeComparisonsCount: 4,
    practiceProjectsCount: 2,
  },
];

export const ARCHITECTURE_META_BY_ID: Record<ArchitectureId, ArchitectureMeta> = {
  'modular-monolith': ARCHITECTURE_META[0],
  microservices: ARCHITECTURE_META[1],
  serverless: ARCHITECTURE_META[2],
  'event-driven': ARCHITECTURE_META[3],
};

export interface SimulatorScenarioMeta {
  id: string;
  bestFit: ArchitectureId;
}

export const SIMULATOR_SCENARIO_META: SimulatorScenarioMeta[] = [
  { id: 'sim-clinic-saas', bestFit: 'modular-monolith' },
  { id: 'sim-global-marketplace', bestFit: 'microservices' },
  { id: 'sim-invoice-ocr', bestFit: 'serverless' },
  { id: 'sim-food-delivery', bestFit: 'event-driven' },
  { id: 'sim-hr-payroll', bestFit: 'modular-monolith' },
  { id: 'sim-webhook-enrichment', bestFit: 'serverless' },
  { id: 'sim-iot-telemetry', bestFit: 'event-driven' },
  { id: 'sim-fintech-platform', bestFit: 'microservices' },
  { id: 'sim-evolve-pdf-monolith', bestFit: 'serverless' },
  { id: 'sim-evolve-order-webhooks', bestFit: 'event-driven' },
  { id: 'sim-ai-doc-assistant', bestFit: 'event-driven' },
  { id: 'sim-multitenant-saas', bestFit: 'modular-monolith' },
  { id: 'sim-realtime-collab', bestFit: 'microservices' },
];

export const COURSE_COUNTS = {
  foundationBlocks: 18,
  beginnerGlossary: 34,
  practiceProjects: 9,
  simulatorScenarios: SIMULATOR_SCENARIO_META.length,
} as const;
