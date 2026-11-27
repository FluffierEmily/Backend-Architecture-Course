import { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  DollarSign,
  Gauge,
  Play,
  Users,
} from 'lucide-react';
import { ARCHITECTURE_BY_ID, ARCHITECTURE_MODULES, SIMULATOR_SCENARIOS } from '../data';
import type { ArchitectureId, SimulatorOutcome } from '../types/course';

interface DecisionSimulatorProps {
  completedChoices: Record<string, ArchitectureId>;
  onRecordChoice: (scenarioId: string, chosen: ArchitectureId) => void;
}

const VERDICT_STYLES: Record<
  SimulatorOutcome['verdict'],
  { label: string; badge: string; border: string; bg: string }
> = {
  'best-fit': {
    label: 'Best Fit',
    badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  viable: {
    label: 'Viable with Trade-offs',
    badge: 'bg-sky-500/20 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/40',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/10',
  },
  'over-engineered': {
    label: 'Over-Engineered',
    badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/40',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
  risky: {
    label: 'Risky Bottleneck',
    badge: 'bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/40',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
  },
};

const SCORE_AXES: { key: keyof SimulatorOutcome['scores']; label: string }[] = [
  { key: 'devSpeed', label: 'Development Speed' },
  { key: 'opsSimplicity', label: 'Ops Simplicity' },
  { key: 'scaling', label: 'Scaling Fit' },
  { key: 'costEfficiency', label: 'Cost Efficiency' },
  { key: 'faultIsolation', label: 'Fault Isolation' },
];

export function DecisionSimulator({
  completedChoices,
  onRecordChoice,
}: DecisionSimulatorProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SIMULATOR_SCENARIOS[scenarioIdx];

  const [selectedArch, setSelectedArch] = useState<ArchitectureId | null>(
    completedChoices[scenario.id] ?? null
  );
  const [simulatedArch, setSimulatedArch] = useState<ArchitectureId | null>(
    completedChoices[scenario.id] ?? null
  );
  const [showCompareAll, setShowCompareAll] = useState(false);

  const handleSelectScenario = (index: number) => {
    const nextScenario = SIMULATOR_SCENARIOS[index];
    setScenarioIdx(index);
    const saved = completedChoices[nextScenario.id] ?? null;
    setSelectedArch(saved);
    setSimulatedArch(saved);
    setShowCompareAll(false);
  };

  const handleRunSimulation = () => {
    if (!selectedArch) return;
    setSimulatedArch(selectedArch);
    onRecordChoice(scenario.id, selectedArch);
  };

  const outcome = simulatedArch ? scenario.outcomes[simulatedArch] : null;
  const bestFitOutcome = scenario.outcomes[scenario.bestFit];
  const bestFitModule = ARCHITECTURE_BY_ID[scenario.bestFit];

  return (
    <div className="space-y-6">
      {/* Scenario Selector Strip */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {SIMULATOR_SCENARIOS.map((s, idx) => {
          const savedChoice = completedChoices[s.id];
          const hitBestFit = savedChoice === s.bestFit;
          const isActive = idx === scenarioIdx;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectScenario(idx)}
              className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                isActive
                  ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Case #{idx + 1} · {s.company}
                </span>
                {savedChoice && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      hitBestFit
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
                    }`}
                  >
                    {hitBestFit ? 'Optimal' : 'Tried'}
                  </span>
                )}
              </div>
              <span className="mt-1 line-clamp-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Brief & Constraints */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Client Brief · {scenario.company}
            </span>
            <h2 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white">
              {scenario.title}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            Scenario {scenarioIdx + 1} of {SIMULATOR_SCENARIOS.length}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {scenario.brief}
        </p>

        {/* Constraints Grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Users, label: 'Team Size', value: scenario.constraints.teamSize },
            { icon: Gauge, label: 'Traffic Profile', value: scenario.constraints.trafficPattern },
            { icon: DollarSign, label: 'Budget & Ops', value: scenario.constraints.budgetOps },
            {
              icon: Cpu,
              label: 'Consistency / SLA',
              value: scenario.constraints.latencyConsistency,
            },
            { icon: Clock, label: 'Time to Market', value: scenario.constraints.timeToMarket },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Icon className="h-3.5 w-3.5 text-indigo-500" />
                {label}
              </div>
              <p className="mt-1 text-xs font-medium leading-snug text-slate-800 dark:text-slate-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Architecture Picker */}
        <div className="mt-6">
          <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
            Which backend architecture do you recommend for {scenario.company}?
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARCHITECTURE_MODULES.map((arch) => {
              const isPicked = selectedArch === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedArch(arch.id)}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    isPicked
                      ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/40'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {arch.shortName}
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {arch.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!selectedArch}
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Play className="h-4 w-4" />
              Run Architecture Simulation
            </button>
            {simulatedArch && scenarioIdx < SIMULATOR_SCENARIOS.length - 1 && (
              <button
                type="button"
                onClick={() => handleSelectScenario(scenarioIdx + 1)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next Scenario →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Outcome Report */}
      {outcome && simulatedArch && (
        <div
          className={`rounded-2xl border p-6 shadow-sm ${VERDICT_STYLES[outcome.verdict].border} ${VERDICT_STYLES[outcome.verdict].bg}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Simulation Result for {ARCHITECTURE_BY_ID[simulatedArch].name}
              </span>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${VERDICT_STYLES[outcome.verdict].badge}`}
            >
              {VERDICT_STYLES[outcome.verdict].label}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
            {outcome.headline}
          </h3>

          <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/75">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              6 Months Later...
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {outcome.sixMonthsLater}
            </p>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {/* What Worked & What Hurt */}
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/75">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> What Worked
                </p>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {outcome.whatWorked.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" /> Trade-offs & Pain Points
                </p>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  {outcome.whatHurt.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5-Axis Score Bars */}
            <div className="rounded-xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/75">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Trade-Off Scorecard (1–5)
                </p>
                {simulatedArch !== scenario.bestFit && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Marker = Best Fit ({bestFitModule.shortName})
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {SCORE_AXES.map(({ key, label }) => {
                  const score = outcome.scores[key];
                  const bestScore = bestFitOutcome.scores[key];
                  return (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{label}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {score}/5
                        </span>
                      </div>
                      <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                        {simulatedArch !== scenario.bestFit && (
                          <div
                            title={`${bestFitModule.shortName}: ${bestScore}/5`}
                            className="absolute top-0 bottom-0 w-1 bg-emerald-400"
                            style={{ left: `calc(${(bestScore / 5) * 100}% - 2px)` }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {simulatedArch !== scenario.bestFit && (
                <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                  <strong>Recommended Best Fit:</strong> {bestFitModule.name} —{' '}
                  {bestFitOutcome.headline}
                </p>
              )}
            </div>
          </div>

          {/* Compare All 4 Options Toggle */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowCompareAll((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {showCompareAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showCompareAll ? 'Hide All 4 Comparisons' : 'Compare All 4 Architectures on This Brief'}
            </button>

            {showCompareAll && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ARCHITECTURE_MODULES.map((arch) => {
                  const o = scenario.outcomes[arch.id];
                  const style = VERDICT_STYLES[o.verdict];
                  return (
                    <div
                      key={arch.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-950/80"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {arch.shortName}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {o.headline}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
