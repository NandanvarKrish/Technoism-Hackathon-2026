# TECH TITANS — IMPLEMENTATION AUDIT & BACKEND INTEGRATION PLAN

> **Project Name**: TECHNOISM 2026 — AI Resume Screening & Mock Interview Platform  
> **UI Status**: LOCKED / FROZEN (Strictly preserving DOM structure, CSS design tokens, typography, and visual components)  
> **Audit Date**: August 9, 2026  

---

## 1. Current Functionality

The application is currently a fully interactive, local-first single-page web app built with Vanilla HTML5, CSS3 (using custom properties in `css/design-tokens.css` and glassmorphic styling in `css/main.css`), and JavaScript ES6+.

### Core Functional Capabilities Implemented
1. **Single-Page Application Router**: 
   - Managed via `window.AppState` (in `js/state.js`) with an observable pub/sub event mechanism (`subscribe`, `notify`, `setState`).
   - Navigates seamlessly across 6 screens (`landing`, `upload`, `job`, `ats`, `interview`, `report`).
2. **Client-Side Document Text Extraction**:
   - `js/resume-parser.js` extracts text from uploaded PDF files page-by-page using **PDF.js** (`window.pdfjsLib`).
   - Extracts raw text from Word `.docx` documents using **Mammoth.js** (`window.mammoth`).
   - Supports plain text `.txt` files and manual text pasting.
   - Includes real-time character count and word count inspection drawer (`#text-preview-card`).
3. **Explainable Deterministic ATS Matching Engine**:
   - `js/ats-engine.js` categorizes requirements into 4 weighted areas:
     - **Core Skills**: 45%
     - **Tools & Technologies**: 20%
     - **Experience & Projects**: 20%
     - **Education & Requirements**: 15%
   - Evaluates keyword matches against normalized text and generates category breakdown percentages, matched tags, missing tags, strengths, and actionable suggestions.
4. **Interactive AI Mock Interview Room**:
   - Setup view allowing candidates to select 3-question or 5-question mock sessions.
   - Text-to-Speech (TTS) integration using browser `SpeechSynthesisUtterance` for reading questions aloud.
   - Voice Dictation input using browser `webkitSpeechRecognition` with visual mic state indicators.
   - Per-question evaluation drawer assessing answers for **Relevance**, **Clarity**, and **Structure**, giving specific strengths, improvements, and next-action tips.
5. **Consolidated Candidate Readiness Scorecard**:
   - `js/report.js` calculates overall readiness score weighted as **45% ATS Match Score + 55% Mock Interview Score**.
   - Categorizes readiness into levels (*High Readiness*, *Job Ready*, *Needs Development*) and aggregates overall strengths, gaps, and concrete next actions.
6. **Accessibility & Responsive Layout**:
   - Keyboard navigation shortcuts (e.g. `Escape` key clears global errors).
   - Glassmorphic UI cards, sticky header, progress pills, custom form controls, and loading overlays.

---

## 2. Simulated / Mock Functionality

To run offline without backend dependency during prototyping, the application currently simulates AI latency and responses:

1. **Simulated AI Latency (`setTimeout`)**:
   - `js/ai-service.js` uses `setTimeout` delays (300ms–400ms) to emulate async network communication:
     - `executeQuestionGenerationRequest`: 400ms delay.
     - `executeAiRequestWithRetry`: 300ms delay.
     - `executeAnswerEvaluationRequest`: 400ms delay.
2. **Static Fallback Question Database (`fallbackQuestionDatabase`)**:
   - 35 hardcoded questions categorized under 7 role keys (`frontend`, `backend`, `fullstack`, `data-analyst`, `aiml`, `software-engineer`, `fresher-hr`).
3. **Template Question Tailoring**:
   - `executeQuestionGenerationRequest` replaces question 0 and 1 with string-interpolated templates using `targetRole` and `jobDescription` rather than invoking a live LLM model.
4. **Local Heuristic Answer Evaluation Rubric (`evaluateLocalRubric`)**:
   - Evaluates candidate answers locally based on word count thresholds, keyword matching for STAR methodology (`situation`, `task`, `action`, `result`), and role terms, instead of performing true LLM semantic analysis.
5. **Simulated Semantic ATS Enhancements**:
   - `executeAiRequestWithRetry` appends a static string summary: `"AI evaluated candidate resume against ${targetRole} requirements..."` to the deterministic ATS engine output.
6. **`localStorage`-Only Persistence**:
   - `js/state.js` persists session state under `localStorage` key `'technoism_app_state'`.
   - `js/ai-service.js` caches query outputs in `localStorage` under `ai_cache_*`.
7. **Demo Sample Data**:
   - `data/sample-data.js` provides static sample resume text (Nandan Shah) and job description (Associate Frontend & Full-Stack Developer) injected via `#btn-use-sample-resume` and `#btn-use-sample-job`.

