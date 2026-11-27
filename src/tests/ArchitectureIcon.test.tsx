import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  ArchitectureIcon,
  ArchitectureIconBadge,
  ARCHITECTURE_VISUALS,
} from '../components/ArchitectureIcon';
import { AppRoutes } from '../App';
import type { ProjectArchitectureId } from '../types/course';

const ALL_ICON_IDS: ProjectArchitectureId[] = [
  'modular-monolith',
  'microservices',
  'serverless',
  'event-driven',
  'hybrid',
];

describe('ArchitectureIcon', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = (() => {}) as typeof window.scrollTo;
  });
  it('renders a distinct decorative SVG glyph for every architecture and hybrid evolution', () => {
    const renderedMarkup = new Set<string>();

    for (const id of ALL_ICON_IDS) {
      const { container, unmount } = render(<ArchitectureIcon architectureId={id} colored />);
      const svg = container.querySelector(`svg[data-architecture-icon="${id}"]`);

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).not.toHaveAttribute('role');
      expect(svg?.getAttribute('class')).toContain(ARCHITECTURE_VISUALS[id].iconColor.split(' ')[0]);

      renderedMarkup.add(svg!.innerHTML);
      unmount();
    }

    // Every architecture has a unique recognizable vector silhouette
    expect(renderedMarkup.size).toBe(ALL_ICON_IDS.length);
  });

  it('exposes role="img" and aria-label when a standalone label is provided', () => {
    render(<ArchitectureIcon architectureId="serverless" label="Serverless icon" />);
    const img = screen.getByRole('img', { name: 'Serverless icon' });
    expect(img).toBeInTheDocument();
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('renders ArchitectureIconBadge for all architectures across sizes', () => {
    for (const id of ALL_ICON_IDS) {
      const { container, unmount } = render(
        <ArchitectureIconBadge architectureId={id} size="lg" />
      );
      expect(container.querySelector(`svg[data-architecture-icon="${id}"]`)).toBeInTheDocument();
      unmount();
    }
  });

  it('displays architecture icons across key routes (Home, Compare, Simulator, Projects)', async () => {
    for (const route of ['/', '/compare', '/simulator', '/projects']) {
      window.localStorage.clear();
      const { container, unmount } = render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );

      await waitFor(() => {
        for (const id of ['modular-monolith', 'microservices', 'serverless', 'event-driven'] as const) {
          expect(
            container.querySelectorAll(`svg[data-architecture-icon="${id}"]`).length
          ).toBeGreaterThan(0);
        }

        if (route === '/projects') {
          expect(
            container.querySelectorAll('svg[data-architecture-icon="hybrid"]').length
          ).toBeGreaterThan(0);
        }
      });

      unmount();
    }
  });
});
