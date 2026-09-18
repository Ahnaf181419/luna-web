import React, { useState } from 'react';
import { CheckCircle2, CircleDollarSign, ChevronDown, GitBranch, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BUDGET_LEDGER, GATES, PROGRAM_RECORD, type GateCriterion } from '@/lib/lunarvoid-data';

const VERDICT_TONE: Record<GateCriterion['verdict'], string> = {
  PASS: 'border-success/50 bg-success/15 text-success',
  PARTIAL: 'border-warning/40 bg-warning/10 text-warning',
  DEMONSTRATION: 'border-accent/40 bg-accent/10 text-accent',
  DEFERRED: 'border-border bg-muted text-muted-foreground',
  'DEFERRED-DTM-GAP': 'border-warning/40 bg-warning/10 text-warning',
  'NOT MEASURED': 'border-border bg-muted text-muted-foreground',
};

const JOURNEY = [
  {
    phase: 'Gate G0′ · 2026-08-21 · Passed',
    title: 'Tier-0 baseline',
    body: 'Pit-recovery primitive (7/8), measured noise floors, confusion layers, and the first Z2 sag search — all at $0.',
    tone: 'border-success/40',
    label: 'text-success',
  },
  {
    phase: 'Gate G1 · 2026-08-22 · Passed',
    title: 'Calibration freeze',
    body: 'TRANQPIT1 recipe frozen and reproduced byte-identically; analog registration; per-DTM floors at N=10; Diviner thermal sampled.',
    tone: 'border-success/40',
    label: 'text-success',
  },
  {
    phase: 'Gate G2 · 2026-08-24 · Passed',
    title: 'N=7 → N=21 expansion',
    body: 'Eleven new sha-verified NAC DTMs; registry grown to 278 rows at terminal state; FP bound 3.74 [1.71, 7.10] per 10⁴ km².',
    tone: 'border-success/40',
    label: 'text-success',
  },
  {
    phase: 'Sessions 25–58 · Complete',
    title: 'Engineering terminal state',
    body: 'Registry tooling, sentinel hardening, verifier scripts, 124-test suite. Queue exhausted; remaining items are user-gated — see the repository.',
    tone: 'border-primary/50',
    label: 'text-primary',
  },
];

const FROZEN_STATS = [
  {
    label: 'NAC DTMs on disk',
    value: `${PROGRAM_RECORD.dtmsOnDisk} / ${PROGRAM_RECORD.goodTierPopulation}`,
    detail: 'Good-tier population; 24,063 km² searched',
  },
  {
    label: 'Registry (terminal partition)',
    value: `${PROGRAM_RECORD.registryRows} = ${PROGRAM_RECORD.registryActive} + ${PROGRAM_RECORD.registrySuperseded}`,
    detail: 'ACTIVE + SUPERSEDED rows; md5-frozen',
  },
  {
    label: 'Tier assignments',
    value: `A ${PROGRAM_RECORD.tierA} · B ${PROGRAM_RECORD.tierB} · C ${PROGRAM_RECORD.registryRows}`,
    detail: 'Every candidate is tier C — morphometry only',
  },
  {
    label: 'FP per 10⁴ km² (row-based)',
    value: `${PROGRAM_RECORD.fpRowRate.toFixed(2)} [${PROGRAM_RECORD.fpRowCi[0].toFixed(2)}, ${PROGRAM_RECORD.fpRowCi[1].toFixed(2)}]`,
    detail: 'Unique-feature: 2.08 [0.67, 4.85] · calibration-context, not survey',
  },
  {
    label: 'PU-learning baseline',
    value: `P ${PROGRAM_RECORD.puBaseline.precision.toFixed(2)} · R ${PROGRAM_RECORD.puBaseline.recall.toFixed(2)} · AUC ${PROGRAM_RECORD.puBaseline.auc.toFixed(3)}`,
    detail: 'v5 run B: F1 0.824 · AUC 0.930',
  },
  {
    label: 'Test suite',
    value: `${PROGRAM_RECORD.testsGreen} green`,
    detail: 'Smoke + E2E pins byte-identical through refactors',
  },
];

