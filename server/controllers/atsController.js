const https = require('https');

// Validate Gemini Resume ATS Response Schema
function validateGeminiResumeAtsResponse(obj) {
  if (!obj || typeof obj !== 'object') return false;

  const score = obj.overallScore || obj.score;
  if (typeof score !== 'number' || score < 0 || score > 100) return false;

  if (!obj.categoryScores || typeof obj.categoryScores !== 'object') return false;
  if (!Array.isArray(obj.strengths)) return false;
  if (!Array.isArray(obj.weaknesses) && !Array.isArray(obj.missingSkills)) return false;
  if (!Array.isArray(obj.recommendations) && !Array.isArray(obj.suggestions)) return false;

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

// Deterministic Resume Readiness Fallback Engine
function evaluateDeterministicResumeAts(resumeText, candidateProfile) {
  const textLower = (resumeText || '').toLowerCase();
  const profile = candidateProfile || {};

  const skills = profile.skills || [];
  const projects = profile.projects || [];
  const experience = profile.experience || [];
  const education = profile.education || [];

  const headline = profile.detectedRole || profile.headline || 'Software Engineering Candidate';

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
    { name: 'Resume Structure', weight: '15%', score: categoryScores.resumeStructure, weightedScore: Math.round(categoryScores.resumeStructure * 0.15), explanation: 'Section organization, contact details, and layout readability.' },
    { name: 'Technical Skills', weight: '20%', score: categoryScores.technicalSkills, weightedScore: Math.round(categoryScores.technicalSkills * 0.20), explanation: 'Breadth and depth of programming languages, frameworks, and tools.' },
    { name: 'Projects', weight: '20%', score: categoryScores.projects, weightedScore: Math.round(categoryScores.projects * 0.20), explanation: 'Substantive project execution and technical complexity.' },
    { name: 'Experience & Internships', weight: '15%', score: categoryScores.experience, weightedScore: Math.round(categoryScores.experience * 0.15), explanation: 'Practical industry work or internship evidence.' },
    { name: 'Education', weight: '10%', score: categoryScores.education, weightedScore: Math.round(categoryScores.education * 0.10), explanation: 'Degree alignment and academic background.' },
    { name: 'Achievements & Impact', weight: '10%', score: categoryScores.impact, weightedScore: Math.round(categoryScores.impact * 0.10), explanation: 'Quantifiable metrics and accomplishment evidence.' },
    { name: 'Role Readiness', weight: '10%', score: categoryScores.roleReadiness, weightedScore: Math.round(categoryScores.roleReadiness * 0.10), explanation: 'Overall career readiness for target professional domain.' }
  ];

  return {
    overallScore,
    score: overallScore,
    matchScore: overallScore,
    targetRole: headline,
    detectedRoles: [headline],
    categoryScores,
    categories,
    strengths: [
      `Strong technical foundation in ${skills.slice(0, 4).join(', ') || 'core software engineering'}.`,
      `Demonstrated project work in ${projects.map(p => p.name).join(', ') || 'modern application development'}.`
    ],
    weaknesses: [
      'Incorporate more quantitative metric results (% improvements, latency reductions) in experience bullets.'
    ],
    missingElements: [
      'Explicit certifications or cloud deployment project highlights.'
    ],
    recommendations: [
      'Add quantifiable metric outcomes for all completed projects.',
      'Highlight specific leadership and technical contribution details.'
    ],
    detectedSkills: skills,
    projectInsights: projects.map(p => `Project "${p.name}": evaluates core practical skills.`),
    experienceInsights: experience.map(e => `Role "${e.title}": evaluates industry readiness.`),
    summary: `Resume ATS Analysis completed for ${headline}. Candidate exhibits a solid foundation with clear project evidence.`,
    aiEnhanced: false,
    isFallback: true,
    source: 'Deterministic Resume ATS Engine (API Offline)'
  };
}

