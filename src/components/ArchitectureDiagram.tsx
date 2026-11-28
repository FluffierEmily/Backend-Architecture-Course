import { Activity, AlertOctagon } from 'lucide-react';
import type { ArchitectureDiagramData, ArchitectureId, DiagramNode } from '../types/course';
import { usePersistedState } from '../hooks/usePersistedState';
import { ArchitectureIconBadge } from './ArchitectureIcon';
import { CourseText } from './CourseText';

interface ArchitectureDiagramProps {
  data: ArchitectureDiagramData;
  storageKey?: string;
  architectureId?: ArchitectureId;
}

const NODE_COLORS: Record<DiagramNode['kind'], { fill: string; stroke: string; badge: string }> = {
  client: { fill: '#1e293b', stroke: '#94a3b8', badge: 'Client' },
  gateway: { fill: '#1e1b4b', stroke: '#818cf8', badge: 'Gateway' },
  module: { fill: '#1e1b4b', stroke: '#6366f1', badge: 'Module' },
  service: { fill: '#0c4a6e', stroke: '#38bdf8', badge: 'Service' },
  function: { fill: '#451a03', stroke: '#f59e0b', badge: 'Function' },
  queue: { fill: '#064e3b', stroke: '#10b981', badge: 'Queue / Broker' },
  database: { fill: '#312e81', stroke: '#a78bfa', badge: 'Database' },
};

const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';

