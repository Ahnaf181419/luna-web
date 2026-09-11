import React, { useState, useEffect, useCallback } from 'react';
import { LunarGlobe3D } from './components/3d/LunarGlobe3D';
import { FloatingToolbar } from './components/overlay/FloatingToolbar';
import { LeftDrawer } from './components/overlay/LeftDrawer';
import { RightDrawer } from './components/overlay/RightDrawer';
import { StatusBar } from './components/overlay/StatusBar';
import { CommandPalette } from './components/instruments/CommandPalette';
import { CANDIDATES } from './data/candidates';
import { SITES } from './data/sites';
import type { SiteDossier } from './types';

export type PanelMode = 'site' | 'candidate' | 'evidence' | 'gates' | 'knowledge';

export const App: React.FC = () => {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelMode>('site');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [hoveredSite, setHoveredSite] = useState<SiteDossier | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        } else if (rightDrawerOpen) {
          setRightDrawerOpen(false);
        } else if (leftDrawerOpen) {
          setLeftDrawerOpen(false);
        }
        return;
      }
      if (e.key === '[' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        setLeftDrawerOpen((prev) => !prev);
      }
      if (e.key === ']' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        setRightDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, rightDrawerOpen, leftDrawerOpen]);

  // Globe site selection → open right drawer with site panel
  const handleGlobeSiteSelect = useCallback((site: SiteDossier) => {
    setSelectedSiteId(site.id);
    setActivePanel('site');
    setRightDrawerOpen(true);
  }, []);

  // Left drawer site selection
  const handleSiteSelect = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setActivePanel('site');
    setRightDrawerOpen(true);
  }, []);

  // Left drawer candidate selection
  const handleCandidateSelect = useCallback((candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setActivePanel('candidate');
    setRightDrawerOpen(true);
  }, []);

  // Toolbar panel switch
  const handleSetPanel = useCallback((panel: string) => {
    setActivePanel(panel as PanelMode);
    setRightDrawerOpen(true);
  }, []);

  // Command palette navigation
  const handleCommandSelectTab = useCallback((tab: string) => {
    const panelMap: Record<string, PanelMode> = {
      overview: 'site',
      atlas: 'candidate',
      evidence: 'evidence',
      gates: 'gates',
      knowledge: 'knowledge',
    };
    setActivePanel(panelMap[tab] || 'site');
    if (tab === 'atlas') {
      setLeftDrawerOpen(true);
    } else {
      setRightDrawerOpen(true);
    }
  }, []);

  const handleCommandSelectSite = useCallback((siteId: string) => {
    setSelectedSiteId(siteId);
    setActivePanel('site');
    setRightDrawerOpen(true);
  }, []);

  const selectedSiteName = selectedSiteId
    ? SITES.find((s) => s.id === selectedSiteId)?.name ?? null
    : hoveredSite?.name ?? null;

  return (
    <div className="relative w-full h-full">
      {/* Full-viewport 3D Globe (z-0) */}
      <LunarGlobe3D
        selectedSiteId={selectedSiteId}
        onSelectSite={handleGlobeSiteSelect}
        onHoverSite={setHoveredSite}
        onCursorCoords={setCursorCoords}
      />

      {/* Floating Toolbar (z-30) */}
      <FloatingToolbar
        activePanel={activePanel}
        onSetPanel={handleSetPanel}
        onToggleLeftDrawer={() => setLeftDrawerOpen((prev) => !prev)}
        onToggleRightDrawer={() => setRightDrawerOpen((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Left Drawer: Sites & Candidates (z-20) */}
      <LeftDrawer
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        selectedSiteId={selectedSiteId}
        onSelectSite={handleSiteSelect}
        selectedCandidateId={selectedCandidateId}
        onSelectCandidate={handleCandidateSelect}
      />

      {/* Right Drawer: Detail Panels (z-20) */}
      <RightDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        activePanel={activePanel}
        selectedSiteId={selectedSiteId}
        selectedCandidateId={selectedCandidateId}
      />

      {/* Hover Tooltip */}
      {hoveredSite && (
        <div className="fixed z-10 pointer-events-none" style={{ top: '52px', left: '50%', transform: 'translateX(-50%)' }}>
          <div className="bg-panel-bg/95 backdrop-blur-sm border border-panel-border px-3 py-1.5 rounded text-xs font-mono">
            <span className="text-blue-400 font-bold">{hoveredSite.name}</span>
            <span className="text-zinc-500 ml-2">
              {hoveredSite.lat.toFixed(2)}°, {hoveredSite.lon.toFixed(2)}°
            </span>
            {hoveredSite.primaryAnchor && (
              <span className="text-teal-400 ml-2 text-[10px]">ANCHOR</span>
            )}
          </div>
        </div>
      )}

      {/* Status Bar (z-30) */}
      <StatusBar
        selectedSiteName={selectedSiteName}
        cursorCoords={cursorCoords}
        candidateCount={CANDIDATES.length}
      />

      {/* Command Palette Modal (z-50) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleCommandSelectTab}
        onSelectSite={handleCommandSelectSite}
      />
    </div>
  );
};

export default App;
