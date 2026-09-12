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
  SITES,
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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Candidate atlas & registry</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {CATALOG_SIZE} indexed candidates; {CANDIDATES.length} published in this public
            working set.
          </p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] tracking-widest">
          {filtered.length} SHOWN
        </Badge>
      </div>

      {/* Search & filter panel */}
      <div className="panel space-y-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search candidate ID, site name, or feature type…"
              className="pl-9 font-mono text-sm"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['All', 'Primary Pits', 'Collapse Sags', 'Inspection Backlog'].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['ALL', ...SITES.map((s) => s.id)] as const).map((id) => (
            <button
              key={id}
              onClick={() => onSetSiteFilter(id)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-widest transition-colors ${
                siteFilter === id
                  ? 'border-primary/60 bg-primary/15 text-primary'
                  : 'border-border bg-surface/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Data table */}
      <div className="panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[
                'Candidate ID',
                'Target site',
                'Coordinates',
                'Morphology',
                'Likelihood',
                'Status',
                '',
              ].map((h) => (
                <TableHead key={h} className="label-mono">
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
                className="cursor-pointer"
              >
                <TableCell className="font-mono text-xs text-primary">{c.id}</TableCell>
                <TableCell className="font-mono text-xs">{c.site}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {c.coordLabel}
                </TableCell>
                <TableCell className="text-sm">{c.morphology}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{c.score.toFixed(2)}</span>
                    <Progress value={c.score * 100} className="h-1 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] tracking-widest ${STATUS_TONE[c.status]}`}
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" className="font-mono text-[11px]">
                    <Binoculars className="mr-1 h-3.5 w-3.5" />
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
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
