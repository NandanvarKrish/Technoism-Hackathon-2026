import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2, Award } from 'lucide-react';
import { apiService } from '../services/api';

export default function AtsAnalysisPage({ nextStep, resumeData, jdData, setAtsResult }) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function runAnalysis() {
      setLoading(true);
      try {
        const payload = {
          profile: resumeData?.parsed_profile || {},
          job_description: jdData?.job_description || '',
          target_role: jdData?.target_role || 'Software Engineer'
        };
        const res = await apiService.analyzeAts(payload);
        if (res.success && res.ats_report) {
          setReport(res.ats_report);
          setAtsResult(res.ats_report);
        } else {
          setError("Failed to complete ATS analysis.");
        }
      } catch (err) {
        setError(`ATS analysis error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    runAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Running ATS Match Analysis...</h3>
        <p className="text-xs text-slate-400 mt-2">Computing keyword vectors & skill requirement coverage in Python.</p>
      </div>
    );
  }

  const score = report?.overall_match_score || 85.0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">ATS Analysis & Gap Breakdown</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 5 of 11 — Comprehensive compatibility score against target job description.
        </p>
      </div>

      {/* Main Overall Match Card */}
      <div className="glass-card p-8 rounded-3xl text-center mb-8 relative overflow-hidden border border-indigo-500/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">OVERALL MATCH SCORE</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-black text-white">{score}</span>
          <span className="text-2xl font-bold text-indigo-400">%</span>
        </div>
        <p className="text-xs text-slate-400 mt-2">Target Role: <strong className="text-slate-200">{jdData?.target_role}</strong></p>

        {/* Category Breakdown Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left">
          {report?.category_scores && Object.entries(report.category_scores).map(([cat, val]) => (
            <div key={cat} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="capitalize text-slate-300 font-medium">{cat.replace('_', ' ')}</span>
                <span className="font-mono text-indigo-400 font-bold">{val}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matched vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-emerald-500">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Matched Skills ({report?.matched_skills?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {report?.matched_skills?.map((skill, idx) => (
              <span key={idx} className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-mono">
                ✓ {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-amber-500">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-amber-400" />
            Identified ATS Skill Gaps ({report?.missing_skills?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2">
            {report?.missing_skills?.map((skill, idx) => (
              <span key={idx} className="bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-mono">
                ✕ {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-400" />
          Actionable Resume Optimization Suggestions
        </h4>
        <ul className="space-y-2 text-xs text-slate-300">
          {report?.suggestions?.map((sug, idx) => (
            <li key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
              <span className="text-indigo-400 font-bold">•</span>
              <span>{sug}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={nextStep}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
      >
        <span>Proceed to Personalized General AI Interview</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
