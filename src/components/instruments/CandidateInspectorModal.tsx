import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Candidate } from '../../types';
import { ElevationProfileChart } from './ElevationProfileChart';
import { EvidenceRadarChart } from './EvidenceRadarChart';

interface CandidateInspectorModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateInspectorModal: React.FC<CandidateInspectorModalProps> = ({
  candidate,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!candidate) return null;

  const citation = `LUNARVOID Candidate ${candidate.id} (${candidate.siteName}): Lat ${candidate.lat.toFixed(2)}, Lon ${candidate.lon.toFixed(2)}, Score ${candidate.score.toFixed(2)}, DTM ${candidate.dtmProduct}`;

  const copyCitation = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-space-900 border border-space-700/80 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-space-800 bg-space-950 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">CANDIDATE DOSSIER</span>
              <span
                className={`px-2 py-0.5 text-[10px] rounded border ${
                  candidate.status === 'CONFIRMED ANCHOR'
                    ? 'bg-teal-950/80 text-teal-300 border-teal-800'
                    : candidate.status === 'HIGH CONFIDENCE'
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                    : 'bg-orange-950/80 text-orange-300 border-orange-800'
                }`}
              >
                {candidate.status}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-sans mt-0.5">{candidate.id}</h3>
            <p className="text-xs text-zinc-400">{candidate.morphology} • {candidate.siteName}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyCitation}
              className="p-2 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-zinc-300 hover:text-white transition"
              title="Copy Record Citation"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <span className="text-zinc-500 text-[10px] block">COORDINATES</span>
              <span className="text-zinc-100 font-bold">
                {candidate.lat.toFixed(2)}°N, {candidate.lon.toFixed(2)}°E
              </span>
            </div>
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <span className="text-zinc-500 text-[10px] block">CALIBRATED SCORE</span>
              <span className="text-blue-400 font-bold text-sm">{candidate.score.toFixed(2)} / 1.00</span>
            </div>
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <span className="text-zinc-500 text-[10px] block">DEPTH / SPAN</span>
              <span className="text-zinc-100 font-bold">
                {candidate.depthMeters ? `${candidate.depthMeters}m / ${candidate.spanMeters}m` : 'Subsidence Sag'}
              </span>
            </div>
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <span className="text-zinc-500 text-[10px] block">DTM PRODUCT</span>
              <span className="text-zinc-300 font-bold truncate block">{candidate.dtmProduct}</span>
            </div>
          </div>

          {/* Scientific Instrument 1: DTM Cross-Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              TRANSECT ELEVATION PROFILE
            </span>
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <ElevationProfileChart
                depthMeters={candidate.depthMeters}
                spanMeters={candidate.spanMeters}
                candidateId={candidate.id}
                resolution={candidate.resolution}
              />
            </div>
          </div>

          {/* Scientific Instrument 2: Multi-Axis Radar Spider Chart */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              MULTI-AXIS EVIDENCE FUSION
            </span>
            <div className="bg-space-950 p-3 rounded-xl border border-space-800">
              <EvidenceRadarChart
                score={candidate.score}
                cprRatio={candidate.cprRatio}
                bouguerMGal={candidate.bouguerMGal}
                depthMeters={candidate.depthMeters}
              />
            </div>
          </div>

          {/* Analyst Morphological Evaluation Notes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              ANALYST INTERPRETATION & STEREO PAIR AUDIT
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-space-950/80 p-4 rounded-xl border border-space-800">
              {candidate.notes}
            </p>
          </div>

          {candidate.isBacklog && (
            <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-800/60 text-orange-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" />
              <span>
                Flagged in Visual Inspection Backlog (27 features) — requires human stereo illumination verification under variable solar incidence.
              </span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-space-800 bg-space-950 flex items-center justify-between text-[10px] text-zinc-500">
          <span>LUNARVOID Planetary Database • Press Esc to close</span>
          <span className="flex items-center gap-1 text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audited for Gate G2</span>
          </span>
        </div>
      </div>
    </div>
  );
};
