import { Award, Compass } from 'lucide-react';
import { DecisionSimulator } from '../components/DecisionSimulator';
import { SIMULATOR_SCENARIOS } from '../data';
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
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <Compass className="h-3.5 w-3.5" />
            Architect’s Workbench
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Architecture Decision Simulator
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Read each company’s constraints, choose the architecture you’d bet on, and simulate
            what happens 6 months later. You can re-run any brief to explore every trade-off.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <Award className="h-6 w-6 text-emerald-500" />
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white">
              {bestFitCount} / {SIMULATOR_SCENARIOS.length} Optimal Picks
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {attemptedCount} of {SIMULATOR_SCENARIOS.length} scenarios simulated
            </p>
          </div>
        </div>
      </header>

      <DecisionSimulator
        completedChoices={completedChoices}
        onRecordChoice={onRecordChoice}
      />
    </div>
  );
}
