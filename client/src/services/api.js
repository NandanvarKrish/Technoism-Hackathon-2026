/**
 * Tech Titans - API Service Client
 * Handles communication between React Frontend and Express Backend REST APIs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export const apiService = {
  // Health Check
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  // Database Status Check
  async getDbStatus() {
    const res = await fetch(`${API_BASE_URL}/db-status`);
    return handleResponse(res);
  },

  // Resume Upload & Processing
  async uploadResume(formDataOrText) {
    let options = {};
    if (formDataOrText instanceof FormData) {
      options = {
        method: 'POST',
        body: formDataOrText,
      };
    } else {
      options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text_override: formDataOrText }),
      };
    }
    const res = await fetch(`${API_BASE_URL}/resume/upload`, options);
    return handleResponse(res);
  },

  // ATS Matching Analysis
  async analyzeAts(data) {
    const res = await fetch(`${API_BASE_URL}/ats/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // General AI Interview Generation
  async generateInterview(data) {
    const res = await fetch(`${API_BASE_URL}/interview/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Evaluate General AI Interview Responses
  async evaluateInterview(data) {
    const res = await fetch(`${API_BASE_URL}/interview/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Get Companies Dataset
  async getCompanies() {
    const res = await fetch(`${API_BASE_URL}/coding/companies`);
    return handleResponse(res);
  },

  // Generate Personalized Company Coding Challenge
  async generateCodingChallenge(data) {
    const res = await fetch(`${API_BASE_URL}/coding/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Evaluate Coding Solution
  async evaluateCodingSubmission(data) {
    const res = await fetch(`${API_BASE_URL}/coding/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Save Final Scorecard
  async saveScorecard(data) {
    const res = await fetch(`${API_BASE_URL}/scorecard/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};
