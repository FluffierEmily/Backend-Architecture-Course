import { modularMonolithModule } from './architectures/modularMonolith';
import { microservicesModule } from './architectures/microservices';
import { serverlessModule } from './architectures/serverless';
import { eventDrivenModule } from './architectures/eventDriven';
import { SIMULATOR_SCENARIOS } from './simulatorScenarios';
import { FOUNDATION_BLOCKS, BEGINNER_GLOSSARY } from './foundations';
import type { ArchitectureId, ArchitectureModule, PracticeProject } from '../types/course';

export const ARCHITECTURE_MODULES: ArchitectureModule[] = [
  modularMonolithModule,
  microservicesModule,
  serverlessModule,
  eventDrivenModule,
];

export const ARCHITECTURE_BY_ID: Record<ArchitectureId, ArchitectureModule> = {
  'modular-monolith': modularMonolithModule,
  microservices: microservicesModule,
  serverless: serverlessModule,
  'event-driven': eventDrivenModule,
};

export const ALL_PRACTICE_PROJECTS: PracticeProject[] = ARCHITECTURE_MODULES.flatMap(
  (m) => m.practiceProjects
);

export { SIMULATOR_SCENARIOS, FOUNDATION_BLOCKS, BEGINNER_GLOSSARY };
