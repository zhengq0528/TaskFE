// src/config/api.ts

// HTTP base URL for REST API
// - Local dev  : falls back to http://localhost:4000
// - Production : MUST be provided via VITE_API_BASE_URL
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// WebSocket base URL for Socket.IO
// Reuses BASE_URL and just swaps http/https -> ws/wss
export const WS_URL = BASE_URL.replace(/^http/, 'ws');