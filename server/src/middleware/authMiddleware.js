const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Helper function to extract token
const extractToken = (req) => {
  return req.headers.authorization?.split(' ')[1] || req.cookies?.token;
};

// Middleware to authenticate JWT token
exports.authenticate = async (req, res, next) => {
  try {
    console.log('Auth middleware triggered');
    console.log('Headers:', JSON.stringify(req.headers));
    console.log('Cookies:', req.cookies);
    
    // Get token from the Authorization header or cookies
    const token = extractToken(req);
    
    console.log('Token extracted:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('No authentication token found, rejecting request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found in database:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user and tenant info to the request object
    req.user = user;
    req.tenantId = user.tenantId;
    console.log('User authenticated, tenantId:', req.tenantId);
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware that tries to authenticate but continues anyway
exports.optionalAuthenticate = async (req, res, next) => {
  try {
    console.log('Optional auth middleware triggered');
    
    // Get token from the Authorization header or cookies
    const token = extractToken(req);
    
    if (!token) {
      console.log('No token found, but continuing as unauthenticated');
      return next();
    }

    // Try to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find the user
      const user = await User.findById(decoded.id);
      if (user) {
        // Add user and tenant info to the request object
        req.user = user;
        req.tenantId = user.tenantId;
        console.log('User optionally authenticated:', user.email);
      }
    } catch (tokenError) {
      console.log('Invalid token, but continuing as unauthenticated');
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue anyway
    next();
  }
};

// Middleware to check if user is an admin
exports.isAdmin = (req, res, next) => {
  console.log('Admin check middleware triggered');
  console.log('User role:', req.user?.role);
  
  if (req.user && req.user.role === 'admin') {
    console.log('Admin access granted');
    next();
  } else {
    console.log('Admin access denied');
    return res.status(403).json({ message: 'Admin access required' });
  }
}; 