import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
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

window.addEventListener('error', resizeObserverErrorHandler);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