export function ArchitectureDiagram({
  data,
  storageKey = 'default',
  architectureId,
}: ArchitectureDiagramProps) {
  const [failureMode, setFailureMode] = usePersistedState<boolean>(
    `diagram.${storageKey}.failureMode`,
    false,
    isBoolean
  );
  const [selectedNodeId, setSelectedNodeId] = usePersistedState<string>(
    `diagram.${storageKey}.selectedNodeId`,
    data.nodes[0]?.id ?? '',
    (v): v is string => typeof v === 'string' && data.nodes.some((n) => n.id === v)
  );

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const selectedNode = nodeMap.get(selectedNodeId) ?? data.nodes[0];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs sm:p-6 dark:border-slate-700/80 dark:bg-[#162033]">
      {/* Top Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {architectureId && <ArchitectureIconBadge architectureId={architectureId} size="sm" />}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interactive Architecture Flow
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tap any box to inspect its role, or toggle a failure / traffic spike.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-xl border border-stone-200 bg-stone-100 p-1 text-xs font-semibold sm:inline-flex dark:border-slate-700 dark:bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setFailureMode(false)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 transition sm:px-3 sm:py-1.5 ${
              !failureMode
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span>Normal Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setFailureMode(true)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 transition sm:px-3 sm:py-1.5 ${
              failureMode
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5 shrink-0" />
            <span>Simulate Failure / Spike</span>
          </button>
        </div>
      </div>

      {/* Mode Summary */}
      <div
        className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-6 ${
          failureMode
            ? 'border-rose-500/25 bg-rose-500/[0.08] text-rose-900 dark:text-rose-100'
            : 'border-stone-200 bg-stone-50 text-slate-700 dark:border-slate-700/80 dark:bg-[#0f172a]/70 dark:text-slate-300'
        }`}
      >
        {failureMode ? (
          <>
            <p className="font-bold text-rose-700 dark:text-rose-300">
              <CourseText text={data.failureTitle} />
            </p>
            <p className="prose-measure mt-0.5 text-sm">
              <CourseText text={data.failureSummary} />
            </p>
          </>
        ) : (
          <p className="prose-measure">
            <CourseText text={data.normalSummary} />
          </p>
        )}
      </div>

      {/* Diagram + Inspector Grid */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          <p className="px-0.5 text-[11px] font-medium text-slate-500 sm:hidden dark:text-slate-400">
            Swipe diagram ↔ or pick a component below
          </p>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-2.5 sm:p-3">
          <svg
            viewBox="0 0 800 340"
            className="h-auto w-full min-w-[540px]"
            role="img"
            aria-label="Interactive architecture diagram"
          >
            <defs>
              <marker
                id="arrow-normal"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-fail"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-buffer"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
            </defs>

            {/* Subtle grid dots */}
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1e293b" />
            </pattern>
            <rect width="800" height="340" fill="url(#dot-grid)" rx="12" />

            {/* Edges */}
            {data.edges.map((edge, idx) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.hypot(dx, dy) || 1;
              const padStart = 58;
              const padEnd = 62;
              const x1 = from.x + (dx / dist) * padStart;
              const y1 = from.y + (dy / dist) * (Math.abs(dy) > 40 ? 28 : 16);
              const x2 = to.x - (dx / dist) * padEnd;
              const y2 = to.y - (dy / dist) * (Math.abs(dy) > 40 ? 28 : 16);
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2 - 8;

              const isFailing = failureMode && edge.failsInFailureMode;
              const isBuffering = failureMode && edge.buffersInFailureMode;

              const stroke = isFailing
                ? '#f43f5e'
                : isBuffering
                ? '#10b981'
                : edge.async
                ? '#38bdf8'
                : '#64748b';
              const markerEnd = isFailing
                ? 'url(#arrow-fail)'
                : isBuffering
                ? 'url(#arrow-buffer)'
                : 'url(#arrow-normal)';

              return (
                <g key={`${edge.from}-${edge.to}-${idx}`}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={stroke}
                    strokeWidth={isFailing || isBuffering ? 2.6 : 1.8}
                    strokeDasharray={edge.async || isFailing || isBuffering ? '6 6' : undefined}
                    className={
                      isFailing
                        ? 'animate-flow-fast'
                        : edge.async || isBuffering
                        ? 'animate-flow'
                        : undefined
                    }
                    markerEnd={markerEnd}
                  />
                  <rect
                    x={mx - 36}
                    y={my - 10}
                    width="72"
                    height="17"
                    rx="5"
                    fill="#0f172a"
                    stroke={isFailing ? '#f43f5e' : isBuffering ? '#10b981' : '#334155'}
                    strokeWidth="0.8"
                  />
                  <text
                    x={mx}
                    y={my + 2}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fill={isFailing ? '#fda4af' : isBuffering ? '#6ee7b7' : '#cbd5e1'}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {data.nodes.map((node) => {
              const palette = NODE_COLORS[node.kind];
              const isSelected = node.id === selectedNode?.id;
              const hasFailureEdge =
                failureMode &&
                data.edges.some(
                  (e) => (e.to === node.id || e.from === node.id) && e.failsInFailureMode
                );

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedNodeId(node.id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x={node.x - 58}
                    y={node.y - 28}
                    width="116"
                    height="56"
                    rx="12"
                    fill={palette.fill}
                    stroke={
                      isSelected
                        ? '#ffffff'
                        : hasFailureEdge
                        ? '#f43f5e'
                        : palette.stroke
                    }
                    strokeWidth={isSelected ? 2.8 : 1.6}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill="#f8fafc"
                  >
                    {node.label}
                  </text>
                  {node.sublabel && (
                    <text
                      x={node.x}
                      y={node.y + 13}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#94a3b8"
                    >
                      {node.sublabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 px-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-slate-400" /> Sync call
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-sky-400" />{' '}
              Async / Event
            </span>
            {failureMode && (
              <>
                <span className="inline-flex items-center gap-1.5 text-rose-300">
                  <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-rose-500" />{' '}
                  Impacted / Bottleneck
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-emerald-500" />{' '}
                  Safely Buffered
                </span>
              </>
            )}
          </div>
          </div>

          {/* Mobile & Tablet Quick Component Picker */}
          <div
            className="no-scrollbar flex gap-2 overflow-x-auto pt-1 lg:hidden"
            aria-label="Inspect architecture component"
          >
            {data.nodes.map((node) => {
              const isSelected = node.id === selectedNode?.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-slate-700 hover:bg-stone-100 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-300'
                  }`}
                >
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Calm Component Inspector */}
        {selectedNode && (
          <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5 dark:border-slate-700/80 dark:bg-[#0f172a]/70">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Selected Component
                </span>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {NODE_COLORS[selectedNode.kind].badge}
                </span>
              </div>

              <h4 className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white">
                {selectedNode.label}
              </h4>
              {selectedNode.sublabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedNode.sublabel}
                </p>
              )}

              <div className="mt-4 space-y-4 text-sm">
                <div className={failureMode ? 'opacity-65' : ''}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Normal Operation
                  </p>
                  <p className="mt-1 leading-6 text-slate-700 dark:text-slate-200">
                    <CourseText text={selectedNode.beginnerSummary} />
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-3.5 transition ${
                    failureMode
                      ? 'border-rose-500/30 bg-rose-500/[0.08]'
                      : 'border-stone-200 bg-white dark:border-slate-700/80 dark:bg-[#162033]'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Under Failure / Spike
                  </p>
                  <p className="mt-1 leading-6 text-slate-700 dark:text-slate-200">
                    <CourseText text={selectedNode.failureNote} />
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              Tap any other box on the diagram to inspect it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
