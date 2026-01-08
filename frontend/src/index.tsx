import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

// Calmer l'overlay du runtime error React/webpack qui sert à rien

const resizeObserverErrMsgs = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
];

const resizeObserverErrorHandler = (e: ErrorEvent) => {
  if (!e.message) return;
  if (resizeObserverErrMsgs.some(msg => e.message.includes(msg))) {
    e.stopImmediatePropagation();  // empêche React/webpack d’afficher l’overlay
    e.preventDefault();           // supprime aussi le log « uncaught error »
  }
};

const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration: ServiceWorkerRegistration) => {
          console.log('SW registered: ', registration);
        })
        .catch((error: Error) => {
          console.log('SW registration failed: ', error);
        });
    });
  }
};

registerServiceWorker();

window.addEventListener('error', resizeObserverErrorHandler);

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
