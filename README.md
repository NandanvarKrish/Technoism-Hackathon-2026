# TECHNOISM 2026 — AI Resume Screening & Mock Interview Platform

> **CareerTech AI Platform** — Upload your resume, check it against a target job description with an explainable ATS-style match score, and practice a tailored AI mock interview — all in your browser.

A local-first, hackathon web application that turns a resume + target job description into two outcomes:

1. **An understandable ATS-style match report** — score, matched/missing requirements, and actionable resume suggestions.
2. **A tailored mock interview** — role-specific questions with text or voice answers and a final feedback scorecard.

Built by **Team 001 – Tech Titans**, C. K. Pithawala College of Engineering & Technology, Surat, for **TECHNOISM Hackathon 2026**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Flow](#user-flow)
- [ATS Matching Logic](#ats-matching-logic)
- [AI Integration & Fallback](#ai-integration--fallback)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Demo Data](#demo-data)
- [Privacy & Data Handling](#privacy--data-handling)
- [Disclaimer](#disclaimer)
- [Future Scope](#future-scope)
- [Acknowledgments](#acknowledgments)

---

## Overview

Students and freshers often don't know why their resume gets rejected by applicant tracking systems (ATS) or how their technical background maps to a specific role. Manually screening resumes also consumes recruiter time.

This project solves that by providing a single, demo-ready platform that:

- Extracts clean readable text from **PDF / DOCX / TXT** resumes **entirely in the browser**.
- Runs a **transparent, category-weighted ATS-style matching engine** against a pasted job description.
- Shows exactly *what matched*, *what's missing*, and *how to improve* — with evidence behind every score.
- Generates **role-specific mock interview questions** and evaluates text or voice answers.
- Produces a **final candidate scorecard** combining resume fit and interview readiness.

The matching algorithm is intentionally **explainable**: it is designed for career preparation and candidate learning, not to reproduce any specific commercial ATS.

---

## Features

- **📄 In-browser document text extraction** — page-by-page PDF parsing via PDF.js and DOCX extraction via Mammoth.js; drag-and-drop upload, size/format validation, and a 10 MB limit.
- **🔍 Extracted text preview** — inspect, edit, and clean the extracted resume text before analysis, with live character and word counts.
- **⌨️ Manual text fallback** — paste resume text directly if file parsing fails (e.g., scanned image PDFs).
- **⚖️ Explainable ATS engine** — configurable category weights (Skills 45%, Tools 20%, Experience 20%, Education 15%) with per-category scores and explanations.
- **✅ Gap analysis** — matched requirements, missing requirements, resume strengths, and actionable improvement suggestions.
- **🧠 AI service layer with graceful fallback** — result caching, schema validation, single retry, and a deterministic fallback so the app never breaks if an AI/API call fails.
- **🎙️ Mock interview room** — sequential role-relevant questions, progress bar, and optional voice input via the browser's Web Speech API (text input always works).
- **🏆 Final scorecard** — ATS match (40%) + mock interview (60%) → overall readiness score and level, with strengths, gaps, and next actions.
- **🔄 Session persistence** — state saved to `localStorage`; a "Reset Demo" button restarts the flow.
- **🧭 Guided navigation** — a 6-step progress stepper (Home → Resume → Job Description → ATS Scorecard → Mock Interview → Final Scorecard).
- **🛡️ Robust error handling** — loading overlays, clear error messages with retry actions, and `Esc` to dismiss errors.
- **🧪 One-click demo data** — sample resume and job description for a reliable end-to-end demonstration.

---

## User Flow

1. **Landing** — value proposition and "Start Analysis" CTA.
2. **Upload Resume** — drag-and-drop a PDF/DOCX/TXT, or paste text manually; preview and optionally clean the extracted text.
3. **Job Description** — enter a target role title and paste the job description/requirements.
4. **ATS Scorecard** — overall match score, four weighted category breakdowns, matched/missing requirements, strengths, and suggestions.
5. **Mock Interview** — answer 4 tailored questions by text or voice.
6. **Final Scorecard** — combined readiness score with strengths, development gaps, and recommended next actions; restart with a new role or resume.

---

## ATS Matching Logic

The scoring engine is **deterministic and fully transparent**:

1. **Normalize** both the resume and the job description (lowercasing, punctuation/whitespace cleanup).
2. **Extract & classify** job requirements into four categories: Core Skills, Tools & Technologies, Experience & Projects, Education & Requirements.
3. **Match** each requirement term against the resume text and record matched vs. missing terms.
4. **Score each category** as the percentage of matched terms.
5. **Combine weighted scores** using the configurable weights object (`AtsEngine.config.weights`):

   | Category                   | Weight |
   |----------------------------|--------|
   | Core Skills                | 45%    |
   | Tools & Technologies       | 20%    |
   | Experience & Projects      | 20%    |
   | Education & Requirements   | 15%    |

6. **Generate evidence-backed strengths and actionable suggestions** from the matched/missing results.

The weights are a single configuration object, so category weighting can be tuned without touching the rest of the engine.

---

## AI Integration & Fallback

The `AiService` module is an isolated abstraction designed around safe, resilient AI usage:

- **Local caching** — identical resume + job description pairs are cached in `localStorage` to avoid redundant calls.
- **Deterministic baseline** — a rule-based ATS analysis always runs first.
- **Schema validation** — AI responses are validated against a fixed output contract; invalid responses trigger an automatic single retry.
- **Graceful fallback** — if the AI layer is unavailable or fails validation, the deterministic result is returned and the app continues working normally.

> **Note:** In this hackathon shell, no private API key is shipped in client-side code (per security best practice). The AI enhancement layer is simulated over the deterministic baseline, demonstrating the exact integration pattern to swap in a server-side proxy later.

---

## Tech Stack

| Layer        | Technology |
|--------------|------------|
| Frontend     | HTML5, CSS3, Vanilla JavaScript (no framework, no build step) |
| Design       | CSS custom-property design tokens, Google Fonts (Rubik, Noto Sans, Nunito Sans, Roboto Mono), Font Awesome 6 |
| PDF parsing  | [PDF.js](https://mozilla.github.io/pdf.js/) (CDN) |
| DOCX parsing | [Mammoth.js](https://github.com/mammothhq/mammoth.js) (CDN) |
| Voice input  | Web Speech API (browser-provided, optional) |
| Persistence  | Browser `localStorage` |

The architecture is intentionally **modular** — each concern lives in its own script:

- `StateStore` — observable central state with localStorage persistence
- `ResumeParser` — file validation + PDF/DOCX/TXT text extraction
- `AtsEngine` — deterministic matching & scoring
- `AiService` — AI abstraction, caching, validation, retries, fallback
- `InterviewController` — mock interview loop + speech recognition
- `ReportBuilder` — final scorecard synthesis
- `UIController` — screen visibility, stepper, and DOM rendering (subscribed to state changes)

---

## Project Structure

```
.
├── README.md
├── Prototype/                  # The web application (open index.html)
│   ├── index.html              # All 6 screens + app shell
│   ├── css/
│   │   ├── design-tokens.css   # Global design tokens (colors, fonts, radii)
│   │   └── main.css            # Layout, components, responsive styles
│   ├── data/
│   │   └── sample-data.js      # Sample resume & job description for demo
│   └── js/
│       ├── state.js            # Observable central state + localStorage
│       ├── resume-parser.js    # File validation & PDF/DOCX/TXT extraction
│       ├── ats-engine.js       # Deterministic ATS matching engine
│       ├── ai-service.js       # AI abstraction, caching, retry, fallback
│       ├── interview.js        # Mock interview controller & voice input
│       ├── report.js           # Final scorecard builder
│       ├── ui.js               # DOM rendering controller
│       └── app.js              # Bootstrap & event bindings
└── Docx_txt/                   # Product design docs (PRD, TRD, flows, etc.)
```

---

## Getting Started

The app has **no build step and no dependencies to install**.

**Option A — open directly**

1. Clone or download the repository.
2. Open `Prototype/index.html` in any modern browser (Chrome, Edge, Firefox).

**Option B — local server (recommended for full file-upload support)**

1. From the project root, start a simple static server:

   ```bash
   # Python
   python -m http.server 8000 --directory Prototype

   # OR Node.js
   npx serve Prototype
   ```

2. Visit `http://localhost:8000` in your browser.

> ⚠️ **Note:** PDF/DOCX parsing libraries are loaded from a CDN, so an **internet connection is required** on first load. Voice input requires a browser with Web Speech API support (Chrome/Edge).

---

## Usage Guide

1. On the landing page, click **Start Analysis**.
2. **Upload Resume** — drag a PDF/DOCX/TXT into the upload zone (or click to browse), or click **Load Sample Resume** for a quick demo. Inspect and edit the extracted text in the preview, or use the **Manual Text Input Fallback**.
3. Click **Continue to Job Description**, enter a target role, and paste the job description. Use **Load Sample Job** to try it instantly.
4. Click **Run ATS Analysis** to view the **ATS-Style Match Scorecard** with the category breakdown, matched/missing requirements, strengths, and suggestions.
5. Click **Practice AI Interview** and answer each question by text (or voice via the microphone button). Submit to advance.
6. Review the **Final Candidate Scorecard** — overall readiness, strengths, gaps, and next actions. Use **Try Another Job Description** or **Analyze New Resume** to restart.

Use the **Reset Demo** button in the header anytime to clear all saved session data.

---

## Demo Data

`Prototype/data/sample-data.js` ships with:

- A sample student resume (Nandan Shah — Full-Stack & Frontend Developer)
- A matching sample job description (Associate Frontend & Full-Stack Developer)

These are ideal for a repeatable, reliable end-to-end demo.

---

## Privacy & Data Handling

- **Everything runs locally** — resumes and job descriptions are processed in your browser.
- Extracted text and results are stored only in your browser's `localStorage` for session continuity; nothing is uploaded to any server.
- Clear all saved data at any time with the **Reset Demo** button (or `localStorage.clear()` in devtools).
- No API keys are embedded in client-side code.

---

## Disclaimer

This project provides an **explainable ATS-style match score** based on transparent category weighting. It is designed for career preparation, candidate learning, and hackathon demonstration. The score **does not guarantee** employer ATS approval, job shortlisting, or reproduce the behavior of any specific commercial applicant tracking system.

---

## Future Scope

- Server-side AI proxy with a real LLM API for richer semantic analysis and feedback
- Text-to-speech for reading interview questions aloud
- Export/download of the final report
- Interview history and progress tracking
- Recruiter-style candidate ranking dashboard
- Multi-language and accessibility enhancements

---

## Acknowledgments

Built for the **TECHNOISM Hackathon 2026** by **Team 001 – Tech Innovators** at **C. K. Pithawala College of Engineering & Technology, Surat**. The product design is grounded in the team's PRD, TRD, and implementation planning documents (see `Docx_txt/`).

- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF text extraction
- [Mammoth.js](https://github.com/mammothhq/mammoth.js) — DOCX text extraction
- [Font Awesome](https://fontawesome.com/) — icons
- [Google Fonts](https://fonts.google.com/) — typography
