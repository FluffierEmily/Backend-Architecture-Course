import { modularMonolithModule } from './modularMonolith';
import { microservicesModule } from './microservices';
import { serverlessModule } from './serverless';
import { eventDrivenModule } from './eventDriven';
import type { ArchitectureId, ArchitectureModule } from '../../types/course';

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
