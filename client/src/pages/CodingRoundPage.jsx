import React, { useState, useEffect } from 'react';
import { Code2, Play, CheckCircle2, Loader2, ArrowRight, Lightbulb, Terminal } from 'lucide-react';
import { apiService } from '../services/api';

export default function CodingRoundPage({ nextStep, selectedCompany, resumeData, jdData, atsResult, setCodingSubmission }) {
  const [challenge, setChallenge] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadChallenge() {
      setLoading(true);
      try {
        const payload = {
          company: selectedCompany || 'Google',
          target_role: jdData?.target_role || 'Software Engineer',
          profile: resumeData?.parsed_profile || {},
          job_description: jdData?.job_description || ''
        };
        const res = await apiService.generateCodingChallenge(payload);
        if (res.success && res.challenge) {
          setChallenge(res.challenge);
          const initialCode = res.challenge.starter_code?.[language] || '// Write code here';
          setCode(initialCode);
        } else {
          setError("Could not load coding challenge.");
        }
      } catch (err) {
        setError(`Coding challenge loading error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadChallenge();
  }, [selectedCompany]);

  const handleLanguageSwitch = (lang) => {
    setLanguage(lang);
    if (challenge?.starter_code?.[lang]) {
      setCode(challenge.starter_code[lang]);
    }
  };

  const handleSubmit = () => {
    setCodingSubmission({
      company: selectedCompany || 'Google',
      question_title: challenge?.question_title || 'Coding Challenge',
      code: code,
      language: language
    });
    nextStep();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Generating Personalized {selectedCompany || 'Google'} Coding Round...</h3>
        <p className="text-xs text-slate-400 mt-2">Integrating candidate profile, target role, and company problem dataset.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            {selectedCompany || 'Google'} CODING ROUND
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            {challenge?.question_title || 'LRU Cache Implementation'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => handleLanguageSwitch('javascript')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                language === 'javascript' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => handleLanguageSwitch('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                language === 'python' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Problem Statement & Test Cases */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-400" />
              Problem Description
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {challenge?.problem_statement}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Difficulty: </span>
                <span className="text-amber-400 font-mono">{challenge?.difficulty || 'Medium'}</span>
              </div>
              <div className="text-xs">
                <span className="text-slate-400 font-semibold">Category: </span>
                <span className="text-indigo-300 font-mono">{challenge?.category || 'Algorithms'}</span>
              </div>
            </div>
          </div>

          {/* Sample Test Cases */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">Sample Test Cases</h4>
            <div className="space-y-3">
              {challenge?.sample_test_cases?.map((tc, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-xs">
                  <div className="text-slate-400"><strong className="text-slate-300">Input:</strong> {tc.input}</div>
                  <div className="text-emerald-400 mt-1"><strong className="text-slate-300">Expected:</strong> {tc.expected_output}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints Toggle */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-xs font-semibold text-amber-400 flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              <span>{showHints ? 'Hide Hints' : 'Need a Hint? Click Here'}</span>
            </button>
            {showHints && (
              <ul className="mt-3 space-y-1 text-xs text-slate-300 list-disc list-inside">
                {challenge?.hints?.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Code Editor */}
        <div className="flex flex-col h-full space-y-4">
          <div className="glass-card p-4 rounded-2xl border border-indigo-500/30 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400">Editor ({language.toUpperCase()})</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">Live Validation</span>
            </div>

            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 bg-slate-950 text-indigo-200 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Submit Solution for AI Code Evaluation</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
