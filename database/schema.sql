-- ===================================================
-- TECH TITANS - SUPABASE SQL DATABASE SCHEMA
-- ===================================================

-- 1. Candidates / Users Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    target_role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    raw_text TEXT NOT NULL,
    parsed_profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Job Descriptions Table
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    raw_text TEXT NOT NULL,
    extracted_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ATS Analyses Table
CREATE TABLE IF NOT EXISTS ats_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    overall_match_score NUMERIC(5, 2) NOT NULL,
    category_scores JSONB NOT NULL,
    matched_skills JSONB,
    missing_skills JSONB,
    improvement_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. General AI Interviews Table
CREATE TABLE IF NOT EXISTS general_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    questions JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Interview Responses & Evaluations Table
CREATE TABLE IF NOT EXISTS interview_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES general_interviews(id) ON DELETE CASCADE,
    responses JSONB NOT NULL,
    overall_interview_score NUMERIC(5, 2) NOT NULL,
    communication_score NUMERIC(5, 2),
    technical_score NUMERIC(5, 2),
    feedback_summary JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Companies & Company Coding Dataset Table
CREATE TABLE IF NOT EXISTS company_coding_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    question_title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    problem_statement TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    sample_cases JSONB NOT NULL,
    evaluation_criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Personalized Coding Sessions & Evaluations Table
CREATE TABLE IF NOT EXISTS coding_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    question_id UUID REFERENCES company_coding_questions(id),
    submitted_code TEXT NOT NULL,
    programming_language VARCHAR(50) NOT NULL,
    code_execution_score NUMERIC(5, 2) NOT NULL,
    code_quality_score NUMERIC(5, 2),
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    feedback JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Final Combined Scorecards Table
CREATE TABLE IF NOT EXISTS final_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    ats_score NUMERIC(5, 2) NOT NULL,
    general_interview_score NUMERIC(5, 2) NOT NULL,
    coding_score NUMERIC(5, 2) NOT NULL,
    final_readiness_score NUMERIC(5, 2) NOT NULL,
    readiness_level VARCHAR(100) NOT NULL,
    executive_summary TEXT NOT NULL,
    actionable_roadmap JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security) policies (Optional / Public read for demo)
ALTER TABLE company_coding_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to company coding questions" 
    ON company_coding_questions FOR SELECT USING (true);
