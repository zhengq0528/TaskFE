// src/config/api.ts

// Change these to match your Railway backend backend URL:
const PROD_API = "https://taskbe-production-f738.up.railway.app";

// HTTP BASE URL
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : PROD_API);

// WEBSOCKET URL
export const WS_URL =
  import.meta.env.VITE_WS_URL ||
  (window.location.hostname === "localhost"
    ? "ws://localhost:4000"
    : PROD_API.replace("https://", "wss://"));