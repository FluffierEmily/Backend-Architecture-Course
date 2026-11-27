import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('AppRoutes integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = (() => {}) as typeof window.scrollTo;
  });

  it('renders Home page and links to Foundations, Simulator, and Projects', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { name: /learn how to choose & design backend architectures/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start with foundations/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /try decision simulator/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse 8 practice projects/i })).toBeInTheDocument();
    expect(document.title).toBe('Interactive Backend Architectures Course');
  });

  it('renders Foundations page and toggles the Traffic Spike mini-lab', () => {
    renderAt('/foundations');
    expect(document.title).toBe('Foundations · Interactive Backend Architectures Course');
    expect(
      screen.getByRole('heading', { name: /backend architecture foundations/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /trigger 10x flash spike/i }));
    expect(screen.getByText(/OVERLOADED \(503 Errors!\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Absorbing Spike Smoothly/i)).toBeInTheDocument();
  });

  it('renders all 4 architecture module pages with diagrams, code comparisons, and projects', () => {
    const slugs = [
      { slug: 'modular-monolith', heading: 'Modular Monolith' },
      { slug: 'microservices', heading: 'Microservices' },
      { slug: 'serverless', heading: 'Serverless' },
      { slug: 'event-driven', heading: 'Event-Driven Architecture (EDA)' },
    ];

    for (const { slug, heading } of slugs) {
      const { unmount } = renderAt(`/modules/${slug}`);
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      expect(screen.getByText(/Problematic vs\. Refactored Examples/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simulate failure \/ spike/i })).toBeInTheDocument();
      unmount();
    }
  });

  it('renders Compare page and highlights matching architectures on priority selection', () => {
    renderAt('/compare');
    expect(
      screen.getByRole('heading', { name: /compare all 4 backend architectures/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /spiky traffic \/ zero idle cost/i }));
    expect(screen.getAllByText(/★ Strong Match/i).length).toBe(2);
    expect(
      screen.getByRole('heading', { name: /the strangler fig pattern/i })
    ).toBeInTheDocument();
  });

  it('renders Practice Projects gallery, filters by difficulty, and toggles milestones', () => {
    renderAt('/projects');
    expect(
      screen.getByRole('heading', { name: /practice projects gallery/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^starter$/i }));
    expect(screen.getAllByText(/Starter Project/i).length).toBe(4);
    expect(screen.queryByText(/Stretch Project/i)).not.toBeInTheDocument();

    const firstMilestone = screen.getByRole('button', {
      name: /set up the 3 domain module folders/i,
    });
    fireEvent.click(firstMilestone);
    expect(screen.getByText(/1 \/ 25 Milestones Checked/i)).toBeInTheDocument();
  });
});
