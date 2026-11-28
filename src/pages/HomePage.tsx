import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Compass, FolderGit2 } from 'lucide-react';
import { ARCHITECTURE_META, COURSE_COUNTS } from '../data/courseMeta';
import { prefetchRoute } from '../routes/prefetch';
import type { CourseProgressState } from '../hooks/useCourseProgress';
import type { ArchitectureId } from '../types/course';
import {
  ArchitectureIcon,
  ArchitectureIconBadge,
  ARCHITECTURE_VISUALS,
} from '../components/ArchitectureIcon';
import { CourseText } from '../components/CourseText';

interface HomePageProps {
  progress: CourseProgressState;
  overallPercent: number;
}

function getNextRecommendedStep(progress: CourseProgressState): {
  label: string;
  to: string;
  note: string;
  architectureId?: ArchitectureId;
} {
  if (!progress.completedSections.includes('foundations')) {
    return {
      label: 'Start with Foundations',
      to: '/foundations',
      note: 'Recommended first step · 5-min beginner on-ramp',
    };
  }

  const nextMod = ARCHITECTURE_META.find(
    (m) => !progress.completedSections.includes(m.id)
  );
  if (nextMod) {
    return {
      label: `Continue: ${nextMod.order}. ${nextMod.shortName}`,
      to: `/modules/${nextMod.id}`,
      note: `Up next · ${nextMod.company} (${nextMod.domain})`,
      architectureId: nextMod.id,
    };
  }

  return {
    label: 'Open Decision Simulator',
    to: '/simulator',
    note: `All modules complete · Test your instincts on ${COURSE_COUNTS.simulatorScenarios} company briefs`,
  };
}

export function HomePage({ progress, overallPercent }: HomePageProps) {
  const nextStep = getNextRecommendedStep(progress);
  const foundationsDone = progress.completedSections.includes('foundations');

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Focused Single-CTA Header Card */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-8 lg:p-9 dark:border-slate-700/80 dark:bg-[#162033]">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Beginner-Friendly · Bite-Sized Steps · Zero Coding Exams
        </p>
        <h1 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
          Learn How to Choose &amp; Design Backend Architectures
        </h1>
        <p className="prose-measure mt-3 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
          Master <strong>Modular Monoliths</strong>, <strong>Microservices</strong>,{' '}
          <strong>Serverless</strong>, and <strong>Event-Driven Architecture</strong> one calm chunk
          at a time — with visual flow diagrams, highlighted{' '}
          <em className="font-medium text-slate-900 dark:text-slate-100">
            Problematic vs. Refactored
          </em>{' '}
          TypeScript examples, and a Decision Simulator.
        </p>

        {/* Single Primary CTA + Quiet Secondary Links */}
        <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <Link
            to={nextStep.to}
            onMouseEnter={() => prefetchRoute(nextStep.to)}
            onFocus={() => prefetchRoute(nextStep.to)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-indigo-500 sm:w-auto"
          >
            {nextStep.architectureId && (
              <ArchitectureIcon architectureId={nextStep.architectureId} className="h-4 w-4" />
            )}
            {nextStep.label}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 pt-1 sm:pt-0">
            <Link
              to="/simulator"
              onMouseEnter={() => prefetchRoute('/simulator')}
              onFocus={() => prefetchRoute('/simulator')}
              className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-slate-600 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
            >
              <Compass className="h-4 w-4" />
              Try Decision Simulator
            </Link>

            <Link
              to="/projects"
              onMouseEnter={() => prefetchRoute('/projects')}
              onFocus={() => prefetchRoute('/projects')}
              className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-slate-600 underline decoration-slate-400/50 underline-offset-4 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300"
            >
              <FolderGit2 className="h-4 w-4" />
              Browse {COURSE_COUNTS.practiceProjects} Practice Projects
            </Link>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{nextStep.note}</p>
      </section>

      {/* Calm Course Roadmap */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl dark:text-white">
            Course Roadmap
          </h2>
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
            {overallPercent}% complete
          </span>
        </div>

        {/* Module 0: Foundations Row */}
        <Link
          to="/foundations"
          onMouseEnter={() => prefetchRoute('/foundations')}
          onFocus={() => prefetchRoute('/foundations')}
          className="group flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-indigo-500/50 sm:gap-4 sm:p-5 dark:border-slate-700/80 dark:bg-[#162033] dark:hover:border-indigo-400/50"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="mt-0.5 shrink-0 rounded-xl bg-indigo-500/15 p-2.5 text-indigo-600 dark:text-indigo-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Module 0 · Foundations</span>
                {foundationsDone && (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    · <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-base font-bold text-slate-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                Backend Building Blocks: Gateways, Concurrency, Databases &amp; Resilience
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {COURSE_COUNTS.foundationBlocks} plain-English building blocks, 3 interactive resilience
                labs, and a {COURSE_COUNTS.beginnerGlossary}-term pocket glossary.
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300" />
        </Link>

        {/* 4 Core Architecture Modules */}
        <div className="grid gap-4 md:grid-cols-2">
          {ARCHITECTURE_META.map((mod) => {
            const isDone = progress.completedSections.includes(mod.id);
            const visual = ARCHITECTURE_VISUALS[mod.id];
            const modPath = `/modules/${mod.id}`;
            return (
              <Link
                key={mod.id}
                to={modPath}
                onMouseEnter={() => prefetchRoute(modPath)}
                onFocus={() => prefetchRoute(modPath)}
                className={`group flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition sm:p-6 dark:border-slate-700/80 dark:bg-[#162033] ${visual.hoverBorder}`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <ArchitectureIconBadge architectureId={mod.id} size="md" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                      <span className={visual.eyebrowColor}>
                        Module {mod.order} · {mod.company}
                      </span>
                      {isDone && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 text-lg font-extrabold text-slate-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                      <CourseText text={mod.name} interactive={false} />
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      <CourseText text={mod.tagline} interactive={false} />
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3.5 text-xs font-medium text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
                  <span>
                    {mod.codeComparisonsCount} code comparisons · {mod.practiceProjectsCount}{' '}
                    projects
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-500 dark:group-hover:text-indigo-300" />
                </div>
              </Link>
            );
          })}
        </div>

        <p className="pt-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="lg:hidden">
            Tip: Tap the menu button in the top bar anytime to jump between modules or toggle{' '}
            <strong>Calm Motion</strong>.
          </span>
          <span className="hidden lg:inline">
            Tip: Hover or click the left edge of the screen anytime to open navigation, or toggle{' '}
            <strong>Calm Motion</strong> inside the sidebar.
          </span>
        </p>
      </section>
    </div>
  );
}
