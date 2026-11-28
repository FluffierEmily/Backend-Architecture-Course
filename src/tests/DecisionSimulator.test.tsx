import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DecisionSimulator } from '../components/DecisionSimulator';
import { SIMULATOR_SCENARIOS } from '../data';

function byRenderedText(rawText: string) {
  const expected = rawText.replace(/`/g, '');
  return (_content: string, element: Element | null) => {
    if (!element || element.textContent !== expected) return false;
    return Array.from(element.children).every((child) => child.textContent !== expected);
  };
}

describe('DecisionSimulator', () => {
  it('evaluates the selected architecture and shows the 6 Months Later outcome', () => {
    const onRecordChoice = vi.fn();
    render(<DecisionSimulator completedChoices={{}} onRecordChoice={onRecordChoice} />);

    const firstScenario = SIMULATOR_SCENARIOS[0];
    expect(screen.getByRole('heading', { name: firstScenario.title })).toBeInTheDocument();

    const runButton = screen.getByRole('button', { name: /run architecture simulation/i });
    expect(runButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /modular monolith/i }));
    expect(runButton).toBeEnabled();

    fireEvent.click(runButton);

    expect(onRecordChoice).toHaveBeenCalledWith(firstScenario.id, 'modular-monolith');
    expect(
      screen.getByText(byRenderedText(firstScenario.outcomes['modular-monolith'].headline))
    ).toBeInTheDocument();
    expect(
      screen.getByText(byRenderedText(firstScenario.outcomes['modular-monolith'].sixMonthsLater))
    ).toBeInTheDocument();
  });

  it('allows switching scenarios and comparing all 4 architectures', () => {
    render(<DecisionSimulator completedChoices={{}} onRecordChoice={vi.fn()} />);

    const secondScenario = SIMULATOR_SCENARIOS[1];
    fireEvent.click(screen.getByRole('button', { name: /next case/i }));

    expect(screen.getByRole('heading', { name: secondScenario.title })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /microservices/i }));
    fireEvent.click(screen.getByRole('button', { name: /run architecture simulation/i }));

    fireEvent.click(
      screen.getByRole('button', { name: /compare all 4 architectures on this brief/i })
    );
    expect(
      screen.getByText(secondScenario.outcomes['modular-monolith'].headline)
    ).toBeInTheDocument();
  });
});
