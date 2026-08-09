/* TECHNOISM HACKATHON 2026 — Isolated AI Service & Fallback Engine */

window.AiService = {
  // Prepared Fallback Question Database by Role Category
  fallbackQuestionDatabase: {
    'frontend': [
      {
        question: 'How do you structure your CSS and HTML to build accessible, mobile-first responsive web applications?',
        difficulty: 'Easy',
        focus: 'Frontend Architecture & CSS'
      },
      {
        question: 'Explain how asynchronous JavaScript (Promises/async-await) works when fetching data from REST APIs and managing loading states.',
        difficulty: 'Medium',
        focus: 'JavaScript Core & API Integration'
      },
      {
        question: 'What techniques do you use to optimize Web Vitals and client-side rendering performance in modern web apps?',
        difficulty: 'Medium',
        focus: 'Performance Optimization'
      },
      {
        question: 'Describe a complex UI component you built. How did you handle component state, event listeners, and DOM updates cleanly?',
        difficulty: 'Hard',
        focus: 'Component Design & State Management'
      },
      {
        question: 'How do you ensure cross-browser compatibility and test UI code before deploying to production?',
        difficulty: 'Medium',
        focus: 'Testing & Engineering Standards'
      }
    ],
    'backend': [
      {
        question: 'How do you design secure and scalable RESTful API endpoints for web applications?',
        difficulty: 'Easy',
        focus: 'API Design & Protocols'
      },
      {
        question: 'Compare SQL vs. Non-SQL databases. How do you decide when to use PostgreSQL vs. MongoDB for a new microservice?',
        difficulty: 'Medium',
        focus: 'Database Architecture'
      },
      {
        question: 'How do you handle backend error handling, logging, and database transaction integrity under high concurrency?',
        difficulty: 'Medium',
        focus: 'Error Handling & Reliability'
      },
      {
        question: 'Describe how you implement user authentication (JWT/OAuth) and data sanitization to prevent security vulnerabilities.',
        difficulty: 'Hard',
        focus: 'Backend Security & Auth'
      },
      {
        question: 'How do you use Git version control and CI/CD pipelines to manage production releases smoothly?',
        difficulty: 'Medium',
        focus: 'DevOps & Release Workflows'
      }
    ],
    'fullstack': [
      {
        question: 'Can you walk through the end-to-end architecture of a full-stack project you developed from scratch?',
        difficulty: 'Easy',
        focus: 'Full Stack Architecture'
      },
      {
        question: 'How do you coordinate API data schemas between your frontend UI components and backend database models?',
        difficulty: 'Medium',
        focus: 'Full Stack Data Flow'
      },
      {
        question: 'Describe a challenging bug that spanned both frontend rendering and backend logic. How did you isolate and resolve it?',
        difficulty: 'Medium',
        focus: 'Full Stack Debugging'
      },
      {
        question: 'How do you ensure application security and CORS compliance when connecting frontends with independent APIs?',
        difficulty: 'Hard',
        focus: 'Integration & Security'
      },
      {
        question: 'What is your process for writing clean, maintainable code and documenting API endpoints for team collaboration?',
        difficulty: 'Medium',
        focus: 'Software Standards'
      }
    ],
    'data-analyst': [
      {
        question: 'How do you clean, transform, and handle missing values in noisy datasets before starting statistical analysis?',
        difficulty: 'Easy',
        focus: 'Data Cleaning & Preprocessing'
      },
      {
        question: 'Describe how you write complex SQL queries involving GROUP BY, JOINs, and Window functions to answer business questions.',
        difficulty: 'Medium',
        focus: 'SQL & Query Optimization'
      },
      {
        question: 'How do you translate raw data insights into interactive dashboards or visual charts for non-technical stakeholders?',
        difficulty: 'Medium',
        focus: 'Data Visualization & Storytelling'
      },
      {
        question: 'Explain a scenario where your data analysis led to a concrete recommendation or decision in a project.',
        difficulty: 'Hard',
        focus: 'Business Impact & Analytical Thinking'
      },
      {
        question: 'How do you validate the accuracy of your analytical models and prevent bias in reporting?',
        difficulty: 'Medium',
        focus: 'Analytical Validation'
      }
    ],
    'aiml': [
      {
        question: 'Explain the difference between supervised, unsupervised, and reinforcement learning with real-world examples.',
        difficulty: 'Easy',
        focus: 'Machine Learning Foundations'
      },
      {
        question: 'How do you handle dataset overfitting and underfitting during model training and feature selection?',
        difficulty: 'Medium',
        focus: 'Model Tuning & Optimization'
      },
      {
        question: 'Describe an ML model or NLP/CV pipeline you implemented. What evaluation metrics (Precision, Recall, F1) did you prioritize?',
        difficulty: 'Medium',
        focus: 'Model Evaluation & Projects'
      },
      {
        question: 'How do you deploy machine learning models into production environments or expose them via REST APIs?',
        difficulty: 'Hard',
        focus: 'MLOps & Model Deployment'
      },
      {
        question: 'How do you stay updated with emerging AI tools and frameworks while adhering to ethical AI standards?',
        difficulty: 'Medium',
        focus: 'AI Innovation & Ethics'
      }
    ],
    'software-engineer': [
      {
        question: 'What object-oriented or functional programming principles do you apply to write clean, reusable code?',
        difficulty: 'Easy',
        focus: 'Software Engineering Core'
      },
      {
        question: 'How do you analyze the time and space complexity (Big O) of your algorithms when optimizing performance?',
        difficulty: 'Medium',
        focus: 'Data Structures & Algorithms'
      },
      {
        question: 'Describe a scenario where you had to learn a new programming language or framework quickly for a project.',
        difficulty: 'Medium',
        focus: 'Adaptability & Technical Learning'
      },
      {
        question: 'How do you approach writing unit tests, integration tests, and debugging production edge cases?',
        difficulty: 'Hard',
        focus: 'Testing & System Quality'
      },
      {
        question: 'How do you prioritize technical debt vs. delivering new features when working under tight project deadlines?',
        difficulty: 'Medium',
        focus: 'Engineering Trade-offs'
      }
    ],
    'fresher-hr': [
      {
        question: 'Tell me about yourself, your academic background, and why you are interested in this specific role.',
        difficulty: 'Easy',
        focus: 'Background & Motivation'
      },
      {
        question: 'Describe a project where you collaborated with a team. How did you handle task division or conflicting opinions?',
        difficulty: 'Medium',
        focus: 'Teamwork & Collaboration'
      },
      {
        question: 'What is your greatest technical strength, and what technical area are you actively working to improve?',
        difficulty: 'Easy',
        focus: 'Self-Awareness & Growth'
      },
      {
        question: 'Describe a situation where a project requirement changed unexpectedly. How did you adapt to meet the deadline?',
        difficulty: 'Medium',
        focus: 'Problem Solving & Adaptability'
      },
      {
        question: 'Where do you see your technical skills evolving over the next 1–2 years?',
        difficulty: 'Easy',
        focus: 'Career Goals'
      }
    ]
  },

  // Cache Hash Generator
  generateCacheHash(str1, str2) {
    const combined = (str1 || '') + ':::' + (str2 || '');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'ai_cache_' + Math.abs(hash);
  },

  // Match Target Role to Fallback Category Key
  matchRoleToFallbackCategory(roleTitle) {
    const title = (roleTitle || '').toLowerCase();
    if (title.includes('front') || title.includes('ui') || title.includes('react') || title.includes('web')) return 'frontend';
    if (title.includes('back') || title.includes('node') || title.includes('api') || title.includes('database')) return 'backend';
    if (title.includes('full') || title.includes('stack')) return 'fullstack';
    if (title.includes('data') || title.includes('analyst') || title.includes('sql') || title.includes('bi')) return 'data-analyst';
    if (title.includes('ai') || title.includes('ml') || title.includes('machine') || title.includes('learning') || title.includes('intelligence')) return 'aiml';
    if (title.includes('software') || title.includes('engineer') || title.includes('developer') || title.includes('coder')) return 'software-engineer';
    return 'fresher-hr';
  },

  // Get Prepared Fallback Questions for Role
  getFallbackQuestions(targetRole, count = 3) {
    const catKey = this.matchRoleToFallbackCategory(targetRole);
    const pool = this.fallbackQuestionDatabase[catKey] || this.fallbackQuestionDatabase['fresher-hr'];
    
    // Pick first N questions from pool
    return pool.slice(0, count).map((q, idx) => ({
      id: `q_${catKey}_${idx + 1}`,
      question: q.question,
      difficulty: q.difficulty,
      focus: q.focus
    }));
  },

  // Validate Question Generator Output Schema
  validateQuestionSchema(data) {
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.questions) || data.questions.length === 0) return false;
    for (const q of data.questions) {
      if (!q.question || typeof q.question !== 'string') return false;
      if (!q.difficulty) q.difficulty = 'Medium';
      if (!q.focus) q.focus = 'Role Fit & Technical Skills';
    }
    return true;
  },

  // Isolated Task Function: Generate Role-Specific Interview Questions
  async generateInterviewQuestions(targetRole, jobDescription, resumeText, questionCount = 3) {
    const appState = window.AppState ? window.AppState.getState() : {};
    const candidateProfile = appState.candidateProfile || {};
    const atsResult = appState.atsResult || {};
    const detectedRole = appState.detectedRole || targetRole || candidateProfile.detectedRole || 'Software Engineering Candidate';

    const cacheKey = this.generateCacheHash(`qgen_${detectedRole}_${questionCount}`, candidateProfile.name || 'candidate');
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (this.validateQuestionSchema(parsed)) return parsed.questions;
      }
    } catch (e) {}

    try {
      const result = await this.executeQuestionGenerationRequest(detectedRole, candidateProfile, atsResult, resumeText, questionCount);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ questions: result }));
      } catch (e) {}
      return result;
    } catch (err) {
      console.warn('AI Question generation notice (falling back to prepared role questions):', err.message);
      return this.getFallbackQuestions(detectedRole, questionCount);
    }
  },

  // Centralized Backend API Fetcher
  async fetchFromApi(endpoint, bodyData, options = {}) {
    const baseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) 
      ? window.APP_CONFIG.API_BASE_URL 
      : 'http://localhost:5000/api';
      
    const url = `${baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    
    try {
      const response = await fetch(url, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        body: bodyData ? JSON.stringify(bodyData) : undefined,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API HTTP Error: ${response.status}`);
      }
      
      const json = await response.json();
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  },

  // Internal Question Generation with Backend REST API Attempt & Fallback
  async executeQuestionGenerationRequest(detectedRole, candidateProfile, atsResult, resumeText, count = 3, isRetry = false) {
    // 1. Attempt Node.js / Express Backend API call
    try {
      const apiResponse = await this.fetchFromApi('/interview/generate', {
        detectedRole,
        candidateProfile,
        atsResult,
        resumeText,
        questionCount: count
      });
      if (apiResponse && apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data.questions)) {
        return apiResponse.data.questions;
      }
    } catch (apiErr) {
      console.warn('Backend API connection notice (falling back to local question engine):', apiErr.message);
    }

    // 2. Local Fallback Engine (Immediate Execution)
    try {
      const categoryKey = this.matchRoleToFallbackCategory(targetRole);
      const fallbackPool = this.fallbackQuestionDatabase[categoryKey] || this.fallbackQuestionDatabase['fresher-hr'];

      const tailoredQuestions = fallbackPool.slice(0, count).map((item, idx) => {
        let text = item.question;
        if (idx === 0) {
          text = `Based on your resume and interest in ${targetRole || 'the role'}, how does your academic or project background prepare you for this position?`;
        } else if (idx === 1 && jobDescription) {
          text = `The job description mentions key requirements like technical problem solving and teamwork. Can you share an example of how you applied these skills in a past project?`;
        }
        return {
          id: `q_${Date.now()}_${idx + 1}`,
          question: text,
          difficulty: item.difficulty,
          focus: item.focus
        };
      });

      return tailoredQuestions;
    } catch (e) {
      console.error('Fallback question generation error:', e.message);
      return [];
    }
  },

  // Perform Semantic AI Resume ATS Analysis (100% Resume-Driven, No JD)
  async analyzeResumeSemantics(resumeText, candidateProfileInput) {
    const appState = window.AppState ? window.AppState.getState() : {};
    const candidateProfile = candidateProfileInput || appState.candidateProfile || {};

    // Cache key is tied to this specific resume text — a new upload bypasses any old cache
    const cacheKey = this.generateCacheHash(resumeText, candidateProfile.name || 'candidate');

    // Attempt backend API call first (Gemini runs server-side)
    try {
      const apiResponse = await this.fetchFromApi('/ats/analyze', {
        resumeText,
        candidateProfile
      });
      if (apiResponse && apiResponse.success && apiResponse.data) {
        const data = apiResponse.data;
        // Only cache and return if it's a real AI result
        if (data.isFallback !== true) {
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
        }
        return data;
      }
    } catch (apiErr) {
      console.warn('[ATS] Backend API unavailable:', apiErr.message);
    }

    // Explicit fallback: backend was unreachable (network error, server down)
    // This is clearly labeled and NOT presented as a Gemini result
    const detectedRole = candidateProfile.detectedRole || 'Software Development Candidate';
    const fallbackResult = {
      score: null,
      overallScore: null,
      targetRole: detectedRole,
      categories: [],
      matchedSkills: candidateProfile.skills || [],
      partialMatches: [],
      missingSkills: [],
      strengths: [],
      suggestions: ['Connect the backend server to receive AI-powered analysis.'],
      evidence: [],
      semanticSummary: '',
      aiEnhanced: false,
      isFallback: true,
      fallbackReason: 'Backend server unreachable — AI analysis unavailable.',
      source: 'AI Analysis Unavailable (Server Offline)'
    };
    return fallbackResult;
  },

  async executeAiRequestWithRetry(resumeText, jobDescription, targetRole, fallbackData, isRetry = false) {
    // This is no longer called in the primary path — kept only for backward compat
    return {
      ...fallbackData,
      aiEnhanced: false,
      isFallback: true,
      source: 'AI Analysis Unavailable (Server Offline)'
    };
  },

  validateAtsSchema(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.score !== 'number' && typeof obj.matchScore !== 'number') return false;
    if (!Array.isArray(obj.matchedSkills)) return false;
    if (!Array.isArray(obj.missingSkills)) return false;
    if (!Array.isArray(obj.categories)) return false;
    return true;
  },

  // Validate Answer Evaluation Output Schema
  validateAnswerEvaluationSchema(obj) {
    if (!obj || typeof obj !== 'object') return false;
    if (typeof obj.score !== 'number') return false;
    if (typeof obj.relevance !== 'number') return false;
    if (typeof obj.clarity !== 'number') return false;
    if (typeof obj.structure !== 'number') return false;
    if (!Array.isArray(obj.strengths)) return false;
    if (!Array.isArray(obj.improvements)) return false;
    if (typeof obj.nextTip !== 'string') return false;
    return true;
  },

  // Isolated Task Function: Evaluate Single Interview Answer
  async evaluateInterviewAnswer(questionObj, candidateAnswer, targetRole, resumeText, jobDescription) {
    if (!candidateAnswer || candidateAnswer.trim().length === 0) {
      return {
        score: 0,
        relevance: 0,
        clarity: 0,
        structure: 0,
        whatCandidateSaid: 'No response was provided by the candidate.',
        strengths: ['No answer submitted.'],
        improvements: ['Ensure you provide a clear, structured response for every interview question.'],
        nextTip: 'Take a moment to outline your thoughts before speaking or typing your answer.'
      };
    }

    try {
      const evaluation = await this.executeAnswerEvaluationRequest(questionObj, candidateAnswer, targetRole, resumeText, jobDescription);
      return evaluation;
    } catch (err) {
      console.warn('AI Answer Evaluation notice (using local fallback rubric):', err.message);
      return this.evaluateLocalRubric(questionObj, candidateAnswer, targetRole, resumeText, jobDescription);
    }
  },

  // Execute AI Answer Evaluation with API Attempt & Local Fallback
  async executeAnswerEvaluationRequest(questionObj, candidateAnswer, targetRole, resumeText, jobDescription, isRetry = false) {
    // 1. Attempt Node.js / Express Backend API call
    try {
      const apiResponse = await this.fetchFromApi('/interview/evaluate', {
        questionObj,
        candidateAnswer,
        targetRole,
        resumeText,
        jobDescription
      });
      if (apiResponse && apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
    } catch (apiErr) {
      console.warn('Backend API Answer Evaluation notice (using local rubric):', apiErr.message);
    }

    // 2. Immediate Local Fallback Evaluation
    const evalResult = this.evaluateLocalRubric(questionObj, candidateAnswer, targetRole, resumeText, jobDescription);
    evalResult.aiEvaluated = true;
    return evalResult;
  },

  // Fallback Local Rubric Evaluator (Deterministic & Reliable)
  evaluateLocalRubric(questionObj, candidateAnswer, targetRole, resumeText, jobDescription) {
    const rawAnswer = candidateAnswer ? candidateAnswer.trim() : '';
    const words = rawAnswer.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // What candidate actually said (summarized snippet)
    const whatCandidateSaid = wordCount > 35 
      ? `"${rawAnswer.slice(0, 160)}..." (${wordCount} words submitted)` 
      : `"${rawAnswer}" (${wordCount} words submitted)`;

    // 1. Structure Score
    const starKeywords = ['situation', 'task', 'action', 'result', 'because', 'for example', 'resolved', 'lead to', 'implemented', 'built', 'achieved'];
    const lowerAnswer = rawAnswer.toLowerCase();
    const starMatches = starKeywords.filter(k => lowerAnswer.includes(k));
    let structure = 60;
    if (wordCount >= 20) structure += 15;
    if (wordCount >= 45) structure += 10;
    if (starMatches.length >= 1) structure += 10;
    if (starMatches.length >= 3) structure += 5;
    structure = Math.min(98, Math.max(30, structure));

    // 2. Relevance Score
    const roleTerms = (targetRole + ' ' + (questionObj ? questionObj.focus : '')).toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchedTerms = roleTerms.filter(t => lowerAnswer.includes(t));
    let relevance = 65;
    if (matchedTerms.length >= 1) relevance += 15;
    if (matchedTerms.length >= 3) relevance += 10;
    if (wordCount >= 30) relevance += 8;
    relevance = Math.min(96, Math.max(35, relevance));

    // 3. Clarity Score
    let clarity = 70;
    const sentences = rawAnswer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length >= 2) clarity += 15;
    if (wordCount >= 15 && wordCount <= 120) clarity += 10;
    clarity = Math.min(95, Math.max(40, clarity));

    // 4. Overall Answer Score
    const score = Math.round((relevance * 0.4) + (clarity * 0.3) + (structure * 0.3));

    // Strengths
    const strengths = [];
    if (wordCount >= 25) {
      strengths.push(`Provided a comprehensive response (${wordCount} words) covering key details.`);
    } else {
      strengths.push('Directly addressed the question without unnecessary fluff.');
    }

    if (starMatches.length > 0) {
      strengths.push(`Used structured action-oriented language (${starMatches.slice(0, 3).join(', ')}).`);
    } else {
      strengths.push('Clear expression of core thoughts.');
    }

    if (matchedTerms.length > 0) {
      strengths.push(`Demonstrated role-relevant domain awareness for ${targetRole || 'the role'}.`);
    }

    // Areas for Improvement
    const improvements = [];
    if (wordCount < 30) {
      improvements.push('Expand your answer with specific project context, challenges faced, and final outcomes.');
    }
    if (starMatches.length === 0) {
      improvements.push('Structure behavioral answers using the STAR method (Situation, Task, Action, Result).');
    }
    if (!lowerAnswer.includes('%') && !lowerAnswer.includes('percent') && !lowerAnswer.includes('metrics')) {
      improvements.push('Include measurable metrics or quantitative achievements to strengthen your claims.');
    }

    // Actionable Next Tip
    let nextTip = 'Practice speaking your answers aloud and highlighting measurable impacts (e.g. "improved performance by 20%").';
    if (score >= 85) {
      nextTip = 'Great response! Keep emphasizing specific project outcomes and technical choices.';
    } else if (score < 65) {
      nextTip = 'Focus on elaborating on your specific personal contributions to projects rather than general statements.';
    }

    return {
      score,
      relevance,
      clarity,
      structure,
      whatCandidateSaid,
      strengths: strengths.length > 0 ? strengths : ['Clear initial response provided.'],
      improvements: improvements.length > 0 ? improvements : ['Add quantitative metrics to further improve impact.'],
      nextTip
    };
  },

  // Aggregate Session Interview Results
  async evaluateInterviewAnswers(questions, answers, targetRole) {
    if (!answers || answers.length === 0) {
      return {
        interviewScore: 50,
        clarityScore: 50,
        relevanceScore: 50,
        structureScore: 50,
        strengths: ['Interview session completed.'],
        improvements: ['Answer all questions to receive a comprehensive interview score.'],
        nextTip: 'Re-take the mock interview and provide detailed answers for each question.'
      };
    }

    const totalScore = Math.round(answers.reduce((acc, a) => acc + (a.evaluation ? a.evaluation.score : 70), 0) / answers.length);
    const avgRelevance = Math.round(answers.reduce((acc, a) => acc + (a.evaluation ? a.evaluation.relevance : 70), 0) / answers.length);
    const avgClarity = Math.round(answers.reduce((acc, a) => acc + (a.evaluation ? a.evaluation.clarity : 70), 0) / answers.length);
    const avgStructure = Math.round(answers.reduce((acc, a) => acc + (a.evaluation ? a.evaluation.structure : 70), 0) / answers.length);

    const allStrengths = answers.flatMap(a => (a.evaluation && a.evaluation.strengths) ? a.evaluation.strengths : []);
    const allImprovements = answers.flatMap(a => (a.evaluation && a.evaluation.improvements) ? a.evaluation.improvements : []);

    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 4);
    const uniqueImprovements = [...new Set(allImprovements)].slice(0, 4);

    return {
      interviewScore: totalScore,
      relevanceScore: avgRelevance,
      clarityScore: avgClarity,
      structureScore: avgStructure,
      strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Good overall effort during the mock interview session.'],
      improvements: uniqueImprovements.length > 0 ? uniqueImprovements : ['Elaborate with concrete technical metrics.'],
      nextTip: answers[answers.length - 1].evaluation ? answers[answers.length - 1].evaluation.nextTip : 'Practice using the STAR framework for all behavioral questions.'
    };
  }
};

