import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  calibratedFpRate,
  targetWeightedScore,
  verdict,
} from "@/lib/lunarvoid-data";
import { EvidenceRadarChart } from "@/components/instruments/EvidenceRadarChart";
import { CHART } from "@/lib/chart-theme";

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

export function LikelihoodCalculator() {
  const [morphRatio, setMorphRatio] = useState(0.85);
  const [radarCpr, setRadarCpr] = useState(1.6);
  const [bouguer, setBouguer] = useState(-8.0);

  const score = useMemo(
    () => targetWeightedScore(morphRatio, radarCpr, bouguer),
    [morphRatio, radarCpr, bouguer],
  );
  const fp = calibratedFpRate(score);

  /* Live Bayesian posterior density curve (Gaussian around the score) */
  const { pdfD, pdfFill } = useMemo(() => {
    const mu = score;
    const sigma = 0.12 - score * 0.05;
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 80; i++) {
      const val = i / 80;
      const gaussian =
        (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
      pts.push({
        x: (i / 80) * SVG_W,
        y: SVG_H - (gaussian / 4.0) * (SVG_H * 0.85),
      });
    }
    const d = pts.reduce(
      (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
      "",
    );
    return { pdfD: d, pdfFill: `${d} L ${SVG_W} ${SVG_H} L 0 ${SVG_H} Z` };
  }, [score]);

  return (
    <div className="panel grid gap-6 p-5 lg:grid-cols-2">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Interactive likelihood calculator</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Move the three evidence lines and watch the posterior — and its
            false-positive cost — respond.
          </p>
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

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface/60 p-5">
        <div>
          <p className="label-mono">Inference score</p>
          <p className="mt-1 font-mono text-6xl leading-none text-primary">
            {score.toFixed(2)}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
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
            <path
              d={pdfD}
              fill="none"
              stroke={CHART.primary}
              strokeWidth="2"
            />
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

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-background/50 p-3">
            <p className="label-mono">FP bound</p>
            <p className="mt-1 font-mono text-lg text-foreground">
              {fp.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">per 10⁴ km²</p>
          </div>
          <div className="rounded-md border border-border bg-background/50 p-3">
            <p className="label-mono">Posterior odds</p>
            <p className="mt-1 font-mono text-lg text-foreground">
              {(score / Math.max(1e-3, 1 - score)).toFixed(1)} : 1
            </p>
            <p className="text-xs text-muted-foreground">void vs. no void</p>
          </div>
        </div>
        <div className="rounded-md border border-accent/30 bg-accent/5 p-3">
          <p className="label-mono text-accent">Automated verdict</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {verdict(score)}
          </p>
        </div>
      </div>
    </div>
  );
}
