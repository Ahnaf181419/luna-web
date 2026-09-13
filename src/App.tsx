import React, { useEffect, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { EpistemicThesis } from "./components/sections/EpistemicThesis";
import { ObservatorySection } from "./components/sections/ObservatorySection";
import { AtlasSection } from "./components/sections/AtlasSection";
import { CutawaySection } from "./components/sections/CutawaySection";
import { TheorySection } from "./components/sections/TheorySection";
import { GatesJourneySection } from "./components/sections/GatesJourneySection";
import { KnowledgePreviewSection } from "./components/sections/KnowledgePreviewSection";
import { KnowledgeVaultSection } from "./components/sections/KnowledgeVaultSection";
import { CandidateDrawer } from "./components/lunar/CandidateDrawer";
import { CommandPalette } from "./components/instruments/CommandPalette";
import { CANDIDATES, isSiteId, type Candidate, type SiteId } from "./lib/lunarvoid-data";

export type TabId = "overview" | "atlas" | "fusion" | "gates" | "knowledge";

export const App: React.FC = () => {
  // Read initial state from URL parameters
  const [tab, setTab] = useState<TabId>(() => {
    if (typeof window === "undefined") return "overview";
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab") as TabId | null;
    if (t && ["overview", "atlas", "fusion", "gates", "knowledge"].includes(t)) {
      return t;
    }
    return "overview";
  });

  const [activeSite, setActiveSite] = useState<SiteId | null>(() => {
    if (typeof window === "undefined") return "TRANQPIT1";
    const params = new URLSearchParams(window.location.search);
    const s = params.get("site");
    return isSiteId(s) ? s : "TRANQPIT1";
  });

  const [selected, setSelected] = useState<Candidate | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const candId = params.get("candidate");
    if (candId) {
      return CANDIDATES.find((c) => c.id === candId) ?? null;
    }
    return null;
  });

  const [siteFilter, setSiteFilter] = useState<"ALL" | SiteId>(() => {
    if (typeof window === "undefined") return "ALL";
    const params = new URLSearchParams(window.location.search);
    const s = params.get("site");
    return isSiteId(s) ? s : "ALL";
  });

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync state changes back to URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== "overview") params.set("tab", tab);
    if (activeSite && activeSite !== "TRANQPIT1") params.set("site", activeSite);
    if (selected) params.set("candidate", selected.id);

    const newQuery = params.toString();
    const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [tab, activeSite, selected]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab") as TabId | null;
      if (t && ["overview", "atlas", "fusion", "gates", "knowledge"].includes(t)) {
        setTab(t);
      } else {
        setTab("overview");
      }
      const s = params.get("site");
      if (isSiteId(s)) {
        setActiveSite(s);
        setSiteFilter(s);
      } else {
        setActiveSite("TRANQPIT1");
        setSiteFilter("ALL");
      }
      const candId = params.get("candidate");
      if (candId) {
        const found = CANDIDATES.find((c) => c.id === candId);
        if (found) setSelected(found);
      } else {
        setSelected(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function focusSite(id: SiteId) {
    setActiveSite(id);
    const first = CANDIDATES.find((c) => c.site === id);
    if (first) setSelected(first);
  }

  function inspectSiteInAtlas(id: SiteId) {
    setSiteFilter(id);
    setActiveSite(id);
    setTab("atlas");
  }

  function inspectCandidateInAtlas(c: Candidate) {
    setSelected(c);
    setActiveSite(c.site);
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
          <TheorySection />
        </TabsContent>

        {/* -------------------------------- gates ------------------------------ */}
        <TabsContent value="gates" className="space-y-8">
          <GatesJourneySection />
          <KnowledgePreviewSection onOpenKnowledge={() => setTab("knowledge")} />
        </TabsContent>

        {/* ------------------------------ knowledge ---------------------------- */}
        <TabsContent value="knowledge" className="space-y-8">
          <KnowledgeVaultSection />
        </TabsContent>
      </main>

      <CandidateDrawer
        candidate={selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />

      <Footer />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectSite={(siteId) => {
          setSiteFilter(siteId);
          if (isSiteId(siteId)) setActiveSite(siteId);
          setTab("atlas");
        }}
        onSelectCandidate={(c) => inspectCandidateInAtlas(c)}
        onNavigate={(t) => setTab(t)}
      />
    </Tabs>
  );
};

export default App;
