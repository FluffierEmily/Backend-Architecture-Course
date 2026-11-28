import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CourseText } from '../components/CourseText';
import { TermDrawer } from '../components/TermDrawer';
import { TermDrawerProvider } from '../context/TermDrawerContext';
import { ABBREVIATION_BY_ID, ABBREVIATIONS } from '../data/abbreviations';

function renderWithDrawer(text: string) {
  return render(
    <TermDrawerProvider>
      <p>
        <CourseText text={text} />
      </p>
      <TermDrawer />
    </TermDrawerProvider>
  );
}

describe('Abbreviation tooltips and right-side TermDrawer', () => {
  it('shows a tooltip on hover and opens the right-side drawer with usage and code on click', () => {
    renderWithDrawer('Use Postgres RLS and JWTs to keep B2B SaaS APIs safe.');

    // Hovering RLS displays its tooltip portaled to document.body above all other layers
    const rlsTrigger = screen.getByRole('button', { name: 'RLS' });
    fireEvent.mouseEnter(rlsTrigger);
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent(/Row-Level Security/i);
    expect(tooltip).toHaveTextContent(/Click for usage & example code/i);
    expect(tooltip.parentElement).toBe(document.body);
    expect(tooltip.className).toContain('z-[100]');

    // Clicking RLS opens the right-side drawer with explanation, usage, and example code
    fireEvent.click(rlsTrigger);
    const dialog = screen.getByRole('dialog', { name: /RLS — Row-Level Security/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent(/In Plain English/i);
    expect(dialog).toHaveTextContent(/How It’s Used in Backends/i);
    expect(dialog).toHaveTextContent(/SET LOCAL/);

    // Clicking a related term switches drawer content and shows Back navigation
    const idorButton = screen.getByRole('button', { name: /IDOR/i });
    fireEvent.click(idorButton);
    expect(
      screen.getByRole('dialog', { name: /IDOR — Insecure Direct Object Reference/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to RLS/i })).toBeInTheDocument();

    // Going back returns to RLS, and Escape closes the drawer
    fireEvent.click(screen.getByRole('button', { name: /Back to RLS/i }));
    expect(screen.getByRole('dialog', { name: /RLS — Row-Level Security/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows tooltips for everyday abbreviations without making them drawer buttons', () => {
    renderWithDrawer('Export a PDF report for B2B clients.');

    // PDF and B2B should not be clickable buttons, yet hovering still shows a tooltip
    expect(screen.queryByRole('button', { name: 'PDF' })).not.toBeInTheDocument();
    const pdfSpan = screen.getByText('PDF');
    fireEvent.mouseEnter(pdfSpan);
    expect(screen.getByRole('tooltip')).toHaveTextContent(/Portable Document Format/i);
  });

  it('renders inline backtick code spans cleanly without false abbreviation splits inside code', () => {
    renderWithDrawer('Send `POST /api/orders` over HTTPS with a valid UUID.');

    expect(screen.getByText('POST /api/orders').tagName).toBe('CODE');
    expect(screen.getByRole('button', { name: 'HTTPS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'UUID' })).toBeInTheDocument();
  });

  it('validates that every relatedTerms reference points to a valid drawer-enabled term', () => {
    expect(ABBREVIATIONS.length).toBeGreaterThanOrEqual(80);
    for (const entry of ABBREVIATIONS) {
      expect(entry.fullName.length).toBeGreaterThan(2);
      expect(entry.shortTooltip.length).toBeGreaterThan(10);
      if (entry.drawer?.relatedTerms) {
        for (const relId of entry.drawer.relatedTerms) {
          const target = ABBREVIATION_BY_ID[relId];
          expect(target, `Missing relatedTerm "${relId}" on "${entry.id}"`).toBeDefined();
          expect(
            target?.drawer,
            `relatedTerm "${relId}" on "${entry.id}" should have a drawer`
          ).toBeDefined();
        }
      }
    }
  });
});
