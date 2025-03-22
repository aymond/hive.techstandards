import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Add error handling to catch rendering issues
window.addEventListener('error', function(e) {
  console.error('Global error caught:', e.error || e.message);
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="max-width: 800px; margin: 40px auto; padding: 20px; text-align: center; font-family: sans-serif;">
        <h1 style="color: #e53935;">Application Error</h1>
        <p>The application encountered an error. Details:</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${e.message}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4a6cf7; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">
          Reload Page
        </button>
      </div>
    `;
  }
});

// Log environment variables to help with debugging
console.log('Environment:', {
  apiUrl: window.env.REACT_APP_API_URL,
  absoluteApiUrl: window.env.REACT_APP_ABSOLUTE_API_URL,
  clientUrl: window.env.REACT_APP_CLIENT_URL,
  version: window.env.REACT_APP_VERSION
});

// Use the traditional render method which is more compatible
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
); 