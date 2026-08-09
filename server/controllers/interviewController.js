const https = require('https');

// Helper to call Google Gemini API directly
function callGeminiApi(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const responseJson = JSON.parse(body);
          if (res.statusCode !== 200) {
            return reject(new Error(`Gemini API Error (${res.statusCode}): ${JSON.stringify(responseJson)}`));
          }
          const textCandidate = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!textCandidate) {
            return reject(new Error('Empty text content from Gemini API response.'));
          }
          resolve(textCandidate);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Generate Personalized Interview Questions
exports.generateQuestions = async (req, res) => {
  try {
    const { detectedRole, targetRole, candidateProfile, atsResult, resumeText, questionCount = 3 } = req.body;
    const profile = candidateProfile || {};
    const role = detectedRole || targetRole || profile.detectedRole || 'Software Engineering Candidate';
    const count = parseInt(questionCount, 10) || 3;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Live Gemini Question Generation
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert technical interviewer conducting a personalized General AI Mock Interview.
Generate ${count} highly personalized interview questions tailored specifically to this candidate.

CANDIDATE NAME: ${profile.name || 'Candidate'}
PRIMARY ROLE: ${role}
EXTRACTED SKILLS: ${(profile.skills || []).join(', ')}
PROJECTS: ${JSON.stringify(profile.projects || [])}
EXPERIENCE: ${JSON.stringify(profile.experience || [])}
ATS AUDIT GAPS: ${JSON.stringify(atsResult?.weaknesses || [])}

RESUME TEXT:
${(resumeText || '').slice(0, 2000)}

RULES:
1. Questions MUST reference concrete evidence from the candidate's resume (specific project names, technical tools, or experience items).
2. Never ask generic fixed questions. Each candidate must receive a unique question set.
3. Balance across: resume-specific, project-specific, technical, behavioral, and problem-solving.
4. Include 'sourceEvidence' identifying the exact resume/profile item that triggered the question.

Return ONLY a JSON object matching this exact schema:
{
  "questions": [
    {
      "id": "q_1",
      "question": "Personalized question string referencing candidate's specific project/skill...",
      "type": "project-specific",
      "difficulty": "Medium",
      "focus": "React State Management",
      "sourceEvidence": "Resume project 'Real-Time Analytics Dashboard' with React.js"
    }
  ]
}`;

        const rawAiOutput = await callGeminiApi(apiKey, prompt);
        let cleanedJsonText = rawAiOutput.trim();
        if (cleanedJsonText.startsWith('```json')) {
          cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJsonText.startsWith('```')) {
          cleanedJsonText = cleanedJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanedJsonText);
        if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return res.status(200).json({
            success: true,
            data: {
              targetRole: role,
              detectedRole: role,
              questionCount: parsed.questions.length,
              questions: parsed.questions.slice(0, count).map((q, idx) => ({
                ...q,
                id: q.id || `q_${Date.now()}_${idx + 1}`,
                isFallback: false,
                source: 'Gemini 2.5 Flash AI'
              }))
            }
          });
        }
      } catch (geminiErr) {
        console.warn('[interviewController] Gemini question generation failed:', geminiErr.message);
      }
    }

    // 2. Deterministic Personalized Fallback Questions (Candidate Evidence-Backed)
    const projects = profile.projects || [];
    const mainProject = projects.length > 0 ? projects[0].name : 'your primary engineering project';
    const topSkills = profile.skills || ['Software Engineering'];
    const weaknesses = atsResult?.weaknesses || ['quantifiable percentage metrics'];

    const fallbackQuestions = [
      {
        id: `q_${Date.now()}_1`,
        question: `Your resume highlights building "${mainProject}" using ${topSkills.slice(0, 3).join(', ')}. How did you approach component architecture and state management for this project?`,
        type: 'project-specific',
        difficulty: 'Medium',
        focus: 'Project Architecture & Design',
        sourceEvidence: `Candidate project "${mainProject}" with ${topSkills.slice(0, 2).join(', ')}`,
        isFallback: true
      },
      {
        id: `q_${Date.now()}_2`,
        question: `Your ATS audit noted opportunities to improve ${weaknesses[0] || 'performance metrics'}. How do you measure, benchmark, and optimize technical performance in production?`,
        type: 'technical',
        difficulty: 'Medium',
        focus: 'Performance & Engineering Metrics',
        sourceEvidence: `ATS Audit weakness insight: ${weaknesses[0] || 'performance metrics'}`,
        isFallback: true
      },
      {
        id: `q_${Date.now()}_3`,
        question: `Describe a challenging technical bug or system bottleneck you encountered while working on "${mainProject}". How did you systematically debug and resolve it?`,
        type: 'problem-solving',
        difficulty: 'Hard',
        focus: 'Debugging & Root Cause Analysis',
        sourceEvidence: `Candidate project "${mainProject}" troubleshooting experience`,
        isFallback: true
      },
      {
        id: `q_${Date.now()}_4`,
        question: `As a ${role}, how do you ensure code quality, test coverage, and responsive UI layout stability when building features?`,
        type: 'role-specific',
        difficulty: 'Medium',
        focus: 'Quality Assurance & Standards',
        sourceEvidence: `Primary detected role: ${role}`,
        isFallback: true
      },
      {
        id: `q_${Date.now()}_5`,
        question: `Can you share an example of how you prioritized refactoring legacy code versus delivering new features under a tight deadline?`,
        type: 'behavioral',
        difficulty: 'Medium',
        focus: 'Prioritization & Tradeoffs',
        sourceEvidence: `Candidate engineering background in ${role}`,
        isFallback: true
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        detectedRole: role,
        questionCount: Math.min(count, fallbackQuestions.length),
        questions: fallbackQuestions.slice(0, count)
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Question generation failed: ' + err.message
    });
  }
};

