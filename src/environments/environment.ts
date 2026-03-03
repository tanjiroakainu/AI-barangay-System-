export const environment = {
  production: true,
  apiUrl: 'http://cayananlsb-001-site1.rtempurl.com/api',
  /** Gemini API key for AI chatbot on home (non-users). Use a backend proxy in production to avoid exposing the key. */
  geminiApiKey: 'AIzaSyB6Y8tHaMzl6M8OrtSsoEhX488LLKwBsp0',
  /** Model for Gemini (e.g. gemini-pro for v1, or gemini-2.0-flash for v1beta). */
  geminiModel: 'gemini-pro',
  /** Use v1 (stable) for gemini-pro; set false to use v1beta. */
  geminiUseV1: true,
};