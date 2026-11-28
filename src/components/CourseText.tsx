import { Fragment, memo, useCallback, useId, useMemo, useRef, useState } from 'react';
import {
  ABBREVIATION_BY_TOKEN,
  ABBREVIATION_REGEX,
  type AbbreviationEntry,
} from '../data/abbreviations';
import { useTermDrawer } from '../context/TermDrawerContext';

interface AbbreviationTokenProps {
  matchedText: string;
  entry: AbbreviationEntry;
  interactive: boolean;
}

const AbbreviationToken = memo(function AbbreviationToken({
  matchedText,
  entry,
  interactive,
}: AbbreviationTokenProps) {
  const { openTerm } = useTermDrawer();
  const [hovered, setHovered] = useState(false);
  const [placeBelow, setPlaceBelow] = useState(false);
  const [alignEdge, setAlignEdge] = useState<'center' | 'left' | 'right'>('center');
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  const canOpenDrawer = interactive && Boolean(entry.drawer);

  const showTooltip = useCallback(() => {
    const el = triggerRef.current;
    if (el && typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect();
      setPlaceBelow(rect.top < 140);
      if (rect.left < 150) {
        setAlignEdge('left');
      } else if (typeof window !== 'undefined' && window.innerWidth - rect.right < 150) {
        setAlignEdge('right');
      } else {
        setAlignEdge('center');
      }
    }
    setHovered(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setHovered(false);
  }, []);

  const handleOpen = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (!canOpenDrawer) return;
      e.preventDefault();
      e.stopPropagation();
      setHovered(false);
      openTerm(entry.id);
    },
    [canOpenDrawer, entry.id, openTerm]
  );

  const positionClass =
    alignEdge === 'left'
      ? 'left-0'
      : alignEdge === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  const verticalClass = placeBelow ? 'top-full mt-2' : 'bottom-full mb-2';

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline' }}
      className="relative inline"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <span
        style={{ display: 'inline' }}
        role={canOpenDrawer ? 'button' : undefined}
        tabIndex={canOpenDrawer ? 0 : undefined}
        aria-describedby={hovered ? tooltipId : undefined}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onClick={canOpenDrawer ? handleOpen : undefined}
        onKeyDown={
          canOpenDrawer
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleOpen(e);
                }
              }
            : undefined
        }
        className={
          canOpenDrawer
            ? 'cursor-pointer underline decoration-indigo-400/70 decoration-dotted underline-offset-[3px] transition-colors hover:text-indigo-600 hover:decoration-solid focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-indigo-500 dark:decoration-indigo-400/60 dark:hover:text-indigo-300'
            : 'cursor-help underline decoration-slate-400/60 decoration-dotted underline-offset-[3px] dark:decoration-slate-500/70'
        }
      >
        {matchedText}
      </span>

      {hovered && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-64 rounded-xl border border-slate-700/90 bg-[#0f172a] p-3 text-left text-xs font-normal normal-case tracking-normal text-slate-100 shadow-xl ${verticalClass} ${positionClass}`}
        >
          <span className="block font-bold text-white">
            <span className="font-mono text-indigo-300">{entry.term}</span>
            <span className="mx-1.5 text-slate-500">·</span>
            <span>{entry.fullName}</span>
          </span>
          <span className="mt-1 block leading-5 text-slate-300">{entry.shortTooltip}</span>
          {canOpenDrawer && (
            <span className="mt-1.5 block text-[11px] font-semibold text-indigo-300">
              Click for usage &amp; example code →
            </span>
          )}
        </span>
      )}
    </span>
  );
});

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'abbr'; value: string; entry: AbbreviationEntry };

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  // Split out inline backtick spans first so SQL/code snippets inside backticks stay untouched
  const parts = text.split(/(`[^`]+`)/g);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      segments.push({ kind: 'code', value: part.slice(1, -1) });
      continue;
    }

    ABBREVIATION_REGEX.lastIndex = 0;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = ABBREVIATION_REGEX.exec(part)) !== null) {
      const token = match[1];
      const entry = ABBREVIATION_BY_TOKEN[token];
      if (!entry) continue;

      if (match.index > lastIdx) {
        segments.push({ kind: 'text', value: part.slice(lastIdx, match.index) });
      }
      segments.push({ kind: 'abbr', value: token, entry });
      lastIdx = match.index + token.length;
    }

    if (lastIdx < part.length) {
      segments.push({ kind: 'text', value: part.slice(lastIdx) });
    }
  }

  return segments;
}

interface CourseTextProps {
  text: string;
  interactive?: boolean;
}

export const CourseText = memo(function CourseText({
  text,
  interactive = true,
}: CourseTextProps) {
  const segments = useMemo(() => parseSegments(text), [text]);

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return <Fragment key={idx}>{seg.value}</Fragment>;
        }
        if (seg.kind === 'code') {
          return (
            <code
              key={idx}
              className="rounded-md bg-stone-200/75 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800/90 dark:text-indigo-200"
            >
              {seg.value}
            </code>
          );
        }
        return (
          <AbbreviationToken
            key={`${seg.entry.id}-${idx}`}
            matchedText={seg.value}
            entry={seg.entry}
            interactive={interactive}
          />
        );
      })}
    </>
  );
});
