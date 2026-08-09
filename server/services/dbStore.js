const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../../data/db-store.json');

// Default Database Store Schema matching database/schema.sql
function createInitialDbStore() {
  return {
    sessions: {},
    resumes: {},
    candidateProfiles: {},
    jobDescriptions: {},
    atsAnalyses: {},
    interviews: {},
    interviewQuestions: {},
    interviewAnswers: {},
    interviewEvaluations: {},
    codingSessions: {},
    codingSubmissions: {},
    codingResults: {},
    finalReports: {}
  };
}

let dbMemory = null;

function getDb() {
  if (dbMemory) return dbMemory;

  if (fs.existsSync(dbFilePath)) {
    try {
      dbMemory = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
      return dbMemory;
    } catch (e) {
      console.warn('[dbStore] Failed to read db-store.json, creating initial store:', e.message);
    }
  }

  dbMemory = createInitialDbStore();
  saveDb();
  return dbMemory;
}

function saveDb() {
  if (!dbMemory) return;
  try {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(dbMemory, null, 2));
  } catch (e) {
    console.warn('[dbStore] Failed to persist db-store.json:', e.message);
  }
}

// Session CRUD Operations
exports.upsertSession = (sessionId, payload = {}) => {
  const db = getDb();
  const existing = db.sessions[sessionId] || {
    id: sessionId,
    user_id: payload.userId || 'anonymous_candidate',
    resumeCompleted: false,
    atsCompleted: false,
    generalInterviewCompleted: false,
    codingRoundStarted: false,
    codingRoundCompleted: false,
    finalReportAvailable: false,
    created_at: new Date().toISOString()
  };

  const updatedSession = {
    ...existing,
    ...payload,
    id: sessionId,
    updated_at: new Date().toISOString()
  };

  db.sessions[sessionId] = updatedSession;
  saveDb();
  return updatedSession;
};

exports.getSessionFull = (sessionId) => {
  const db = getDb();
  const session = db.sessions[sessionId];
  if (!session) return null;

  return {
    session,
    resume: db.resumes[sessionId] || null,
    candidateProfile: db.candidateProfiles[sessionId] || null,
    jobDescription: db.jobDescriptions[sessionId] || null,
    atsResult: db.atsAnalyses[sessionId] || null,
    interview: db.interviews[sessionId] || null,
    interviewQuestions: db.interviewQuestions[sessionId] || [],
    interviewAnswers: db.interviewAnswers[sessionId] || [],
    interviewEvaluations: db.interviewEvaluations[sessionId] || [],
    codingSession: db.codingSessions[sessionId] || null,
    codingSubmissions: db.codingSubmissions[sessionId] || [],
    codingResult: db.codingResults[sessionId] || null,
    finalReport: db.finalReports[sessionId] || null
  };
};

// Record Upsert Handlers
exports.saveResume = (sessionId, resumeData) => {
  const db = getDb();
  const record = {
    id: `res_${Date.now()}`,
    session_id: sessionId,
    ...resumeData,
    created_at: new Date().toISOString()
  };
  db.resumes[sessionId] = record;
  
  exports.upsertSession(sessionId, { resumeCompleted: true });
  saveDb();
  return record;
};

exports.saveCandidateProfile = (sessionId, profileData = {}) => {
  const db = getDb();
  const record = {
    id: `prof_${Date.now()}`,
    session_id: sessionId,
    name: profileData.name || '',
    headline: profileData.headline || '',
    detectedRole: profileData.detectedRole || profileData.detected_role || '',
    detected_role: profileData.detectedRole || profileData.detected_role || '',
    skills: profileData.skills || [],
    projects: profileData.projects || [],
    experience: profileData.experience || [],
    education: profileData.education || [],
    achievements: profileData.achievements || [],
    created_at: new Date().toISOString()
  };
  db.candidateProfiles[sessionId] = record;
  saveDb();
  return record;
};

