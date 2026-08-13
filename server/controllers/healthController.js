// Health Check Controller
exports.getHealth = (req, res) => {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10);
  
  res.status(200).json({
    ok: true,
    status: 'ok',
    service: 'Technoism backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    geminiConfigured,
    // Never expose the actual key — only boolean status
    message: geminiConfigured
      ? 'AI services ready. Gemini API is configured.'
      : 'Gemini API key not configured. Set GEMINI_API_KEY in .env and restart.'
  });
};
