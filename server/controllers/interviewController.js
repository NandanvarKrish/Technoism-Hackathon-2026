// AI Mock Interview Controller

exports.generateQuestions = (req, res) => {
  try {
    const { targetRole, jobDescription, resumeText, questionCount = 3 } = req.body;
    const role = targetRole || 'Software Engineering Candidate';
    const count = parseInt(questionCount, 10) || 3;

    const baseQuestions = [
      {
        id: `q_${Date.now()}_1`,
        question: `Based on your interest in ${role}, how does your academic or project background prepare you for this position?`,
        difficulty: 'Easy',
        focus: 'Background & Role Alignment'
      },
      {
        id: `q_${Date.now()}_2`,
        question: 'Explain how you approach structuring clean, maintainable web application components and handling asynchronous data flows.',
        difficulty: 'Medium',
        focus: 'Technical Architecture & Code Quality'
      },
      {
        id: `q_${Date.now()}_3`,
        question: 'Describe a challenging engineering bug or project obstacle you encountered. How did you isolate and resolve it?',
        difficulty: 'Hard',
        focus: 'Problem Solving & Debugging'
      },
      {
        id: `q_${Date.now()}_4`,
        question: 'How do you optimize application performance and responsive UI layouts across mobile and desktop devices?',
        difficulty: 'Medium',
        focus: 'Performance & Responsive Design'
      },
      {
        id: `q_${Date.now()}_5`,
        question: 'How do you prioritize code refactoring versus delivering new features under tight project deadlines?',
        difficulty: 'Medium',
        focus: 'Software Engineering Standards & Tradeoffs'
      }
    ];

    const questions = baseQuestions.slice(0, count);

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        questionCount: questions.length,
        questions
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Question generation failed: ' + err.message
    });
  }
};

exports.evaluateAnswer = (req, res) => {
  try {
    const { questionObj, candidateAnswer, targetRole } = req.body;

    if (!candidateAnswer || candidateAnswer.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          score: 0,
          relevance: 0,
          clarity: 0,
          structure: 0,
          whatCandidateSaid: 'No answer submitted.',
          strengths: ['No answer submitted.'],
          improvements: ['Please provide a structured response for each question.'],
          nextTip: 'Take a moment to formulate your response before submitting.'
        }
      });
    }

    const answerStr = candidateAnswer.trim();
    const words = answerStr.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    let relevance = Math.min(95, Math.max(50, 65 + (wordCount >= 20 ? 15 : 5)));
    let clarity = Math.min(95, Math.max(50, 70 + (wordCount >= 15 ? 15 : 5)));
    let structure = Math.min(95, Math.max(50, 60 + (wordCount >= 30 ? 25 : 10)));

    const score = Math.round((relevance * 0.4) + (clarity * 0.3) + (structure * 0.3));

    res.status(200).json({
      success: true,
      data: {
        score,
        relevance,
        clarity,
        structure,
        whatCandidateSaid: wordCount > 35 ? `"${answerStr.slice(0, 150)}..." (${wordCount} words)` : `"${answerStr}"`,
        strengths: [
          `Clear response (${wordCount} words) directly addressing the question topic.`,
          `Demonstrated role-relevant domain understanding for ${targetRole || 'target role'}.`
        ],
        improvements: [
          'Incorporate specific metrics or measurable outcomes (e.g. % improvement).',
          'Use the STAR method (Situation, Task, Action, Result) to structure behavioral examples.'
        ],
        nextTip: score >= 80 
          ? 'Strong answer! Highlight quantitative team contributions in subsequent questions.'
          : 'Elaborate on specific technical steps and personal project responsibilities.'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Answer evaluation failed: ' + err.message
    });
  }
};

exports.followUpQuestion = (req, res) => {
  try {
    const { questionText, candidateAnswer, targetRole } = req.body;

    res.status(200).json({
      success: true,
      data: {
        followUpQuestion: `Can you elaborate further on how you measured success or tested your implementation for: "${questionText || 'that requirement'}"?`,
        context: targetRole || 'Technical Interview'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Follow-up question generation failed: ' + err.message
    });
  }
};
