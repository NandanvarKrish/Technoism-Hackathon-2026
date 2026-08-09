-- ====================================================================
-- TECHNOISM HACKATHON 2026 — SUPABASE RELATIONAL DATABASE SCHEMA
-- Authoritative Schema for End-to-End Candidate Preparation Pipeline
-- ====================================================================

-- 1. Sessions Table (Central State & Pipeline Status Tracker)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) DEFAULT 'anonymous_candidate',
    resume_completed BOOLEAN DEFAULT FALSE,
    ats_completed BOOLEAN DEFAULT FALSE,
    general_interview_completed BOOLEAN DEFAULT FALSE,
    coding_round_started BOOLEAN DEFAULT FALSE,
    coding_round_completed BOOLEAN DEFAULT FALSE,
    final_report_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at);

-- 2. Resumes Table (Extracted Document Text & File Metadata)
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'pdf',
    extracted_text TEXT NOT NULL,
    char_count INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_session_id ON resumes(session_id);

-- 3. Candidate Profiles Table (Structured Candidate Extraction)
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    name VARCHAR(255),
    headline VARCHAR(255),
    detected_role VARCHAR(255),
    skills JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_session_id ON candidate_profiles(session_id);

-- 4. Job Descriptions Table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    target_role VARCHAR(255),
    job_title VARCHAR(255),
    job_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_descriptions_session_id ON job_descriptions(session_id);

-- 5. ATS Analyses Table (Resume-Driven Scorecard Results)
CREATE TABLE IF NOT EXISTS ats_analyses (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    category_scores JSONB NOT NULL,
    categories JSONB DEFAULT '[]'::jsonb,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    partial_matches JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    source VARCHAR(100) DEFAULT 'Gemini 2.5 Flash AI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ats_analyses_session_id ON ats_analyses(session_id);

-- 6. Interviews Table (General AI Mock Interview Session)
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    target_role VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    total_questions INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interviews_session_id ON interviews(session_id);

-- 7. Interview Questions Table (Personalized Evidence-Backed Questions)
CREATE TABLE IF NOT EXISTS interview_questions (
    id VARCHAR(64) PRIMARY KEY,
    interview_id VARCHAR(64) NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'technical',
    difficulty VARCHAR(50) DEFAULT 'Medium',
    focus VARCHAR(100),
    source_evidence TEXT,
    is_fallback BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);

-- 8. Interview Answers Table (Candidate Response Texts)
CREATE TABLE IF NOT EXISTS interview_answers (
    id VARCHAR(64) PRIMARY KEY,
    interview_id VARCHAR(64) NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    candidate_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);

-- 9. Interview Evaluations Table (Semantic AI Question Feedback)
CREATE TABLE IF NOT EXISTS interview_evaluations (
    id VARCHAR(64) PRIMARY KEY,
    interview_id VARCHAR(64) NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    answer_id VARCHAR(64) NOT NULL REFERENCES interview_answers(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    relevance INTEGER NOT NULL,
    clarity INTEGER NOT NULL,
    structure INTEGER NOT NULL,
    technical_accuracy INTEGER NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    improvements JSONB DEFAULT '[]'::jsonb,
    next_tip TEXT,
    follow_up_needed BOOLEAN DEFAULT FALSE,
    follow_up_reason TEXT,
    follow_up_question TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_interview_evaluations_interview_id ON interview_evaluations(interview_id);

-- 10. Companies Table (Target Employer Dataset)
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    question_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Coding Questions Table (LeetCode Company Question Dataset)
CREATE TABLE IF NOT EXISTS coding_questions (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Medium',
    topic VARCHAR(100),
    source_url TEXT,
    description TEXT,
    starter_code TEXT,
    test_cases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Company Question Relations Table
CREATE TABLE IF NOT EXISTS company_question_relations (
    id VARCHAR(64) PRIMARY KEY,
    company_id VARCHAR(64) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    question_id VARCHAR(64) NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
    time_window VARCHAR(50) DEFAULT 'All Time',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_company_question UNIQUE(company_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_cq_relations_company ON company_question_relations(company_id);

-- 13. Coding Sessions Table (Company Coding Round Instance)
CREATE TABLE IF NOT EXISTS coding_sessions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    company_id VARCHAR(64) NOT NULL,
    question_id VARCHAR(64) NOT NULL,
    selection_reason TEXT,
    status VARCHAR(50) DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_coding_sessions_session_id ON coding_sessions(session_id);

-- 14. Coding Submissions Table (Execution Attempts & Sandbox Output)
CREATE TABLE IF NOT EXISTS coding_submissions (
    id VARCHAR(64) PRIMARY KEY,
    coding_session_id VARCHAR(64) NOT NULL REFERENCES coding_sessions(id) ON DELETE CASCADE,
    source_code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'javascript',
    attempts INTEGER DEFAULT 1,
    status VARCHAR(50) NOT NULL,
    passed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coding_submissions_cs_id ON coding_submissions(coding_session_id);

-- 15. Coding Results Table (Final Coding Performance Tier)
CREATE TABLE IF NOT EXISTS coding_results (
    id VARCHAR(64) PRIMARY KEY,
    coding_session_id VARCHAR(64) NOT NULL REFERENCES coding_sessions(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    time_complexity VARCHAR(50) DEFAULT 'O(N)',
    space_complexity VARCHAR(50) DEFAULT 'O(1)',
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Final Reports Table (Consolidated Evaluation Scorecard)
CREATE TABLE IF NOT EXISTS final_reports (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
    ats_score INTEGER NOT NULL,
    interview_score INTEGER NOT NULL,
    coding_score INTEGER NOT NULL,
    readiness_score INTEGER NOT NULL,
    readiness_level VARCHAR(100) NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    gaps JSONB DEFAULT '[]'::jsonb,
    next_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_final_reports_session_id ON final_reports(session_id);
