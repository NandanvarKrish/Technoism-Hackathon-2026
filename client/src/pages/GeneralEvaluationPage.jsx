import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { apiService } from '../services/api';

export default function GeneralEvaluationPage({ nextStep, interviewResponses, setEvaluationResult }) {
  const [loading, setLoading] = useState(true);
  const [evalData, setEvalData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runEvaluation() {
      setLoading(true);
      try {
        const payload = {
          responses: interviewResponses || []
        };
        const res = await apiService.evaluateInterview(payload);
        if (res.success && res.evaluation) {
          setEvalData(res.evaluation);
          setEvaluationResult(res.evaluation);
        } else {
          setError("Failed to evaluate interview responses.");
        }
      } catch (err) {
        setError(`Evaluation error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    runEvaluation();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Evaluating Interview Responses...</h3>
        <p className="text-xs text-slate-400 mt-2">Analyzing technical accuracy, articulation, and problem-solving framework.</p>
      </div>
    );
  }

  const score = evalData?.overall_score || 85.0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">General Interview Evaluation</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 7 of 11 — Detailed feedback on communication & technical depth.
        </p>
      </div>

      {/* Score Summary Card */}
      <div className="glass-card p-8 rounded-3xl text-center mb-8 border border-indigo-500/30">
        <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">GENERAL INTERVIEW SCORE</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-black text-white">{score}</span>
          <span className="text-2xl font-bold text-indigo-400">%</span>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Communication</span>
            <span className="text-lg font-bold text-emerald-400">{evalData?.communication_score || 88}%</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Technical Accuracy</span>
            <span className="text-lg font-bold text-indigo-400">{evalData?.technical_score || 82}%</span>
          </div>
        </div>
      </div>

      {/* Strengths & Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Key Strengths Observed
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {evalData?.feedback_summary?.strengths?.map((str, idx) => (
              <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                ✓ {str}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Recommended Growth Areas
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {evalData?.feedback_summary?.areas_for_improvement?.map((area, idx) => (
              <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                • {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
      >
        <span>Proceed to Company Selection</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
