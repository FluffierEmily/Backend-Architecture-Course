import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Defer Firebase & Analytics initialization until the main thread is idle
if (typeof window !== 'undefined') {
  const initFirebase = () => {
    void import('./firebase');
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initFirebase, { timeout: 2500 });
  } else {
    globalThis.setTimeout(initFirebase, 1500);
  }
}
