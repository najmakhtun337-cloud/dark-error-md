/**
 * API Configuration & Utilities
 * @module config/api
 * @author Sir LOFT
 * @version 2.0
 * @lastUpdated 2025-11-07
 */

const fetch = require('node-fetch'); // Pre-import for performance

// === APK & App Sources ===
const APIs = {
  // ID → Base URL
  aptoide: 'http://ws75.aptoide.com/api/7',
  apkcombo: 'https://apkcombo.com',
  apkdl: 'apk-dl.com',
  evozi: 'https://apps.evozi.com/apk-downloader',
  apkSupport: 'https://apk.support',
  cafeBazaar: 'https://cafebazaar.ir',
};

// === Voice AI API (Centralized) ===
const VOICE_AI_API = 'https://api.siputzx.my.id/api/ai/gpt3';

// === Proxy for Bypassing Restrictions (Google Translate Proxy) ===
const Proxy = (url = '') => {
  if (!url) return '';
  try {
    return `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp`;
  } catch {
    return url; // Fallback
  }
};

/**
 * Build full API URL with query params
 * @param {string|number} id - API identifier (from APIs object or full URL)
 * @param {string} [path='/'] - Endpoint path
 * @param {Object} [query={}] - Query parameters
 * @returns {string} Full URL
 */
const api = (id, path = '/', query = {}) => {
  let base = typeof id === 'string' && id.startsWith('http') ? id : APIs[id];

  if (!base) {
    console.warn(`[API] Unknown ID: ${id}, using fallback`);
    base = id; // Allow raw URLs
  }

  // Normalize path
  if (path && !path.startsWith('/')) path = '/' + path;

  // Build query string safely
  const params = query && Object.keys(query).length
    ? '?' + new URLSearchParams(Object.entries(query)).toString()
    : '';

  return base + path + params;
};

// === Export ===
module.exports = {
  APIs,
  VOICE_AI_API,
  Proxy,
  api,
  fetch, // Optional: expose for convenience
};