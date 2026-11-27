import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App';
import { ALL_PRACTICE_PROJECTS } from '../data';

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
    expect(
      screen.getByRole('link', {
        name: new RegExp(`browse ${ALL_PRACTICE_PROJECTS.length} practice projects`, 'i'),
      })
    ).toBeInTheDocument();
    expect(document.title).toBe('Interactive Backend Architectures Course');
  });

  it('renders Foundations page with guided steps and interactive resilience labs', () => {
    renderAt('/foundations');
    expect(document.title).toBe('Foundations · Interactive Backend Architectures Course');
    expect(
      screen.getByRole('heading', { name: /backend architecture foundations/i })
    ).toBeInTheDocument();

    // Navigate to Step 2 (Interactive Labs)
    fireEvent.click(screen.getByRole('tab', { name: /2\. interactive labs/i }));
    fireEvent.click(screen.getByRole('button', { name: /trigger 10x flash spike/i }));
    expect(screen.getByText(/OVERLOADED \(503 Errors!\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Absorbing Spike Smoothly/i)).toBeInTheDocument();

    // Switch to Circuit Breaker lab and trip it open
    fireEvent.click(screen.getByRole('tab', { name: /lab 2 · circuit breaker states/i }));
    const failBtn = screen.getByRole('button', { name: /inject downstream failure/i });
    fireEvent.click(failBtn);
    fireEvent.click(failBtn);
    fireEvent.click(failBtn);
    expect(screen.getByText(/OPEN \(Fail-Fast Fallback\)/i)).toBeInTheDocument();

    // Switch to Availability & Outbox lab and simulate crash
    fireEvent.click(screen.getByRole('tab', { name: /lab 3 · availability math/i }));
    fireEvent.click(screen.getByRole('button', { name: /simulate crash right after db commit/i }));
    expect(screen.getByText(/Event Lost!/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero Loss!/i)).toBeInTheDocument();
  });

  it('renders all 4 architecture module pages with guided steps and All Sections mode', () => {
    const slugs = [
      { slug: 'modular-monolith', heading: 'Modular Monolith' },
      { slug: 'microservices', heading: 'Microservices' },
      { slug: 'serverless', heading: 'Serverless' },
      { slug: 'event-driven', heading: 'Event-Driven Architecture (EDA)' },
    ];

    for (const { slug, heading } of slugs) {
      const { unmount } = renderAt(`/modules/${slug}`);
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      // Guided Steps starts cleanly on Step 1 (Story)
      expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();

      // Switching to All Sections reveals diagram and code comparisons together
      fireEvent.click(screen.getByRole('button', { name: /all sections/i }));
      expect(screen.getByText(/Problematic vs\. Refactored Examples/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simulate failure \/ spike/i })).toBeInTheDocument();
      unmount();
    }
  });

  it('opens the auto-hiding sidebar via the left edge trigger and toggles Calm Motion', () => {
    renderAt('/');
    const edgeTrigger = screen.getByRole('button', { name: /open navigation sidebar/i });
    expect(edgeTrigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.mouseEnter(edgeTrigger);
    expect(edgeTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByRole('button', { name: /calm motion/i }));
    expect(document.documentElement.classList.contains('calm-motion')).toBe(true);

    expect(screen.queryByRole('button', { name: /focus mode/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close navigation menu/i }));
    expect(edgeTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders Compare page and highlights matching architectures on priority selection', () => {
    renderAt('/compare');
    expect(
      screen.getByRole('heading', { name: /compare all 4 backend architectures/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /spiky traffic \/ zero idle cost/i }));
    expect(screen.getAllByText(/★ Strong Match/i).length).toBe(2);

    fireEvent.click(screen.getByRole('tab', { name: /2\. hybrids & strangler fig/i }));
    expect(
      screen.getByRole('heading', { name: /the strangler fig pattern/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/splitting the shared database safely/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /3\. cost intuition/i }));
    expect(
      screen.getByRole('heading', { name: /cloud cost intuition/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /10m req \/ mo/i }));
    expect(screen.getByText(/\$120 – \$350 \/ mo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /4\. sizing & adr kit/i }));
    expect(
      screen.getByRole('heading', { name: /5-minute back-of-the-envelope sizing estimator/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /lightweight architecture decision record \(adr\) template/i })
    ).toBeInTheDocument();
  });

  it('renders Practice Projects gallery, filters by difficulty and Hybrid tab, and toggles milestones', () => {
    const totalMilestones = ALL_PRACTICE_PROJECTS.reduce((sum, p) => sum + p.milestones.length, 0);
    renderAt('/projects');
    expect(
      screen.getByRole('heading', { name: /practice projects gallery/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /hybrid \/ evolution/i }));
    expect(
      screen.getByRole('heading', { name: /strangler fig capstone/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /^all \(/i }));
    fireEvent.click(screen.getByRole('button', { name: /^starter$/i }));
    expect(screen.getAllByText(/Starter Project/i).length).toBe(4);
    expect(screen.queryByText(/Stretch Project/i)).not.toBeInTheDocument();

    const firstMilestone = screen.getByRole('button', {
      name: /set up the 3 domain module folders/i,
    });
    fireEvent.click(firstMilestone);
    expect(
      screen.getByText(new RegExp(`1 / ${totalMilestones} Milestones Checked`, 'i'))
    ).toBeInTheDocument();
  });
});