---

## 3. Missing Functionality & Backend Integration Requirements

The following components are required to make the prototype a real, production-ready full-stack application:

1. **REST API Server (Node.js/Express)**:
   - Live HTTP API endpoints handling document parsing, ATS analysis, question generation, answer evaluation, company coding challenges, and scorecard storage.
2. **Real AI Engine (Google Gemini 2.5 Flash / Server-side Python)**:
   - Server-side invocation of `GEMINI_API_KEY` for deep semantic ATS matching, dynamic non-canned question generation, and real-time response feedback.
3. **Database Layer (Supabase / PostgreSQL)**:
   - SQL schema storing candidate profiles, parsed resumes, ATS evaluations, interview Q&A logs, and company coding challenge datasets.
4. **Company Coding Round (Screens S08–S10)**:
   - Company selection view (Google, Amazon, Microsoft, Meta).
   - Code editor component styled with `--color-deep-blue` design tokens.
   - Code execution engine for running test cases safely.
5. **Candidate Authentication & Multi-Session Support**:
   - Multi-tenant candidate login/signup and session tracking.

---

## 4. Existing UI Screens

| Screen ID | Title / Purpose | Main Container ID | Active Components |
|---|---|---|---|
| **S01** | Landing Page | `#screen-landing` | Hero banner, CTA button, ATS match scorecard preview card, feature grid |
| **S02** | Upload Resume | `#screen-upload` | Drag & drop dropzone, file status card, extracted text preview textarea with metrics, sample data button, manual text drawer |
| **S03** | Target Job Description | `#screen-job` | Target role input, job description textarea, sample job button, analyze CTA button |
| **S04** | ATS Match Scorecard | `#screen-ats` | Match score badge, 4 weighted category progress bars, matched/missing skill tags, strengths/suggestions lists |
| **S05** | Mock Interview Room | `#screen-interview` | Setup view (question count radio selector), interview room (progress bar, question card, TTS button, voice dictation toggle, answer input, evaluation feedback drawer) |
| **S06** | Final Scorecard | `#screen-report` | Overall readiness score badge, ATS & interview score breakdown cards, sub-metric indicators, aggregated strengths, gaps, and next action recommendations |

---

## 5. Existing Element IDs & CSS Classes to Preserve (UI Lock)

All existing element IDs, CSS custom properties, and class names must be preserved without modification:

### CSS Design Tokens (`css/design-tokens.css`)
- `--font-heading`, `--font-body`, `--font-ui`, `--font-mono`
- `--color-deep-blue` (`#293681`), `--color-action-blue` (`#4274D9`), `--color-light-cyan` (`#95CCDD`), `--color-pale-aqua` (`#D0E7E6`)
- `--color-bg-main`, `--color-bg-card`, `--color-text-main`, `--color-text-muted`
- `--color-success`, `--color-warning`, `--color-error`
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-action`

### DOM Element IDs (`index.html`)
- **Navigation & Header**: `#brand-logo-link`, `.step-pill`, `#btn-reset-demo`
- **Error Banner**: `#global-error-box`, `#error-message-text`, `#error-details-text`, `#btn-dismiss-error`
- **S01 Landing**: `#screen-landing`, `#btn-start-analysis`
- **S02 Upload**: `#screen-upload`, `#upload-drop-zone`, `#resume-file-input`, `#btn-browse-file`, `#file-status-card`, `#selected-file-name`, `#selected-file-source`, `#file-status-tag`, `#text-preview-card`, `#preview-char-count`, `#preview-word-count`, `#extracted-text-preview`, `#btn-use-sample-resume`, `#btn-upload-continue`, `#btn-toggle-manual-text`, `#manual-text-area`, `#manual-resume-textarea`, `#btn-save-manual-text`
- **S03 Job**: `#screen-job`, `#target-role-input`, `#job-desc-textarea`, `#btn-use-sample-job`, `#btn-analyze-job`
- **S04 ATS**: `#screen-ats`, `#ats-role-label`, `#btn-start-interview-setup`, `#ats-score-number`, `#category-breakdown-container`, `#matched-skills-container`, `#missing-skills-container`, `#ats-strengths-list`, `#ats-suggestions-list`
- **S05 Interview**: `#screen-interview`, `#interview-setup-card`, `#setup-target-role-title`, `#opt-q3`, `#opt-q5`, `#btn-back-to-ats`, `#btn-start-interview-session`, `#interview-room-card`, `#question-counter-badge`, `#btn-exit-interview`, `#interview-progress-fill`, `#question-index-label`, `#question-difficulty-tag`, `#question-focus-tag`, `#btn-read-aloud`, `#question-text-display`, `#answer-input-group`, `#mic-status-label`, `#btn-mic-toggle`, `#interview-answer-textarea`, `#answer-word-count`, `#answer-evaluation-card`, `#eval-score-badge`, `#eval-score-label`, `#eval-relevance-metric`, `#eval-clarity-metric`, `#eval-structure-metric`, `#eval-candidate-said-text`, `#eval-strengths-list`, `#eval-improvements-list`, `#eval-next-tip-text`, `#btn-submit-answer`, `#btn-next-question`
- **S06 Report**: `#screen-report`, `#report-target-role-label`, `#final-ats-score`, `#final-interview-score`, `#final-readiness-score`, `#final-readiness-level`, `#report-relevance-score`, `#report-clarity-score`, `#report-structure-score`, `#final-strengths-list`, `#final-gaps-list`, `#final-actions-list`, `#btn-try-another-role`, `#btn-restart-analysis`
- **Global Loading**: `#global-loading-overlay`, `#loading-message`

