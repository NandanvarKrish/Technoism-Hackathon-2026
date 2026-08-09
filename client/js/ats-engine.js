/* TECHNOISM HACKATHON 2026 — Authoritative Resume ATS Analysis Engine */

(function(root) {
  const AtsEngine = {
    config: {
      weights: {
        resumeStructure: 0.15,
        technicalSkills: 0.20,
        projects: 0.20,
        experience: 0.15,
        education: 0.10,
        achievements: 0.05,
        impact: 0.05,
        roleReadiness: 0.10
      }
    },

    // Primary Resume-Driven ATS Analysis
    analyzeResume(resumeText, candidateProfile = {}, targetRole = '') {
      const text = (resumeText || '').trim();
      if (!text || text.length < 10) {
        throw new Error('Resume text is too brief to perform ATS analysis.');
      }

      const textLower = text.toLowerCase();
      const profile = candidateProfile || {};

      const skills = profile.skills || [];
      const projects = profile.projects || [];
      const experience = profile.experience || [];
      const education = profile.education || [];

      const roleTitle = targetRole || profile.detectedRole || 'Software Development Candidate';

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
        overallScore,
        score: overallScore,
        matchScore: overallScore,
        targetRole: roleTitle,
        detectedRoles: [roleTitle],
        categoryScores,
        categories,
        matchedSkills: skills,
        missingSkills: ['Cloud Infrastructure (AWS/Docker)', 'Quantifiable percentage impact metrics'],
        strengths: [
          `Strong technical foundation in ${skills.slice(0, 4).join(', ') || 'software engineering'}.`,
          `Demonstrated project work in ${projects.map(p => p.name).join(', ') || 'modern application development'}.`
        ],
        weaknesses: [
          'Incorporate quantifiable metric outcomes (% improvements, latency reductions) in project bullets.'
        ],
        missingElements: [
          'Cloud infrastructure or automated CI/CD deployment highlights.'
        ],
        recommendations: [
          'Add quantifiable metrics for all completed projects.',
          'Highlight specific technical contribution details.'
        ],
        detectedSkills: skills,
        projectInsights: projects.map(p => `Project "${p.name}": evaluates practical execution.`),
        experienceInsights: experience.map(e => `Role "${e.title}": evaluates industry readiness.`),
        summary: `Resume ATS Analysis completed for ${roleTitle}. Candidate exhibits solid technical foundation.`,
        aiEnhanced: false,
        isFallback: true,
        source: 'Deterministic Resume ATS Engine (API Offline)'
      };
    },

    // Method Aliases for complete API contract compatibility
    analyze(resumeText, candidateProfile, targetRole) {
      return this.analyzeResume(resumeText, candidateProfile, targetRole);
    },

    analyzeMatch(resumeText, jobDescription, targetRole) {
      return this.analyzeResume(resumeText, {}, targetRole);
    },

    analyzeCandidate(resumeText, candidateProfile) {
      return this.analyzeResume(resumeText, candidateProfile, '');
    },

    runATSAnalysis(resumeText, candidateProfile) {
      return this.analyzeResume(resumeText, candidateProfile, '');
    },

    evaluateResume(resumeText, candidateProfile) {
      return this.analyzeResume(resumeText, candidateProfile, '');
    }
  };

  // Expose to window / global object & module exports
  if (typeof window !== 'undefined') {
    window.AtsEngine = AtsEngine;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.AtsEngine = AtsEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AtsEngine;
  }
})(typeof window !== 'undefined' ? window : this);
