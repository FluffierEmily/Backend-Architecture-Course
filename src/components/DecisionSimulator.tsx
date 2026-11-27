import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  { label: string; badge: string; accent: string }
> = {
  'best-fit': {
    label: 'Best Fit',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    accent: 'border-l-emerald-500',
  },
  viable: {
    label: 'Viable with Trade-offs',
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
    accent: 'border-l-sky-500',
  },
  'over-engineered': {
    label: 'Over-Engineered',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    accent: 'border-l-amber-500',
  },
  risky: {
    label: 'Risky Bottleneck',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    accent: 'border-l-rose-500',
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
  const [jumpOpen, setJumpOpen] = useState(false);
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
    setJumpOpen(false);
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
      {/* Unified Calm Case Card (Matches FoundationsPlayground layout) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033]">
        {/* Slim Progress Track + Jump Dropdown inside the card */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setJumpOpen((o) => !o)}
                aria-expanded={jumpOpen}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-stone-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <span>
                  Case {scenarioIdx + 1} of {SIMULATOR_SCENARIOS.length} · {scenario.company}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </button>

              {jumpOpen && (
                <div className="absolute left-0 z-20 mt-1.5 max-h-80 w-80 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-[#0f172a]">
                  {SIMULATOR_SCENARIOS.map((s, idx) => {
                    const savedChoice = completedChoices[s.id];
                    const hitBestFit = savedChoice === s.bestFit;
                    const isCurrent = idx === scenarioIdx;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectScenario(idx)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                          isCurrent
                            ? 'bg-indigo-500/15 font-semibold text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">
                          {idx + 1}. {s.company} — {s.title}
                        </span>
                        {savedChoice && (
                          <Check
                            className={`h-3.5 w-3.5 shrink-0 ${
                              hitBestFit ? 'text-emerald-500' : 'text-amber-400'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={scenarioIdx === 0}
                onClick={() => handleSelectScenario(scenarioIdx - 1)}
                aria-label="Previous case"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={scenarioIdx === SIMULATOR_SCENARIOS.length - 1}
                onClick={() => handleSelectScenario(scenarioIdx + 1)}
                aria-label="Next case"
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-stone-100 hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quiet Segmented Progress Track */}
          <div className="flex gap-1.5" aria-hidden="true">
            {SIMULATOR_SCENARIOS.map((s, idx) => {
              const saved = completedChoices[s.id];
              const isCurrent = idx === scenarioIdx;
              const isBest = saved === s.bestFit;
              return (
                <button
                  key={s.id}
                  type="button"
                  tabIndex={-1}
                  title={`Case ${idx + 1}: ${s.company}`}
                  onClick={() => handleSelectScenario(idx)}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    isCurrent
                      ? 'bg-indigo-500'
                      : isBest
                      ? 'bg-emerald-500/70'
                      : saved
                      ? 'bg-amber-400/70'
                      : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-700/80 dark:hover:bg-slate-600'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Brief Heading & Story */}
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {scenario.title}
        </h2>
        <p className="prose-measure mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
          {scenario.brief}
        </p>

        {/* Constraints Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Icon className="h-3.5 w-3.5 text-indigo-500" />
                {label}
              </div>
              <p className="mt-1 text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Architecture Picker */}
        <div className="mt-7 border-t border-stone-200 pt-6 dark:border-slate-700/80">
          <p className="mb-3.5 text-sm font-bold text-slate-900 dark:text-white">
            Which architecture do you recommend for {scenario.company}?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ARCHITECTURE_MODULES.map((arch) => {
              const isPicked = selectedArch === arch.id;
              return (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => setSelectedArch(arch.id)}
                  className={`flex flex-col rounded-xl border p-4 text-left transition ${
                    isPicked
                      ? 'border-indigo-500 bg-indigo-500/[0.08] ring-1 ring-indigo-500/40'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-300 dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {arch.shortName}
                  </span>
                  <span className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                    {arch.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={!selectedArch}
              onClick={handleRunSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" />
              Run Architecture Simulation
            </button>

            {simulatedArch && scenarioIdx < SIMULATOR_SCENARIOS.length - 1 && (
              <button
                type="button"
                onClick={() => handleSelectScenario(scenarioIdx + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next Scenario
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calm Simulation Outcome Card (Clean left accent instead of loud full-card tint) */}
      {outcome && simulatedArch && (
        <div
          className={`rounded-2xl border border-l-4 border-stone-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-700/80 dark:bg-[#162033] ${VERDICT_STYLES[outcome.verdict].accent}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              6-Month Outcome · {ARCHITECTURE_BY_ID[simulatedArch].name}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${VERDICT_STYLES[outcome.verdict].badge}`}
            >
              {VERDICT_STYLES[outcome.verdict].label}
            </span>
          </div>

          <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
            {outcome.headline}
          </h3>

          <p className="prose-measure mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
            {outcome.sixMonthsLater}
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* What Worked & Pain Points */}
            <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> What Worked
                </p>
                <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {outcome.whatWorked.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-stone-200 pt-4 dark:border-slate-700/80">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" /> Trade-offs &amp; Pain Points
                </p>
                <ul className="space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {outcome.whatHurt.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5-Axis Trade-Off Scorecard */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Trade-Off Scorecard (1–5)
                </p>
                {simulatedArch !== scenario.bestFit && (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Marker = {bestFitModule.shortName}
                  </span>
                )}
              </div>

              <div className="space-y-3.5">
                {SCORE_AXES.map(({ key, label }) => {
                  const score = outcome.scores[key];
                  const bestScore = bestFitOutcome.scores[key];
                  return (
                    <div key={key}>
                      <div className="mb-1.5 flex justify-between text-xs font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{label}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {score}/5
                        </span>
                      </div>
                      <div className="relative h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-slate-800">
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
                <p className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3.5 text-xs leading-5 text-emerald-900 dark:text-emerald-200">
                  <strong>Recommended Best Fit:</strong> {bestFitModule.name} —{' '}
                  {bestFitOutcome.headline}
                </p>
              )}

              {scenario.hybridNote && (
                <p className="mt-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.08] p-3.5 text-xs leading-5 text-slate-800 dark:text-slate-100">
                  <strong className="text-indigo-700 dark:text-indigo-300">
                    Pragmatic Hybrid Pairing:{' '}
                  </strong>
                  {scenario.hybridNote}
                </p>
              )}
            </div>
          </div>

          {/* Compare All 4 Options Disclosure */}
          <div className="mt-6 border-t border-stone-200 pt-5 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setShowCompareAll((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
            >
              {showCompareAll ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showCompareAll
                ? 'Hide All 4 Comparisons'
                : 'Compare All 4 Architectures on This Brief'}
            </button>

            {showCompareAll && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {ARCHITECTURE_MODULES.map((arch) => {
                  const o = scenario.outcomes[arch.id];
                  const style = VERDICT_STYLES[o.verdict];
                  return (
                    <div
                      key={arch.id}
                      className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-slate-700/80 dark:bg-[#0f172a]/70"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {arch.shortName}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
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
