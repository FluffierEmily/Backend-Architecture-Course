import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ArchitectureId } from '../types/course';
import { ARCHITECTURE_META, SIMULATOR_SCENARIO_META } from '../data/courseMeta';

const STORAGE_KEY = 'backend-arch-course-progress-v1';

export interface CourseProgressState {
  completedSections: string[]; // 'foundations', 'modular-monolith', etc.
  inspectedComparisons: string[]; // code comparison ids
  completedMiniChecks: string[]; // mini check ids
  simulatorChoices: Record<string, ArchitectureId>; // scenarioId -> last chosen arch
  completedMilestones: string[]; // practice project milestone ids
}

const DEFAULT_STATE: CourseProgressState = {
  completedSections: [],
  inspectedComparisons: [],
  completedMiniChecks: [],
  simulatorChoices: {},
  completedMilestones: [],
};

function loadProgress(): CourseProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<CourseProgressState>;
    return {
      completedSections: Array.isArray(parsed.completedSections) ? parsed.completedSections : [],
      inspectedComparisons: Array.isArray(parsed.inspectedComparisons)
        ? parsed.inspectedComparisons
        : [],
      completedMiniChecks: Array.isArray(parsed.completedMiniChecks)
        ? parsed.completedMiniChecks
        : [],
      simulatorChoices:
        parsed.simulatorChoices && typeof parsed.simulatorChoices === 'object'
          ? parsed.simulatorChoices
          : {},
      completedMilestones: Array.isArray(parsed.completedMilestones)
        ? parsed.completedMilestones
        : [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useCourseProgress() {
  const [progress, setProgress] = useState<CourseProgressState>(() => loadProgress());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }, [progress]);

  const markSectionComplete = useCallback((sectionId: string) => {
    setProgress((prev) =>
      prev.completedSections.includes(sectionId)
        ? prev
        : { ...prev, completedSections: [...prev.completedSections, sectionId] }
    );
  }, []);

  const markComparisonInspected = useCallback((comparisonId: string) => {
    setProgress((prev) =>
      prev.inspectedComparisons.includes(comparisonId)
        ? prev
        : { ...prev, inspectedComparisons: [...prev.inspectedComparisons, comparisonId] }
    );
  }, []);

  const markMiniCheckComplete = useCallback((checkId: string) => {
    setProgress((prev) =>
      prev.completedMiniChecks.includes(checkId)
        ? prev
        : { ...prev, completedMiniChecks: [...prev.completedMiniChecks, checkId] }
    );
  }, []);

  const recordSimulatorAttempt = useCallback(
    (scenarioId: string, chosenArchitecture: ArchitectureId) => {
      setProgress((prev) => ({
        ...prev,
        simulatorChoices: {
          ...prev.simulatorChoices,
          [scenarioId]: chosenArchitecture,
        },
      }));
    },
    []
  );

  const toggleProjectMilestone = useCallback((milestoneId: string) => {
    setProgress((prev) => {
      const exists = prev.completedMilestones.includes(milestoneId);
      return {
        ...prev,
        completedMilestones: exists
          ? prev.completedMilestones.filter((id) => id !== milestoneId)
          : [...prev.completedMilestones, milestoneId],
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_STATE);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  // Weighted overall completion: Foundations + 4 Modules + at least 4 Simulator Scenarios
  const overallPercent = useMemo(() => {
    const coreLessonsTotal = 1 + ARCHITECTURE_META.length; // 5
    const coreLessonsDone = ['foundations', ...ARCHITECTURE_META.map((m) => m.id)].filter((id) =>
      progress.completedSections.includes(id)
    ).length;

    const simTotal = SIMULATOR_SCENARIO_META.length;
    const simDone = Object.keys(progress.simulatorChoices).filter((id) =>
      SIMULATOR_SCENARIO_META.some((s) => s.id === id)
    ).length;

    const totalUnits = coreLessonsTotal + simTotal;
    const doneUnits = coreLessonsDone + simDone;
    return totalUnits === 0 ? 0 : Math.round((doneUnits / totalUnits) * 100);
  }, [progress.completedSections, progress.simulatorChoices]);

  const bestFitSimCount = useMemo(() => {
    return SIMULATOR_SCENARIO_META.filter(
      (s) => progress.simulatorChoices[s.id] === s.bestFit
    ).length;
  }, [progress.simulatorChoices]);

  return {
    progress,
    overallPercent,
    bestFitSimCount,
    markSectionComplete,
    markComparisonInspected,
    markMiniCheckComplete,
    recordSimulatorAttempt,
    toggleProjectMilestone,
    resetProgress,
  };
}
