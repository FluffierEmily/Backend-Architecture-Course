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

  it('renders Home page and links to Foundations, Simulator, and Projects', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', {
        name: /learn how to choose & design backend architectures/i,
      })
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

  it('renders Foundations page with guided steps and interactive resilience labs', async () => {
    renderAt('/foundations');
    expect(document.title).toBe('Foundations · Interactive Backend Architectures Course');
    expect(
      await screen.findByRole('heading', { name: /backend architecture foundations/i })
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

  it('renders all 4 architecture module pages with guided steps and All Sections mode', async () => {
    const slugs = [
      { slug: 'modular-monolith', heading: 'Modular Monolith' },
      { slug: 'microservices', heading: 'Microservices' },
      { slug: 'serverless', heading: 'Serverless' },
      { slug: 'event-driven', heading: 'Event-Driven Architecture (EDA)' },
    ];

    for (const { slug, heading } of slugs) {
      const { unmount } = renderAt(`/modules/${slug}`);
      expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      // Guided Steps starts cleanly on Step 1 (Story)
      expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();

      // Switching to All Sections reveals diagram and code comparisons together
      fireEvent.click(screen.getByRole('button', { name: /all sections/i }));
      expect(await screen.findByText(/Problematic vs\. Refactored Examples/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /simulate failure \/ spike/i })).toBeInTheDocument();
      unmount();
    }
  });

  it('opens the auto-hiding sidebar via the left edge trigger and toggles Calm Motion', async () => {
    renderAt('/');
    await screen.findByRole('heading', {
      name: /learn how to choose & design backend architectures/i,
    });
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

  it('renders Compare page and highlights matching architectures on priority selection', async () => {
    renderAt('/compare');
    expect(
      await screen.findByRole('heading', { name: /compare all 4 backend architectures/i })
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

  it('renders Practice Projects gallery, filters by difficulty and Hybrid tab, and toggles milestones', async () => {
    const totalMilestones = ALL_PRACTICE_PROJECTS.reduce((sum, p) => sum + p.milestones.length, 0);
    renderAt('/projects');
    expect(
      await screen.findByRole('heading', { name: /practice projects gallery/i })
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

  it('persists the active page and selected elements across a simulated page refresh', async () => {
    // 1. Open Serverless module, go to Step 3 (Code), switch to Example 2 & Annotation 2
    const firstVisit = renderAt('/modules/serverless');
    expect(await screen.findByRole('heading', { level: 1, name: 'Serverless' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /3\. code/i }));
    fireEvent.click(await screen.findByRole('button', { name: /next code example/i }));
    expect(screen.getByText(/Example 2 of 3/i)).toBeInTheDocument();

    const secondFocusTab = await screen.findByRole('tab', { name: /2\. clear async contract/i });
    fireEvent.click(secondFocusTab);
    expect(secondFocusTab).toHaveAttribute('aria-selected', 'true');

    firstVisit.unmount();

    // 2. Simulate reopening/refreshing at root '/' -> auto-restores Serverless + Step 3 + Example 2 + Annotation 2
    const refreshed = renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Serverless' })).toBeInTheDocument();
    expect(await screen.findByText(/Example 2 of 3/i)).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: /2\. clear async contract/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    refreshed.unmount();

    // 3. Open Practice Projects, pick Hybrid tab & Folder Layout, then refresh '/projects'
    const projectsVisit = renderAt('/projects');
    expect(
      await screen.findByRole('heading', { name: /practice projects gallery/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /hybrid \/ evolution/i }));
    fireEvent.click(screen.getByRole('button', { name: /folder layout/i }));
    expect(screen.getByText(/strangler-capstone\//i)).toBeInTheDocument();
    projectsVisit.unmount();

    const projectsRefreshed = renderAt('/projects');
    expect(await screen.findByRole('tab', { name: /hybrid \/ evolution/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText(/strangler-capstone\//i)).toBeInTheDocument();
    projectsRefreshed.unmount();
  });

  it('renders visual diagrams selectively where they aid understanding', async () => {
    // 1. Foundations: first block (client-http) stays clean without redundant SVG; caching renders its Cache-Aside diagram
    const foundations = renderAt('/foundations');
    expect(
      await screen.findByRole('heading', { name: /backend architecture foundations/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /block 1 of/i }));
    fireEvent.click(screen.getByRole('button', { name: /7\. caching/i }));
    expect(
      screen.getByRole('img', { name: /cache-aside diagram showing cache hit and cache miss/i })
    ).toBeInTheDocument();
    foundations.unmount();

    // 2. Microservices Step 2 shows Saga forward + compensating actions diagram
    const ms = renderAt('/modules/microservices');
    expect(await screen.findByRole('heading', { level: 1, name: 'Microservices' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /2\. visual flow/i }));
    expect(
      screen.getByRole('img', { name: /saga workflow diagram showing reserve stock/i })
    ).toBeInTheDocument();
    ms.unmount();

    // 3. Compare page shows Decision Flowchart (Step 1) and Strangler Fig diagram (Step 2)
    const compare = renderAt('/compare');
    expect(
      await screen.findByRole('img', { name: /decision flowchart showing when to choose/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /2\. hybrids & strangler fig/i }));
    expect(
      screen.getByRole('img', { name: /three-stage strangler fig migration diagram/i })
    ).toBeInTheDocument();
    compare.unmount();
  });
});
