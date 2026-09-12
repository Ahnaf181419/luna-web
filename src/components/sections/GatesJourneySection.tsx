import React, { useState } from 'react';
import { CheckCircle2, Clock, CircleDollarSign, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GATES, BUDGET_LEDGER, type GateCriterion } from '@/lib/lunarvoid-data';

const VERDICT_TONE: Record<GateCriterion['verdict'], string> = {
  PASS: 'border-success/50 bg-success/15 text-success',
  PARTIAL: 'border-warning/40 bg-warning/10 text-warning',
  DEMONSTRATION: 'border-accent/40 bg-accent/10 text-accent',
  DEFERRED: 'border-border bg-muted text-muted-foreground',
  PENDING: 'border-border bg-muted text-muted-foreground',
};

const JOURNEY = [
  {
    phase: 'Sessions 01–06 · Passed',
    title: 'Gate G0′ scoping',
    body: 'Prior-art matrix, dataset licensing audit (NASA/ISRO/JAXA), and initial Tier-0 workstation setup.',
    tone: 'border-success/40',
    label: 'text-success',
  },
  {
    phase: 'Sessions 07–14 · Passed',
    title: 'Gate G1 pipeline',
    body: 'USGS ISIS3 ingestion, Ames Stereo Pipeline reproduction at Mare Tranquillitatis, and Decision D1.',
    tone: 'border-success/40',
    label: 'text-success',
  },
  {
    phase: 'Sessions 15–24 · Active',
    title: 'Gate G2 candidate scope',
    body: '21 DTM targets mapped, 257 candidate features cataloged, and false-positive bounds calibrated.',
    tone: 'border-primary/50',
    label: 'text-primary',
  },
  {
    phase: 'Planned WP1',
    title: 'Gate G3 manuscript',
    body: 'Peer-reviewed journal publication, Zenodo artifact archiving, and open code release.',
    tone: 'border-border opacity-60',
    label: 'text-muted-foreground',
  },
];

export const GatesJourneySection: React.FC = () => {
  const [expandedGate, setExpandedGate] = useState<string>('G2');

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-foreground">Gates & budget ledger</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Nothing advances without a gate review, and no gate opens spend it has not been
          approved for. LUNARVOID progresses strictly across verifiable milestone gates
          with numerical pass criteria, explicit decision records, and complete budget
          transparency.
        </p>
      </div>

      {/* 24-session roadmap */}
      <div className="panel space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h3 className="font-mono text-sm font-semibold text-foreground">
              The 24-session autonomous research odyssey
            </h3>
          </div>
          <Badge
            variant="outline"
            className="border-success/50 bg-success/15 font-mono text-[10px] tracking-widest text-success"
          >
            Active session: 24 (Gate G2 review)
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-4">
          {JOURNEY.map((j) => (
            <div key={j.title} className={`rounded-md border border-border bg-surface/60 p-4 ${j.tone}`}>
              <div className={`text-[10px] font-bold ${j.label}`}>{j.phase}</div>
              <div className="mt-1 text-sm font-bold text-foreground">{j.title}</div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{j.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone gates accordion */}
      <div className="space-y-4">
        <p className="label-mono">Verifiable gate criteria matrices</p>

        {GATES.map((gate) => {
          const isExpanded = expandedGate === gate.id;
          const isDraft = gate.status === 'DRAFT-FOR-REVIEW';

          return (
            <div
              key={gate.id}
              className={`panel overflow-hidden ${isDraft ? 'border-primary/40' : ''}`}
            >
              <div
                onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
                className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-surface/40"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-md border ${
                      gate.status === 'PASSED'
                        ? 'border-success/50 bg-success/15 text-success'
                        : 'border-primary/50 bg-primary/15 text-primary'
                    }`}
                  >
                    {gate.status === 'PASSED' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-mono text-sm font-semibold text-foreground">
                        {gate.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tracking-widest ${
                          gate.status === 'PASSED'
                            ? 'border-success/50 bg-success/15 text-success'
                            : 'border-warning/50 bg-warning/15 text-warning'
                        }`}
                      >
                        {gate.status}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Spend: ${gate.spend}.00 ·{' '}
                      {gate.sessionCompleted
                        ? `Passed in session ${gate.sessionCompleted}`
                        : 'Active working milestone'}
                    </p>
                  </div>
                </div>

                <div className="text-muted-foreground">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-4 border-t border-border bg-background/40 px-5 pb-5 pt-4">
                  <p className="text-xs leading-relaxed text-foreground/80">{gate.summary}</p>

                  <div className="space-y-2">
                    <p className="label-mono">Criteria satisfaction verdict matrix</p>
                    <div className="grid grid-cols-1 gap-3 font-mono text-xs md:grid-cols-2">
                      {gate.criteria.map((c) => (
                        <div
                          key={c.id}
                          className="space-y-1.5 rounded-md border border-border bg-surface/60 p-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-foreground">{c.name}</span>
                            <Badge
                              variant="outline"
                              className={`shrink-0 font-mono text-[10px] tracking-widest ${VERDICT_TONE[c.verdict]}`}
                            >
                              {c.verdict}
                            </Badge>
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">
                            {c.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Frugal science compute ledger */}
      <div className="panel space-y-6 p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="label-mono flex items-center gap-2 text-success">
              <CircleDollarSign className="h-4 w-4" />
              <span>Frugal science compute ledger</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Compute infrastructure & zero cloud waste
            </h3>
            <p className="font-mono text-xs text-muted-foreground">
              Rigorous discipline: all 24 research sessions executed on local Tier-0
              hardware with zero cloud waste.
            </p>
          </div>

          <div className="shrink-0 rounded-md border border-border bg-surface/60 p-3.5 text-right font-mono">
            <span className="label-mono block">Total expenditure</span>
            <span className="text-2xl font-bold text-success">$0.00 USD</span>
            <span className="block text-[10px] text-muted-foreground">
              against $800 lifetime ceiling
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-3">
          {BUDGET_LEDGER.map((b) => (
            <div key={b.tier} className="space-y-2 rounded-md border border-border bg-surface/60 p-5">
              <div className="text-[11px] text-muted-foreground">{b.tier}</div>
              <div className="text-2xl font-bold text-foreground">
                ${b.spent}.00{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  / ${b.allocation}.00
                </span>
              </div>
              <div className="text-[10px] font-bold text-primary">{b.status}</div>
              <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                {b.description}
              </p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>$0.00 drawn</span>
            <span>$800.00 ceiling</span>
          </div>
          <Progress value={0} className="mt-2 h-2" />
        </div>
      </div>
    </section>
  );
};
