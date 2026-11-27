import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  FolderGit2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ARCHITECTURE_MODULES } from '../data';
import type { CourseProgressState } from '../hooks/useCourseProgress';

interface HomePageProps {
  progress: CourseProgressState;
  overallPercent: number;
}

const ACCENT_CLASSES = {
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
};

export function HomePage({ progress, overallPercent }: HomePageProps) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 via-slate-900 to-slate-950 p-8 text-white shadow-lg sm:p-10 dark:border-slate-800">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5" />
            Beginner-Friendly · Zero Coding Required · TypeScript Examples
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Learn How to Choose &amp; Design Backend Architectures
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
            Master <strong>Modular Monoliths</strong>, <strong>Microservices</strong>,{' '}
            <strong>Serverless</strong>, and <strong>Event-Driven Architecture</strong> through
            real-world company scenarios, interactive failure diagrams, side-by-side{' '}
            <em>Problematic vs. Refactored</em> code explainers, and an Architecture Decision
            Simulator.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/foundations"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-indigo-50"
            >
              Start with Foundations
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Compass className="h-4 w-4" />
              Try Decision Simulator
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold text-indigo-100 transition hover:bg-white/10"
            >
              <FolderGit2 className="h-4 w-4" />
              Browse 8 Practice Projects
            </Link>
          </div>
        </div>
      </section>

      {/* What Makes This Course Different */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Code2,
            title: 'Pitfall vs. Refactored Explainers',
            desc: 'Never stare at a blank editor. Inspect highlighted TypeScript anti-patterns side-by-side with refactored fixes and plain-English callouts.',
          },
          {
            icon: Compass,
            title: 'Architecture Decision Simulator',
            desc: 'Evaluate 8 realistic client briefs with team, traffic, and budget constraints — then see what happens 6 months after your decision.',
          },
          {
            icon: FolderGit2,
            title: 'Self-Paced Practice Projects',
            desc: 'Ready to build locally? Pick from 8 beginner Starter & Stretch project blueprints with folder layouts, milestones, and Markdown briefs.',
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="mb-3 inline-flex rounded-xl bg-indigo-500/15 p-2.5 text-indigo-600 dark:text-indigo-400">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {desc}
            </p>
          </div>
        ))}
      </section>

      {/* Guided Learning Roadmap */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Course Roadmap
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Follow in order if you’re new to backend architecture, or jump straight to any topic.
            </p>
          </div>
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-300">
            {overallPercent}% Complete
          </span>
        </div>

        {/* Step 0: Foundations Banner */}
        <Link
          to="/foundations"
          className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/60 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-slate-900 p-3 text-white dark:bg-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Module 0 · Recommended First Step
                </span>
                {progress.completedSections.includes('foundations') && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                Backend Foundations: Queues, API Gateways, Databases &amp; Scaling
              </h3>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                Plain-English analogies + an interactive Traffic Spike mini-lab before diving into
                the 4 architectures.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
            Start <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        {/* 4 Architecture Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {ARCHITECTURE_MODULES.map((mod) => {
            const isDone = progress.completedSections.includes(mod.id);
            return (
              <Link
                key={mod.id}
                to={`/modules/${mod.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500/60 dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${ACCENT_CLASSES[mod.accentColor]}`}
                    >
                      <Layers className="h-3 w-3" />
                      Module {mod.order} · {mod.scenario.company}
                    </span>
                    {isDone && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                    {mod.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{mod.tagline}</p>
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-100">Real-World Case:</strong>{' '}
                    {mod.scenario.domain}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>
                    {mod.codeComparisons.length} code comparisons · {mod.practiceProjects.length}{' '}
                    projects
                  </span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
