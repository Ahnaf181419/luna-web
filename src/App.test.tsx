import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { CANDIDATES } from '@/lib/lunarvoid-data'

const setUrl = (url: string) => {
  window.history.replaceState({}, '', url)
}

afterEach(() => {
  cleanup()
  setUrl('/')
})

describe('App URL deep-link state machine', () => {
  it('renders the Overview tab for a bare URL', () => {
    setUrl('/')
    render(<App />)
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    )
  })

  it('renders the atlas table with all published candidates via ?tab=atlas', () => {
    setUrl('/?tab=atlas')
    render(<App />)
    const rows = document.querySelectorAll('table tbody tr')
    expect(rows.length).toBe(CANDIDATES.length)
  })

  it('survives a garbage ?site= value (no crash, default site)', () => {
    setUrl('/?site=GARBAGE')
    expect(() => render(<App />)).not.toThrow()
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    )
  })

  it('opens the candidate drawer via ?candidate=', () => {
    const target = CANDIDATES.find((c) => c.id === 'CAND-MARIUS-001')!
    setUrl(`/?tab=atlas&candidate=${target.id}`)
    render(<App />)
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain(target.id)
  })

  it('popstate to a bare URL resets the tab to overview', () => {
    setUrl('/?tab=atlas')
    render(<App />)
    setUrl('/')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByRole('tab', { name: /Overview & 3D Globe/ })).toHaveAttribute(
      'data-state',
      'active',
    )
  })

  it('popstate resets a garbage site to the default dossier', () => {
    setUrl('/?site=MARIUS')
    render(<App />)
    setUrl('/?site=NOT_A_SITE')
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(document.body.textContent).toContain('TRANQPIT1')
  })

  it('seeds the calculator from ?m/&c/&b and shows both scores with ?src=', () => {
    setUrl('/?tab=fusion&m=1.1&c=2.5&b=-12&src=CAND-MARIUS-001')
    render(<App />)
    const text = document.body.textContent ?? ''
    expect(text).toContain('1.10')
    expect(text).toContain('2.50')
    expect(text).toContain('SEEDED: CAND-MARIUS-001')
    expect(text).toContain('Published (authored):')
    expect(text).toContain('Fusion model:')
  })

  it('survives garbage calculator params', () => {
    setUrl('/?tab=fusion&m=abc')
    expect(() => render(<App />)).not.toThrow()
  })
})
