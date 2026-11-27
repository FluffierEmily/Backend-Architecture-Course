import { Link } from 'react-router-dom';
import { ArchitectureIcon, ArchitectureIconGlyph } from './ArchitectureIcon';

export function ArchitectureDecisionFlowchart() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-700/80 dark:bg-[#162033]">
      <div className="mb-4">
        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          Quick Mental Map
        </p>
        <h2 className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">
          Which Architecture Should You Start With?
        </h2>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-4">
        <svg
          viewBox="0 0 760 250"
          className="h-auto w-full min-w-[560px]"
          role="img"
          aria-label="Decision flowchart showing when to choose Microservices, Serverless, Event-Driven Architecture, or Modular Monolith"
        >
          {/* Question 1 */}
          <rect x="20" y="20" width="210" height="50" rx="10" fill="#1e293b" stroke="#818cf8" strokeWidth="1.5" />
          <text x="125" y="42" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">
            30+ devs / independent deploys
          </text>
          <text x="125" y="58" textAnchor="middle" fontSize="9.5" fill="#a5b4fc">
            or strict PCI/polyglot isolation?
          </text>

          {/* Q1 YES -> Microservices */}
          <line x1="230" y1="45" x2="496" y2="45" stroke="#38bdf8" strokeWidth="2" />
          <text x="360" y="38" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#7dd3fc">YES →</text>
          <rect x="500" y="22" width="236" height="46" rx="10" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.6" />
          <g transform="translate(514, 35) scale(0.83)">
            <ArchitectureIconGlyph architectureId="microservices" color="#7dd3fc" />
          </g>
          <text x="628" y="43" textAnchor="middle" fontSize="12" fontWeight="800" fill="#f0f9ff">Microservices</text>
          <text x="628" y="58" textAnchor="middle" fontSize="9.5" fill="#bae6fd">Squad autonomy + isolated DBs</text>

          {/* Q1 NO -> Q2 */}
          <line x1="125" y1="70" x2="125" y2="96" stroke="#64748b" strokeWidth="1.8" />
          <text x="142" y="88" fontSize="9" fontWeight="700" fill="#94a3b8">NO</text>

          {/* Question 2 */}
          <rect x="20" y="98" width="210" height="50" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="125" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">
            Spiky / 90%+ idle workload
          </text>
          <text x="125" y="136" textAnchor="middle" fontSize="9.5" fill="#fcd34d">
            (webhooks, PDFs, cron jobs)?
          </text>

          {/* Q2 YES -> Serverless */}
          <line x1="230" y1="123" x2="496" y2="123" stroke="#f59e0b" strokeWidth="2" />
          <text x="360" y="116" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fcd34d">YES →</text>
          <rect x="500" y="100" width="236" height="46" rx="10" fill="#451a03" stroke="#f59e0b" strokeWidth="1.6" />
          <g transform="translate(514, 113) scale(0.83)">
            <ArchitectureIconGlyph architectureId="serverless" color="#fcd34d" />
          </g>
          <text x="628" y="121" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fef3c7">Serverless</text>
          <text x="628" y="136" textAnchor="middle" fontSize="9.5" fill="#fcd34d">Scale-to-zero + instant bursts</text>

          {/* Q2 NO -> Q3 */}
          <line x1="125" y1="148" x2="125" y2="174" stroke="#64748b" strokeWidth="1.8" />
          <text x="142" y="166" fontSize="9" fontWeight="700" fill="#94a3b8">NO</text>

          {/* Question 3 */}
          <rect x="20" y="176" width="210" height="50" rx="10" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
          <text x="125" y="198" textAnchor="middle" fontSize="11" fontWeight="700" fill="#f8fafc">
            4+ independent async consumers
          </text>
          <text x="125" y="214" textAnchor="middle" fontSize="9.5" fill="#6ee7b7">
            or high-volume event stream?
          </text>

          {/* Q3 YES -> Event-Driven */}
          <line x1="230" y1="191" x2="496" y2="191" stroke="#10b981" strokeWidth="2" />
          <text x="360" y="185" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6ee7b7">YES →</text>
          <rect x="500" y="168" width="236" height="38" rx="9" fill="#064e3b" stroke="#10b981" strokeWidth="1.6" />
          <g transform="translate(514, 178) scale(0.75)">
            <ArchitectureIconGlyph architectureId="event-driven" color="#6ee7b7" />
          </g>
          <text x="628" y="191" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#ecfdf5">
            Event-Driven (EDA)
          </text>

          {/* Q3 NO -> Modular Monolith (Default!) */}
          <line x1="230" y1="218" x2="496" y2="226" stroke="#818cf8" strokeWidth="2.2" />
          <text x="360" y="236" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#a5b4fc">NO (Best Default) →</text>
          <rect x="500" y="210" width="236" height="34" rx="9" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.8" />
          <g transform="translate(514, 218.5) scale(0.71)">
            <ArchitectureIconGlyph architectureId="modular-monolith" color="#a5b4fc" />
          </g>
          <text x="628" y="231" textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#e0e7ff">
            Modular Monolith (Start Here)
          </text>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Jump to module:</span>
        <Link
          to="/modules/modular-monolith"
          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
        >
          <ArchitectureIcon architectureId="modular-monolith" className="h-3.5 w-3.5" />
          Modular Monolith
        </Link>
        <span>·</span>
        <Link
          to="/modules/microservices"
          className="inline-flex items-center gap-1.5 font-semibold text-sky-600 hover:underline dark:text-sky-300"
        >
          <ArchitectureIcon architectureId="microservices" className="h-3.5 w-3.5" />
          Microservices
        </Link>
        <span>·</span>
        <Link
          to="/modules/serverless"
          className="inline-flex items-center gap-1.5 font-semibold text-amber-600 hover:underline dark:text-amber-300"
        >
          <ArchitectureIcon architectureId="serverless" className="h-3.5 w-3.5" />
          Serverless
        </Link>
        <span>·</span>
        <Link
          to="/modules/event-driven"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:underline dark:text-emerald-300"
        >
          <ArchitectureIcon architectureId="event-driven" className="h-3.5 w-3.5" />
          Event-Driven
        </Link>
      </div>
    </div>
  );
}

