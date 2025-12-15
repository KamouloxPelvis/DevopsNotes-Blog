import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Patch pour calmer l'erreur ResizeObserver dans la console de dev
const resizeObserverErrMsg = 'ResizeObserver loop completed with undelivered notifications.';
window.addEventListener('error', (e) => {
  if (e.message === resizeObserverErrMsg) {
    e.stopImmediatePropagation();
  }
});

window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  const message = (e.reason && e.reason.message) || '';
  if (message === resizeObserverErrMsg) {
    e.preventDefault();
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
