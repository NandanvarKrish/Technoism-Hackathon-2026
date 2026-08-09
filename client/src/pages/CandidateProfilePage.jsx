import React from 'react';
import { User, Code, GraduationCap, Briefcase, FolderGit2, ArrowRight } from 'lucide-react';

export default function CandidateProfilePage({ nextStep, resumeData, jdData }) {
  const profile = resumeData?.parsed_profile || {
    name: "John Doe",
    email: "john.doe@example.com",
    skills: ["React.js", "Node.js", "JavaScript", "Python", "Tailwind CSS", "REST API", "PostgreSQL", "Supabase", "Gemini API"],
    experience: ["Full-Stack Developer | Tech Solutions Inc."],
    education: ["B.Tech in Computer Science"],
    projects: ["AI Interview Prep Platform", "Real-Time Collaborative Canvas"]
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-white">Candidate Profile Overview</h2>
        <p className="text-sm text-slate-400 mt-2">
          Step 4 of 11 — Verified profile extracted by Python AI parser.
        </p>
      </div>

      <div className="space-y-6">
        {/* Candidate Header Card */}
        <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{profile.name}</h3>
              <p className="text-xs text-slate-400">{profile.email} • {profile.phone || 'N/A'}</p>
              <span className="inline-block mt-2 bg-indigo-500/10 text-indigo-300 text-xs font-mono px-3 py-1 rounded-full border border-indigo-500/20">
                Target Role: {jdData?.target_role || 'Senior Full-Stack Engineer'}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Code className="h-4 w-4 text-indigo-400" />
            Extracted Technical Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.map((skill, idx) => (
              <span key={idx} className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-mono">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience & Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-400" />
              Work Experience Highlights
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {profile.experience?.map((exp, idx) => (
                <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {exp}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-pink-400" />
              Key Projects
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {profile.projects?.map((proj, idx) => (
                <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {proj}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Education */}
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-400" />
            Education Background
          </h4>
          <p className="text-xs text-slate-300">
            {profile.education?.join(" • ") || "B.Tech in Computer Science & Engineering"}
          </p>
        </div>

        <button
          onClick={nextStep}
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <span>Run ATS Gap Match Analysis</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
