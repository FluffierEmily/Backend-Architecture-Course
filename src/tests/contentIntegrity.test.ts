import { describe, expect, it } from 'vitest';
import {
  ALL_PRACTICE_PROJECTS,
  ARCHITECTURE_META,
  ARCHITECTURE_MODULES,
  BEGINNER_GLOSSARY,
  COURSE_COUNTS,
  FOUNDATION_BLOCKS,
  HYBRID_CAPSTONE_PROJECTS,
  SIMULATOR_SCENARIO_META,
  SIMULATOR_SCENARIOS,
} from '../data';
import type { ArchitectureId } from '../types/course';

const EXPECTED_ARCH_IDS: ArchitectureId[] = [
  'modular-monolith',
  'microservices',
  'serverless',
  'event-driven',
];

describe('Course content integrity', () => {
  it('includes all 4 core architectures with distinct real-world companies', () => {
    expect(ARCHITECTURE_MODULES.map((m) => m.id)).toEqual(EXPECTED_ARCH_IDS);

    const companies = new Set(ARCHITECTURE_MODULES.map((m) => m.scenario.company));
    expect(companies.size).toBe(4);
  });

  it('provides at least 3 code comparisons and 2 deep-dive concepts per architecture with valid line ranges', () => {
    for (const mod of ARCHITECTURE_MODULES) {
      expect(mod.codeComparisons.length).toBeGreaterThanOrEqual(3);
      expect(mod.deepDiveConcepts.length).toBeGreaterThanOrEqual(2);

      for (const comp of mod.codeComparisons) {
        const problemLineCount = comp.problemCode.trimEnd().split('\n').length;
        const refactoredLineCount = comp.refactoredCode.trimEnd().split('\n').length;

        expect(comp.annotations.length).toBeGreaterThanOrEqual(2);

        for (const ann of comp.annotations) {
          const [pStart, pEnd] = ann.problemLines;
          const [rStart, rEnd] = ann.refactoredLines;

          expect(pStart).toBeGreaterThanOrEqual(1);
          expect(pEnd).toBeGreaterThanOrEqual(pStart);
          expect(pEnd).toBeLessThanOrEqual(problemLineCount);

          expect(rStart).toBeGreaterThanOrEqual(1);
          expect(rEnd).toBeGreaterThanOrEqual(rStart);
          expect(rEnd).toBeLessThanOrEqual(refactoredLineCount);

          expect(ann.problemExplanation.length).toBeGreaterThan(20);
          expect(ann.refactoredExplanation.length).toBeGreaterThan(20);
        }
      }
    }
  });

  it('has valid diagram nodes and edges referencing existing node ids', () => {
    for (const mod of ARCHITECTURE_MODULES) {
      const nodeIds = new Set(mod.diagram.nodes.map((n) => n.id));
      expect(nodeIds.size).toBeGreaterThanOrEqual(5);

      for (const edge of mod.diagram.edges) {
        expect(nodeIds.has(edge.from)).toBe(true);
        expect(nodeIds.has(edge.to)).toBe(true);
      }
    }
  });

  it('provides Starter and Stretch self-paced practice projects for every architecture plus Hybrid capstone', () => {
    expect(HYBRID_CAPSTONE_PROJECTS.length).toBeGreaterThanOrEqual(1);
    expect(ALL_PRACTICE_PROJECTS.length).toBe(8 + HYBRID_CAPSTONE_PROJECTS.length);
    const milestoneIds = new Set<string>();

    for (const mod of ARCHITECTURE_MODULES) {
      expect(mod.practiceProjects.length).toBe(2);
      const difficulties = mod.practiceProjects.map((p) => p.difficulty).sort();
      expect(difficulties).toEqual(['starter', 'stretch']);

      for (const proj of mod.practiceProjects) {
        expect(proj.milestones.length).toBeGreaterThanOrEqual(4);
        expect(proj.architectureRules.length).toBeGreaterThanOrEqual(2);
        for (const m of proj.milestones) {
          expect(milestoneIds.has(m.id)).toBe(false);
          milestoneIds.add(m.id);
        }
      }
    }

    for (const proj of HYBRID_CAPSTONE_PROJECTS) {
      expect(proj.architectureId).toBe('hybrid');
      expect(proj.milestones.length).toBeGreaterThanOrEqual(4);
      for (const m of proj.milestones) {
        expect(milestoneIds.has(m.id)).toBe(false);
        milestoneIds.add(m.id);
      }
    }
  });

  it('defines complete outcomes and valid 1-5 scores for all 13 simulator scenarios (greenfield, brownfield & modern)', () => {
    expect(SIMULATOR_SCENARIOS.length).toBe(13);

    for (const scenario of SIMULATOR_SCENARIOS) {
      expect(EXPECTED_ARCH_IDS).toContain(scenario.bestFit);
      expect(scenario.outcomes[scenario.bestFit].verdict).toBe('best-fit');

      for (const archId of EXPECTED_ARCH_IDS) {
        const outcome = scenario.outcomes[archId];
        expect(outcome).toBeDefined();
        expect(outcome.whatWorked.length).toBeGreaterThan(0);
        expect(outcome.whatHurt.length).toBeGreaterThan(0);

        for (const score of Object.values(outcome.scores)) {
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it('provides all 18 foundation blocks and 34 glossary terms covering core & advanced gaps', () => {
    expect(FOUNDATION_BLOCKS.length).toBeGreaterThanOrEqual(18);
    expect(BEGINNER_GLOSSARY.length).toBeGreaterThanOrEqual(34);
    const ids = FOUNDATION_BLOCKS.map((b) => b.id);
    expect(ids).toContain('caching');
    expect(ids).toContain('rate-limiting-backpressure');
    expect(ids).toContain('observability');
    expect(ids).toContain('security-auth');
    expect(ids).toContain('zero-downtime-migrations');
    expect(ids).toContain('testing-strategies');
    expect(ids).toContain('concurrency-locking');
    expect(ids).toContain('realtime-push');
    expect(ids).toContain('db-choice-scaling');
    expect(ids).toContain('safe-deployments');
    expect(ids).toContain('multi-tenancy');
    expect(ids).toContain('availability-dr');

    const blocksWithGuides = FOUNDATION_BLOCKS.filter((b) => (b.howToImplement?.length ?? 0) > 0);
    expect(blocksWithGuides.length).toBeGreaterThanOrEqual(9);
    for (const block of blocksWithGuides) {
      for (const recipe of block.howToImplement ?? []) {
        expect(recipe.steps.length).toBeGreaterThanOrEqual(2);
        expect(recipe.summary.length).toBeGreaterThan(20);
      }
    }
  });

  it('keeps lightweight courseMeta in sync with full course data modules', () => {
    expect(ARCHITECTURE_META).toEqual(
      ARCHITECTURE_MODULES.map((m) => ({
        id: m.id,
        order: m.order,
        name: m.name,
        shortName: m.shortName,
        tagline: m.tagline,
        company: m.scenario.company,
        domain: m.scenario.domain,
        codeComparisonsCount: m.codeComparisons.length,
        practiceProjectsCount: m.practiceProjects.length,
      }))
    );

    expect(SIMULATOR_SCENARIO_META).toEqual(
      SIMULATOR_SCENARIOS.map((s) => ({ id: s.id, bestFit: s.bestFit }))
    );

    expect(COURSE_COUNTS).toEqual({
      foundationBlocks: FOUNDATION_BLOCKS.length,
      beginnerGlossary: BEGINNER_GLOSSARY.length,
      practiceProjects: ALL_PRACTICE_PROJECTS.length,
      simulatorScenarios: SIMULATOR_SCENARIOS.length,
    });
  });
});