---

## 6. Recommended Backend Integration Points

To transition to a real backend without breaking the existing interface, `js/ai-service.js` will serve as the primary API client layer with standard fallback:

```
[ Frontend UI ]
       │
       ▼
[ js/ai-service.js API Bridge ]
       │
   ┌───┴────────────────────────┐
   │ Check API Availability      │
   └───┬────────────────────┬───┘
       │ (Backend Active)   │ (Offline / Fallback)
       ▼                    ▼
[ Node.js/Express API ]  [ Local Engine ]
       │
       ▼
[ Python Gemini AI ]
```

### Proposed API Endpoints
1. `POST /api/parse-resume`: Multipart resume file upload & server-side text extraction.
2. `POST /api/ats-analyze`: Payload `{ resumeText, jobDescription, targetRole }` → Returns ATS score, weighted categories, matched/missing skills.
3. `POST /api/generate-questions`: Payload `{ targetRole, jobDescription, resumeText, questionCount }` → Returns Gemini-generated interview questions array.
4. `POST /api/evaluate-answer`: Payload `{ questionObj, candidateAnswer, targetRole, resumeText, jobDescription }` → Returns structured evaluation JSON.
5. `POST /api/company-coding`: Payload `{ companyName }` → Returns coding challenges.
6. `POST /api/execute-code`: Payload `{ code, language, testCases }` → Returns test case execution results.
7. `POST /api/final-scorecard`: Payload `{ sessionData }` → Saves final report to Supabase/PostgreSQL.

---

## 7. Recommended Database Integration Points

Database Schema design for Supabase SQL / PostgreSQL:

```sql
-- Candidates Table
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id),
    file_name VARCHAR(255),
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ATS Matching Evaluations Table
CREATE TABLE ats_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES resumes(id),
    target_role VARCHAR(255),
    job_description TEXT,
    match_score INT,
    category_breakdown JSONB,
    matched_skills JSONB,
    missing_skills JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Sessions Table
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id),
    target_role VARCHAR(255),
    question_count INT,
    overall_score INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Questions & Answers Log Table
CREATE TABLE interview_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES interview_sessions(id),
    question_text TEXT,
    difficulty VARCHAR(50),
    focus VARCHAR(100),
    candidate_answer TEXT,
    relevance_score INT,
    clarity_score INT,
    structure_score INT,
    evaluation_detail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Final Consolidated Scorecards Table
CREATE TABLE final_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id),
    ats_score INT,
    interview_score INT,
    readiness_score INT,
    readiness_level VARCHAR(100),
    report_detail JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 8. Company Coding Integration Requirements

When adding the Company Coding features:
1. **Preserve Design Language**: Use existing design tokens (`--color-deep-blue`, `--color-action-blue`, `--color-pale-aqua`) and glassmorphic card styling.
2. **Non-Breaking Navigation Extension**: Append Company Selection & Coding steps after Mock Interview / ATS Analysis without altering existing steps S01–S06.
3. **Consolidated Readiness Formula Update**:
   $$\text{Readiness Score} = (0.30 \times \text{ATS Score}) + (0.35 \times \text{Interview Score}) + (0.35 \times \text{Coding Score})$$

---

## 9. Safe Structural Changes Made (Phase 1)

1. **Extensible API Service Layer (`js/ai-service.js`)**:
   - Added backend API client configuration block (`config.useBackend`, `config.backendUrl`).
   - Integrated transparent HTTP fetch handlers for backend integration while keeping robust local fallback logic.
2. **Fixed Code Quality & Reference Issues (`js/app.js`)**:
   - Resolved undeclared `optQ1` ReferenceError on radio option selection.
   - Cleaned up event handler error propagation.
3. **State Store Modularization (`js/state.js`)**:
   - Ensured atomic state updates and backward-compatible persistence payload structure.

---
*The existing UI/UX is 100% locked. All changes maintain exact visual fidelity and DOM compatibility.*
