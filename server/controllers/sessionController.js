const dbStore = require('../services/dbStore');

// Create or initialize a new Preparation Session
exports.createSession = (req, res) => {
  try {
    const { candidateName, targetRole, userId } = req.body;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newSession = dbStore.upsertSession(sessionId, {
      userId: userId || 'anonymous_candidate',
      candidateName: candidateName || 'Anonymous Candidate',
      targetRole: targetRole || 'Software Development Engineer',
      resumeCompleted: false,
      atsCompleted: false,
      generalInterviewCompleted: false,
      codingRoundStarted: false,
      codingRoundCompleted: false,
      finalReportAvailable: false
    });

    res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to create session: ' + err.message
    });
  }
};

// Retrieve Complete Persisted Session State for Recovery
exports.getSession = (req, res) => {
  try {
    const sessionId = req.params.id;
    const fullSession = dbStore.getSessionFull(sessionId);

    if (!fullSession) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`
      });
    }

    res.status(200).json({
      success: true,
      data: fullSession
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session: ' + err.message
    });
  }
};

// Persist Stage Data Endpoints
exports.saveStageResume = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { file_name, file_type, extracted_text, candidateProfile } = req.body;

    const resumeRecord = dbStore.saveResume(sessionId, {
      file_name: file_name || 'resume.pdf',
      file_type: file_type || 'pdf',
      extracted_text: extracted_text || '',
      char_count: (extracted_text || '').length,
      word_count: (extracted_text || '').split(/\s+/).length
    });

    if (candidateProfile) {
      dbStore.saveCandidateProfile(sessionId, candidateProfile);
    }

    res.status(200).json({
      success: true,
      data: resumeRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save resume stage: ' + err.message
    });
  }
};

exports.saveStageAts = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { atsResult } = req.body;

    const atsRecord = dbStore.saveAtsAnalysis(sessionId, atsResult || {});

    res.status(200).json({
      success: true,
      data: atsRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save ATS stage: ' + err.message
    });
  }
};

exports.saveStageInterview = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { targetRole, questions, answers, evaluations } = req.body;

    const intRecord = dbStore.saveInterviewSession(
      sessionId,
      { targetRole: targetRole || 'Target Role', total_questions: (questions || []).length },
      questions || [],
      answers || [],
      evaluations || []
    );

    res.status(200).json({
      success: true,
      data: intRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save interview stage: ' + err.message
    });
  }
};

exports.saveStageCoding = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { company, problemId, submission } = req.body;

    const codingRecord = dbStore.saveCodingSession(
      sessionId,
      { company_id: company || 'google', question_id: problemId || 'goog_1' },
      submission || null
    );

    res.status(200).json({
      success: true,
      data: codingRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save coding stage: ' + err.message
    });
  }
};

exports.saveStageReport = (req, res) => {
  try {
    const sessionId = req.params.id;
    const { report } = req.body;

    const reportRecord = dbStore.saveFinalReport(sessionId, report || {});

    res.status(200).json({
      success: true,
      data: reportRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to save final report stage: ' + err.message
    });
  }
};
