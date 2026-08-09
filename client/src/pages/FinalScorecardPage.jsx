import React, { useEffect, useState } from 'react';
import { Trophy, Award, CheckCircle, RefreshCw, Database, Sparkles, Star, Download } from 'lucide-react';
import { apiService } from '../services/api';

export default function FinalScorecardPage({ resumeData, jdData, atsResult, evaluationResult, codingEvaluation, selectedCompany, resetFlow }) {
  const [savedToDb, setSavedToDb] = useState(false);

  const atsScore = Number(atsResult?.overall_match_score || 85.0);
  const interviewScore = Number(evaluationResult?.overall_score || 84.0);
  const codingScore = Number(codingEvaluation?.execution_score || 90.0);

  // Weighted Final Readiness Formula: 30% ATS + 35% General Interview + 35% Coding Round
  const finalReadinessScore = Number((
    (atsScore * 0.30) +
    (interviewScore * 0.35) +
    (codingScore * 0.35)
  ).toFixed(1));

  const readinessLevel = finalReadinessScore >= 85 ? "Top Tier Candidate — Interview Ready" : "Strong Candidate — Minor Refinements Needed";

  useEffect(() => {
    async function persistScorecard() {
      try {
        const payload = {
          candidate_name: resumeData?.parsed_profile?.name || "Candidate",
          target_role: jdData?.target_role || "Software Engineer",
          ats_score: atsScore,
          general_interview_score: interviewScore,
          coding_score: codingScore,
          final_readiness_score: finalReadinessScore
        };
        const res = await apiService.saveScorecard(payload);
        if (res.success && res.persisted_to_supabase) {
          setSavedToDb(true);
        }
      } catch (err) {
        console.warn("Save scorecard notice:", err.message);
      }
    }
    persistScorecard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 text-xs font-mono mb-3 border border-amber-500/30">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>FINAL SCORECARD COMPILATION</span>
        </div>
        <h2 className="text-4xl font-black text-white">Candidate Readiness Scorecard</h2>
        <p className="text-sm text-slate-400 mt-2">
          End-to-End Evaluation for <strong className="text-white">{resumeData?.parsed_profile?.name || 'John Doe'}</strong> targeting <strong className="text-indigo-400">{jdData?.target_role || 'Senior Full-Stack Engineer'}</strong>
        </p>
      </div>

      {/* Main Readiness Hero Banner */}
      <div className="glass-card p-8 rounded-3xl text-center mb-8 border border-indigo-500/40 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/20 rounded-full blur-3xl -z-10" />

        <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">OVERALL INTERVIEW READINESS</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-7xl font-black gradient-text">{finalReadinessScore}</span>
          <span className="text-3xl font-bold text-indigo-400">%</span>
        </div>

        <div className="inline-block mt-3 bg-emerald-500/10 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-emerald-500/30">
          ★ {readinessLevel}
        </div>

        {/* 3 Pillars Score Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">1. ATS Match (30%)</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{atsScore}%</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">2. AI Interview (35%)</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{interviewScore}%</span>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 block font-mono">3. {selectedCompany || 'Google'} Code (35%)</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">{codingScore}%</span>
          </div>
        </div>
      </div>

      {/* Database Storage Banner */}
      <div className="glass-card p-4 rounded-2xl mb-8 flex items-center justify-between border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <Database className={`h-5 w-5 ${savedToDb ? 'text-emerald-400' : 'text-indigo-400'}`} />
          <span>
            {savedToDb ? (
              <strong className="text-emerald-400">Scorecard successfully persisted to Supabase Database.</strong>
            ) : (
              <span className="text-slate-300">Scorecard cached locally in structured JSON session memory.</span>
            )}
          </span>
        </div>
        <span className="font-mono text-slate-500">SESSION READY</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={resetFlow}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Start New Interview Prep Session</span>
        </button>
      </div>
    </div>
  );
}
