import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImplementationDrawer } from '../components/ImplementationDrawer';
import type { ImplementationRecipe } from '../types/course';

const SAMPLE_RECIPES: ImplementationRecipe[] = [
  {
    id: 'r1',
    label: 'Cache Invalidation',
    summary: 'Delete affected keys right after your SQL write commits.',
    steps: ['Commit the SQL UPDATE first.', 'Call redis.del(key) after commit.'],
    code: {
      filename: 'updatePrice.ts',
      snippet: 'await redis.del(`product:${id}`);',
    },
    watchOut: 'Always keep a fallback TTL in case delete fails.',
  },
  {
    id: 'r2',
    label: 'Safe CDN Headers',
    summary: 'Mark authenticated responses private so CDNs never share them.',
    steps: ['Set Cache-Control: private, no-store on auth routes.', 'Allow public caching only on anonymous GETs.'],
  },
];

describe('ImplementationDrawer', () => {
  it('starts collapsed by default and reveals one focused recipe at a time on click', () => {
    render(<ImplementationDrawer recipes={SAMPLE_RECIPES} />);

    // Collapsed by default to keep visual density calm
    expect(screen.queryByText(/Delete affected keys/)).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /How to Implement/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Delete affected keys/)).toBeInTheDocument();
    expect(screen.getByText('updatePrice.ts')).toBeInTheDocument();
    expect(screen.queryByText(/Mark authenticated responses private/)).not.toBeInTheDocument();

    // Switching tab swaps cleanly to recipe 2 without stacking walls of text
    fireEvent.click(screen.getByRole('tab', { name: /2\. Safe CDN Headers/i }));
    expect(screen.getByText(/Mark authenticated responses private/)).toBeInTheDocument();
    expect(screen.queryByText(/Delete affected keys/)).not.toBeInTheDocument();
  });

  it('renders open immediately in inline variant (used inside Project Starter Hints)', () => {
    render(<ImplementationDrawer recipes={[SAMPLE_RECIPES[0]]} variant="inline" />);
    expect(screen.getByText(/Delete affected keys/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /How to Implement/i })).not.toBeInTheDocument();
  });
});
