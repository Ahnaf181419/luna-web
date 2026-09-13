import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { EpistemicThesis } from '@/components/sections/EpistemicThesis';
import { ObservatorySection } from '@/components/sections/ObservatorySection';
import { AtlasSection } from '@/components/sections/AtlasSection';
import { CutawaySection } from '@/components/sections/CutawaySection';
import { TheorySection } from '@/components/sections/TheorySection';
import { GatesJourneySection } from '@/components/sections/GatesJourneySection';
import { KnowledgePreviewSection } from '@/components/sections/KnowledgePreviewSection';
import { KnowledgeVaultSection } from '@/components/sections/KnowledgeVaultSection';
import { CandidateDrawer } from '@/components/lunar/CandidateDrawer';
import type { CalcSeed } from '@/components/lunar/LikelihoodCalculator';
import { CommandPalette } from '@/components/instruments/CommandPalette';
import { CANDIDATES, isSiteId, type Candidate, type SiteId } from '@/lib/lunarvoid-data';
import { downloadWorkingSet } from '@/lib/registry-export';

export type TabId = 'overview' | 'atlas' | 'fusion' | 'gates' | 'knowledge';

export const App: React.FC = () => {
  // Read initial state from URL parameters
  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === 'undefined') return 'overview';
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab') as TabId | null;
    if (t && ['overview', 'atlas', 'fusion', 'gates', 'knowledge'].includes(t)) {
      return t;
    }
    return 'overview';
  });

  const [activeSite, setActiveSite] = useState<SiteId | null>(() => {
    if (typeof window === 'undefined') return 'TRANQPIT1';
    const params = new URLSearchParams(window.location.search);
    const s = params.get('site');
    return isSiteId(s) ? s : 'TRANQPIT1';
  });

  const [selected, setSelected] = useState<Candidate | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const candId = params.get('candidate');
    if (candId) {
      return CANDIDATES.find((c) => c.id === candId) ?? null;
    }
    return null;
  });

  const [siteFilter, setSiteFilter] = useState<'ALL' | SiteId>(() => {
    if (typeof window === 'undefined') return 'ALL';
    const params = new URLSearchParams(window.location.search);
    const s = params.get('site');
    return isSiteId(s) ? s : 'ALL';
  });

  const [calcSeed, setCalcSeed] = useState<CalcSeed | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const mRaw = params.get('m');
    const cRaw = params.get('c');
    const bRaw = params.get('b');
    if (mRaw === null || cRaw === null || bRaw === null) return null;
    const m = Number(mRaw);
    const c = Number(cRaw);
    const b = Number(bRaw);
    if (![m, c, b].every(Number.isFinite)) return null;
    const src = params.get('src');
    const fromCandidate = src ? CANDIDATES.find((x) => x.id === src) : undefined;
    return {
      morphRatio: m,
      radarCpr: c,
      bouguer: b,
      label: fromCandidate?.id,
      publishedScore: fromCandidate?.score,
      morphIsDefault: fromCandidate !== undefined,
    };
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync state changes back to URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== 'overview') params.set('tab', tab);
    if (activeSite && activeSite !== 'TRANQPIT1') params.set('site', activeSite);
    if (selected) params.set('candidate', selected.id);
    if (calcSeed) {
      params.set('m', String(calcSeed.morphRatio));
      params.set('c', String(calcSeed.radarCpr));
      params.set('b', String(calcSeed.bouguer));
      if (calcSeed.label) params.set('src', calcSeed.label);
    }

    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [tab, activeSite, selected, calcSeed]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab') as TabId | null;
      if (t && ['overview', 'atlas', 'fusion', 'gates', 'knowledge'].includes(t)) {
        setTab(t);
      } else {
        setTab('overview');
      }
      const s = params.get('site');
      if (isSiteId(s)) {
        setActiveSite(s);
        setSiteFilter(s);
      } else {
        setActiveSite('TRANQPIT1');
        setSiteFilter('ALL');
      }
      const candId = params.get('candidate');
      if (candId) {
        const found = CANDIDATES.find((c) => c.id === candId);
        if (found) setSelected(found);
      } else {
        setSelected(null);
      }
      const mRaw = params.get('m');
      const cRaw = params.get('c');
      const bRaw = params.get('b');
      const src = params.get('src');
      const fromCandidate = src ? CANDIDATES.find((x) => x.id === src) : undefined;
      if (mRaw !== null && cRaw !== null && bRaw !== null) {
        const m = Number(mRaw);
        const c = Number(cRaw);
        const b = Number(bRaw);
        setCalcSeed(
          [m, c, b].every(Number.isFinite)
            ? {
                morphRatio: m,
                radarCpr: c,
                bouguer: b,
                label: fromCandidate?.id,
                publishedScore: fromCandidate?.score,
                morphIsDefault: fromCandidate !== undefined,
              }
            : null,
        );
      } else {
        setCalcSeed(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function focusSite(id: SiteId) {
    setActiveSite(id);
    const first = CANDIDATES.find((c) => c.site === id);
    if (first) setSelected(first);
  }

  function inspectSiteInAtlas(id: SiteId) {
    setSiteFilter(id);
    setActiveSite(id);
    setTab('atlas');
  }

  function inspectCandidateInAtlas(c: Candidate) {
    setSelected(c);
    setActiveSite(c.site);
  }

  function seedCalculatorFromCandidate(c: Candidate) {
    setSelected(null);
    setTab('fusion');
    setCalcSeed({
      morphRatio: 0.85,
      radarCpr: c.cprRatio,
      bouguer: c.bouguerMGal,
      label: c.id,
      publishedScore: c.score,
      morphIsDefault: true,
    });
  }

  async function copyScenarioLink(m: number, c: number, b: number) {
    const url = `${window.location.origin}${window.location.pathname}?tab=fusion&m=${m}&c=${c}&b=${b}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(url);
    } catch {
      // Non-fatal: the URL is also reflected in the address bar via the sync effect.
    }
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)} className="min-h-screen gap-0">
      {/* ---------------------------- header / status --------------------------- */}
      <Header onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* ------------------------------ overview ----------------------------- */}
        <TabsContent value="overview" className="space-y-10">
          <HeroSection />
          <EpistemicThesis />
          <ObservatorySection
            activeSite={activeSite}
            onSelectSite={focusSite}
            onInspectInAtlas={inspectSiteInAtlas}
          />
        </TabsContent>

        {/* -------------------------------- atlas ------------------------------ */}
        <TabsContent value="atlas" className="space-y-6">
          <AtlasSection
            siteFilter={siteFilter}
            onSetSiteFilter={setSiteFilter}
            onSelectCandidate={inspectCandidateInAtlas}
          />
        </TabsContent>

        {/* -------------------------------- fusion ----------------------------- */}
        <TabsContent value="fusion" className="space-y-8">
          <CutawaySection />
          <TheorySection
            calcSeed={calcSeed ?? undefined}
            onCalcReset={() => setCalcSeed(null)}
            onCopyScenario={copyScenarioLink}
          />
        </TabsContent>

        {/* -------------------------------- gates ------------------------------ */}
        <TabsContent value="gates" className="space-y-8">
          <GatesJourneySection />
          <KnowledgePreviewSection onOpenKnowledge={() => setTab('knowledge')} />
        </TabsContent>

        {/* ------------------------------ knowledge ---------------------------- */}
        <TabsContent value="knowledge" className="space-y-8">
          <KnowledgeVaultSection />
        </TabsContent>
      </main>

      <CandidateDrawer
        candidate={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        onOpenInCalculator={seedCalculatorFromCandidate}
      />

      <Footer />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSite={(siteId) => {
          setSiteFilter(siteId);
          if (isSiteId(siteId)) setActiveSite(siteId);
          setTab('atlas');
        }}
        onSelectCandidate={(c) => inspectCandidateInAtlas(c)}
        onNavigate={(t) => setTab(t)}
        onDownloadRegistry={() => downloadWorkingSet('csv')}
      />
    </Tabs>
  );
};
