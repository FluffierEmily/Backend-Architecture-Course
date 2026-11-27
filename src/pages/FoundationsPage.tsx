import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { FoundationsPlayground } from '../components/FoundationsPlayground';
import { BEGINNER_GLOSSARY } from '../data';

interface FoundationsPageProps {
  isCompleted: boolean;
  onMarkComplete: () => void;
}

export function FoundationsPage({ isCompleted, onMarkComplete }: FoundationsPageProps) {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            <BookOpen className="h-3.5 w-3.5" />
            Module 0 · Beginner On-Ramp
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Backend Architecture Foundations
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Every backend architecture combines the same core building blocks in different ways. Click
          through the 8 essentials below so terms like <em>API Gateway</em>, <em>Caching</em>,{' '}
          <em>Rate Limiting</em>, and <em>Backpressure</em> feel completely intuitive before we
          compare the 4 patterns.
        </p>
      </header>

      <FoundationsPlayground />

      {/* Beginner Glossary */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            10 Architecture Terms You’ll Hear Everywhere
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A quick pocket glossary — no textbook jargon.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BEGINNER_GLOSSARY.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {item.term}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Completion & Next Step */}
      <footer className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <button
          type="button"
          onClick={onMarkComplete}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCompleted ? 'Foundations Marked Complete' : 'Mark Foundations Complete'}
        </button>

        <Link
          to="/modules/modular-monolith"
          onClick={onMarkComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-500"
        >
          Next: 1. Modular Monolith
          <ArrowRight className="h-4 w-4" />
        </Link>
      </footer>
    </div>
  );
}
