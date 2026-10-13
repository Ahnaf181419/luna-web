import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommandPalette } from './CommandPalette';
import { PROGRAM_RECORD } from '@/lib/lunarvoid-data';

describe('CommandPalette copy currency', () => {
  it('gates subtitle cites the frozen session count, never a stale literal', () => {
    render(
      <CommandPalette
        isOpen
        onClose={() => {}}
        onSelectSite={() => {}}
        onSelectCandidate={() => {}}
        onNavigate={() => {}}
      />,
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain(`${PROGRAM_RECORD.sessionsRun}-session`);
    expect(dialog?.textContent).not.toContain('58-session');
  });
});
