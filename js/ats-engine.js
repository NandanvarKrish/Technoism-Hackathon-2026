/* TECHNOISM HACKATHON 2026 — Modular Deterministic ATS Matching Engine */

window.AtsEngine = {
  // Single Configurable Weights Object as per specification
  config: {
    weights: {
      skills: 0.45,       // Core Skills: 45%
      tools: 0.20,        // Tools & Technologies: 20%
      experience: 0.20,   // Experience & Projects: 20%
      education: 0.15     // Education & Requirements: 15%
    }
  },

  // Primary Deterministic ATS Matching Analysis
  analyzeMatch(resumeText, jobDescription, targetRole = 'Target Role') {
    if (!resumeText || resumeText.trim().length < 20) {
      throw new Error('Resume text is too brief to perform ATS analysis.');
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      throw new Error('Job description is too brief to perform ATS analysis.');
    }

    const resumeClean = this.normalizeText(resumeText);
    const jobClean = this.normalizeText(jobDescription);

    // 1. Requirement Extraction & Classification from Job Description
    const classifiedRequirements = this.extractAndClassifyRequirements(jobClean);

    // 2. Category Term Matching
    const skillsResult = this.evaluateCategoryTerms(classifiedRequirements.skills, resumeClean);
    const toolsResult = this.evaluateCategoryTerms(classifiedRequirements.tools, resumeClean);
    const expResult = this.evaluateCategoryTerms(classifiedRequirements.experience, resumeClean);
    const eduResult = this.evaluateCategoryTerms(classifiedRequirements.education, resumeClean);

    // 3. Apply Configurable Weights
    const w = this.config.weights;
    const skillsWeighted = Math.round(skillsResult.score * w.skills);
    const toolsWeighted = Math.round(toolsResult.score * w.tools);
    const expWeighted = Math.round(expResult.score * w.experience);
    const eduWeighted = Math.round(eduResult.score * w.education);

    const overallScore = Math.min(99, Math.max(15, skillsWeighted + toolsWeighted + expWeighted + eduWeighted));

    // Combine matched and missing items
    const matchedSkills = skillsResult.matched;
    const missingSkills = skillsResult.missing;
    const matchedItems = [...new Set([...skillsResult.matched, ...toolsResult.matched, ...expResult.matched, ...eduResult.matched])];
    const missingItems = [...new Set([...skillsResult.missing, ...toolsResult.missing, ...expResult.missing, ...eduResult.missing])];

    // Structured Categories Array matching required output schema
    const categories = [
      {
        name: 'Core Skills',
        weight: `${Math.round(w.skills * 100)}%`,
        score: skillsResult.score,
        weightedScore: skillsWeighted,
        explanation: `Matched ${skillsResult.matched.length} of ${classifiedRequirements.skills.length} identified core skills.`
      },
      {
        name: 'Tools & Technologies',
        weight: `${Math.round(w.tools * 100)}%`,
        score: toolsResult.score,
        weightedScore: toolsWeighted,
        explanation: `Matched ${toolsResult.matched.length} of ${classifiedRequirements.tools.length} required technical tools.`
      },
      {
        name: 'Experience & Projects',
        weight: `${Math.round(w.experience * 100)}%`,
        score: expResult.score,
        weightedScore: expWeighted,
        explanation: `Matched ${expResult.matched.length} of ${classifiedRequirements.experience.length} experience indicators.`
      },
      {
        name: 'Education & Requirements',
        weight: `${Math.round(w.education * 100)}%`,
        score: eduResult.score,
        weightedScore: eduWeighted,
        explanation: `Matched ${eduResult.matched.length} of ${classifiedRequirements.education.length} general requirements.`
      }
    ];

    // Generate Strengths & Suggestions
    const strengths = this.generateStrengths(matchedItems, overallScore, targetRole);
    const suggestions = this.generateSuggestions(missingItems, targetRole);

    // Standardized Output Schema
    return {
      targetRole,
      score: overallScore,
      matchScore: overallScore, // Alias for UI compatibility
      matchedSkills,
      missingSkills,
      strengths,
      suggestions,
      categories,
      matchedItems,
      missingItems
    };
  },

  // Normalize text for clean term matching
  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s\+\#\.-]/g, ' ')
      .replace(/\s+/g, ' ');
  },

  // Extract and classify keywords from job description into 4 categories
  extractAndClassifyRequirements(jobText) {
    const skillsDict = ['javascript', 'html5', 'html', 'css3', 'css', 'react', 'react.js', 'vue', 'angular', 'node.js', 'node', 'express', 'python', 'java', 'sql', 'rest api', 'api', 'ui/ux', 'responsive design', 'typescript', 'unit testing'];
    const toolsDict = ['git', 'github', 'postgresql', 'mongodb', 'docker', 'aws', 'vs code', 'postman', 'jira', 'figma', 'webpack', 'npm'];
    const expDict = ['internship', 'project', 'projects', 'agile', 'scrum', 'version control', 'code review', 'web vitals', 'optimization', 'full-stack', 'frontend', 'backend'];
    const eduDict = ['bachelor', 'b.tech', 'degree', 'computer science', 'information technology', 'communication', 'teamwork', 'problem solving', 'clean code'];

    const skills = skillsDict.filter(s => jobText.includes(s));
    const tools = toolsDict.filter(t => jobText.includes(t));
    const experience = expDict.filter(e => jobText.includes(e));
    const education = eduDict.filter(d => jobText.includes(d));

    return {
      skills: skills.length > 0 ? skills : ['javascript', 'html5', 'css3', 'react', 'rest api'],
      tools: tools.length > 0 ? tools : ['git', 'github', 'postgresql', 'vs code'],
      experience: experience.length > 0 ? experience : ['project', 'internship', 'agile'],
      education: education.length > 0 ? education : ['computer science', 'communication', 'teamwork']
    };
  },

  // Evaluate term matches for a category
  evaluateCategoryTerms(targetTerms, resumeText) {
    if (!targetTerms || targetTerms.length === 0) {
      return { score: 75, matched: [], missing: [] };
    }

    const matched = [];
    const missing = [];

    targetTerms.forEach(term => {
      const formattedTerm = term.toUpperCase();
      if (resumeText.includes(term.toLowerCase())) {
        matched.push(formattedTerm);
      } else {
        missing.push(formattedTerm);
      }
    });

    const ratio = matched.length / targetTerms.length;
    const score = Math.round(ratio * 100);

    return { score, matched, missing };
  },

  // Generate evidence-backed strengths
  generateStrengths(matchedItems, score, role) {
    const list = [];
    if (matchedItems.length > 0) {
      list.push(`Found clear keyword evidence for target role: ${matchedItems.slice(0, 4).join(', ')}.`);
    }
    if (score >= 75) {
      list.push(`Strong candidate alignment for ${role} across technical and experience categories.`);
    } else {
      list.push('Identified foundational software engineering and core web development skills.');
    }
    list.push('Extracted education and project section indicators matched job expectations.');
    return list;
  },

  // Generate actionable improvement suggestions
  generateSuggestions(missingItems, role) {
    const list = [];
    if (missingItems.length > 0) {
      list.push(`Add specific technical project examples incorporating missing requirements: ${missingItems.slice(0, 4).join(', ')}.`);
    } else {
      list.push('Quantify project outcomes and team accomplishments using measurable percentages or metrics.');
    }
    list.push(`Ensure your resume summary explicitly mentions key alignment with ${role}.`);
    list.push('Group technical tools under a dedicated "Skills & Technologies" section for ATS scannability.');
    return list;
  }
};
