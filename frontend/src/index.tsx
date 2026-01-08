import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

// 1. Calmer l'overlay du runtime error (ResizeObserver)
const resizeObserverErrMsgs = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
];

const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (!e.message) return;
  if (resizeObserverErrMsgs.some(msg => e.message.includes(msg))) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
};

window.addEventListener('error', resizeObserverErrorHandler);

// 2. Désactivation du Service Worker pour supprimer l'erreur 404
// On retire l'appel à registerServiceWorker() car le fichier est manquant.
// Si un ancien SW existe, on peut même l'effacer proprement :
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();