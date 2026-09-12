import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// ── Firebase environment variable validation ──────────────────────────────
// Runs once at startup. Warns in the console if env vars look like placeholders
// or are missing so developers know exactly why Firebase is in offline mode.
const FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const PLACEHOLDER_PATTERNS = /^(YOUR_|your-|placeholder|undefined|null|VITE_|$)/i;

const missingVars = FIREBASE_VARS.filter((key) => {
  const val = (import.meta.env as Record<string, string>)[key] ?? '';
  return !val || PLACEHOLDER_PATTERNS.test(val) || val.length < 8;
});

if (missingVars.length > 0) {
  console.warn(
    `[Dolly] Firebase offline mode active.\n` +
    `Missing or placeholder env vars: ${missingVars.join(', ')}\n` +
    `All features work locally — set real values in .env to enable cloud sync.`
  );
} else {
  console.info('[Dolly] Firebase env vars detected — cloud sync available.');
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
