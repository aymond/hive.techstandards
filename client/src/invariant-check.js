/**
 * Invariant Checker
 * 
 * This module provides custom handling for React Router invariant errors
 * and helps to identify issues with nested routers or history objects.
 */

// Original invariant function from React Router
export function invariant(value, message) {
  if (value === false || value === null || typeof value === 'undefined') {
    console.error(`[Router Invariant Error]: ${message}`);
    
    // Track stack trace
    const error = new Error(message);
    error.name = 'InvariantError';
    console.error('Stack trace:', error.stack);
    
    // Throw a more informative error
    throw new Error(
      `React Router Invariant Failed: ${message}\n` +
      'This is often caused by nested routers or missing router context.\n' +
      'Please check:\n' +
      ' - You are not nesting <BrowserRouter> or <Router> components\n' +
      ' - You are not using router hooks outside Router context\n' +
      ' - The history object is properly instantiated\n'
    );
  }
}

// Patch global window to handle uncaught invariant errors
window.addEventListener('error', function(event) {
  const errorMessage = event.error?.message || event.message;
  
  if (
    typeof errorMessage === 'string' && 
    (errorMessage.includes('Invariant failed') || 
     errorMessage.includes('useNavigate() may be used only in the context of a <Router>') ||
     errorMessage.includes('useLocation() may be used only in the context of a <Router>'))
  ) {
    console.error(
      'React Router Error Detected!\n' +
      'This is likely caused by nested routers or using router hooks outside Router context.\n' +
      'Original error:', errorMessage
    );
  }
});

export default invariant; 