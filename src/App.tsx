import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { EpistemicThesis } from './components/sections/EpistemicThesis';
import { TheorySection } from './components/sections/TheorySection';
import { CutawaySection } from './components/sections/CutawaySection';
import { ObservatorySection } from './components/sections/ObservatorySection';
import { AtlasSection } from './components/sections/AtlasSection';
import { GatesJourneySection } from './components/sections/GatesJourneySection';
import { KnowledgeVaultSection } from './components/sections/KnowledgeVaultSection';
import { CommandPalette } from './components/instruments/CommandPalette';

export const App: React.FC = () => {
  const [atlasSiteFilter, setAtlasSiteFilter] = useState<string>('ALL');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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

  const handleFilterAtlasBySite = (siteId: string) => {
    setAtlasSiteFilter(siteId);
    const el = document.querySelector('#atlas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-space-950 text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Floating Glass Navigation */}
      <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* Main Narrative Flow */}
      <main>
        {/* Hero Section: Epistemic Manifesto & Stats */}
        <HeroSection />

        {/* Section 01: Epistemic Thesis & Sensationalism vs Calibration */}
        <EpistemicThesis />

        {/* Section 02: Multi-Evidence Bayesian Formulation & Live Calculator */}
        <TheorySection />

        {/* Section 03: 3D Geological Conduit Cutaway Block Model */}
        <CutawaySection />

        {/* Section 04: Interactive 3D Lunar Target Observatory & Dossier */}
        <ObservatorySection onFilterAtlasBySite={handleFilterAtlasBySite} />

        {/* Section 05: 257 Subsurface Candidate Feature Atlas */}
        <AtlasSection
          siteFilter={atlasSiteFilter}
          onSetSiteFilter={setAtlasSiteFilter}
        />

        {/* Section 06: 24-Session Research Journey, Milestone Gates & Compute Ledger */}
        <GatesJourneySection />

        {/* Section 07: Obsidian Knowledge Graph Vault & MOCs */}
        <KnowledgeVaultSection />
      </main>

      {/* Academic Citations & Provenance Footer */}
      <Footer />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSite={(siteId) => {
          setAtlasSiteFilter(siteId);
        }}
      />
    </div>
  );
};

export default App;
