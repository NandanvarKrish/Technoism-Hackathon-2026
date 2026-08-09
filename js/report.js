/* TECHNOISM HACKATHON 2026 — Final Three-Stage Scorecard Report Builder */

window.ReportBuilder = {
  generateFinalReport() {
    const state = window.AppState.getState();
    const { atsResult, interviewResult, codingResult, codingSubmission, targetRole, selectedCompany } = state;

    const weights = (window.APP_CONFIG && window.APP_CONFIG.SCORE_WEIGHTS)
      ? window.APP_CONFIG.SCORE_WEIGHTS
      : { ats: 0.30, interview: 0.35, coding: 0.35 };

    const atsScore = (atsResult && typeof atsResult.overallScore === 'number') ? atsResult.overallScore : null;
    const interviewScore = (interviewResult && typeof interviewResult.overallScore === 'number') ? interviewResult.overallScore : null;
    const codingScore = (codingSubmission && typeof codingSubmission.score === 'number') 
      ? codingSubmission.score 
      : (codingResult && typeof codingResult.overallScore === 'number' ? codingResult.overallScore : null);

    const isAtsDone = atsScore !== null;
    const isInterviewDone = interviewScore !== null;
    const isCodingDone = codingScore !== null;

    let readinessScore = null;
    let readinessLevel = 'Incomplete Assessment';

    if (isAtsDone && isInterviewDone && isCodingDone) {
      readinessScore = Math.round(
        (atsScore * weights.ats) +
        (interviewScore * weights.interview) +
        (codingScore * weights.coding)
      );

      if (readinessScore >= 85) readinessLevel = 'High Readiness / Exceptional Role Fit';
      else if (readinessScore >= 70) readinessLevel = 'Job Ready / Solid Candidate Fit';
      else readinessLevel = 'Needs Targeted Development';
    }

    const relevanceScore = interviewResult ? (interviewResult.averageRelevance || 80) : '--';
    const clarityScore = interviewResult ? (interviewResult.averageClarity || 85) : '--';
    const structureScore = interviewResult ? (interviewResult.averageStructure || 80) : '--';

    // Synthesize Strengths across all 3 rounds
    const combinedStrengths = [
      ...(atsResult && atsResult.strengths ? atsResult.strengths : []),
      ...(interviewResult && interviewResult.strongestAreas ? interviewResult.strongestAreas.map(s => `Interview strength: ${s}`) : []),
      ...(isCodingDone ? [`Demonstrated coding efficiency (${codingSubmission?.complexity?.time || 'O(N)'} time complexity)`] : [])
    ];

    // Synthesize Gaps & Weaknesses across all 3 rounds
    const combinedGaps = [
      ...(atsResult && atsResult.weaknesses ? atsResult.weaknesses : []),
      ...(interviewResult && interviewResult.weakestAreas ? interviewResult.weakestAreas.map(w => `Interview gap: ${w}`) : []),
      ...(codingSubmission && codingSubmission.status !== 'Accepted' ? [`Coding execution issue: ${codingSubmission.status}`] : [])
    ];

    // Personalized Recommendations based on actual round performance
    const personalizedActions = [];

    if (atsResult && atsResult.missingSkills && atsResult.missingSkills.length > 0) {
      personalizedActions.push(`Incorporate explicit resume evidence and metrics for missing skills: ${atsResult.missingSkills.slice(0, 3).join(', ')}.`);
    }

    if (interviewResult && interviewResult.weakestAreas && interviewResult.weakestAreas.length > 0) {
      personalizedActions.push(`Refine technical communication and STAR structure for: ${interviewResult.weakestAreas.slice(0, 2).join(', ')}.`);
    }

    if (codingSubmission) {
      if (codingSubmission.status !== 'Accepted') {
        personalizedActions.push(`Prioritize debugging edge cases and algorithmic practice for ${selectedCompany || 'target company'} coding rounds.`);
      } else {
        personalizedActions.push(`Maintain optimal ${codingSubmission.complexity?.time || 'O(N)'} algorithmic efficiency in live pair-programming screenings.`);
      }
    } else {
      personalizedActions.push(`Complete the Company Coding Round to receive tailored algorithmic preparation advice.`);
    }

    const report = {
      targetRole: targetRole || 'Target Role',
      atsScoreDisplay: isAtsDone ? `${atsScore}%` : 'Not completed',
      interviewScoreDisplay: isInterviewDone ? `${interviewScore}%` : 'Not completed',
      codingScoreDisplay: isCodingDone ? `${codingScore}%` : 'Not completed',
      atsScore,
      interviewScore,
      codingScore,
      readinessScoreDisplay: readinessScore !== null ? `${readinessScore}%` : 'Not completed',
      readinessScore,
      readinessLevel,
      relevanceScore,
      clarityScore,
      structureScore,
      strengths: [...new Set(combinedStrengths)],
      gaps: [...new Set(combinedGaps)],
      nextActions: [...new Set(personalizedActions)]
    };

    window.AppState.setState({ finalReport: report });
    return report;
  }
};
