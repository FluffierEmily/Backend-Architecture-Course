import type { ProjectArchitectureId } from '../types/course';

export interface ArchitectureVisualTokens {
  iconColor: string;
  badgeBg: string;
  badgeRing: string;
  pillClass: string;
  eyebrowColor: string;
  hoverBorder: string;
  activeBorder: string;
  activeBg: string;
  hexAccent: string;
}

export const ARCHITECTURE_VISUALS: Record<ProjectArchitectureId, ArchitectureVisualTokens> = {
  'modular-monolith': {
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-500/12 dark:bg-indigo-400/15',
    badgeRing: 'ring-1 ring-inset ring-indigo-500/20 dark:ring-indigo-400/25',
    pillClass:
      'bg-indigo-500/10 text-indigo-700 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/25',
    eyebrowColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/50 dark:hover:border-indigo-400/50',
    activeBorder: 'border-indigo-500',
    activeBg: 'bg-indigo-500/[0.08]',
    hexAccent: '#818cf8',
  },
  microservices: {
    iconColor: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-500/12 dark:bg-sky-400/15',
    badgeRing: 'ring-1 ring-inset ring-sky-500/20 dark:ring-sky-400/25',
    pillClass:
      'bg-sky-500/10 text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-400/15 dark:text-sky-300 dark:ring-sky-400/25',
    eyebrowColor: 'text-sky-600 dark:text-sky-400',
    hoverBorder: 'hover:border-sky-500/50 dark:hover:border-sky-400/50',
    activeBorder: 'border-sky-500',
    activeBg: 'bg-sky-500/[0.08]',
    hexAccent: '#38bdf8',
  },
  serverless: {
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-500/12 dark:bg-amber-400/15',
    badgeRing: 'ring-1 ring-inset ring-amber-500/20 dark:ring-amber-400/25',
    pillClass:
      'bg-amber-500/10 text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-400/25',
    eyebrowColor: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-500/50 dark:hover:border-amber-400/50',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/[0.08]',
    hexAccent: '#f59e0b',
  },
  'event-driven': {
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/12 dark:bg-emerald-400/15',
    badgeRing: 'ring-1 ring-inset ring-emerald-500/20 dark:ring-emerald-400/25',
    pillClass:
      'bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/25',
    eyebrowColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/50',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/[0.08]',
    hexAccent: '#10b981',
  },
  hybrid: {
    iconColor: 'text-violet-600 dark:text-violet-400',
    badgeBg: 'bg-violet-500/12 dark:bg-violet-400/15',
    badgeRing: 'ring-1 ring-inset ring-violet-500/20 dark:ring-violet-400/25',
    pillClass:
      'bg-violet-500/10 text-violet-700 ring-1 ring-inset ring-violet-500/20 dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-400/25',
    eyebrowColor: 'text-violet-600 dark:text-violet-400',
    hoverBorder: 'hover:border-violet-500/50 dark:hover:border-violet-400/50',
    activeBorder: 'border-violet-500',
    activeBg: 'bg-violet-500/[0.08]',
    hexAccent: '#a78bfa',
  },
};

/**
 * Pure SVG glyph shapes on a 24x24 grid so icons can be rendered standalone
 * via <ArchitectureIcon> or embedded directly inside larger SVG diagrams.
 */
