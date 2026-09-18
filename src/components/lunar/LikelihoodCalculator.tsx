import { useEffect, useMemo, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { calibratedFpRate, targetWeightedScore, verdict } from '@/lib/lunarvoid-data';
import { EvidenceRadarChart } from '@/components/instruments/EvidenceRadarChart';
import { buildPdfCurve } from '@/lib/chart-math';
import { Link2, RotateCcw } from 'lucide-react';
import { CHART } from '@/lib/chart-theme';

const SVG_W = 420;
const SVG_H = 100;

function Control({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-sm text-primary">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0] ?? value)}
      />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export interface CalcSeed {
  morphRatio: number;
  radarCpr: number;
  bouguer: number;
  label?: string;
  publishedScore?: number;
  morphIsDefault?: boolean;
}

const DEFAULTS = { morphRatio: 0.85, radarCpr: 1.6, bouguer: -8.0 } as const;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function LikelihoodCalculator({
  seed,
  onReset,
  onCopyScenario,
}: {
  seed?: CalcSeed;
  onReset?: () => void;
  onCopyScenario?: (m: number, c: number, b: number) => void;
}) {
  const [morphRatio, setMorphRatio] = useState(() =>
    clamp(seed?.morphRatio ?? DEFAULTS.morphRatio, 0.1, 1.5),
  );
  const [radarCpr, setRadarCpr] = useState(() =>
    clamp(seed?.radarCpr ?? DEFAULTS.radarCpr, 0.5, 3.0),
  );
  const [bouguer, setBouguer] = useState(() => clamp(seed?.bouguer ?? DEFAULTS.bouguer, -15, 0));
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  const reset = () => {
    setMorphRatio(DEFAULTS.morphRatio);
    setRadarCpr(DEFAULTS.radarCpr);
    setBouguer(DEFAULTS.bouguer);
    onReset?.();
  };

  const copyScenario = () => {
    onCopyScenario?.(morphRatio, radarCpr, bouguer);
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 700);
  };

  const score = useMemo(
    () => targetWeightedScore(morphRatio, radarCpr, bouguer),
    [morphRatio, radarCpr, bouguer],
  );
  const fp = calibratedFpRate(score);

  /* Live Bayesian posterior density curve (Gaussian around the score) */
  const { d: pdfD, fill: pdfFill } = useMemo(() => buildPdfCurve(score, SVG_W, SVG_H), [score]);

  return (
    <div className="workbench-panel grid gap-6 p-5 lg:grid-cols-2 rounded-[2px]">
      <div className="space-y-5">
        <div className="border-b border-border/70 pb-3">
          <span className="collar-ribbon text-[9px]">INTERACTIVE INFERENCE INSTRUMENT</span>
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground mt-0.5">
            Bayesian Posterior Likelihood Calculator
          </h3>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            Adjust the three empirical evidence sliders and watch the continuous posterior — and its
            calibrated false-positive cost — respond in real time.
          </p>
          {seed?.label && (
            <div className="label-mono mt-2 flex flex-wrap items-center gap-2 text-[10px]">
              <span className="text-primary">SEEDED: {seed.label}</span>
              {seed.publishedScore !== undefined && (
                <span className="text-muted-foreground">
                  Published (authored): {seed.publishedScore.toFixed(2)} · Fusion model:{' '}
                  {score.toFixed(2)}
                  {seed.morphIsDefault
                    ? ' · morph = default (registry lacks morphometry ratio)'
                    : ''}
                </span>
              )}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 rounded-[2px] font-mono text-[9px] tracking-widest btn-lift"
              onClick={reset}
            >
              <RotateCcw className="h-3 w-3" />
              RESET
            </Button>
            {onCopyScenario && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`h-6 rounded-[2px] font-mono text-[9px] tracking-widest btn-lift ${copied ? 'flash-ok' : ''}`}
                onClick={copyScenario}
              >
                <Link2 className="h-3 w-3" />
                COPY SCENARIO LINK
              </Button>
            )}
          </div>
        </div>
        <Control
          label="Morphometry depth-to-span ratio"
          unit=""
          value={morphRatio}
          min={0.1}
          max={1.5}
          step={0.05}
          onChange={setMorphRatio}
          hint="Steep vertical wall drop without impact ejecta rim."
        />
        <Control
          label="Radar CPR contrast"
          unit="×"
          value={radarCpr}
          min={0.5}
          max={3.0}
          step={0.1}
          onChange={setRadarCpr}
          hint="S-band circular polarisation contrast vs background mare regolith."
        />
        <Control
          label="GRAIL Bouguer deficit"
          unit="mGal"
          value={bouguer}
          min={-15}
          max={0}
          step={0.5}
          onChange={setBouguer}
          hint="Mass deficit anomaly consistent with uncompensated conduit void."
        />
        <EvidenceRadarChart
          score={score}
          cprRatio={radarCpr}
          bouguerMGal={bouguer}
          depthMeters={Math.round(morphRatio * 80)}
        />
      </div>

      <div className="flex flex-col gap-4 rounded-[2px] border border-border/80 bg-surface/60 p-5">
        <div>
          <span className="collar-ribbon text-[9px]">CALIBRATED POSTERIOR SCORE P(VOID | E)</span>
          <p className="numeric-readout mt-1 text-5xl font-bold leading-none text-primary sm:text-6xl">
            {score.toFixed(2)}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-[2px] bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${score * 100}%` }}
            />
          </div>
        </div>

        {/* Live Bayesian posterior density */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Posterior density P(void | E)</span>
            <span className="text-accent">
              μ = {score.toFixed(2)} · σ = ±{(0.12 - score * 0.05).toFixed(2)}
            </span>
          </div>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="h-24 w-full select-none">
            <path d={pdfFill} fill={CHART.primaryFill} />
            <path d={pdfD} fill="none" stroke={CHART.primary} strokeWidth="2" />
            <line
              x1={score * SVG_W}
              y1={0}
              x2={score * SVG_W}
              y2={SVG_H}
              stroke={CHART.success}
              strokeWidth="2"
              strokeDasharray="3 2"
            />
          </svg>
          <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
            <span>0.00 degraded crater</span>
            <span className="font-bold text-success">posterior mode</span>
            <span>1.00 verified anchor</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[2px] border border-border/80 bg-background/50 p-3">
            <span className="collar-ribbon text-[9px]">FP BOUND</span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">{fp.toFixed(2)}</p>
            <p className="text-[10px] font-mono text-muted-foreground">per 10⁴ km²</p>
          </div>
          <div className="rounded-[2px] border border-border/80 bg-background/50 p-3">
            <span className="collar-ribbon text-[9px]">POSTERIOR ODDS</span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {(score / Math.max(1e-3, 1 - score)).toFixed(1)} : 1
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">void vs. no void</p>
          </div>
        </div>
        <div className="rounded-[2px] border border-accent/40 bg-accent/5 p-3">
          <span className="collar-ribbon text-[9px] text-accent">AUTOMATED VERDICT</span>
          <p className="mt-1 font-sans text-xs leading-relaxed text-foreground">{verdict(score)}</p>
        </div>
      </div>
    </div>
  );
}
