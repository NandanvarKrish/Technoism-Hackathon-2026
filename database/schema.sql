-- ==================================================
-- TECH TITANS — SUPABASE SQL DATABASE SCHEMA
-- ==================================================

-- 1. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    extracted_text TEXT NOT NULL,
    char_count INT,
    word_count INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ATS Compatibility Scorecards Table
CREATE TABLE IF NOT EXISTS ats_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    overall_score INT NOT NULL,
    category_breakdown JSONB NOT NULL,
    matched_skills JSONB,
    missing_skills JSONB,
    strengths JSONB,
    suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. AI Mock Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    question_count INT DEFAULT 3,
    overall_score INT,
    relevance_score INT,
    clarity_score INT,
    structure_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Interview Q&A Log Table
CREATE TABLE IF NOT EXISTS interview_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    difficulty VARCHAR(50),
    focus VARCHAR(100),
    candidate_answer TEXT,
    answer_score INT,
    relevance INT,
    clarity INT,
    structure INT,
    evaluation_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Company Coding Dataset Table
CREATE TABLE IF NOT EXISTS company_questions (
    id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    description TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    test_cases JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Coding Submissions Log Table
CREATE TABLE IF NOT EXISTS coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    problem_id VARCHAR(100) REFERENCES company_questions(id),
    code_submitted TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'javascript',
    status VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    runtime_ms INT,
    evaluation_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Final Consolidated Scorecards Table
CREATE TABLE IF NOT EXISTS final_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    ats_score INT NOT NULL,
    interview_score INT NOT NULL,
    coding_score INT NOT NULL,
    readiness_score INT NOT NULL,
    readiness_level VARCHAR(100) NOT NULL,
    report_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
