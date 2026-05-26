// Environment configuration for API base URL
// Supports VITE_API_URL environment variable or defaults based on environment

// Get environment from Vite (VITE_APP_ENV or fallback to mode)
const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;

// Backend API base URL. Must point to the API gateway/backend, NOT the frontend dev server (e.g. not http://localhost:5173).
const DEFAULT_DEV_API = 'http://52.209.34.34:5150/api/v1';
// const DEFAULT_DEV_API = "http://10.150.5.62:5150/api/v1";

const getApiUrl = (): string => {
  let url: string;
  // Check for explicit VITE_API_URL first
  if (import.meta.env.VITE_API_URL) {
    url = import.meta.env.VITE_API_URL;
  } else if (env === 'dev' || env === 'development') {
    url = DEFAULT_DEV_API;
  } else if (env === 'staging') {
    url =
      import.meta.env.VITE_STAGING_API_URL ||
      'https://sdeiaiml.com:9214/api/v1';
  } else if (env === 'production') {
    url =
      import.meta.env.VITE_PRODUCTION_API_URL ||
      'https://api.aegisai.com/api/v1';
  } else {
    url = DEFAULT_DEV_API;
  }
  // Safeguard: never use the frontend origin as API (e.g. Vite dev server on 5173)
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, '');
    const base = url.replace(/\/$/, '').replace(/\/api\/v1.*$/i, '');
    if (base === origin) {
      console.warn(
        '[environment] API URL matched frontend origin; using backend default. Set VITE_API_URL to your backend (e.g. http://localhost:9213/api/v1).'
      );
      return DEFAULT_DEV_API;
    }
  }
  return url;
};

const config = {
  API_URL: getApiUrl(),
  ENV: env,
};

// Export both default config and named export for API_URL
export default config;
export const API_URL = config.API_URL;
export const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || '';
