// API base URL — dev uses Vite proxy (empty base), prod points to deployed backend.
// Set VITE_API_URL in production (Vercel env var) to e.g. https://api.atakhanleague.com
const BASE = import.meta.env.VITE_API_URL || '';

/**
 * Build an API URL: api('/auth/signin') → '/api/auth/signin' in dev, full URL in prod.
 */
export const api = (path) => `${BASE}/api${path.startsWith('/') ? path : `/${path}`}`;
