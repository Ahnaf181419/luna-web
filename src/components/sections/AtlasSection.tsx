import { SitePills } from '@/components/instruments/SitePills';
import React, { useMemo, useState } from 'react';
import { Search, Binoculars } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CANDIDATES,
  CATALOG_SIZE,
  STATUS_TONE,
  siteById,
  type Candidate,
  type SiteId,
} from '@/lib/lunarvoid-data';

interface AtlasSectionProps {
  siteFilter: 'ALL' | SiteId;
  onSetSiteFilter: (siteId: 'ALL' | SiteId) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const AtlasSection: React.FC<AtlasSectionProps> = ({
  siteFilter,
  onSetSiteFilter,
  onSelectCandidate,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CANDIDATES.filter((c) => {
      if (siteFilter !== 'ALL' && c.site !== siteFilter) return false;
      if (category !== 'All' && c.category !== category) return false;
      if (!q) return true;
      return (
        c.id.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q) ||
        siteById(c.site).name.toLowerCase().includes(q) ||
        c.morphology.toLowerCase().includes(q)
      );
    });
  }, [query, category, siteFilter]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-3">
        <div>
          <span className="collar-ribbon text-[10px]">
            <span>CANDIDATE REGISTRY // STEREO BASELINE D1</span>
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
            Candidate Atlas & Morphometry Registry
          </h2>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            {CATALOG_SIZE} indexed candidates; {CANDIDATES.length} published in this public working set.
          </p>
        </div>
        <Badge variant="outline" className="rounded-[2px] font-mono text-[10px] tracking-widest border-primary/50 text-primary">
          {filtered.length} / {CANDIDATES.length} ACTIVE
        </Badge>
      </div>

      {/* Search & filter panel */}
      <div className="workbench-panel space-y-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidate ID, site name, or feature type…"
              className="pl-9 font-mono text-xs rounded-[2px]"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56 font-mono text-xs rounded-[2px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[2px] font-mono text-xs">
              {['All', 'Primary Pits', 'Collapse Sags', 'Inspection Backlog'].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SitePills
          label="FILTER TARGET:"
          labelClassName="collar-ribbon text-[9px] mr-1"
          selectedId={siteFilter}
          onSelect={onSetSiteFilter}
          includeAll
        />
      </div>

      {/* Data table */}
      <div className="workbench-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border/80">
              {[
                'Candidate ID',
                'Target site',
                'Coordinates',
                'Morphology',
                'Likelihood',
                'Status',
                '',
              ].map((h) => (
                <TableHead key={h} className="collar-ribbon text-[9px]">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                onClick={() => onSelectCandidate(c)}
                className="cursor-pointer transition-colors hover:bg-surface/50 border-b border-border/40"
              >
                <TableCell className="font-mono text-xs font-bold text-primary">{c.id}</TableCell>
                <TableCell className="font-mono text-xs">{c.site}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {c.coordLabel}
                </TableCell>
                <TableCell className="font-sans text-xs">{c.morphology}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">{c.score.toFixed(2)}</span>
                    <Progress value={c.score * 100} className="h-1 w-14 rounded-[2px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`rounded-[2px] font-mono text-[9px] tracking-widest uppercase ${STATUS_TONE[c.status]}`}
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="font-mono text-[10px] h-7 px-2">
                    <Binoculars className="mr-1 h-3 w-3" />
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center font-mono text-xs text-muted-foreground"
                >
                  No candidates match this query.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
