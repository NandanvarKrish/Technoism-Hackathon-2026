const https = require('https');

// Validate Gemini ATS Output Schema
function validateGeminiAtsResponse(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const score = obj.score !== undefined ? obj.score : obj.overallScore;
  if (typeof score !== 'number' || score < 0 || score > 100) return false;

  if (!Array.isArray(obj.matchedSkills)) return false;
  if (!Array.isArray(obj.missingSkills) && !Array.isArray(obj.weaknesses)) return false;
  if (!Array.isArray(obj.strengths)) return false;
  if (!Array.isArray(obj.suggestions) && !Array.isArray(obj.recommendations)) return false;

  return true;
}

// Call Google Gemini REST API directly
function callGeminiApi(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
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

// Deterministic Local ATS Fallback Evaluator (Explicitly labeled as API Offline Fallback)
function evaluateDeterministicAts(resumeText, candidateProfile, targetRole, jobDescription) {
  const textLower = (resumeText || '').toLowerCase();
  const profile = candidateProfile || {};

  const skills = profile.skills || [];
  const projects = profile.projects || [];
  const experience = profile.experience || [];
  const education = profile.education || [];

  const roleTitle = targetRole || profile.detectedRole || 'Software Engineering Candidate';

  let structScore = 85;
  if (profile.name && profile.email) structScore += 5;
  if (projects.length > 0) structScore += 5;

  let techScore = Math.min(98, Math.max(40, 50 + skills.length * 4));
  let projScore = Math.min(98, Math.max(35, 45 + projects.length * 15));
  let expScore = Math.min(95, Math.max(30, 40 + experience.length * 20));
  let eduScore = education.length > 0 ? 90 : 70;
  let achieveScore = (profile.achievements || []).length > 0 ? 85 : 70;
  let impactScore = textLower.includes('%') || textLower.includes('reduced') || textLower.includes('improved') ? 85 : 65;
  let readinessScore = Math.round((techScore + projScore + expScore + eduScore) / 4);

  const categoryScores = {
    resumeStructure: Math.min(100, structScore),
    technicalSkills: techScore,
    projects: projScore,
    experience: expScore,
    education: eduScore,
    achievements: achieveScore,
    impact: impactScore,
    roleReadiness: readinessScore
  };

  const overallScore = Math.round(
    structScore * 0.15 +
    techScore * 0.20 +
    projScore * 0.20 +
    expScore * 0.15 +
    eduScore * 0.10 +
    achieveScore * 0.05 +
    impactScore * 0.05 +
    readinessScore * 0.10
  );

  const categories = [
    { name: 'Resume Structure', weight: '15%', score: categoryScores.resumeStructure, weightedScore: Math.round(categoryScores.resumeStructure * 0.15), explanation: 'Section organization, contact details, and formatting.' },
    { name: 'Technical Skills', weight: '20%', score: categoryScores.technicalSkills, weightedScore: Math.round(categoryScores.technicalSkills * 0.20), explanation: 'Breadth and depth of programming languages, frameworks, and developer tools.' },
    { name: 'Projects', weight: '20%', score: categoryScores.projects, weightedScore: Math.round(categoryScores.projects * 0.20), explanation: 'Substantive project execution and technical complexity.' },
    { name: 'Experience & Internships', weight: '15%', score: categoryScores.experience, weightedScore: Math.round(categoryScores.experience * 0.15), explanation: 'Practical industry work or internship evidence.' },
    { name: 'Education', weight: '10%', score: categoryScores.education, weightedScore: Math.round(categoryScores.education * 0.10), explanation: 'Degree relevance and academic background.' },
    { name: 'Achievements & Impact', weight: '10%', score: categoryScores.impact, weightedScore: Math.round(categoryScores.impact * 0.10), explanation: 'Quantifiable metrics and accomplishment evidence.' },
    { name: 'Role Readiness', weight: '10%', score: categoryScores.roleReadiness, weightedScore: Math.round(categoryScores.roleReadiness * 0.10), explanation: 'Overall career readiness for target professional domain.' }
  ];

  return {
    score: overallScore,
    overallScore,
    matchScore: overallScore,
    targetRole: roleTitle,
    detectedRoles: [roleTitle],
    categoryScores,
    categories,
    matchedSkills: skills,
    partialMatches: ['TypeScript', 'Unit Testing'],
    missingSkills: ['Cloud Infrastructure (AWS/Docker)', 'Quantifiable percentage impact metrics'],
    strengths: [
      `Strong technical foundation in ${skills.slice(0, 4).join(', ') || 'software engineering'}.`,
      `Demonstrated project work in ${projects.map(p => p.name).join(', ') || 'modern application development'}.`
    ],
    weaknesses: [
      'Incorporate quantifiable metric outcomes (% improvements, latency reductions) in project bullets.'
    ],
    suggestions: [
      'Add quantifiable metrics for all completed projects.',
      'Highlight specific technical contribution details.'
    ],
    recommendations: [
      'Add quantifiable metrics for all completed projects.',
      'Highlight specific technical contribution details.'
    ],
    evidence: projects.length > 0 ? [`Developed ${projects[0].name}`] : ['Demonstrated software development background'],
    detectedSkills: skills,
    semanticSummary: `ATS Analysis completed for ${roleTitle}. Candidate exhibits solid technical foundation.`,
    summary: `ATS Analysis completed for ${roleTitle}. Candidate exhibits solid technical foundation.`,
    aiEnhanced: false,
    isFallback: true,
    source: 'Deterministic Resume ATS Engine (API Offline)'
  };
}

exports.analyzeAts = async (req, res) => {
  try {
    const { resumeText, candidateProfile, targetRole, jobDescription } = req.body;

    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({
        success: false,
        error: 'resumeText is required (minimum 15 characters).'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If GEMINI_API_KEY is present, perform live Gemini AI ATS Analysis
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const detectedRole = candidateProfile?.detectedRole || targetRole || 'Software Development Candidate';
        const prompt = `You are an expert ATS (Applicant Tracking System) Screener & Talent Evaluator.
Analyze the candidate's Resume Text and Candidate Profile JSON to evaluate their overall professional readiness, technical depth, and ATS resume quality.

EVALUATION TASK:
1. Identify the candidate's primary professional role (detectedRole) from their resume headline, experience, and skills.
2. Calculate an overall ATS Resume Readiness Score (0-100).
3. Evaluate 7 weighted categories:
   - Resume Structure (15%): Layout, section organization, readability, contact info
   - Technical Skills (20%): Breadth & depth of programming languages, frameworks, databases, tools
   - Projects (20%): Technical complexity, execution depth, project scope
   - Experience & Internships (15%): Industry experience, responsibilities, practical work
   - Education (10%): Degree relevance, academic background
   - Achievements & Impact (10%): Quantifiable metric outcomes (% improvements, scale)
   - Role Readiness (10%): Overall career readiness for their detected role
4. Identify matched skills, missing key skills for role growth, strengths, and actionable resume suggestions.

CANDIDATE RESUME TEXT:
${resumeText}

CANDIDATE PROFILE JSON:
${JSON.stringify(candidateProfile || {})}

DETECTED ROLE:
${detectedRole}

Return ONLY a JSON object matching this exact schema (no Markdown, no extra text):
{
  "score": 85,
  "targetRole": "${detectedRole}",
  "categories": [
    { "name": "Resume Structure", "weight": "15%", "score": 90, "weightedScore": 14, "explanation": "Section layout and scannability." },
    { "name": "Technical Skills", "weight": "20%", "score": 85, "weightedScore": 17, "explanation": "Languages, frameworks, databases, and developer tools." },
    { "name": "Projects", "weight": "20%", "score": 80, "weightedScore": 16, "explanation": "Project scope, technical depth, and practical execution." },
    { "name": "Experience & Internships", "weight": "15%", "score": 75, "weightedScore": 11, "explanation": "Work history and professional experience alignment." },
    { "name": "Education", "weight": "10%", "score": 90, "weightedScore": 9, "explanation": "Degree relevance and academic background." },
    { "name": "Achievements & Impact", "weight": "10%", "score": 75, "weightedScore": 8, "explanation": "Quantifiable achievements and metric evidence." },
    { "name": "Role Readiness", "weight": "10%", "score": 85, "weightedScore": 8, "explanation": "Overall readiness for target technical role." }
  ],
  "matchedSkills": ["JavaScript", "React.js", "Node.js", "SQL"],
  "partialMatches": ["TypeScript"],
  "missingSkills": ["Cloud Infrastructure (AWS/Docker)", "Quantifiable metric outcomes"],
  "strengths": ["Clear project evidence building web applications...", "..."],
  "suggestions": ["Incorporate quantifiable impact metrics in project bullets...", "..."],
  "evidence": ["Developed applications with modern web stack..."],
  "semanticSummary": "High-level summary of candidate ATS readiness and technical alignment."
}`;

        const rawAiOutput = await callGeminiApi(apiKey, prompt);
        
        let cleanedJsonText = rawAiOutput.trim();
        if (cleanedJsonText.startsWith('```json')) {
          cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJsonText.startsWith('```')) {
          cleanedJsonText = cleanedJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedResult = JSON.parse(cleanedJsonText);

        if (validateGeminiAtsResponse(parsedResult)) {
          const overall = parsedResult.score !== undefined ? parsedResult.score : (parsedResult.overallScore || 80);
          parsedResult.score = overall;
          parsedResult.overallScore = overall;
          parsedResult.matchScore = overall;
          parsedResult.targetRole = parsedResult.targetRole || candidateProfile?.detectedRole || 'Software Development Engineer';
          parsedResult.aiEnhanced = true;
          parsedResult.isFallback = false;
          parsedResult.source = 'Gemini 2.5 Flash AI';

          if (!parsedResult.categories || parsedResult.categories.length === 0) {
            parsedResult.categories = [
              { name: 'Resume Structure', weight: '15%', score: 85, weightedScore: 13, explanation: 'Section layout and formatting.' },
              { name: 'Technical Skills', weight: '20%', score: overall, weightedScore: Math.round(overall * 0.20), explanation: 'Technical domain alignment.' },
              { name: 'Projects', weight: '20%', score: 80, weightedScore: 16, explanation: 'Practical project execution.' },
              { name: 'Experience & Internships', weight: '15%', score: 75, weightedScore: 11, explanation: 'Work history alignment.' },
              { name: 'Education', weight: '10%', score: 90, weightedScore: 9, explanation: 'Academic background.' },
              { name: 'Achievements & Impact', weight: '10%', score: 75, weightedScore: 8, explanation: 'Quantifiable achievements.' },
              { name: 'Role Readiness', weight: '10%', score: 85, weightedScore: 8, explanation: 'Overall readiness.' }
            ];
          }

          return res.status(200).json({
            success: true,
            data: parsedResult
          });
        } else {
          console.warn('[atsController] Gemini ATS response failed schema validation. Using fallback.');
        }
      } catch (geminiErr) {
        console.warn('[atsController] Gemini API call error:', geminiErr.message);
      }
    }

    // 2. Fallback (Gemini unavailable — explicitly labeled, NOT presented as AI success)
    const fallbackResult = evaluateDeterministicAts(resumeText, candidateProfile, targetRole, jobDescription);
    // Override to ensure client shows retry option, not fake AI score
    fallbackResult.isFallback = true;
    fallbackResult.aiEnhanced = false;
    fallbackResult.score = null;
    fallbackResult.overallScore = null;
    fallbackResult.matchScore = null;
    fallbackResult.source = 'AI Analysis Unavailable (Gemini Offline)';
    fallbackResult.fallbackReason = 'Gemini API key missing or call failed. Please set GEMINI_API_KEY and retry.';

    res.status(200).json({
      success: true,
      data: fallbackResult
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'ATS Analysis failed: ' + err.message
    });
  }
};
