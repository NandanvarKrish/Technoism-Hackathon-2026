import React from 'react';
import { Cpu, RefreshCw, Database, Sparkles } from 'lucide-react';

export default function Header({ currentStep, resetFlow, dbStatus }) {
  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetFlow}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                TECH <span className="gradient-text">TITANS</span>
              </h1>
              <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-indigo-500/20">
                PROMPT 01
              </span>
            </div>
            <p className="text-xs text-slate-400">AI-Powered Interview Prep Platform</p>
          </div>
        </div>

        {/* Database & System Status Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <Database className={`h-3.5 w-3.5 ${dbStatus?.connected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300 font-mono">
              DB: <strong className="text-slate-100">{dbStatus?.mode || 'Checking...'}</strong>
            </span>
          </div>

          <button
            onClick={resetFlow}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-all"
            title="Reset session state"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
