import React, { useState } from 'react';
import { GATES, BUDGET_LEDGER } from '../../data/gates';
import { CheckCircle2, Clock, DollarSign, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';

export const GatesJourneySection: React.FC = () => {
  const [expandedGate, setExpandedGate] = useState<string>('G2');

  return (
    <section id="gates" className="py-24 border-b border-space-700/60 bg-space-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="text-blue-400 font-mono text-xs uppercase tracking-wider font-semibold">
            06 • GOVERNANCE & REPRODUCIBILITY AUDIT
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
            Research Gates & Journey Ledger
          </h2>
          <p className="text-zinc-400 font-sans text-sm sm:text-base leading-relaxed">
            LUNARVOID progresses strictly across verifiable milestone gates with numerical pass criteria, explicit decision records, and complete budget transparency.
          </p>
        </div>

        {/* 24-Session Roadmap Timeline Visual */}
        <div className="p-6 sm:p-8 rounded-2xl bg-space-900 border border-space-700/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-space-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <GitBranch className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white font-mono">
                The 24-Session Autonomous Research Odyssey
              </h3>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded border border-teal-800">
              Active Session: 24 (Gate G2 Review)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-space-950 p-4 rounded-xl border border-space-800 space-y-1.5">
              <div className="text-teal-400 text-[10px] font-bold">SESSIONS 01–06 • PASSED</div>
              <div className="text-sm font-bold text-white">Gate G0′ Scoping</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Prior-art matrix, dataset licensing audit (NASA/ISRO/JAXA), and initial Tier-0 workstation setup.
              </p>
            </div>

            <div className="bg-space-950 p-4 rounded-xl border border-space-800 space-y-1.5">
              <div className="text-teal-400 text-[10px] font-bold">SESSIONS 07–14 • PASSED</div>
              <div className="text-sm font-bold text-white">Gate G1 Pipeline</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                USGS ISIS3 ingestion, Ames Stereo Pipeline reproduction at Mare Tranquillitatis, and Decision D1.
              </p>
            </div>

            <div className="bg-space-950 p-4 rounded-xl border border-blue-600/80 space-y-1.5 shadow-lg shadow-blue-950">
              <div className="text-blue-400 text-[10px] font-bold">SESSIONS 15–24 • ACTIVE</div>
              <div className="text-sm font-bold text-white">Gate G2 Candidate Scope</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                21 DTM targets mapped, 257 candidate features cataloged, and false-positive bounds calibrated.
              </p>
            </div>

            <div className="bg-space-950/60 p-4 rounded-xl border border-space-800 space-y-1.5 opacity-60">
              <div className="text-zinc-500 text-[10px] font-bold">PLANNED WP1</div>
              <div className="text-sm font-bold text-zinc-300">Gate G3 Manuscript</div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                Peer-reviewed journal publication, Zenodo artifact archiving, and open code release.
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Gates Accordion */}
        <div className="space-y-4">
          <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            VERIFIABLE GATE CRITERIA MATRICES
          </div>

          {GATES.map((gate) => {
            const isExpanded = expandedGate === gate.id;
            const isDraft = gate.status === 'DRAFT-FOR-REVIEW';

            return (
              <div
                key={gate.id}
                className={`bg-space-900 border rounded-2xl overflow-hidden transition ${
                  isDraft ? 'border-blue-600/80 shadow-xl shadow-blue-950/30' : 'border-space-700/80'
                }`}
              >
                {/* Gate Header Row */}
                <div
                  onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-space-850/60 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                        gate.status === 'PASSED'
                          ? 'bg-teal-950/80 text-teal-400 border border-teal-800'
                          : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                      }`}
                    >
                      {gate.status === 'PASSED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-base font-bold text-white font-mono">{gate.title}</h3>
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-mono rounded border ${
                            gate.status === 'PASSED'
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-800 animate-pulse'
                          }`}
                        >
                          {gate.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-1">
                        Spend: ${gate.spend}.00 • {gate.sessionCompleted ? `Passed in Session ${gate.sessionCompleted}` : 'Active Working Milestone'}
                      </p>
                    </div>
                  </div>

                  <div className="text-zinc-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Gate Expanded Criteria */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-space-800 space-y-4 bg-space-950/40">
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {gate.summary}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                        CRITERIA SATISFACTION VERDICT MATRIX
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {gate.criteria.map((c) => (
                          <div key={c.id} className="bg-space-950 p-4 rounded-xl border border-space-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{c.name}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                  c.verdict === 'PASS'
                                    ? 'bg-teal-950/80 text-teal-400 border border-teal-800'
                                    : c.verdict === 'DEMONSTRATION'
                                    ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                                    : 'bg-space-800 text-zinc-400 border border-space-700'
                                }`}
                              >
                                {c.verdict}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{c.detail}</p>
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

        {/* Frugal Science Compute Ledger */}
        <div id="ledger" className="bg-space-900 p-6 sm:p-10 rounded-2xl border border-space-700/80 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-space-800">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-teal-400 font-mono text-xs font-bold">
                <DollarSign className="w-5 h-5" />
                <span>FRUGAL SCIENCE COMPUTE LEDGER</span>
              </div>
              <h3 className="text-xl font-bold text-white font-sans">
                Compute Infrastructure & Zero Cloud Waste
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Rigorous discipline: all 24 research sessions executed on local Tier-0 hardware with zero cloud waste.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono bg-space-950 p-3.5 rounded-xl border border-space-800 shrink-0">
              <span className="text-zinc-500 text-[10px] block">TOTAL EXPENDITURE</span>
              <span className="text-teal-400 font-bold text-2xl">$0.00 USD</span>
              <span className="text-zinc-500 text-[10px] block">against $800 lifetime ceiling</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {BUDGET_LEDGER.map((b, idx) => (
              <div key={idx} className="bg-space-950 p-5 rounded-xl border border-space-800 space-y-2">
                <div className="text-[11px] text-zinc-400">{b.tier}</div>
                <div className="text-2xl font-bold text-white">
                  ${b.spent}.00 <span className="text-xs text-zinc-500 font-normal">/ ${b.allocation}.00</span>
                </div>
                <div className="text-[10px] font-bold text-blue-400">{b.status}</div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