export function ArchitectureIconGlyph({
  architectureId,
  color = 'currentColor',
}: {
  architectureId: ProjectArchitectureId;
  color?: string;
}) {
  switch (architectureId) {
    case 'modular-monolith':
      // One unified deployable monolith cleanly partitioned wall-to-wall into distinct domain modules
      return (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M6.25 2.5H11.5V21.5H6.25A3.75 3.75 0 0 1 2.5 17.75V6.25A3.75 3.75 0 0 1 6.25 2.5Z"
            fill={color}
            fillOpacity="0.22"
            stroke="none"
          />
          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="19"
            rx="3.75"
            fill={color}
            fillOpacity="0.1"
            strokeWidth="1.8"
          />
          <path d="M11.5 2.5V21.5" strokeWidth="1.75" />
          <path d="M11.5 12H21.5" strokeWidth="1.75" />
        </g>
      );

    case 'microservices':
      // Three independent, standalone service nodes connected over a network mesh
      return (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.8 9L7.2 15" strokeWidth="1.55" />
          <path d="M14.2 9L16.8 15" strokeWidth="1.55" />
          <path d="M9 18.25H15" strokeWidth="1.55" />
          <rect
            x="8.75"
            y="2.5"
            width="6.5"
            height="6.5"
            rx="1.75"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.75"
          />
          <rect
            x="2.5"
            y="15"
            width="6.5"
            height="6.5"
            rx="1.75"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.75"
          />
          <rect
            x="15"
            y="15"
            width="6.5"
            height="6.5"
            rx="1.75"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.75"
          />
        </g>
      );

    case 'serverless':
      // Cloud canopy paired with an on-demand execution lightning bolt
      return (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M6.75 15.5H5.5A3.3 3.3 0 0 1 5.5 9a5.1 5.1 0 0 1 10-0.8A3.9 3.9 0 0 1 18.2 15.5H16.75"
            strokeWidth="1.75"
          />
          <path
            d="M13.25 9.75L9.25 15.5H12.25L10.75 21.25L15.25 14.5H12.25L13.25 9.75Z"
            fill={color}
            fillOpacity="0.22"
            strokeWidth="1.65"
          />
        </g>
      );

    case 'event-driven':
      // Single event emitter fanning out asynchronously to independent consumers
      return (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.6 11C10.8 11 12.2 5 16.75 5" strokeWidth="1.6" />
          <path d="M7.6 12H17.25" strokeWidth="1.6" />
          <path d="M7.6 13C10.8 13 12.2 19 16.75 19" strokeWidth="1.6" />
          <circle
            cx="5"
            cy="12"
            r="2.6"
            fill={color}
            fillOpacity="0.22"
            strokeWidth="1.75"
          />
          <circle cx="5" cy="12" r="0.95" fill={color} stroke="none" />
          <circle
            cx="19"
            cy="5"
            r="2.2"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.7"
          />
          <circle
            cx="19.5"
            cy="12"
            r="2.2"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.7"
          />
          <circle
            cx="19"
            cy="19"
            r="2.2"
            fill={color}
            fillOpacity="0.18"
            strokeWidth="1.7"
          />
        </g>
      );

    case 'hybrid':
      // Strangler Fig evolution: core monolith peeling off an extracted independent slice
      return (
        <g
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="2.75"
            y="9.5"
            width="9.5"
            height="11.5"
            rx="2.25"
            fill={color}
            fillOpacity="0.15"
            strokeWidth="1.75"
          />
          <path d="M5.5 14H9.5" strokeWidth="1.4" />
          <path d="M5.5 17.25H8.5" strokeWidth="1.4" />
          <rect
            x="14.5"
            y="3"
            width="6.75"
            height="6.75"
            rx="1.75"
            fill={color}
            fillOpacity="0.24"
            strokeWidth="1.75"
          />
          <path d="M7.5 9.5C7.5 6 9.5 5.25 12.6 5.25" strokeWidth="1.6" />
          <path d="M11 3.6L12.9 5.25L11 6.9" strokeWidth="1.55" />
          <path
            d="M12.25 16.75C16 16.75 18 14.75 18 11.75"
            strokeWidth="1.45"
            strokeDasharray="2 2.2"
          />
        </g>
      );
  }
}

interface ArchitectureIconProps {
  architectureId: ProjectArchitectureId;
  className?: string;
  /** Apply the architecture's signature accent color automatically */
  colored?: boolean;
  /** Provide an accessible label when rendered standalone without adjacent text */
  label?: string;
}

export function ArchitectureIcon({
  architectureId,
  className = 'h-4 w-4',
  colored = false,
  label,
}: ArchitectureIconProps) {
  const colorClass = colored ? ARCHITECTURE_VISUALS[architectureId].iconColor : '';
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      data-architecture-icon={architectureId}
      className={`shrink-0 ${colorClass} ${className}`.trim()}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ArchitectureIconGlyph architectureId={architectureId} />
    </svg>
  );
}

const BADGE_SIZE_CLASSES = {
  xs: { container: 'h-6 w-6 rounded-lg', icon: 'h-4 w-4' },
  sm: { container: 'h-8 w-8 rounded-lg', icon: 'h-[18px] w-[18px]' },
  md: { container: 'h-10 w-10 rounded-xl', icon: 'h-6 w-6' },
  lg: { container: 'h-12 w-12 rounded-2xl', icon: 'h-7 w-7' },
} as const;

interface ArchitectureIconBadgeProps {
  architectureId: ProjectArchitectureId;
  size?: keyof typeof BADGE_SIZE_CLASSES;
  className?: string;
}

export function ArchitectureIconBadge({
  architectureId,
  size = 'md',
  className = '',
}: ArchitectureIconBadgeProps) {
  const visual = ARCHITECTURE_VISUALS[architectureId];
  const sizing = BADGE_SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${sizing.container} ${visual.badgeBg} ${visual.badgeRing} ${visual.iconColor} ${className}`.trim()}
    >
      <ArchitectureIcon architectureId={architectureId} className={sizing.icon} />
    </span>
  );
}
