import React from 'react';
import { Shield, Mountain, Cpu, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const EpistemicThesis: React.FC = () => {
  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="max-w-3xl">
        <p className="label-mono">Epistemology & methodological rigor</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">
          The epistemic thesis of LUNARVOID
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Scientific credibility requires recognizing observational limits. Planetary
          science literature is crowded with overconfident binary labels. LUNARVOID
          enforces strict mathematical humility.
        </p>
      </div>

      {/* Contrast: Sensationalism vs Calibration */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-4 w-4" />
            <span className="label-mono text-destructive">Common sensationalist claims</span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            "Lava tube discovered beneath lunar surface!"
          </p>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-bold text-destructive">•</span>
              <span>Treats superficial surface depressions or impact crater sags as binary "positive detections".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-destructive">•</span>
              <span>Ignores observational bias from LOLA altimeter track density and low-sun grazing shadow illusions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-destructive">•</span>
              <span>Omits numerical false positive rates and confidence interval bounds.</span>
            </li>
          </ul>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle2 className="h-4 w-4" />
            <span className="label-mono text-success">The LUNARVOID calibrated standard</span>
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            "We infer candidate likelihoods, bounded with published error bars."
          </p>
          <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="font-bold text-success">•</span>
              <span>Acknowledges that nothing subsurface on the Moon is verifiable today except the radar-evidenced Tranquillitatis conduit.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-success">•</span>
              <span>Publishes rigorous false positive calibration metrics: 6.06 [2.77, 11.51] per 10⁴ km² under calibration-context.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-success">•</span>
              <span>Couples sub-meter stereo photogrammetry with Mini-RF radar backscatter, GRAIL Bouguer gravity mass-deficits, and terrestrial basalt mechanics.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Three Core Scientific Pillars */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <Shield className="h-5 w-5 text-accent" />
          <h4 className="mt-3 font-mono text-sm font-semibold text-foreground">01 · Claim discipline</h4>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Continuous calibrated likelihoods rather than sensationalist binary labels. We
            mandate publishing the false positive rate per 10⁴ km² and account for
            observational bias (LOLA track density, NAC illumination angles).
          </p>
          <p className="label-mono mt-3 text-primary">FP rate per 10⁴ km² published</p>
        </div>

        <div className="panel p-5">
          <Mountain className="h-5 w-5 text-accent" />
          <h4 className="mt-3 font-mono text-sm font-semibold text-foreground">02 · Terrestrial analogs</h4>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Terrestrial LiDAR 3D scans and geomechanics from Hawai'i (Kīlauea) and
            Valentine Cave (Modoc) anchor our structural beam equations. Under 1/6 lunar
            gravity, stable spans expand to hundreds of meters.
          </p>
          <p className="label-mono mt-3 text-accent">NASA analog dataset integration</p>
        </div>

        <div className="panel p-5">
          <Cpu className="h-5 w-5 text-accent" />
          <h4 className="mt-3 font-mono text-sm font-semibold text-foreground">03 · Frugal science</h4>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Autonomous planetary science does not require endless cloud expenditure. All
            24 research sessions have run on local Tier-0 compute with $0 spent against
            an $800 lifetime ceiling over 30 months.
          </p>
          <p className="label-mono mt-3 text-success">Strict open budget transparency</p>
        </div>
      </div>
    </section>
  );
};
