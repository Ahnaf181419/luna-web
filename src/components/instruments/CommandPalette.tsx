import React from 'react';
import { Compass, Database, ShieldCheck, BookOpen } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  CANDIDATES,
  CATALOG_SIZE,
  GATES,
  SITES,
  type Candidate,
  type SiteId,
} from '@/lib/lunarvoid-data';
import type { TabId } from '@/App';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSite: (siteId: 'ALL' | SiteId) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onNavigate: (tab: TabId) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSite,
  onSelectCandidate,
  onNavigate,
}) => {
  const TABS: Array<{ value: TabId; title: string; subtitle: string }> = [
    {
      value: 'overview',
      title: 'Overview & 3D Globe',
      subtitle: 'Manifesto, epistemic thesis, interactive lunar globe & dossiers',
    },
    {
      value: 'atlas',
      title: 'Candidate Atlas',
      subtitle: `${CATALOG_SIZE}-candidate registry with search, filters & inspection drawer`,
    },
    {
      value: 'fusion',
      title: '3D Tube Cutaway & Fusion',
      subtitle: 'Cross-section model, four evidence layers & live calculator',
    },
    {
      value: 'gates',
      title: 'Gates & Ledger',
      subtitle: 'Gate G0′/G1/G2 criteria, 24-session journey & budget',
    },
    {
      value: 'knowledge',
      title: 'Knowledge',
      subtitle: 'Obsidian vault — 5 MOCs, 107 atomic notes',
    },
  ];

  return (
    <CommandDialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <CommandInput placeholder="Search tabs, target sites, candidates, or gates…" />
      <CommandList>
        <CommandEmpty>No matching lunar records found.</CommandEmpty>

        <CommandGroup heading="Tabs">
          {TABS.map((t) => (
            <CommandItem
              key={t.value}
              onSelect={() => {
                onNavigate(t.value);
                onClose();
              }}
              className="font-mono text-xs"
            >
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{t.title}</span>
              <span className="ml-2 hidden truncate text-[10px] text-muted-foreground sm:inline">
                {t.subtitle}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Target sites">
          {SITES.map((s) => (
            <CommandItem
              key={s.id}
              value={`site ${s.id} ${s.name}`}
              onSelect={() => {
                onSelectSite(s.id);
                onClose();
              }}
              className="font-mono text-xs"
            >
              <Compass className="mr-2 h-4 w-4 text-accent" />
              <span className="font-semibold text-foreground">{s.name}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">
                {s.id} · {s.coordLabel} · {s.candidateCount} candidates
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Candidates">
          {CANDIDATES.map((c) => (
            <CommandItem
              key={c.id}
              value={`candidate ${c.id} ${c.morphology} ${c.site}`}
              onSelect={() => {
                onSelectCandidate(c);
                onClose();
              }}
              className="font-mono text-xs"
            >
              <Database className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{c.id}</span>
              <span className="ml-2 truncate text-[10px] text-muted-foreground">
                {c.morphology} · score {c.score.toFixed(2)} · {c.status}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Gates">
          {GATES.map((g) => (
            <CommandItem
              key={g.id}
              value={`gate ${g.id} ${g.title}`}
              onSelect={() => {
                onNavigate('gates');
                onClose();
              }}
              className="font-mono text-xs"
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-success" />
              <span className="truncate font-semibold text-foreground">{g.title}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">
                {g.status} · ${g.spend}.00
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
