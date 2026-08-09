/* TECHNOISM HACKATHON 2026 — Final Report Builder */

window.ReportBuilder = {
  generateFinalReport() {
    const state = window.AppState.getState();
    const { atsResult, interviewResult, targetRole } = state;

    const atsScore = atsResult ? (atsResult.score || atsResult.matchScore || 75) : 75;
    const interviewScore = interviewResult ? (interviewResult.interviewScore || 80) : 80;

    const relevanceScore = interviewResult ? (interviewResult.relevanceScore || 80) : 80;
    const clarityScore = interviewResult ? (interviewResult.clarityScore || 82) : 82;
    const structureScore = interviewResult ? (interviewResult.structureScore || 78) : 78;

    // Combined overall readiness score calculation
    // ATS Resume Fit: 45%, Mock Interview Readiness: 55%
    const readinessScore = Math.round((atsScore * 0.45) + (interviewScore * 0.55));

    let readinessLevel = 'Job Ready Candidate';
    if (readinessScore >= 85) readinessLevel = 'High Readiness / Strong Role Fit';
    else if (readinessScore >= 70) readinessLevel = 'Job Ready / Moderate Fit';
    else readinessLevel = 'Needs Targeted Skill Development';

    const combinedStrengths = [
      ...(atsResult && atsResult.strengths ? atsResult.strengths : []),
      ...(interviewResult && interviewResult.strengths ? interviewResult.strengths : [])
    ];

    const combinedGaps = [
      ...(atsResult && atsResult.missingSkills && atsResult.missingSkills.length > 0
        ? atsResult.missingSkills.map(s => `Missing ATS keyword evidence: ${s}`) 
        : []),
      ...(interviewResult && interviewResult.improvements ? interviewResult.improvements : [])
    ];

    const nextActions = [
      `Add explicit resume evidence and project bullets for missing keywords (${atsResult && atsResult.missingSkills ? atsResult.missingSkills.slice(0, 3).join(', ') : 'target technical skills'}).`,
      `Practice structuring behavioral interview responses using the STAR method (Situation, Task, Action, Result).`,
      `Quantify personal project outcomes with measurable performance metrics (e.g., % improvement, user count, or speed gains).`,
      `Review technical fundamentals for ${targetRole || 'target role'} prior to live technical screening.`
    ];

    const report = {
      targetRole: targetRole || 'Target Role',
      atsScore,
      interviewScore,
      readinessScore,
      readinessLevel,
      relevanceScore,
      clarityScore,
      structureScore,
      strengths: [...new Set(combinedStrengths)],
      gaps: [...new Set(combinedGaps)],
      nextActions: [...new Set(nextActions)]
    };

    window.AppState.setState({ finalReport: report });
    return report;
  }
};