exports.analyzeAts = async (req, res) => {
  try {
    const { resumeText, candidateProfile } = req.body;

    if (!resumeText || resumeText.trim().length < 15) {
      return res.status(400).json({
        success: false,
        error: 'resumeText is required (minimum 15 characters).'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 1. If GEMINI_API_KEY is present, perform live Gemini AI Resume ATS Analysis
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const prompt = `You are an expert Resume ATS Evaluator & Career Readiness Auditor.
Analyze the candidate's Resume Text and Candidate Profile JSON.
Do NOT look for a job description. Perform an independent, rigorous ATS Readiness evaluation of the resume itself.

EVALUATION CRITERIA:
1. Resume Structure & Completeness (15%)
2. Technical Skills & Diversity (20%)
3. Project Quality & Technical Depth (20%)
4. Practical Experience & Internships (15%)
5. Education Alignment (10%)
6. Achievements & Quantifiable Impact (10%)
7. Overall Role Readiness (10%)

CANDIDATE RESUME TEXT:
${resumeText}

CANDIDATE PROFILE JSON:
${JSON.stringify(candidateProfile || {})}

Return ONLY a JSON object matching this exact schema:
{
  "overallScore": 85,
  "categoryScores": {
    "resumeStructure": 90,
    "technicalSkills": 85,
    "projects": 80,
    "experience": 75,
    "education": 90,
    "achievements": 80,
    "impact": 75,
    "roleReadiness": 85
  },
  "detectedRoles": ["Full-Stack & Frontend Developer"],
  "strengths": ["Clear project evidence building responsive applications...", "..."],
  "weaknesses": ["Lack of quantifiable percentage metrics in project descriptions...", "..."],
  "missingElements": ["Cloud infrastructure deployment evidence...", "..."],
  "recommendations": ["Incorporate quantifiable impact metrics in project bullets...", "..."],
  "detectedSkills": ["JavaScript", "TypeScript", "React.js", "Node.js"],
  "projectInsights": ["Project 1 demonstrates good technical integration..."],
  "experienceInsights": ["Work history indicates hands-on development experience..."],
  "summary": "High-level summary of candidate resume ATS readiness."
}`;

        const rawAiOutput = await callGeminiApi(apiKey, prompt);
        
        let cleanedJsonText = rawAiOutput.trim();
        if (cleanedJsonText.startsWith('```json')) {
          cleanedJsonText = cleanedJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedJsonText.startsWith('```')) {
          cleanedJsonText = cleanedJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsedResult = JSON.parse(cleanedJsonText);

        if (validateGeminiResumeAtsResponse(parsedResult)) {
          const overall = parsedResult.overallScore || 80;
          parsedResult.score = overall;
          parsedResult.matchScore = overall;
          parsedResult.targetRole = parsedResult.detectedRoles?.[0] || candidateProfile?.detectedRole || 'Software Development Engineer';
          parsedResult.aiEnhanced = true;
          parsedResult.isFallback = false;
          parsedResult.source = 'Gemini 2.5 Flash AI';

          const cats = parsedResult.categoryScores || {};
          parsedResult.categories = [
            { name: 'Resume Structure', weight: '15%', score: cats.resumeStructure || 85, weightedScore: Math.round((cats.resumeStructure || 85) * 0.15), explanation: 'Section layout, formatting, and scannability.' },
            { name: 'Technical Skills', weight: '20%', score: cats.technicalSkills || 85, weightedScore: Math.round((cats.technicalSkills || 85) * 0.20), explanation: 'Languages, frameworks, databases, and developer tools.' },
            { name: 'Projects', weight: '20%', score: cats.projects || 80, weightedScore: Math.round((cats.projects || 80) * 0.20), explanation: 'Project scope, technical depth, and practical execution.' },
            { name: 'Experience & Internships', weight: '15%', score: cats.experience || 75, weightedScore: Math.round((cats.experience || 75) * 0.15), explanation: 'Work history and professional experience alignment.' },
            { name: 'Education', weight: '10%', score: cats.education || 90, weightedScore: Math.round((cats.education || 90) * 0.10), explanation: 'Degree relevance and academic background.' },
            { name: 'Achievements & Impact', weight: '10%', score: cats.impact || cats.achievements || 75, weightedScore: Math.round((cats.impact || 75) * 0.10), explanation: 'Quantifiable achievements and metric evidence.' },
            { name: 'Role Readiness', weight: '10%', score: cats.roleReadiness || 85, weightedScore: Math.round((cats.roleReadiness || 85) * 0.10), explanation: 'Overall readiness for target technical role.' }
          ];

          return res.status(200).json({
            success: true,
            data: parsedResult
          });
        } else {
          console.warn('[atsController] Gemini Resume ATS response failed schema validation. Using fallback.');
        }
      } catch (geminiErr) {
        console.warn('[atsController] Gemini API call error:', geminiErr.message);
      }
    }

    // 2. Fallback Resume ATS Engine
    const fallbackResult = evaluateDeterministicResumeAts(resumeText, candidateProfile);

    res.status(200).json({
      success: true,
      data: fallbackResult
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Resume ATS Analysis failed: ' + err.message
    });
  }
};
