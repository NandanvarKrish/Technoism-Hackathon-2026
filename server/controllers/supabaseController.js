const { verifyConnection, isConfigured, supabase } = require('../services/supabaseService');

async function handleGetDbStatus(req, res) {
  try {
    const status = await verifyConnection();
    return res.json({
      success: true,
      database_status: status
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Error checking database status: ${err.message}`
    });
  }
}

async function handleSaveScorecard(req, res) {
  try {
    const { candidate_name, target_role, ats_score, general_interview_score, coding_score, final_readiness_score } = req.body;

    if (isConfigured() && supabase) {
      const { data, error } = await supabase.from('final_scorecards').insert([{
        ats_score,
        general_interview_score,
        coding_score,
        final_readiness_score,
        readiness_level: final_readiness_score >= 80 ? "Interview Ready" : "Developing",
        executive_summary: `Candidate ${candidate_name || ''} achieved an overall readiness score of ${final_readiness_score}%.`,
        actionable_roadmap: ["Practice mock interviews", "Optimize system design depth"]
      }]).select();

      if (error) {
        console.warn("Supabase save warning:", error.message);
      } else {
        return res.json({
          success: true,
          persisted_to_supabase: true,
          data: data
        });
      }
    }

    return res.json({
      success: true,
      persisted_to_supabase: false,
      mode: "Local Session Storage",
      message: "Scorecard successfully compiled and cached locally."
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Error saving scorecard: ${err.message}`
    });
  }
}

module.exports = {
  handleGetDbStatus,
  handleSaveScorecard
};
