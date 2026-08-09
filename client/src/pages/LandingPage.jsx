import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Code2, Trophy } from 'lucide-react';

export default function LandingPage({ nextStep }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <span>TECH TITANS • HACKATHON 2026</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
        Master Your Technical Interviews with <br />
        <span className="gradient-text">Hyper-Personalized AI</span>
      </h1>

      <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        From ATS resume parsing and gap analysis to tailored behavioral AI questions and company-specific coding rounds — experience an end-to-end interview simulation engineered for high-performance roles.
      </p>

      {/* Call to Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
        <button
          onClick={nextStep}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>Start Interview Preparation</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit mb-4 text-indigo-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">ATS Gap Analysis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Extract skill vectors from your resume and target job description to pinpoint missing requirements before recruiters do.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl w-fit mb-4 text-purple-400">
            <Cpu className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Personalized AI Interview</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No generic questions. Questions dynamically adapt to your candidate profile, experience, projects, and target role.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-pink-500/40 transition-all">
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl w-fit mb-4 text-pink-400">
            <Code2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Company Coding Round</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Practice company-specific coding challenges (Google, Amazon, Meta, Microsoft) with automated complexity analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
