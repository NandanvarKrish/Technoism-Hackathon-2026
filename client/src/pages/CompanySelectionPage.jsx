import React, { useState } from 'react';
import { Building2, Code2, ArrowRight, Shield } from 'lucide-react';

const COMPANIES = [
  {
    name: 'Google',
    tagline: 'High-scale System Architecture & Algorithmic Optimization',
    focus: 'Data Structures, LRU Caching, Thread Safety & Memory Bounds',
    color: 'from-blue-600 to-emerald-500'
  },
  {
    name: 'Amazon',
    tagline: 'Fulfillment Logistics & Distributed Graph Routing',
    focus: 'BFS/DFS Graph Traversal, String Manipulations, System Design',
    color: 'from-amber-500 to-orange-600'
  },
  {
    name: 'Microsoft',
    tagline: 'Cloud Service Subgraphs & Recursive Balances',
    focus: 'Binary Trees, Dynamic Programming, Subgraph Isomorphism',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    name: 'Meta',
    tagline: 'Social Graph Querying & Mutual Recommendation Engines',
    focus: 'Hash Maps, Priority Queues, Custom Comparators',
    color: 'from-indigo-600 to-pink-600'
  }
];

export default function CompanySelectionPage({ nextStep, setSelectedCompany }) {
  const [chosen, setChosen] = useState('Google');

  const handleSelect = (companyName) => {
    setChosen(companyName);
    setSelectedCompany(companyName);
  };

  const handleContinue = () => {
    setSelectedCompany(chosen);
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">Select Target Company</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 8 of 11 — The upcoming coding challenge will be dynamically personalized for your chosen tech leader.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {COMPANIES.map((comp) => {
          const isSelected = chosen === comp.name;
          return (
            <div
              key={comp.name}
              onClick={() => handleSelect(comp.name)}
              className={`glass-card p-6 rounded-2xl cursor-pointer border transition-all relative overflow-hidden ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${comp.color} text-white font-black text-lg`}>
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{comp.name}</h3>
                    <p className="text-xs text-slate-400">{comp.tagline}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="bg-indigo-500/20 text-indigo-400 text-xs font-mono px-2.5 py-1 rounded-full border border-indigo-500/30">
                    Selected
                  </span>
                )}
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mt-4 text-xs text-slate-300">
                <span className="text-slate-500 font-semibold block mb-1">Company Dataset Focus:</span>
                {comp.focus}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
      >
        <span>Launch {chosen} Personalized Coding Challenge</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
