import React, { useState } from 'react';
import { GATES, BUDGET_LEDGER } from '../../data/gates';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';

export const GatesTab: React.FC = () => {
  const [expandedGate, setExpandedGate] = useState<string>('G2');

  return (
    <div className="space-y-10">
      
      {/* SECTION HEADER */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <span>Verifiable Research Gates & Reproducibility Ledger</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-3xl">
          LUNARVOID operates on milestone gates with explicit numerical pass criteria, open decision records, and strict budget caps. Research never progresses without verifiable criteria satisfaction.
        </p>
      </div>

      {/* GATE MILESTONE REVIEWS */}
      <div className="space-y-4">
        {GATES.map((gate) => {
          const isExpanded = expandedGate === gate.id;
          const isDraft = gate.status === 'DRAFT-FOR-REVIEW';

          return (
            <div
              key={gate.id}
              className={`bg-obsidian-900 border rounded-2xl overflow-hidden transition ${
                isDraft ? 'border-cyan-800/80 shadow-lg shadow-cyan-950/40' : 'border-slate-800'
              }`}
            >
              {/* Gate Header Row */}
              <div
                onClick={() => setExpandedGate(isExpanded ? '' : gate.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                    gate.status === 'PASSED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {gate.status === 'PASSED' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-bold text-white font-mono">{gate.title}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-mono rounded border ${
                        gate.status === 'PASSED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                      }`}>
                        {gate.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Spend: ${gate.spend}.00 • {gate.sessionCompleted ? `Completed Session ${gate.sessionCompleted}` : 'Active Review'}
                    </p>
                  </div>
                </div>

                <div className="text-slate-500">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Gate Criteria Body */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-4">
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {gate.summary}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                      CRITERIA SATISFACTION MATRIX
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                      {gate.criteria.map((c) => (
                        <div key={c.id} className="bg-obsidian-950 p-3.5 rounded-xl border border-slate-850 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{c.name}</span>
                            <span className={`text-[10px] px-2 py-0.2 rounded font-bold border ${
                              c.verdict === 'PASS'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : c.verdict === 'DEMONSTRATION'
                                ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {c.verdict}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{c.detail}</p>
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

      {/* FRUGAL SCIENCE BUDGET LEDGER */}
      <div className="bg-obsidian-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Compute Infrastructure & Budget Transparency</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Disciplined open planetary science: zero cloud waste across all research sessions.
            </p>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-slate-500 text-[10px] block">TOTAL SPEND ACROSS 24 SESSIONS</span>
            <span className="text-emerald-400 font-bold text-xl">$0.00 USD</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {BUDGET_LEDGER.map((b, idx) => (
            <div key={idx} className="bg-obsidian-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{b.tier}</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${b.spent}.00 <span className="text-xs text-slate-500 font-normal">/ ${b.allocation}.00</span>
              </div>
              <div className="text-[10px] font-bold text-cyan-400">{b.status}</div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pt-1">
                {b.description}
              </p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
