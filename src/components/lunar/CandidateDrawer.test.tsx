import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CandidateDrawer } from '@/components/lunar/CandidateDrawer'
import { CANDIDATES, STATUS_TONE, siteById } from '@/lib/lunarvoid-data'

afterEach(cleanup)

describe('CandidateDrawer data binding', () => {
  it('binds candidate, site, status tone, and both charts', () => {
    const candidate = CANDIDATES[0]!
    render(<CandidateDrawer candidate={candidate} onOpenChange={() => {}} />)

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain(candidate.id)
    expect(dialog?.textContent).toContain(siteById(candidate.site).name)
    expect(dialog?.innerHTML).toContain(STATUS_TONE[candidate.status])
    const svgs = dialog?.querySelectorAll('svg')
    expect(svgs?.length).toBeGreaterThanOrEqual(2)
  })

  it('renders no dialog when candidate is null', () => {
    render(<CandidateDrawer candidate={null} onOpenChange={() => {}} />)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('binds every published candidate without throwing', () => {
    for (const candidate of CANDIDATES) {
      cleanup()
      expect(() =>
        render(<CandidateDrawer candidate={candidate} onOpenChange={() => {}} />),
      ).not.toThrow()
    }
  })
})