export const GatesJourneySection: React.FC = () => {
  const [expandedGate, setExpandedGate] = useState<string>('G2');

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="max-w-3xl border-b border-border/70 pb-3">
        <span className="collar-ribbon text-[10px]">
          <span>VERIFIABLE GOVERNANCE // NUMERICAL GATE CRITERIA</span>
        </span>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mt-1">
          Milestone Gates & Frugal Compute Ledger
        </h2>
        <p className="mt-2 font-sans text-xs leading-relaxed text-muted-foreground">
          Nothing advances without a formal gate review, and no gate opens spend it has not been
          approved for. LUNARVOID progresses strictly across verifiable milestone gates with
          numerical pass criteria, explicit decision records, and complete budget transparency.
        </p>
      </div>

      {/* Session roadmap */}
      <div className="workbench-panel space-y-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            <h3 className="font-mono text-sm font-semibold text-foreground">
              The {PROGRAM_RECORD.sessionsRun}-session autonomous research program
            </h3>
          </div>
          <Badge
            variant="outline"
            className="rounded-[2px] border-success/60 bg-success/15 font-mono text-[9px] tracking-widest text-success uppercase"
          >
            Session {PROGRAM_RECORD.sessionsRun} · G0′ / G1 / G2 Final-Pass
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 font-mono text-xs md:grid-cols-4">
          {JOURNEY.map((j) => (
            <div
              key={j.title}
              className={`rounded-[2px] border border-border/80 bg-surface/60 p-4 ${j.tone}`}
            >
              <div className={`text-[10px] font-bold ${j.label}`}>{j.phase}</div>
              <div className="mt-1 text-sm font-bold text-foreground">{j.title}</div>
              <p className="mt-1 font-sans text-[11px] leading-relaxed text-muted-foreground">
                {j.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Frozen program statistics */}
      <div className="panel space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="collar-ribbon text-[10px]">
              <span>FROZEN PROGRAM RECORD // {PROGRAM_RECORD.frozenAsOf.toUpperCase()}</span>
            </span>
            <h3 className="text-lg font-semibold text-foreground">Program statistics as shipped</h3>
            <p className="font-sans text-xs leading-relaxed text-muted-foreground">
              Byte-identically reproducible from the research repository. Every number cites a
              committed artifact — registry, gate reports, verifier evidence, budget ledger.
            </p>
          </div>
          <a
            href={PROGRAM_RECORD.repoUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor-magnet
            className="flex shrink-0 items-center gap-1.5 rounded-[2px] border border-border bg-surface/60 px-3 py-2 font-mono text-[10px] tracking-widest text-foreground transition-colors hover:border-primary/50 hover:text-primary btn-lift"
          >
            <GitBranch className="h-3.5 w-3.5" />
            SOURCE REPOSITORY
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3">
          {FROZEN_STATS.map((s) => (
            <div
              key={s.label}
              className="space-y-1 rounded-md border border-border bg-surface/60 p-4"
            >
              <span className="label-mono text-[9px]">{s.label}</span>
              <div className="numeric-readout text-sm font-bold text-foreground">{s.value}</div>
              <p className="font-sans text-[10px] leading-relaxed text-muted-foreground">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone gates accordion */}
      <div className="space-y-4">
        <span className="collar-ribbon text-[10px]">VERIFIABLE GATE CRITERIA MATRICES</span>

        {GATES.map((gate) => {
          const isExpanded = expandedGate === gate.id;

          return (
            <div key={gate.id} className="workbench-panel overflow-hidden">
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
                className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors hover:bg-surface/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-success/50 bg-success/15 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-mono text-sm font-semibold text-foreground">
                        {gate.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className="rounded-[2px] border-success/50 bg-success/15 font-mono text-[9px] tracking-widest text-success"
                      >
                        {gate.status}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Spend: ${gate.spend}.00 · FINAL-PASS {gate.datePassed}
                    </p>
                  </div>
                </div>

                <div className="text-muted-foreground">
                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ease-out ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              <div className="gate-disclosure" data-open={isExpanded}>
                <div className="gate-disclosure-clip">
                  <div className="gate-disclosure-inner space-y-4 border-t border-border bg-background/40 px-5 pb-5 pt-4">
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
                </div>
              </div>
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
              Rigorous discipline: all {PROGRAM_RECORD.sessionsRun} research sessions executed on
              local Tier-0 hardware with zero cloud waste.
            </p>
          </div>

          <div className="shrink-0 rounded-md border border-border bg-surface/60 p-3.5 text-right font-mono">
            <span className="label-mono block">Total expenditure</span>
            <span className="numeric-readout text-2xl font-bold text-success">
              ${PROGRAM_RECORD.spendUsd}.00 USD
            </span>
            <span className="block text-[10px] text-muted-foreground">
              against ${PROGRAM_RECORD.ceilingUsd} lifetime ceiling
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 font-mono text-xs md:grid-cols-3">
          {BUDGET_LEDGER.map((b) => (
            <div
              key={b.tier}
              className="space-y-2 rounded-md border border-border bg-surface/60 p-5"
            >
              <div className="text-[11px] text-muted-foreground">{b.tier}</div>
              <div className="numeric-readout text-2xl font-bold text-foreground">
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
            <span>${PROGRAM_RECORD.ceilingUsd}.00 ceiling</span>
          </div>
          <Progress value={0} className="mt-2 h-2" />
        </div>
      </div>
    </section>
  );
};
