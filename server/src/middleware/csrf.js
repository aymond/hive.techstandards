/**
 * CSRF Protection Middleware
 * 
 * This middleware verifies that requests to protected endpoints include a valid CSRF token.
 * The token should be included in the request headers as 'X-CSRF-Token'.
 */

// CSRF protection middleware
exports.csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests as they should be safe
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get the CSRF token from the cookie and header
  const csrfCookie = req.cookies.csrf_token;
  const csrfHeader = req.headers['x-csrf-token'];

  // In development, make CSRF protection optional
  if (process.env.NODE_ENV !== 'production' && !csrfCookie) {
    console.warn('CSRF Protection: No CSRF cookie found. Skipping validation in development.');
    return next();
  }

  // Validate the token
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    console.warn('CSRF Protection: Invalid or missing CSRF token');
    return res.status(403).json({ 
      message: 'CSRF validation failed. Please refresh the page and try again.' 
    });
  }

  next();
}; 