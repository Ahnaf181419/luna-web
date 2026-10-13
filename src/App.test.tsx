import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { CANDIDATES } from '@/lib/lunarvoid-data';

const setUrl = (url: string) => {
  window.history.replaceState({}, '', url);
};

afterEach(() => {
  cleanup();
  setUrl('/');
});

describe('App URL deep-link state machine', () => {
  it('renders the Overview tab for a bare URL', () => {
    setUrl('/');
    render(<App />);
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('renders the atlas table with all published candidates via ?tab=atlas', () => {
    setUrl('/?tab=atlas');
    render(<App />);
    const rows = document.querySelectorAll('table tbody tr');
    expect(rows.length).toBe(CANDIDATES.length);
  });

  it('survives a garbage ?site= value (no crash, default site)', () => {
    setUrl('/?site=GARBAGE');
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('opens the candidate drawer via ?candidate=', () => {
    const target = CANDIDATES.find((c) => c.id === 'CAND-MARIUS-001')!;
    setUrl(`/?tab=atlas&candidate=${target.id}`);
    render(<App />);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain(target.id);
  });

  it('popstate to a bare URL resets the tab to overview', () => {
    setUrl('/?tab=atlas');
    render(<App />);
    setUrl('/');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    );
  });

  it('popstate resets a garbage site to the default dossier', () => {
    setUrl('/?site=MARIUS');
    render(<App />);
    setUrl('/?site=NOT_A_SITE');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(document.body.textContent).toContain('TRANQPIT1');
  });

  it('seeds the calculator from ?m/&c/&b and shows both scores with ?src=', () => {
    setUrl('/?tab=fusion&m=1.1&c=2.5&b=-12&src=CAND-MARIUS-001');
    render(<App />);
    const text = document.body.textContent ?? '';
    expect(text).toContain('1.10');
    expect(text).toContain('2.50');
    expect(text).toContain('SEEDED: CAND-MARIUS-001');
    expect(text).toContain('Published (authored):');
    expect(text).toContain('Fusion model:');
  });

  it('survives garbage calculator params', () => {
    setUrl('/?tab=fusion&m=abc');
    expect(() => render(<App />)).not.toThrow();
  });
});

describe('a11y + interaction regression pins', () => {
  it('exposes a skip link to the main landmark', () => {
    setUrl('/');
    render(<App />);
    expect(document.querySelector('a[href="#main"]')).not.toBeNull();
    expect(document.querySelector('main#main')).not.toBeNull();
  });

  it('names the atlas search input (placeholder is not a label)', () => {
    setUrl('/?tab=atlas');
    render(<App />);
    expect(screen.getByPlaceholderText(/Search candidate/)).toHaveAttribute('aria-label');
  });

  it('opens the drawer from the Inspect button itself, not only via row bubbling', () => {
    setUrl('/?tab=atlas');
    render(<App />);
    const btn = screen.getAllByRole('button', { name: /Inspect/i })[0]!;
    fireEvent.click(btn);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('CAND-TRANQ-001');
  });

  it('names all three calculator sliders', () => {
    setUrl('/?tab=fusion');
    render(<App />);
    const sliders = [...document.querySelectorAll('[role="slider"]')];
    expect(sliders).toHaveLength(3);
    for (const s of sliders) {
      expect(s.getAttribute('aria-label')).toBeTruthy();
    }
  });

  it('gives the WP0.5 figure intrinsic dimensions (CLS guard)', () => {
    setUrl('/?tab=gates');
    render(<App />);
    const img = document.querySelector('img[src*="deflection_4panel"]');
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute('width', '2079');
    expect(img).toHaveAttribute('height', '1499');
  });

  it('keeps table header cells in native table-cell layout (no display:flex utilities)', () => {
    setUrl('/?tab=atlas');
    render(<App />);
    const ths = [...document.querySelectorAll('table thead th')];
    expect(ths.length).toBeGreaterThan(0);
    for (const th of ths) {
      // collar-ribbon sets display:flex, which pulls <th> out of table-cell
      // layout and stacks the header row vertically in Chromium.
      expect(th.className).not.toContain('collar-ribbon');
    }
  });
});
