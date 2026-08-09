import React, { useState, useEffect } from 'react';
import { Cpu, Send, Loader2, ArrowRight, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function GeneralInterviewPage({ nextStep, resumeData, jdData, atsResult, setInterviewResponses }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        const payload = {
          profile: resumeData?.parsed_profile || {},
          job_description: jdData?.job_description || '',
          target_role: jdData?.target_role || 'Software Engineer',
          ats_gaps: atsResult?.missing_skills || []
        };
        const res = await apiService.generateInterview(payload);
        if (res.success && res.questions) {
          setQuestions(res.questions);
        } else {
          setError("Could not load personalized interview questions.");
        }
      } catch (err) {
        setError(`Interview loading error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleSaveAnswer = () => {
    if (!currentAnswer.trim()) return;
    const q = questions[currentIndex];
    const updated = {
      ...answers,
      [q.id]: {
        question_id: q.id,
        question: q.question,
        category: q.category,
        answer: currentAnswer
      }
    };
    setAnswers(updated);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer(updated[questions[currentIndex + 1]?.id]?.answer || '');
    }
  };

  const handleFinishInterview = () => {
    const responseArray = Object.values(answers);
    if (currentAnswer.trim() && questions[currentIndex]) {
      const q = questions[currentIndex];
      responseArray.push({
        question_id: q.id,
        question: q.question,
        category: q.category,
        answer: currentAnswer
      });
    }

    setInterviewResponses(responseArray);
    nextStep();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Generating Personalized AI Questions...</h3>
        <p className="text-xs text-slate-400 mt-2">Tailoring behavioral & technical questions to your resume skills and ATS gaps via Gemini API.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex] || questions[0];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>PERSONALIZED AI INTERVIEW ROOM</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white">General Technical & Behavioral Interview</h2>
        <p className="text-sm text-slate-400 mt-1">
          Step 6 of 11 — Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="glass-card p-6 rounded-2xl mb-6 space-y-4 border border-indigo-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
              {currentQ.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">Focus: {currentQ.focus}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl mt-1">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-relaxed">{currentQ.question}</h3>
              {currentQ.eval_criteria && (
                <p className="text-xs text-slate-400 mt-2 italic">Evaluation Focus: {currentQ.eval_criteria}</p>
              )}
            </div>
          </div>

          {/* Answer Input */}
          <div className="pt-4">
            <label className="text-xs font-semibold text-slate-300 mb-2 block">
              Your Answer (Provide detailed technical rationale or STAR method response):
            </label>
            <textarea
              rows={6}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your structured answer here..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentIndex === 0}
              onClick={() => {
                setCurrentIndex(currentIndex - 1);
                setCurrentAnswer(answers[questions[currentIndex - 1]?.id]?.answer || '');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold disabled:opacity-40"
            >
              Previous Question
            </button>

            {isLast ? (
              <button
                onClick={handleFinishInterview}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <span>Submit All Answers for Evaluation</span>
                <CheckCircle className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveAnswer}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <span>Save & Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
