import { DecisionSimulator } from '../components/DecisionSimulator';
import { COURSE_COUNTS } from '../data/courseMeta';
import type { ArchitectureId } from '../types/course';

interface SimulatorPageProps {
  completedChoices: Record<string, ArchitectureId>;
  bestFitCount: number;
  onRecordChoice: (scenarioId: string, chosen: ArchitectureId) => void;
}

export function SimulatorPage({
  completedChoices,
  bestFitCount,
  onRecordChoice,
}: SimulatorPageProps) {
  const attemptedCount = Object.keys(completedChoices).length;

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-indigo-600 dark:text-indigo-400">Architect’s Workbench</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {bestFitCount}/{COURSE_COUNTS.simulatorScenarios} optimal · {attemptedCount} simulated
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Architecture Decision Simulator
        </h1>
        <p className="prose-measure text-base leading-7 text-slate-600 dark:text-slate-300">
          Read one company brief at a time, pick the architecture you’d bet on, and see what happens
          6 months later.
        </p>
      </header>

      <DecisionSimulator
        completedChoices={completedChoices}
        onRecordChoice={onRecordChoice}
      />
    </div>
  );
}
