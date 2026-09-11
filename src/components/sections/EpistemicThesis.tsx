import React from 'react';
import { Shield, Mountain, Cpu, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const EpistemicThesis: React.FC = () => {
  return (
    <section id="thesis" className="py-24 border-b border-space-700/60 bg-space-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            01 • EPISTEMOLOGY & METHODOLOGICAL RIGOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            The Epistemic Thesis of LUNARVOID
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            Scientific credibility requires recognizing observational limits. Planetary science literature is crowded with overconfident binary labels. LUNARVOID enforces strict mathematical humility.
          </p>
        </div>

        {/* Contrast Table: Sensationalism vs Calibration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
          
          {/* Sensationalist Paradigm (Negative) */}
          <div className="bg-space-900/60 p-6 sm:p-8 rounded-2xl border border-red-950/80 space-y-5">
            <div className="flex items-center space-x-2.5 text-red-400">
              <AlertOctagon className="w-5 h-5" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider">
                Common Sensationalist Claims
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-100">
              "Lava tube discovered beneath lunar surface!"
            </h3>
            <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed font-sans">
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Treats superficial surface depressions or impact crater sags as binary "positive detections".</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Ignores observational bias from LOLA altimeter track density and low-sun grazing shadow illusions.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Omits numerical false positive rates and confidence interval bounds.</span>
              </li>
            </ul>
          </div>

          {/* LUNARVOID Calibration Paradigm (Positive) */}
          <div className="bg-space-900/90 p-6 sm:p-8 rounded-2xl border border-blue-800/80 space-y-5 shadow-xl">
            <div className="flex items-center space-x-2.5 text-teal-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-mono font-bold text-xs uppercase tracking-wider">
                The LUNARVOID Calibrated Standard
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">
              "We infer candidate likelihoods, bounded with published error bars."
            </h3>
            <ul className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans">
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Acknowledges that nothing subsurface on the Moon is verifiable today except the radar-evidenced Tranquillitatis conduit.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Publishes rigorous false positive calibration metrics: 6.06 [2.77, 11.51] per 10⁴ km² under calibration-context.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-teal-400 font-bold">•</span>
                <span>Couples sub-meter stereo photogrammetry with Mini-RF radar backscatter, GRAIL Bouguer gravity mass-deficits, and terrestrial basalt mechanics.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Three Core Scientific Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          
          <div className="bg-space-900 p-6 rounded-xl border border-space-700/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">01. Claim Discipline</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Continuous calibrated likelihoods rather than sensationalist binary labels. We mandate publishing the false positive rate per 10⁴ km² and account for observational bias (LOLA track density, NAC illumination angles).
            </p>
            <div className="text-[11px] font-mono text-blue-400 pt-1">
              Rule: FP rate per 10⁴ km² published
            </div>
          </div>

          <div className="bg-space-900 p-6 rounded-xl border border-space-700/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/80 flex items-center justify-center text-teal-400">
              <Mountain className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">02. Terrestrial Analogs</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Terrestrial LiDAR 3D scans and geomechanics from Hawai'i (Kīlauea) and Valentine Cave (Modoc) anchor our structural beam equations. Under 1/6 lunar gravity, stable spans expand to hundreds of meters.
            </p>
            <div className="text-[11px] font-mono text-teal-400 pt-1">
              NASA Analog Dataset integration
            </div>
          </div>

          <div className="bg-space-900 p-6 rounded-xl border border-space-700/80 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">03. Frugal Science</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Autonomous planetary science does not require endless cloud expenditure. All 24 research sessions have run on local Tier-0 compute with $0 spent against an $800 lifetime ceiling over 30 months.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 pt-1">
              Strict open budget transparency
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