export function StranglerFigDiagram() {
  return (
    <figure className="mt-5 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1120] p-4">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 740 190"
          className="h-auto w-full min-w-[540px]"
          role="img"
          aria-label="Three-stage Strangler Fig migration diagram showing gateway routing and incremental database extraction"
        >
          {/* Stage 1 */}
          <rect x="12" y="12" width="218" height="166" rx="12" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
          <text x="121" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#a5b4fc">
            STAGE 1 · Add Routing Layer
          </text>
          <rect x="64" y="46" width="114" height="28" rx="7" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.3" />
          <text x="121" y="64" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">L7 API Gateway</text>
          <line x1="121" y1="74" x2="121" y2="96" stroke="#818cf8" strokeWidth="1.8" />
          <rect x="34" y="98" width="174" height="32" rx="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
          <text x="121" y="118" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#e2e8f0">
            Monolith (Auth · Orders · Reports)
          </text>
          <rect x="64" y="140" width="114" height="26" rx="6" fill="#312e81" stroke="#a78bfa" strokeWidth="1.1" />
          <text x="121" y="157" textAnchor="middle" fontSize="9.5" fill="#f5f3ff">Shared Postgres</text>

          {/* Arrow 1->2 */}
          <line x1="230" y1="95" x2="256" y2="95" stroke="#64748b" strokeWidth="2" />

          {/* Stage 2 */}
          <rect x="260" y="12" width="222" height="166" rx="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.4" />
          <text x="371" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#fcd34d">
            STAGE 2 · Route &amp; CDC Sync
          </text>
          <rect x="314" y="46" width="114" height="28" rx="7" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.3" />
          <text x="371" y="64" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">L7 API Gateway</text>

          <line x1="342" y1="74" x2="318" y2="96" stroke="#94a3b8" strokeWidth="1.6" />
          <line x1="400" y1="74" x2="424" y2="96" stroke="#10b981" strokeWidth="2" strokeDasharray="5 4" className="animate-flow" />

          <rect x="272" y="98" width="94" height="32" rx="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
          <text x="319" y="118" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#e2e8f0">Monolith</text>

          <rect x="376" y="98" width="96" height="32" rx="7" fill="#064e3b" stroke="#10b981" strokeWidth="1.4" />
          <text x="424" y="118" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ecfdf5">Reports Svc</text>

          <rect x="272" y="140" width="94" height="26" rx="6" fill="#312e81" stroke="#a78bfa" strokeWidth="1.1" />
          <text x="319" y="157" textAnchor="middle" fontSize="9" fill="#f5f3ff">Core DB</text>

          <line x1="366" y1="153" x2="376" y2="153" stroke="#f59e0b" strokeWidth="2" />
          <rect x="376" y="140" width="96" height="26" rx="6" fill="#064e3b" stroke="#10b981" strokeWidth="1.2" />
          <text x="424" y="157" textAnchor="middle" fontSize="9" fill="#ecfdf5">New DB (CDC)</text>

          {/* Arrow 2->3 */}
          <line x1="482" y1="95" x2="508" y2="95" stroke="#64748b" strokeWidth="2" />

          {/* Stage 3 */}
          <rect x="512" y="12" width="216" height="166" rx="12" fill="#05211a" stroke="#10b981" strokeWidth="1.4" />
          <text x="620" y="34" textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#6ee7b7">
            STAGE 3 · Verify &amp; Retire
          </text>
          <rect x="563" y="46" width="114" height="28" rx="7" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.3" />
          <text x="620" y="64" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f8fafc">L7 API Gateway</text>

          <line x1="590" y1="74" x2="568" y2="96" stroke="#94a3b8" strokeWidth="1.6" />
          <line x1="650" y1="74" x2="672" y2="96" stroke="#10b981" strokeWidth="2" />

          <rect x="524" y="98" width="92" height="32" rx="7" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
          <text x="570" y="118" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#e2e8f0">Lean Core</text>

          <rect x="626" y="98" width="92" height="32" rx="7" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
          <text x="672" y="118" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#ecfdf5">Reports (xN)</text>

          <text x="620" y="158" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#6ee7b7">
            Old reports code &amp; tables dropped ✓
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 px-1 text-[11px] font-medium text-slate-400">
        Strangler Fig evolution: shift one path &amp; its data at a time — zero big-bang rewrite.
      </figcaption>
    </figure>
  );
}
