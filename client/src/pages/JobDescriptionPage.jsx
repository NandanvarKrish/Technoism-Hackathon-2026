import React, { useState } from 'react';
import { Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import Alert from '../components/Alert';

export default function JobDescriptionPage({ nextStep, setJdData }) {
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [error, setError] = useState(null);

  const sampleJd = `Target Role: Senior Full-Stack Engineer (React, Node.js, Python, AI Integrations)
Company: Tech Titans Global Inc.

JOB OVERVIEW:
We are seeking an exceptional Senior Full-Stack Engineer to build scalable AI-driven applications. You will collaborate closely with product management and AI research teams to deliver intuitive web interfaces and high-performance backend microservices.

KEY RESPONSIBILITIES:
- Architect responsive React.js frontends powered by Tailwind CSS and Vite.
- Build resilient REST APIs using Node.js, Express, and Python backend services.
- Integrate Google Gemini API and LLM workflows securely on server infrastructure.
- Design database schemas in PostgreSQL and Supabase.
- Conduct code reviews, establish system architecture standards, and mentor junior developers.

REQUIRED QUALIFICATIONS & SKILLS:
- 3+ years of experience with React.js, JavaScript (ES6+), HTML5, CSS3, and Tailwind CSS.
- Proven experience with Node.js, Express.js, and Python.
- Strong understanding of RESTful API design, HTTP protocols, and async execution.
- Hands-on experience with SQL databases, PostgreSQL, and Supabase.
- Familiarity with System Design principles, Docker, Git, and CI/CD pipelines.`;

  const handleLoadSample = () => {
    setTargetRole('Senior Full-Stack Engineer');
    setJobDescription(sampleJd);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Please enter or paste the target job description.");
      return;
    }

    setJdData({
      target_role: targetRole,
      job_description: jobDescription
    });
    nextStep();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">Target Job Description</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 3 of 11 — Paste the target position details to drive ATS matching & personalized questions.
        </p>
      </div>

      {error && <Alert type="warning" title="Required Field" message={error} />}

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-2xl space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-400" />
            Target Role Title
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer, Frontend Lead, Python AI Developer"
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Job Description / Requirements Text
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
            >
              <Sparkles className="h-3 w-3" />
              Load Sample Job
            </button>
          </div>
          <textarea
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job requirements, skills, responsibilities..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>View Extracted Candidate Profile</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
