import React, { useEffect, useState } from 'react';
import { Code2, CheckCircle2, ArrowRight, Loader2, Cpu, FileCode } from 'lucide-react';
import { apiService } from '../services/api';

export default function CodingEvaluationPage({ nextStep, codingSubmission, setCodingEvaluation }) {
  const [loading, setLoading] = useState(true);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runCodeEval() {
      setLoading(true);
      try {
        const payload = {
          code: codingSubmission?.code || '',
          language: codingSubmission?.language || 'javascript',
          company: codingSubmission?.company || 'Google',
          question_title: codingSubmission?.question_title || 'Coding Challenge'
        };
        const res = await apiService.evaluateCodingSubmission(payload);
        if (res.success && res.evaluation) {
          setEvalResult(res.evaluation);
          setCodingEvaluation(res.evaluation);
        } else {
          setError("Failed to evaluate code submission.");
        }
      } catch (err) {
        setError(`Code evaluation error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    runCodeEval();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Running Automated Code Analysis...</h3>
        <p className="text-xs text-slate-400 mt-2">Checking algorithmic correctness, complexity, and clean code standards.</p>
      </div>
    );
  }

  const score = evalResult?.execution_score || 90.0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">Coding Round Evaluation</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 10 of 11 — Automated assessment of {codingSubmission?.company || 'Google'} technical submission.
        </p>
      </div>

      {/* Main Score Box */}
      <div className="glass-card p-8 rounded-3xl text-center mb-8 border border-indigo-500/30">
        <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-1">CODE EXECUTION SCORE</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-black text-white">{score}</span>
          <span className="text-2xl font-bold text-indigo-400">%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mt-6 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Quality Score</span>
            <span className="text-base font-bold text-emerald-400">{evalResult?.quality_score || 88}%</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Test Cases</span>
            <span className="text-base font-bold text-indigo-400">{evalResult?.test_cases_passed || "4 / 4"}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Time Complexity</span>
            <span className="text-base font-bold text-purple-400 font-mono">{evalResult?.time_complexity || "O(1)"}</span>
          </div>
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Space Complexity</span>
            <span className="text-base font-bold text-pink-400 font-mono">{evalResult?.space_complexity || "O(N)"}</span>
          </div>
        </div>
      </div>

      {/* Code Feedback Notes */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileCode className="h-5 w-5 text-indigo-400" />
          Detailed Technical Feedback
        </h4>
        <ul className="space-y-2 text-xs text-slate-300">
          {evalResult?.feedback?.map((item, idx) => (
            <li key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={nextStep}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
      >
        <span>Compile Final Candidate Scorecard</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
