import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CodeComparison } from '../components/CodeComparison';
import { ARCHITECTURE_BY_ID } from '../data';

describe('CodeComparison', () => {
  const sampleItem = ARCHITECTURE_BY_ID['modular-monolith'].codeComparisons[0];

  it('renders both Problematic and Refactored code panels with the first annotation active', () => {
    render(<CodeComparison item={sampleItem} />);

    expect(screen.getByText(sampleItem.title)).toBeInTheDocument();
    expect(screen.getByText(sampleItem.problemTitle)).toBeInTheDocument();
    expect(screen.getByText(sampleItem.refactoredTitle)).toBeInTheDocument();

    expect(screen.getByText(sampleItem.annotations[0].problemExplanation)).toBeInTheDocument();
    expect(
      screen.getByText(sampleItem.annotations[0].refactoredExplanation)
    ).toBeInTheDocument();
  });

  it('switches active highlight explainers when clicking another annotation pill', () => {
    const onInspect = vi.fn();
    render(<CodeComparison item={sampleItem} onInspect={onInspect} />);

    const secondTab = screen.getByRole('tab', { name: sampleItem.annotations[1].label });
    fireEvent.click(secondTab);

    expect(onInspect).toHaveBeenCalledWith(sampleItem.id);
    expect(screen.getByText(sampleItem.annotations[1].problemExplanation)).toBeInTheDocument();
    expect(
      screen.getByText(sampleItem.annotations[1].refactoredExplanation)
    ).toBeInTheDocument();
  });

  it('expands all explainers when toggling View All Explainers', () => {
    render(<CodeComparison item={sampleItem} />);

    fireEvent.click(screen.getByRole('button', { name: /view all explainers/i }));

    for (const ann of sampleItem.annotations) {
      expect(screen.getByText(ann.problemExplanation)).toBeInTheDocument();
      expect(screen.getByText(ann.refactoredExplanation)).toBeInTheDocument();
    }
  });
});
