// Final Scorecard & Report Controller

exports.generateFinalReport = (req, res) => {
  try {
    const { atsScore = 80, interviewScore = 82, codingScore = 85, targetRole } = req.body;
    const role = targetRole || 'Target Role';

    // Calculate readiness score
    const readinessScore = Math.round((atsScore * 0.30) + (interviewScore * 0.35) + (codingScore * 0.35));

    let readinessLevel = 'Job Ready Candidate';
    if (readinessScore >= 85) readinessLevel = 'High Readiness / Strong Role Fit';
    else if (readinessScore >= 70) readinessLevel = 'Job Ready / Moderate Fit';
    else readinessLevel = 'Needs Targeted Skill Development';

    res.status(200).json({
      success: true,
      data: {
        targetRole: role,
        atsScore,
        interviewScore,
        codingScore,
        readinessScore,
        readinessLevel,
        strengths: [
          'Solid baseline candidate resume scannability and keyword placement.',
          'Demonstrated strong technical problem solving during interview rounds.'
        ],
        gaps: [
          'Further detail required for high-scale backend transaction handling.',
          'Add quantitative percentage achievements to resume project experience.'
        ],
        nextActions: [
          'Review company-specific coding algorithms prior to technical screening.',
          'Quantify project outcomes with measurable performance metrics.'
        ]
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Final report generation failed: ' + err.message
    });
  }
};
