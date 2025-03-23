/**
 * React Scheduler Polyfill
 * 
 * This module provides polyfills for React Scheduler functions that might be
 * missing in development mode, particularly unstable_cancelCallback
 */

// Create a global scheduler object if it doesn't exist
if (typeof window !== 'undefined') {
  // Scheduler implementation
  window.scheduler = window.scheduler || {};
  
  // Provide unstable_cancelCallback if not available
  if (!window.scheduler.unstable_cancelCallback) {
    window.scheduler.unstable_cancelCallback = function() { 
      // Empty implementation to prevent errors
      return null;
    };
  }
  
  // Provide other potential missing scheduler functions
  window.scheduler.unstable_now = window.scheduler.unstable_now || function() { 
    return Date.now(); 
  };
  
  window.scheduler.unstable_scheduleCallback = window.scheduler.unstable_scheduleCallback || function(priority, callback) {
    return setTimeout(callback, 0);
  };
  
  // Patch React's scheduler if needed
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    const originalInject = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject;
    
    if (originalInject) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function(obj) {
        if (obj && typeof obj === 'object') {
          // Make sure scheduler functions exist
          obj.unstable_cancelCallback = obj.unstable_cancelCallback || window.scheduler.unstable_cancelCallback;
          obj.unstable_now = obj.unstable_now || window.scheduler.unstable_now;
          obj.unstable_scheduleCallback = obj.unstable_scheduleCallback || window.scheduler.unstable_scheduleCallback;
        }
        
        return originalInject.call(this, obj);
      };
    }
  }
} 