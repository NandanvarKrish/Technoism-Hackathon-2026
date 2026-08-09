# TECH TITANS — AI Candidate Screening, Mock Interview & Coding Assessment Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)](https://expressjs.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange.svg)](https://deepmind.google/technologies/gemini/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_Relational_DB-emerald.svg)](https://supabase.com/)

An enterprise-grade, end-to-end candidate preparation and evaluation platform built for **Technoism Hackathon 2026**.

The platform guides candidates through a **resume-driven preparation pipeline**: from multi-format resume parsing and automated role detection, through real Gemini 2.5 Flash ATS screening and personalized AI mock interviews, to isolated sandbox coding challenges and a final three-stage readiness scorecard.

---

## 🏆 Key Features

- **Automated Target Role & Profile Extraction**: Analyzes uploaded PDF/DOCX resumes automatically to extract Candidate Profile (skills, experience, projects) and primary role headline without requiring manual job description input.
- **Real Gemini 2.5 Flash ATS Scorecard**: Live Google Gemini 2.5 Flash integration evaluating 11 resume criteria with strict 10-field schema validation, transparent category breakdown, and honest `isFallback: true` labeling when offline.
- **Personalized General AI Mock Interview**: Dynamically generates tailored interview questions with `sourceEvidence` references tied directly to candidate resume projects and ATS audit gaps.
- **Dynamic Answer-Dependent Follow-Up Generator**: Probes deeper into candidate answers in real time based on what they type or say.
- **Company-Wise Problem Dataset & Personalized Recommendation**: Normalized LeetCode problem dataset across 6 major tech leaders (Google, Amazon, Microsoft, Meta, Apple, Netflix). Questions are ranked using candidate profile, detected role, ATS weaknesses, and interview performance tier.
- **Isolated VM Sandbox Code Execution Engine**: Safe execution environment supporting JavaScript, Python, Java, C++ with execution status output (`Accepted`, `Wrong Answer`, `Compile Error`, `Runtime Error`, `Time Limit Exceeded >2500ms`).
- **Final Three-Stage Scorecard (30% / 35% / 35%)**: Consolidated readiness score combining ATS Resume Fit (30%), General AI Mock Interview (35%), and Company Coding Round (35%) with performance-based personalized next actions.
- **Full Relational Server-Side Persistence (`database/schema.sql`)**: 16 relational database tables tracking session status flags across all 6 pipeline stages (`resumeCompleted`, `atsCompleted`, `generalInterviewCompleted`, `codingRoundStarted`, `codingRoundCompleted`, `finalReportAvailable`). Full session state recovery on browser refresh.
- **Locked Progression Security & Zero Key Exposure**: Backend route locking prevents skipping required stages. Gemini API keys and Supabase credentials are strictly protected on the backend.

---

## 🏗 System Architecture

```
[ Frontend Client (client/) ]
   ├── index.html (Clean 6-Step Layout)
   ├── css/ (design-tokens.css, main.css — Visual Identity Preserved)
   └── js/ (app.js, ui.js, ats-engine.js UMD, ai-service.js, report.js, config.js)
            │
            ▼ REST API HTTP Requests (port 5000)
[ Express API Server (server/server.js) ]
   ├── /api/ats/analyze ──────────> ATS Controller ─────> Google Gemini 2.5 Flash API
   ├── /api/interview/* ──────────> Interview Controller > Gemini Question & Evaluation
   ├── /api/companies/* ──────────> Company Controller ──> Normalized Question Dataset
   ├── /api/coding/* ─────────────> Coding Controller ───> Isolated VM Sandbox Context
   ├── /api/session/* ────────────> Session Controller ──> Relational DB Store (Supabase)
   └── /api/report/final ─────────> Report Controller ───> Weighted 3-Stage Scorecard
```

---

## 🛠 Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+ UMD Modules), Vanilla CSS (Custom Design System Design Tokens), FontAwesome icons, Monaco Editor.
- **Backend**: Node.js, Express.js.
- **AI Engine**: Google Gemini 2.5 Flash API (`v1beta/models/gemini-2.5-flash:generateContent`).
- **Document Parsing**: `pdf-parse` (PDF extraction) & `mammoth` (DOCX extraction).
- **Code Sandbox**: Isolated Node `vm` Context Execution Engine with 2500ms strict timeout.
- **Database / Persistence**: Supabase PostgreSQL Relational Schema (`database/schema.sql`) & file-backed store (`data/db-store.json`).

---

## 📂 Project Folder Structure

