import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import type { TabType } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { OverviewTab } from './components/tabs/OverviewTab';
import { AtlasTab } from './components/tabs/AtlasTab';
import { EvidenceTab } from './components/tabs/EvidenceTab';
import { GatesTab } from './components/tabs/GatesTab';
import { KnowledgeTab } from './components/tabs/KnowledgeTab';
import { CANDIDATES } from './data/candidates';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [atlasSiteFilter, setAtlasSiteFilter] = useState<string>('ALL');

  const handleNavigateToAtlas = (siteId?: string) => {
    if (siteId) {
      setAtlasSiteFilter(siteId);
    }
    setActiveTab('atlas');
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Global Mission Navigation & Telemetry */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        candidateCount={CANDIDATES.length}
      />

      {/* Main Tab Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab onNavigateToAtlas={handleNavigateToAtlas} />
        )}

        {activeTab === 'atlas' && (
          <AtlasTab initialSiteFilter={atlasSiteFilter} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceTab />
        )}

        {activeTab === 'gates' && (
          <GatesTab />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeTab />
        )}
      </main>

      {/* Observational Provenance & Citations */}
      <Footer />

    </div>
  );
};

export default App;
