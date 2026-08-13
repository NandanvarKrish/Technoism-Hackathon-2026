/* TECHNOISM HACKATHON 2026 — Centralized Frontend API Configuration */

(function () {
  // Detect if served from a web server (http/https) vs opened as a local file (file://)
  const isServedFromWebServer = window.location.protocol === 'http:' || window.location.protocol === 'https:';

  // When served from Node.js backend (http://localhost:5000), use RELATIVE paths.
  // Relative paths resolve against the current origin — no port mismatch, no CORS.
  // When opened as a local file (file://), fall back to absolute localhost URL.
  window.APP_CONFIG = {
    API_BASE_URL: isServedFromWebServer
      ? '/api'
      : 'http://localhost:5000/api',
    REQUEST_TIMEOUT_MS: 30000,
    USE_REMOTE_BACKEND: true
  };

  if (!isServedFromWebServer) {
    console.warn(
      '[Config] App opened as a local file. API calls target http://localhost:5000. ' +
      'For best results, open http://localhost:5000 in your browser.'
    );
  }
})();
