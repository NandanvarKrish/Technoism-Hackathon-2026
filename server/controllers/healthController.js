// Health Check Controller
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Tech Titans API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};