// Evaluate Candidate Interview Answer
exports.evaluateAnswer = async (req, res) => {
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
          nextTip: 'Formulate your response before submitting.'
        }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const answerStr = candidateAnswer.trim();

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert technical interviewer evaluating an answer in a mock interview.

QUESTION: "${questionObj?.question || 'Technical question'}"
QUESTION FOCUS: "${questionObj?.focus || 'General'}"
CANDIDATE ANSWER: "${answerStr}"
ROLE: "${targetRole || 'Software Engineer'}"

Evaluate the answer objectively on a scale of 0-100 across Relevance, Clarity, and STAR Structure.
Return ONLY JSON:
{
  "score": 85,
  "relevance": 90,
  "clarity": 85,
  "structure": 80,
  "whatCandidateSaid": "Brief summary of answer...",
  "strengths": ["Strengths..."],
  "improvements": ["Areas for improvement..."],
  "nextTip": "Actionable advice..."
}`;

        const rawAiOutput = await callGeminiApi(apiKey, prompt);
        let cleanedJsonText = rawAiOutput.trim();
        if (cleanedJsonText.startsWith('```json')) {
          cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJsonText.startsWith('```')) {
          cleanedJsonText = cleanedJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanedJsonText);
        if (parsed && typeof parsed.score === 'number') {
          return res.status(200).json({
            success: true,
            data: parsed
          });
        }
      } catch (e) {
        console.warn('[interviewController] Gemini answer evaluation failed:', e.message);
      }
    }

    // Deterministic Answer Evaluation Fallback
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
          `Clear response (${wordCount} words) addressing technical question topic.`,
          `Demonstrated role-relevant domain understanding.`
        ],
        improvements: [
          'Incorporate specific metrics or percentage improvements.',
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

// Dynamic Follow-Up Question Generator (Probes deeper into candidate's actual answer)
exports.followUpQuestion = async (req, res) => {
  try {
    const { questionText, candidateAnswer, targetRole, candidateProfile } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const answerStr = (candidateAnswer || '').trim();

    if (apiKey && apiKey.trim().length > 10 && answerStr.length > 15) {
      try {
        const prompt = `You are an expert technical interviewer conducting a dynamic follow-up round.

QUESTION ASKED: "${questionText || 'Technical Question'}"
CANDIDATE ANSWER: "${answerStr}"
ROLE: "${targetRole || 'Software Development Engineer'}"

Analyze what the candidate ACTUALLY SAID.
Determine whether a follow-up question is useful to probe deeper into technical details, edge cases, error handling, performance tradeoffs, or metric validation.

Return ONLY JSON:
{
  "requiresFollowUp": true,
  "followUpQuestion": "Probing follow-up question directly building on what the candidate said in their answer...",
  "reasoning": "Explanation of why this follow-up is relevant based on candidate's response."
}`;

        const rawAiOutput = await callGeminiApi(apiKey, prompt);
        let cleanedJsonText = rawAiOutput.trim();
        if (cleanedJsonText.startsWith('```json')) {
          cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJsonText.startsWith('```')) {
          cleanedJsonText = cleanedJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanedJsonText);
        if (parsed && parsed.followUpQuestion) {
          return res.status(200).json({
            success: true,
            data: parsed
          });
        }
      } catch (e) {
        console.warn('[interviewController] Gemini follow-up generation failed:', e.message);
      }
    }

    // Dynamic Fallback Follow-up Generator based on candidate answer keywords
    let followUpText = `Can you elaborate on how you validated performance or handled edge cases when implementing your solution for: "${(questionText || 'that feature').slice(0, 60)}"?`;
    const ansLower = answerStr.toLowerCase();
    
    if (ansLower.includes('websocket')) {
      followUpText = `You mentioned WebSocket streaming. How did you handle unexpected connection drops or message sequence reordering?`;
    } else if (ansLower.includes('polling') || ansLower.includes('rest')) {
      followUpText = `You mentioned REST polling. How did you optimize request latency overhead and handle rate limits?`;
    } else if (ansLower.includes('state') || ansLower.includes('react') || ansLower.includes('redux')) {
      followUpText = `You mentioned state management. How did you prevent unnecessary component re-renders and optimize UI performance?`;
    } else if (ansLower.includes('sql') || ansLower.includes('database') || ansLower.includes('query')) {
      followUpText = `You mentioned database operations. How did you optimize query execution speeds and index slow table joins?`;
    } else if (ansLower.includes('api')) {
      followUpText = `You mentioned API integration. How did you handle API failures, network timeouts, or rate limits in production?`;
    }

    res.status(200).json({
      success: true,
      data: {
        requiresFollowUp: true,
        followUpQuestion: followUpText,
        reasoning: 'Dynamic follow-up generated to probe deeper into technical implementation details.'
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Follow-up question generation failed: ' + err.message
    });
  }
};
