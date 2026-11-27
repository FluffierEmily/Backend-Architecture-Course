import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import type { MiniDecisionCheckItem } from '../types/course';
import { ARCHITECTURE_BY_ID } from '../data';

interface MiniDecisionCheckProps {
  architectureName: string;
  checks: MiniDecisionCheckItem[];
  onCompleteCheck?: (checkId: string) => void;
}

export function MiniDecisionCheck({
  architectureName,
  checks,
  onCompleteCheck,
}: MiniDecisionCheckProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const handleAnswer = (checkId: string, choice: boolean) => {
    setAnswers((prev) => ({ ...prev, [checkId]: choice }));
    onCompleteCheck?.(checkId);
  };

  return (
    <div className="space-y-4">
      {checks.map((check, index) => {
        const hasAnswered = check.id in answers;
        const userChoice = answers[check.id];
        const isCorrect = hasAnswered && userChoice === check.isGoodFit;
        const betterArch = check.betterAlternative
          ? ARCHITECTURE_BY_ID[check.betterAlternative]
          : undefined;

        return (
          <div
            key={check.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <HelpCircle className="h-4 w-4" />
              Quick Decision Check #{index + 1}
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              {check.prompt}
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleAnswer(check.id, true)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  hasAnswered && userChoice === true
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Good fit for {architectureName}
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(check.id, false)}
                className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                  hasAnswered && userChoice === false
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Pick a different architecture
              </button>
            </div>

            {hasAnswered && (
              <div
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
                }`}
              >
                <div className="mb-1 flex items-center gap-2 font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Spot on!
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-amber-500" />
                      Not quite — here’s why:
                    </>
                  )}
                </div>
                <p className="leading-relaxed text-slate-700 dark:text-slate-200">
                  {check.explanation}
                </p>
                {betterArch && (
                  <Link
                    to={`/modules/${betterArch.id}`}
                    className="mt-2 inline-block text-xs font-semibold text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-400"
                  >
                    Explore {betterArch.name} →
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
