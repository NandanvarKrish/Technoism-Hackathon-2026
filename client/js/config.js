/* TECHNOISM HACKATHON 2026 — Centralized Frontend API Configuration */

window.APP_CONFIG = {
  // Centralized Backend API Base URL (Configurable without hardcoding localhost across code)
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api',
  
  // Timeout settings
  REQUEST_TIMEOUT_MS: 15000,
  
  // Feature Toggles
  USE_REMOTE_BACKEND: true
};
