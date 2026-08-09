// Final Three-Stage Scorecard & Report Controller

exports.generateFinalReport = (req, res) => {
  try {
    const { atsResult, interviewResult, codingSubmission, targetRole, selectedCompany } = req.body;

    const atsScore = (atsResult && typeof atsResult.overallScore === 'number') ? atsResult.overallScore : (typeof req.body.atsScore === 'number' ? req.body.atsScore : null);
    const interviewScore = (interviewResult && typeof interviewResult.overallScore === 'number') ? interviewResult.overallScore : (typeof req.body.interviewScore === 'number' ? req.body.interviewScore : null);
    const codingScore = (codingSubmission && typeof codingSubmission.score === 'number') ? codingSubmission.score : (typeof req.body.codingScore === 'number' ? req.body.codingScore : null);

    // Locking enforcement check
    if (atsScore === null || interviewScore === null || codingScore === null) {
      return res.status(403).json({
        success: false,
        error: 'Final Scorecard requires completing all three rounds: ATS Resume Analysis, General AI Mock Interview, and Company Coding Round.'
      });
    }

    // Configurable Default Weights: ATS = 30%, General Interview = 35%, Company Coding = 35%
    const weights = { ats: 0.30, interview: 0.35, coding: 0.35 };

    const readinessScore = Math.round(
      (atsScore * weights.ats) +
      (interviewScore * weights.interview) +
      (codingScore * weights.coding)
    );

    let readinessLevel = 'Job Ready Candidate';
    if (readinessScore >= 85) readinessLevel = 'High Readiness / Exceptional Role Fit';
    else if (readinessScore >= 70) readinessLevel = 'Job Ready / Solid Candidate Fit';
    else readinessLevel = 'Needs Targeted Development';

    const role = targetRole || atsResult?.targetRole || 'Software Development Engineer';
    const company = selectedCompany || 'Target Employer';

    // Synthesize personalized strengths across all 3 rounds
    const strengths = [
      ...(atsResult?.strengths || []),
      ...(interviewResult?.strongestAreas ? interviewResult.strongestAreas.map(s => `Interview strength: ${s}`) : []),
      ...(codingSubmission?.complexity ? [`Coding algorithmic efficiency (${codingSubmission.complexity.time} time complexity)`] : [])
    ];

    // Synthesize personalized gaps across all 3 rounds
    const gaps = [
      ...(atsResult?.weaknesses || []),
      ...(interviewResult?.weakestAreas ? interviewResult.weakestAreas.map(w => `Interview weakness: ${w}`) : []),
      ...(codingSubmission?.status !== 'Accepted' ? [`Coding execution status: ${codingSubmission?.status || 'Incomplete'}`] : [])
    ];

    // Personalized nextActions based on actual performance
    const nextActions = [];

    if (atsResult?.missingSkills && atsResult.missingSkills.length > 0) {
      nextActions.push(`Incorporate explicit resume project bullets for missing skills: ${atsResult.missingSkills.slice(0, 3).join(', ')}.`);
    }

    if (interviewResult?.weakestAreas && interviewResult.weakestAreas.length > 0) {
      nextActions.push(`Refine technical communication and STAR structure for: ${interviewResult.weakestAreas.slice(0, 2).join(', ')}.`);
    }

    if (codingSubmission?.status !== 'Accepted') {
      nextActions.push(`Prioritize algorithmic problem-solving and edge case validation for ${company} coding rounds.`);
    } else {
      nextActions.push(`Maintain optimal ${codingSubmission.complexity?.time || 'O(N)'} space/time performance in live technical screenings.`);
    }

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        company,
        weights,
        atsScore,
        interviewScore,
        codingScore,
        readinessScore,
        readinessLevel,
        strengths: [...new Set(strengths)],
        gaps: [...new Set(gaps)],
        nextActions: [...new Set(nextActions)]
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Final report generation failed: ' + err.message
    });
  }
};
