import { Link, Navigate, useParams } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  FolderGit2,
  Lightbulb,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { ARCHITECTURE_BY_ID, ARCHITECTURE_MODULES } from '../data';
import type { ArchitectureId } from '../types/course';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { CodeComparison } from '../components/CodeComparison';
import { MiniDecisionCheck } from '../components/MiniDecisionCheck';
import { PracticeProjectCard } from '../components/PracticeProjectCard';
import type { CourseProgressState } from '../hooks/useCourseProgress';

interface ModulePageProps {
  progress: CourseProgressState;
  onMarkSectionComplete: (sectionId: string) => void;
  onInspectComparison: (comparisonId: string) => void;
  onCompleteMiniCheck: (checkId: string) => void;
  onToggleMilestone: (milestoneId: string) => void;
}

export function ModulePage({
  progress,
  onMarkSectionComplete,
  onInspectComparison,
  onCompleteMiniCheck,
  onToggleMilestone,
}: ModulePageProps) {
  const { slug } = useParams<{ slug: string }>();
  const mod = slug ? ARCHITECTURE_BY_ID[slug as ArchitectureId] : undefined;

  if (!mod) {
    return <Navigate to="/" replace />;
  }

  const currentIdx = ARCHITECTURE_MODULES.findIndex((m) => m.id === mod.id);
  const prevMod = currentIdx > 0 ? ARCHITECTURE_MODULES[currentIdx - 1] : null;
  const nextMod =
    currentIdx < ARCHITECTURE_MODULES.length - 1
      ? ARCHITECTURE_MODULES[currentIdx + 1]
      : null;
  const isCompleted = progress.completedSections.includes(mod.id);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Module {mod.order} of {ARCHITECTURE_MODULES.length}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Module Completed
            </span>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {mod.name}
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{mod.tagline}</p>
        </div>

        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          {mod.beginnerSummary}
        </p>

        {/* Quick Section Jump Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { href: '#scenario', label: 'Real-World Scenario' },
            { href: '#diagram', label: 'Interactive Diagram' },
            { href: '#concepts', label: 'Key Concepts' },
            { href: '#code', label: 'Problematic vs. Refactored Code' },
            { href: '#practices', label: 'Best Practices & Pitfalls' },
            { href: '#checks', label: 'Decision Check' },
            { href: '#projects', label: 'Self-Paced Projects' },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
            >
              {link.label}
            </a>
          ))}
        </div>
      </header>

      {/* When to Use / Avoid */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            <ThumbsUp className="h-4 w-4" /> When {mod.shortName} Shines
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {mod.whenToUse.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            <ThumbsDown className="h-4 w-4" /> When to Avoid It
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {mod.whenToAvoid.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-rose-500">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Real-World Scenario */}
      <section
        id="scenario"
        className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Building2 className="h-4 w-4" />
          Real-World Scenario · {mod.scenario.company}
        </div>
        <h2 className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
          {mod.scenario.domain}
        </h2>

        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Team: {mod.scenario.teamSize}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Traffic: {mod.scenario.trafficProfile}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {mod.scenario.story}
        </p>
        <div className="mt-4 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4 text-sm leading-relaxed text-slate-800 dark:text-indigo-100">
          <strong className="text-indigo-700 dark:text-indigo-300">Why this choice fits: </strong>
          {mod.scenario.whyThisArchitecture}
        </div>
      </section>

      {/* Interactive Architecture Diagram */}
      <section id="diagram" className="scroll-mt-20">
        <ArchitectureDiagram key={mod.id} data={mod.diagram} />
      </section>

      {/* Deep-Dive Architectural Concepts */}
      <section id="concepts" className="scroll-mt-20 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Lightbulb className="h-4 w-4" />
            Essential Mental Models
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Key {mod.shortName} Patterns &amp; Trade-Offs
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {mod.deepDiveConcepts.map((concept) => (
            <div
              key={concept.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div>
                <span className="inline-block rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                  {concept.badge}
                </span>
                <h3 className="mt-2.5 text-lg font-bold text-slate-900 dark:text-white">
                  {concept.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {concept.summary}
                </p>

                {concept.bulletPoints && concept.bulletPoints.length > 0 && (
                  <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {concept.bulletPoints.map((bp) => (
                      <li key={bp} className="flex gap-2">
                        <span className="font-bold text-indigo-500">→</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-3 text-xs leading-relaxed text-slate-800 dark:text-indigo-100">
                <strong className="text-indigo-700 dark:text-indigo-300">Key Takeaway: </strong>
                {concept.keyTakeaway}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Problematic vs. Refactored Code Comparisons */}
      <section id="code" className="scroll-mt-20 space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Code2 className="h-4 w-4" />
            Interactive Code Breakdowns (TypeScript / Node.js)
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Problematic vs. Refactored Examples
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Click any numbered highlight pill or highlighted line of code to compare why the
            beginner mistake breaks and how the refactored version fixes it.
          </p>
        </div>

        <div className="space-y-6">
          {mod.codeComparisons.map((item) => (
            <CodeComparison key={item.id} item={item} onInspect={onInspectComparison} />
          ))}
        </div>
      </section>

      {/* Best Practices & Common Beginner Pitfalls */}
      <section id="practices" className="scroll-mt-20 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Best Practices
          </h2>
          <div className="space-y-3">
            {mod.bestPractices.map((bp) => (
              <div
                key={bp.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{bp.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {bp.detail}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
            <AlertOctagon className="h-5 w-5 text-rose-500" />
            Common Beginner Pitfalls
          </h2>
          <div className="space-y-3">
            {mod.pitfalls.map((pf) => (
              <div
                key={pf.title}
                className="rounded-xl border border-rose-500/25 bg-white p-4 shadow-sm dark:border-rose-500/25 dark:bg-slate-900/70"
              >
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-300">{pf.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-800 dark:text-slate-100">Red flag: </strong>
                  {pf.symptom}
                </p>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  <strong>Fix: </strong>
                  {pf.fix}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Decision Checks */}
      <section id="checks" className="scroll-mt-20 space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Test Your Intuition
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Spot when {mod.shortName} is the right call — and when it’s a trap.
          </p>
        </div>
        <MiniDecisionCheck
          key={mod.id}
          architectureName={mod.shortName}
          checks={mod.miniChecks}
          onCompleteCheck={onCompleteMiniCheck}
        />
      </section>

      {/* Self-Paced Practice Projects */}
      <section id="projects" className="scroll-mt-20 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <FolderGit2 className="h-4 w-4" />
            Build It On Your Own Time
          </div>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
            Self-Paced {mod.shortName} Projects
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Want hands-on practice later? Pick a project, copy its Markdown brief into a local
            repo, and check off milestones as you build.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {mod.practiceProjects.map((project) => (
            <PracticeProjectCard
              key={project.id}
              project={project}
              completedMilestones={progress.completedMilestones}
              onToggleMilestone={onToggleMilestone}
            />
          ))}
        </div>
      </section>

      {/* Module Footer Navigation */}
      <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div>
          {prevMod ? (
            <Link
              to={`/modules/${prevMod.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              {prevMod.order}. {prevMod.shortName}
            </Link>
          ) : (
            <Link
              to="/foundations"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              0. Foundations
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onMarkSectionComplete(mod.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isCompleted ? 'Completed' : 'Mark Module Complete'}
          </button>

          {nextMod ? (
            <Link
              to={`/modules/${nextMod.id}`}
              onClick={() => onMarkSectionComplete(mod.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Next: {nextMod.order}. {nextMod.shortName}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/simulator"
              onClick={() => onMarkSectionComplete(mod.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Launch Decision Simulator
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
