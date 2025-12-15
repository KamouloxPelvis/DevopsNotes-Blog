import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const ignoreMessages = [
  'ResizeObserver loop completed with undelivered notifications.',
];

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    ignoreMessages.some((msg) => args[0].includes(msg))
  ) {
    return;
  }
  originalError(...args);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
