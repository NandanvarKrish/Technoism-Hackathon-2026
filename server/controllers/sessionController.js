// Session Persistence Controller

const sessionMemoryStore = new Map();

exports.createSession = (req, res) => {
  try {
    const { candidateName, targetRole, resumeText, jobDescription } = req.body;
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newSession = {
      id: sessionId,
      candidateName: candidateName || 'Anonymous Candidate',
      targetRole: targetRole || 'Target Role',
      resumeText: resumeText || '',
      jobDescription: jobDescription || '',
      atsResult: null,
      interviewResult: null,
      finalReport: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    sessionMemoryStore.set(sessionId, newSession);

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

exports.getSession = (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = sessionMemoryStore.get(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve session: ' + err.message
    });
  }
};
