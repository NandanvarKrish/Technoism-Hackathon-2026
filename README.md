# TECH TITANS — AI Interview Preparation Platform

> **Tech Titans** is a fully functional, end-to-end AI-powered interview preparation web application designed for high-performance candidate screening, personalized mock interviews, and company-specific coding rounds.

Built by **Tech Titans Team** for **TECHNOISM Hackathon 2026**.

---

## Architecture & Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, HTML5, JavaScript (ES6+)
- **Backend**: Node.js, Express.js (REST APIs, Multer file upload, child_process IPC bridge)
- **AI Processing**: Python Engine (`resume_parser.py`, `ai_engine.py`, `interview_ai.py`, `coding_ai.py`)
- **AI Service**: Google Gemini API via Google AI Studio (`gemini-2.5-flash`)
- **Database**: Supabase SQL Database (with local session storage fallback)
- **Data Exchange**: Structured JSON

---

## Directory Structure

```
tech-titans/
│
├── client/                     # React + Tailwind CSS Frontend
│   ├── public/
│   └── src/
│       ├── components/         # Header, StepIndicator, StatusCard, Alert
│       ├── pages/              # 11 Journey Page Views
│       │   ├── LandingPage.jsx
│       │   ├── UploadResumePage.jsx
│       │   ├── JobDescriptionPage.jsx
│       │   ├── CandidateProfilePage.jsx
│       │   ├── AtsAnalysisPage.jsx
│       │   ├── GeneralInterviewPage.jsx
│       │   ├── GeneralEvaluationPage.jsx
│       │   ├── CompanySelectionPage.jsx
│       │   ├── CodingRoundPage.jsx
│       │   ├── CodingEvaluationPage.jsx
│       │   └── FinalScorecardPage.jsx
│       ├── services/           # REST API client (api.js)
│       ├── App.jsx             # State store & step router
│       ├── main.jsx            # React root entry
│       └── index.css           # Design tokens & glassmorphism CSS
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js          # API proxy to Express backend
│
├── server/                     # Node.js + Express REST API Server
│   ├── routes/                 # Express API router (api.js)
│   ├── controllers/            # Resume, ATS, Interview, Coding, Supabase controllers
│   ├── services/               # pythonService (spawn IPC), supabaseService
│   ├── uploads/                # Resume document storage
│   ├── data/                   # Seed company coding datasets (company_questions.json)
│   ├── package.json
│   └── server.js               # Server entry point (Port 5000)
│
├── python/                     # Python AI Engine
│   ├── resume_parser.py        # PDF/DOCX/TXT text & profile extraction
│   ├── ai_engine.py            # Gemini API wrapper with fallback
│   ├── interview_ai.py         # ATS gap analysis & personalized interview AI
│   ├── coding_ai.py            # Personalized company coding generator & code evaluator
│   └── requirements.txt
│
├── database/                   # Database Layer
│   └── schema.sql              # Supabase database schema
│
├── scripts/                    # Utility Scripts
│   └── import-company-questions.js # Seed company questions dataset
│
├── .env.example                # Environment variables template
├── package.json                # Monorepo root workspace runner
└── README.md                   # System documentation
```

---

## 11-Step Application Journey

1. **Landing Page**: Platform overview & value proposition
2. **Upload Resume**: PDF, DOCX, TXT drag-and-drop or manual text input
3. **Job Description**: Target role title & job description entry
4. **Candidate Profile**: Extracted technical profile review
5. **ATS Analysis**: Weighted compatibility score & missing skill vector analysis
6. **Personalized General AI Interview**: Adaptively generated questions based on profile & gaps
7. **General Interview Evaluation**: Scoring of communication, technical accuracy, & strengths
8. **Company Selection**: Choose target company (Google, Amazon, Microsoft, Meta)
9. **Personalized Company Coding Round**: Code editor with starter code & sample test cases
10. **Coding Evaluation**: Automated execution, complexity analysis, & code quality review
11. **Final Scorecard**: Combined Readiness Score (30% ATS + 35% Interview + 35% Code) & persistence

---

## Getting Started & Running the Project

### Prerequisites
- Node.js (v18+) & `npm`
- Python (3.9+) with `pip`

### Step 1: Install Dependencies
From the project root workspace directory:
```bash
npm run install:all
```

Or install separately:
```bash
# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install

# Python dependencies
cd ../python && pip install -r requirements.txt
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
(Set your `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` if available. The platform includes full deterministic fallback if keys are omitted.)

### Step 3: Run Full Stack Concurrently
From the root workspace directory:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Backend Health Check**: `http://localhost:5000/api/health`

---

## Inter-Layer Communications Summary

1. **Frontend to Backend**: React communicates with Node.js/Express over HTTP JSON REST APIs (`/api/*`). Vite proxies `/api` requests to Express on port 5000.
2. **Node.js to Python**: Express spawns Python child processes (`child_process.spawn`) executing Python scripts via JSON IPC, passing payloads as stdin/args and parsing stdout JSON output.
3. **Python to Gemini API**: Python calls Google Gemini API (`gemini-2.5-flash`) securely on the server side using server-side environment credentials (`GEMINI_API_KEY`).
4. **Supabase Integration**: Express backend connects via `@supabase/supabase-js` to persist candidate scorecards and retrieve coding datasets, falling back gracefully to local session memory if credentials are not configured.
