import React, { useState } from 'react';
import { Upload, FileText, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import Alert from '../components/Alert';

export default function UploadResumePage({ nextStep, setResumeData }) {
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleResumeText = `John Doe
Email: john.doe@example.com | Phone: (555) 019-2834
Target Role: Senior Full-Stack Software Engineer

SUMMARY:
Results-driven Full-Stack Engineer with 3+ years of experience building web applications using React.js, Node.js, Python, JavaScript, and Tailwind CSS. Proven track record in REST API design, database architecture (PostgreSQL, Supabase), and integrating AI services (Google Gemini API).

TECHNICAL SKILLS:
- Frontend: React.js, JavaScript, HTML5, CSS3, Tailwind CSS, Vite
- Backend: Node.js, Express.js, Python, REST APIs
- Databases: PostgreSQL, Supabase, MongoDB
- AI & Tools: Google Gemini API, Git, Docker, System Architecture, Agile

EXPERIENCE:
Full-Stack Developer | Tech Solutions Inc. (2024 - Present)
- Architected candidate screening micro-features boosting parsing accuracy by 35%.
- Integrated Python text processing script pipelines for PDF & DOCX resume analysis.

PROJECTS:
1. AI Interview Prep Platform - Built React + Express app with Gemini API for dynamic mock interview evaluations.
2. Real-Time Collaborative Canvas - Developed WebSockets server handling 500+ concurrent state updates.

EDUCATION:
B.Tech in Computer Science & Engineering | Top Technical University (2020 - 2024)`;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleLoadSample = () => {
    setManualText(sampleResumeText);
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !manualText.trim()) {
      setError("Please select a resume file (PDF, DOCX, TXT) or paste resume text.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        result = await apiService.uploadResume(formData);
      } else {
        result = await apiService.uploadResume(manualText);
      }

      if (result.success) {
        setResumeData(result);
        nextStep();
      } else {
        setError(result.error || "Failed to process resume.");
      }
    } catch (err) {
      setError(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">Upload Your Resume</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 2 of 11 — PDF, DOCX, or TXT formats supported for AI extraction.
        </p>
      </div>

      {error && <Alert type="warning" title="Upload Notice" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Drag & Drop Box */}
        <div className="glass-card p-8 rounded-2xl text-center border-2 border-dashed border-slate-700 hover:border-indigo-500/60 transition-all cursor-pointer relative">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Upload className="h-8 w-8" />
            </div>
            {file ? (
              <div>
                <p className="text-base font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB • Click to change</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-200">Drag & drop your resume here, or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 my-4">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-xs text-slate-500 font-mono">OR PASTE TEXT</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Manual Text Fallback */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              Resume Raw Text Preview / Manual Input
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
            >
              <Sparkles className="h-3 w-3" />
              Load Sample Resume
            </button>
          </div>
          <textarea
            rows={8}
            value={manualText}
            onChange={(e) => {
              setManualText(e.target.value);
              setFile(null);
            }}
            placeholder="Paste your resume text here..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Resume with Python AI Engine...</span>
            </>
          ) : (
            <>
              <span>Extract Candidate Profile</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
