/* TECHNOISM HACKATHON 2026 — Centralized Frontend API Configuration */

window.APP_CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api',
  REQUEST_TIMEOUT_MS: 15000,
  USE_REMOTE_BACKEND: true
};
