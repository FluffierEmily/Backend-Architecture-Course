import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCourseProgress } from '../hooks/useCourseProgress';

describe('useCourseProgress', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists section completion, simulator choices, and project milestones to localStorage', () => {
    const { result, unmount } = renderHook(() => useCourseProgress());

    expect(result.current.overallPercent).toBe(0);

    act(() => {
      result.current.markSectionComplete('foundations');
      result.current.recordSimulatorAttempt('sim-clinic-saas', 'modular-monolith');
      result.current.toggleProjectMilestone('mm-p1-m1');
    });

    expect(result.current.overallPercent).toBeGreaterThan(0);
    expect(result.current.bestFitSimCount).toBe(1);
    expect(result.current.progress.completedMilestones).toContain('mm-p1-m1');

    unmount();

    const { result: reloaded } = renderHook(() => useCourseProgress());
    expect(reloaded.current.progress.completedSections).toContain('foundations');
    expect(reloaded.current.progress.simulatorChoices['sim-clinic-saas']).toBe('modular-monolith');
    expect(reloaded.current.progress.completedMilestones).toContain('mm-p1-m1');
  });

  it('toggles milestones off and resets progress cleanly', () => {
    const { result } = renderHook(() => useCourseProgress());

    act(() => {
      result.current.toggleProjectMilestone('mm-p1-m1');
    });
    expect(result.current.progress.completedMilestones).toEqual(['mm-p1-m1']);

    act(() => {
      result.current.toggleProjectMilestone('mm-p1-m1');
    });
    expect(result.current.progress.completedMilestones).toEqual([]);

    act(() => {
      result.current.markSectionComplete('foundations');
      result.current.resetProgress();
    });
    expect(result.current.overallPercent).toBe(0);
    expect(result.current.progress.completedSections).toEqual([]);
  });
});
