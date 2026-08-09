// AI Mock Interview Controller

exports.generateQuestions = (req, res) => {
  try {
    const { detectedRole, targetRole, candidateProfile, atsResult, resumeText, questionCount = 3 } = req.body;
    const profile = candidateProfile || {};
    const role = detectedRole || targetRole || profile.detectedRole || 'Software Engineering Candidate';
    const count = parseInt(questionCount, 10) || 3;

    const projects = profile.projects || [];
    const mainProject = projects.length > 0 ? projects[0].name : 'your primary web/data project';
    const topSkills = profile.skills || ['JavaScript', 'Software Engineering'];
    const weaknesses = atsResult?.weaknesses || ['quantifiable impact metrics'];

    const baseQuestions = [
      {
        id: `q_${Date.now()}_1`,
        question: `Based on your experience with ${topSkills.slice(0, 3).join(', ')} as a ${role}, how did you design the architecture for "${mainProject}"?`,
        difficulty: 'Medium',
        focus: 'Project Architecture & Technical Depth'
      },
      {
        id: `q_${Date.now()}_2`,
        question: `Your ATS audit highlighted opportunities to improve ${weaknesses[0] || 'code metrics'}. How do you measure and optimize technical performance in production?`,
        difficulty: 'Medium',
        focus: 'Performance & Engineering Standards'
      },
      {
        id: `q_${Date.now()}_3`,
        question: `Describe a complex technical challenge or debugging obstacle you faced while building ${mainProject}. How did you systematically isolate and resolve it?`,
        difficulty: 'Hard',
        focus: 'Debugging & Problem Solving'
      },
      {
        id: `q_${Date.now()}_4`,
        question: `How do you ensure data integrity, responsive layout stability, and security standards when developing features in ${role}?`,
        difficulty: 'Medium',
        focus: 'System Integrity & Security'
      },
      {
        id: `q_${Date.now()}_5`,
        question: `How do you handle technical trade-offs between refactoring legacy code versus delivering new features under tight deadline constraints?`,
        difficulty: 'Medium',
        focus: 'Engineering Tradeoffs & Prioritization'
      }
    ];

    const questions = baseQuestions.slice(0, count);

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        detectedRole: role,
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