exports.saveAtsAnalysis = (sessionId, atsData = {}) => {
  const db = getDb();
  const overall = atsData.overallScore || atsData.overall_score || atsData.score || 80;
  const record = {
    id: `ats_${Date.now()}`,
    session_id: sessionId,
    overallScore: overall,
    overall_score: overall,
    score: overall,
    categoryScores: atsData.categoryScores || {},
    categories: atsData.categories || [],
    matchedSkills: atsData.matchedSkills || [],
    partialMatches: atsData.partialMatches || [],
    missingSkills: atsData.missingSkills || [],
    strengths: atsData.strengths || [],
    weaknesses: atsData.weaknesses || [],
    recommendations: atsData.recommendations || [],
    summary: atsData.summary || '',
    source: atsData.source || 'Gemini 2.5 Flash AI',
    created_at: new Date().toISOString()
  };
  db.atsAnalyses[sessionId] = record;

  exports.upsertSession(sessionId, { atsCompleted: true });
  saveDb();
  return record;
};

exports.saveInterviewSession = (sessionId, interviewData = {}, questions = [], answers = [], evaluations = []) => {
  const db = getDb();
  const record = {
    id: `int_${Date.now()}`,
    session_id: sessionId,
    target_role: interviewData.targetRole || interviewData.target_role || '',
    targetRole: interviewData.targetRole || interviewData.target_role || '',
    status: interviewData.status || 'active',
    total_questions: questions.length,
    created_at: new Date().toISOString()
  };
  db.interviews[sessionId] = record;
  db.interviewQuestions[sessionId] = questions;
  db.interviewAnswers[sessionId] = answers;
  db.interviewEvaluations[sessionId] = evaluations;

  exports.upsertSession(sessionId, { generalInterviewCompleted: true });
  saveDb();
  return record;
};

exports.saveCodingSession = (sessionId, codingData = {}, submissionData = null) => {
  const db = getDb();
  const record = {
    id: `code_${Date.now()}`,
    session_id: sessionId,
    company_id: codingData.company_id || codingData.company || 'google',
    companyId: codingData.company_id || codingData.company || 'google',
    question_id: codingData.question_id || codingData.problemId || 'goog_1',
    questionId: codingData.question_id || codingData.problemId || 'goog_1',
    started_at: new Date().toISOString()
  };
  db.codingSessions[sessionId] = record;

  if (submissionData) {
    if (!db.codingSubmissions[sessionId]) db.codingSubmissions[sessionId] = [];
    db.codingSubmissions[sessionId].push({
      id: `sub_${Date.now()}`,
      coding_session_id: record.id,
      ...submissionData,
      created_at: new Date().toISOString()
    });
  }

  exports.upsertSession(sessionId, { 
    codingRoundStarted: true,
    codingRoundCompleted: Boolean(submissionData)
  });
  saveDb();
  return record;
};

exports.saveFinalReport = (sessionId, reportData = {}) => {
  const db = getDb();
  const score = reportData.readinessScore || reportData.readiness_score || 85;
  const level = reportData.readinessLevel || reportData.readiness_level || 'Strong Candidate Fit';
  const record = {
    id: `rep_${Date.now()}`,
    session_id: sessionId,
    atsScore: reportData.atsScore || reportData.ats_score || 80,
    interviewScore: reportData.interviewScore || reportData.interview_score || 85,
    codingScore: reportData.codingScore || reportData.coding_score || 95,
    readinessScore: score,
    readiness_score: score,
    readinessLevel: level,
    readiness_level: level,
    strengths: reportData.strengths || [],
    gaps: reportData.gaps || [],
    nextActions: reportData.nextActions || reportData.next_actions || [],
    created_at: new Date().toISOString()
  };
  db.finalReports[sessionId] = record;

  exports.upsertSession(sessionId, { finalReportAvailable: true });
  saveDb();
  return record;
};
