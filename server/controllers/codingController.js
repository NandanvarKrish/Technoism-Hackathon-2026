// Coding Challenge Execution Controller

exports.startCodingRound = (req, res) => {
  try {
    const { company, problemId } = req.body;

    res.status(200).json({
      success: true,
      data: {
        sessionId: `code_sess_${Date.now()}`,
        company: company || 'google',
        problemId: problemId || 'goog_1',
        timeLimitMinutes: 30,
        startedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to start coding round: ' + err.message
    });
  }
};

exports.runCode = (req, res) => {
  try {
    const { code, language = 'javascript', problemId } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No source code provided.'
      });
    }

    // Standardized mock execution result
    res.status(200).json({
      success: true,
      data: {
        language,
        status: 'Accepted',
        runtimeMs: 42,
        memoryKb: 14200,
        testsTotal: 2,
        testsPassed: 2,
        testResults: [
          { testId: 1, passed: true, input: '[2, 7, 11, 15], 9', actualOutput: '[0, 1]', expectedOutput: '[0, 1]' },
          { testId: 2, passed: true, input: '[3, 2, 4], 6', actualOutput: '[1, 2]', expectedOutput: '[1, 2]' }
        ]
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Code execution failed: ' + err.message
    });
  }
};

exports.submitCode = (req, res) => {
  try {
    const { code, language = 'javascript', problemId, sessionId } = req.body;

    res.status(200).json({
      success: true,
      data: {
        submissionId: `sub_${Date.now()}`,
        sessionId: sessionId || `code_sess_${Date.now()}`,
        status: 'Accepted',
        score: 95,
        complexity: {
          time: 'O(N)',
          space: 'O(N)'
        },
        feedback: 'Optimal solution. Space complexity is O(N) using a hash map lookup.'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Code submission failed: ' + err.message
    });
  }
};