```
Technoism-Hackathon-2026/
├── client/                      # Frontend Application
│   ├── css/
│   │   ├── design-tokens.css    # Central Design System Variables
│   │   └── main.css             # Main Component Styles & Utility Classes
│   ├── js/
│   │   ├── config.js            # Frontend API Configuration & Score Weights
│   │   ├── app.js               # Application Controller & Navigation Router
│   │   ├── ui.js                # UI Rendering & DOM Handlers
│   │   ├── ats-engine.js        # Universal UMD ATS Engine Contract
│   │   ├── ai-service.js        # Backend API Service Fetcher
│   │   └── report.js            # Three-Stage Scorecard Builder
│   └── index.html               # Main Single-Page Interface
├── data/                        # Datasets & Persistent Data
│   ├── company-questions-normalized.json # Normalized LeetCode Dataset
│   └── db-store.json            # Relational Session Persistence File Store
├── database/                    # Database Architecture
│   └── schema.sql               # Authoritative 16-Table Supabase Relational Schema
├── python/                      # Python Utility Scripts
│   └── resume_parser.py         # Advanced Resume Parser Script
├── scripts/                     # Datasets & Automated Acceptance Verification Tests
│   ├── import-company-questions.js       # Dataset Normalization & Import Script
│   ├── test-flow-no-jd.js               # No-JD Flow Test
│   ├── test-ats-engine-contract.js      # AtsEngine Alias Contract Test
│   ├── test-personalized-interview.js   # Personalized Interview Test
│   ├── test-semantic-evaluation.js      # Semantic Evaluation Test
│   ├── test-company-questions-dataset.js# Dataset Search & Filters Test
│   ├── test-personalized-coding-round.js# Coding Round Gating & Personalization Test
│   ├── test-functional-coding-execution.js# Code Sandbox Execution Test
│   ├── test-supabase-persistence.js     # Relational Database & Recovery Test
│   ├── test-three-stage-scorecard.js    # Three-Stage Scorecard Test
│   ├── test-end-to-end-journey.js       # Complete End-to-End User Journey Test
│   └── test-final-qa-security-hardening.js # Master QA & Security Audit Suite
├── server/                      # Express Backend API Server
│   ├── controllers/
│   │   ├── atsController.js
│   │   ├── codingController.js
│   │   ├── companyController.js
│   │   ├── interviewController.js
│   │   ├── reportController.js
│   │   ├── resumeController.js
│   │   └── sessionController.js
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   └── dbStore.js
│   ├── package.json
│   └── server.js
├── .env.example                 # Environment Variables Template
├── package.json                 # Root Package Manifest
├── index.html                   # Root Client Entry Point
└── README.md                    # Project Documentation
```

---

## ⚡ Quick Start & Installation

### 1. Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### 2. Environment Setup
Copy `.env.example` to `.env` in root directory:
```bash
cp .env.example .env
```

Define environment variables:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3. Install Dependencies
Install server dependencies:
```bash
cd server
npm install
cd ..
```

### 4. Import Company Question Dataset
Initialize and normalize the LeetCode company problem dataset:
```bash
node scripts/import-company-questions.js
```

### 5. Start Application Server
Run Express backend API server on port 5000:
```bash
npm start
```
Access the application in browser at: `http://localhost:5000`

---

## 🧪 Run Automated Verification Tests

Execute the master QA and security audit suite:
```bash
node scripts/test-final-qa-security-hardening.js
```

Run specific stage tests:
```bash
node scripts/test-end-to-end-journey.js        # Complete 15-stage pipeline
node scripts/test-three-stage-scorecard.js    # 30/35/35 scorecard formula
node scripts/test-supabase-persistence.js     # Relational database & recovery
node scripts/test-functional-coding-execution.js # Isolated VM sandbox execution
```

---

## 🎯 Hackathon Demo Instructions (Judges Step-by-Step Flow)

### Candidate A vs Candidate B Demonstration

#### Candidate A Demo (Senior Full-Stack Developer):
1. **Resume Upload**: Upload Candidate A resume (`Senior React & Node Developer`).
2. **ATS Screening**: View automated target role detection (`Senior Full-Stack Developer`) and real Gemini ATS scorecard.
3. **General AI Mock Interview**: Start interview. Observe questions referencing Candidate A's React component architecture and state management with `sourceEvidence`.
4. **Answer & Evaluation**: Submit candidate answer. View live semantic score and technical accuracy (`85%`).
5. **Dynamic Follow-Up**: View dynamic follow-up question probing deeper into database indexing.
6. **Company Coding Round**: Select **Google**. View personalized problem recommendation (`"Two Sum"` - Array & Hash Table) selected specifically for Candidate A's role and ATS gaps.
7. **Sandbox Code Execution**: Run JavaScript solution in Monaco editor. Click **Submit** to view test results (`Accepted`, `Score: 95%`).
8. **Final Three-Stage Scorecard**: View weighted 3-stage readiness scorecard (`30% ATS + 35% Interview + 35% Coding`) and personalized next actions.

#### Candidate B Demo (Junior Data Analyst):
1. Repeat the exact same flow uploading Candidate B resume (`Junior Python & SQL Analyst`).
2. **Judges Verification**: Observe that ATS score, interview questions, dynamic follow-ups, company problem recommendations, and final next actions are **completely different and customized** for Candidate B!

---

## 🛡 Security & Compliance

- **Zero Key Exposure**: Gemini API keys and Supabase service role keys are managed strictly on the Node.js backend.
- **Isolated VM Execution**: Candidate code executes inside an isolated Node `vm` context sandbox with strict 2.5-second time limits and memory bounds.
- **Route Progression Locking**: Backend endpoints enforce locked progression (`HTTP 403 Forbidden` if attempting to bypass required stages).

---

## 📝 License

Developed for **Technoism Hackathon 2026** by team Tech Titans. All rights reserved.
