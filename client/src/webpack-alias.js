/**
 * Webpack Alias Resolution
 * 
 * This file ensures that only a single instance of React is used throughout the application
 * by creating window-level aliases that all imports will reference.
 */

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Store a single reference to React and ReactDOM
  try {
    // Import React explicitly
    const React = require('react');
    const ReactDOM = require('react-dom');
    
    // Make these globally available
    window.__REACT_SHARED_INTERNALS__ = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    window.__REACT_INSTANCE__ = React;
    window.__REACT_DOM_INSTANCE__ = ReactDOM;
    
    // Ensure React DevTools can find this React instance
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers || new Map();
    
    // Ensure scheduler is properly defined
    window.scheduler = window.scheduler || {};
    window.scheduler.unstable_cancelCallback = window.scheduler.unstable_cancelCallback || function() { return null; };
    window.scheduler.unstable_now = window.scheduler.unstable_now || function() { return Date.now(); };
    window.scheduler.unstable_scheduleCallback = window.scheduler.unstable_scheduleCallback || 
      function(priority, callback) { return setTimeout(callback, 0); };
    
    // Patch React's version if needed
    if (React.version && React.version.startsWith('17')) {
      // Fix compatibility with newer libraries that expect React 18
      if (!React.createRoot) {
        React.createRoot = function(container) {
          return {
            render: function(element) {
              ReactDOM.render(element, container);
            },
            unmount: function() {
              ReactDOM.unmountComponentAtNode(container);
            }
          };
        };
      }
    }
    
    console.log('React aliasing initialized with React:', React.version);
  } catch (e) {
    console.error('Failed to initialize React aliasing:', e);
  }
} 