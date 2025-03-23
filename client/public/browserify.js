/**
 * React Development Setup
 * This script runs before any React code and ensures development environment
 * is properly configured.
 */

// Force development mode
window.NODE_ENV = 'development';

// Set up React configuration
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};

// Scheduler polyfills
window.scheduler = window.scheduler || {};
window.scheduler.unstable_cancelCallback = function(task) { return null; };
window.scheduler.unstable_now = function() { return Date.now(); };
window.scheduler.unstable_scheduleCallback = function(priority, callback) { 
  return setTimeout(callback, 0); 
};

// Add for compatibility with React Router DOM
window.__REACT_ROUTER_BUILD__ = 'development';
window.__REACT_ROUTER_DOM_BUILD__ = 'development';

// Fix React Router invariant issues
window.__ROUTER_HISTORY__ = window.__ROUTER_HISTORY__ || {
  push: function() {},
  replace: function() {},
  go: function() {},
  goBack: function() {},
  goForward: function() {},
  listen: function() { return function() {}; }
};

// Global reference to store React instances for consistency
window.__REACT_SINGLETON__ = null;
window.__REACT_DOM_SINGLETON__ = null;

// History API patch
if (window.history && !window.history.__patched) {
  // Ensure history state exists
  if (!window.history.state) {
    try {
      window.history.replaceState({ 
        key: Math.random().toString(36).substring(2),
        state: {},
        idx: 0
      }, document.title);
    } catch (e) {
      console.warn('Failed to initialize history state:', e);
    }
  }

  const originalPushState = window.history.pushState;
  window.history.pushState = function() {
    try {
      return originalPushState.apply(this, arguments);
    } catch (e) {
      console.warn('History API error caught and patched:', e);
      return null;
    }
  };
  
  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function() {
    try {
      return originalReplaceState.apply(this, arguments);
    } catch (e) {
      console.warn('History API error caught and patched:', e);
      return null;
    }
  };
  
  window.history.__patched = true;
}

// Patch for React Router invariant
window.__react_router_build__ = 'development';
window.__react_router_history_hook_initialized__ = true; 