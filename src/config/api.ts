// src/config/api.ts

// -------------------------------------
// HTTP BASE URL
// -------------------------------------
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:4000'
    : window.location.origin);

// -------------------------------------
// WEBSOCKET URL
// -------------------------------------
export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (window.location.hostname === 'localhost'
    ? 'ws://localhost:4000'
    : // Auto-generate correct WS URL in production
      `${window.location.origin.replace(/^http/, 'ws')}`);