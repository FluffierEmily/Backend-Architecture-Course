import { Fragment, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

interface TooltipCoords {
  left: number;
  top?: number;
  bottom?: number;
}

const TOOLTIP_WIDTH = 256;
const VIEWPORT_PADDING = 12;

const AbbreviationToken = memo(function AbbreviationToken({
  matchedText,
  entry,
  interactive,
}: AbbreviationTokenProps) {
  const { openTerm } = useTermDrawer();
  const [coords, setCoords] = useState<TooltipCoords | null>(null);
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipId = useId();

  const canOpenDrawer = interactive && Boolean(entry.drawer);
  const hovered = coords !== null;

  const showTooltip = useCallback(() => {
    const el = triggerRef.current;
    if (!el || typeof el.getBoundingClientRect !== 'function') {
      setCoords({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });
      return;
    }

    const rect = el.getBoundingClientRect();
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;

    const centeredLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const clampedLeft = Math.max(
      VIEWPORT_PADDING,
      Math.min(centeredLeft, vw - TOOLTIP_WIDTH - VIEWPORT_PADDING)
    );

    if (rect.top < 150) {
      setCoords({ left: clampedLeft, top: rect.bottom + 8 });
    } else {
      setCoords({ left: clampedLeft, bottom: vh - rect.top + 8 });
    }
  }, []);

  const hideTooltip = useCallback(() => {
    setCoords(null);
  }, []);

  useEffect(() => {
    if (!hovered) return;
    const dismiss = () => setCoords(null);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('resize', dismiss);
    return () => {
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('resize', dismiss);
    };
  }, [hovered]);

  const handleOpen = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      if (!canOpenDrawer) return;
      e.preventDefault();
      e.stopPropagation();
      setCoords(null);
      openTerm(entry.id);
    },
    [canOpenDrawer, entry.id, openTerm]
  );

  const tooltipNode =
    hovered && coords && typeof document !== 'undefined'
      ? createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              width: `${TOOLTIP_WIDTH}px`,
            }}
            className="pointer-events-none z-[100] rounded-xl border border-slate-700/90 bg-[#0f172a] p-3 text-left text-xs font-normal normal-case tracking-normal text-slate-100 shadow-2xl"
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
          </span>,
          document.body
        )
      : null;

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
      {tooltipNode}
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
