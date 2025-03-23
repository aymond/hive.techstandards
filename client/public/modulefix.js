/**
 * Module Resolution Fix
 * This script helps avoid duplicate React instances by setting up global module cache
 */

// Create a module cache for consistent React imports
window.__MODULE_CACHE__ = window.__MODULE_CACHE__ || {};

// Patch window.require if needed
if (typeof window.require !== 'function') {
  window.require = function(moduleName) {
    // Handle React and ReactDOM specifically to avoid duplicates
    if (moduleName === 'react' && window.__REACT_SINGLETON__) {
      return window.__REACT_SINGLETON__;
    }
    
    if (moduleName === 'react-dom' && window.__REACT_DOM_SINGLETON__) {
      return window.__REACT_DOM_SINGLETON__;
    }
    
    // For other modules, try to emulate CommonJS require
    if (window.__MODULE_CACHE__[moduleName]) {
      return window.__MODULE_CACHE__[moduleName];
    }
    
    // Return empty object for missing modules
    return {};
  };
}

// Patch window.define for AMD modules if needed
if (typeof window.define !== 'function') {
  window.define = function(name, deps, callback) {
    // Simple AMD module definition support
    if (typeof name === 'function') {
      callback = name;
      deps = [];
      name = null;
    } else if (Array.isArray(name)) {
      callback = deps;
      deps = name;
      name = null;
    }
    
    // Execute the callback with dependencies
    if (typeof callback === 'function') {
      const resolvedDeps = deps.map(dep => {
        if (dep === 'react') return window.__REACT_SINGLETON__ || {};
        if (dep === 'react-dom') return window.__REACT_DOM_SINGLETON__ || {};
        return window.__MODULE_CACHE__[dep] || {};
      });
      
      const result = callback.apply(null, resolvedDeps);
      if (name) {
        window.__MODULE_CACHE__[name] = result;
      }
    }
  };
  
  // Add AMD flag
  window.define.amd = {};
} 