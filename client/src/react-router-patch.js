/**
 * Patch file to fix React Router DOM development issues
 */

// Make sure this runs after DOM is ready
if (typeof window !== 'undefined') {
  // Wait for document ready to apply patches
  const applyPatches = () => {
    window.__ROUTER_HISTORY_DEBUG__ = true;
    
    // Add fallback to prevent errors
    if (!window.history.state) {
      window.history.replaceState({ 
        usr: Date.now(), 
        key: Math.random().toString(36).substr(2, 8),
        idx: 0 
      }, '');
    }
    
    // Override some history functions that might throw errors
    const originalPushState = window.history.pushState;
    window.history.pushState = function(state, title, url) {
      try {
        return originalPushState.apply(this, [state, title, url]);
      } catch (e) {
        console.warn('Error in history.pushState patched:', e);
        return null;
      }
    };
    
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(state, title, url) {
      try {
        return originalReplaceState.apply(this, [state, title, url]);
      } catch (e) {
        console.warn('Error in history.replaceState patched:', e);
        return null;
      }
    };
    
    // React Scheduler patch
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function(obj) {
        if (obj && obj.scheduleWork && !obj.unstable_cancelCallback) {
          obj.unstable_cancelCallback = function() { /* noop */ };
        }
        return obj;
      };
    }
  };
  
  // Apply patches after DOM is ready
  if (document.readyState === 'complete') {
    applyPatches();
  } else {
    window.addEventListener('DOMContentLoaded', applyPatches);
  }
} 