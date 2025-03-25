const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const crypto = require('crypto');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      tenantId: user.tenantId
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate a unique tenant key
const generateTenantKey = () => {
  return crypto.randomBytes(6).toString('hex');
};

// Get default tenant ID
const getDefaultTenantId = async () => {
  let defaultTenant = await Tenant.findOne({ tenantKey: 'default' });
  
  if (!defaultTenant) {
    defaultTenant = await Tenant.create({
      name: 'Default Tenant',
      tenantKey: 'default',
      isActive: true
    });
  }
  
  return defaultTenant._id;
};

// Set token as cookie with enhanced security options
const setSecureCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: isProduction, // Requires HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // Protects against CSRF
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Set a CSRF token that client can read (not httpOnly)
  const csrfToken = require('crypto').randomBytes(32).toString('hex');
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false, // Client JS needs to read this
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Handle Google OAuth callback
exports.googleCallback = async (req, res) => {
  try {
    console.log('Processing Google callback controller');
    
    const user = req.user;
    if (!user) {
      console.error('No user in request after Google auth');
      return res.status(400).json({ message: 'Authentication failed' });
    }
    
    console.log(`Authenticated user: ${user.email}`);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set enhanced secure cookies
    setSecureCookie(res, token);
    
    console.log('Token cookie set, redirecting to frontend');
    
    // Get the return URL from session or use the default success URL
    const returnTo = req.session.returnTo || `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success`;
    delete req.session.returnTo;
    
    // Redirect to frontend
    res.redirect(returnTo);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/failed`);
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, tenantKey, organizationName } = req.body;
    
    // Enhanced input validation
    if (!email || !password || password.length < 8) {
      return res.status(400).json({
        message: 'Invalid input',
        details: 'Email is required and password must be at least 8 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Check if this is the first user in the system
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    const role = isFirstUser ? 'admin' : 'user';
    
    // Determine tenant ID
    let tenantId;
    let tenant;
    
    if (tenantKey) {
      // If tenant key provided, use that tenant
      tenant = await Tenant.findOne({ tenantKey });
      if (!tenant) {
        return res.status(404).json({ message: 'Invalid tenant key' });
      }
      tenantId = tenant._id;
    } else if (isFirstUser || organizationName) {
      // If this is the first user or they provided an org name, create a new tenant for them
      const newTenantKey = generateTenantKey();
      const tenantName = organizationName || `${name}'s Organization`;
      
      tenant = await Tenant.create({
        name: tenantName,
        tenantKey: newTenantKey,
        isActive: true
      });
      
      tenantId = tenant._id;
    } else {
      // Otherwise use default tenant
      tenantId = await getDefaultTenantId();
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role,
      tenantId
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set secure cookies (if method exists)
    if (typeof setSecureCookie === 'function') {
      setSecureCookie(res, token);
    } else {
      // Fallback cookie setting
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    // Return user info (excluding password) and tenant info
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    const tenantResponse = tenant ? {
      id: tenant._id,
      name: tenant.name,
      tenantKey: tenant.tenantKey
    } : null;
    
    res.status(201).json({ 
      user: userResponse, 
      token,
      tenant: tenantResponse,
      isFirstUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    // Sanitized error response
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Enhanced input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use Google login' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set enhanced secure cookies
    setSecureCookie(res, token);
    
    // Return user info (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture
    };
    
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    // Sanitized error response
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

// Logout user
exports.logout = (req, res) => {
  // Clear all authentication cookies
  res.clearCookie('token');
  res.clearCookie('csrf_token');
  res.json({ message: 'Logged out successfully' });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  try {
    const user = req.user;
    
    // Return user info (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture,
      tenantId: user.tenantId
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get current user' });
  }
}; 