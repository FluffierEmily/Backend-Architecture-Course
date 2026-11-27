import { useState } from 'react';
import { Activity, AlertOctagon, Info } from 'lucide-react';
import type { ArchitectureDiagramData, DiagramNode } from '../types/course';

interface ArchitectureDiagramProps {
  data: ArchitectureDiagramData;
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

export function ArchitectureDiagram({ data }: ArchitectureDiagramProps) {
  const [failureMode, setFailureMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(data.nodes[0]?.id ?? '');

  const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));
  const selectedNode = nodeMap.get(selectedNodeId) ?? data.nodes[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      {/* Top Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Interactive Architecture Flow
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any component to inspect its role, or simulate a failure / traffic spike.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setFailureMode(false)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              !failureMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Normal Flow
          </button>
          <button
            type="button"
            onClick={() => setFailureMode(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              failureMode
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <AlertOctagon className="h-3.5 w-3.5" />
            Simulate Failure / Spike
          </button>
        </div>
      </div>

      {/* Mode Banner */}
      <div
        className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
          failureMode
            ? 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200'
            : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300'
        }`}
      >
        {failureMode ? (
          <>
            <p className="font-semibold text-rose-700 dark:text-rose-300">{data.failureTitle}</p>
            <p className="mt-0.5 text-sm">{data.failureSummary}</p>
          </>
        ) : (
          <p>{data.normalSummary}</p>
        )}
      </div>

      {/* Diagram + Inspector Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 lg:col-span-2">
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
          <div className="mt-2 flex flex-wrap items-center gap-4 px-2 text-[11px] text-slate-400">
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

        {/* Component Inspector Card */}
        {selectedNode && (
          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <Info className="h-3.5 w-3.5" />
                  Component Inspector
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {NODE_COLORS[selectedNode.kind].badge}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedNode.label}
              </h4>
              {selectedNode.sublabel && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedNode.sublabel}
                </p>
              )}

              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Role in Normal Operation
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedNode.beginnerSummary}
                  </p>
                </div>

                <div
                  className={`rounded-lg border p-3 ${
                    failureMode
                      ? 'border-rose-500/30 bg-rose-500/10'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                    Under Failure / Spike
                  </p>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-200">
                    {selectedNode.failureNote}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400">
              Tip: Click other boxes on the diagram to see how each part behaves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
