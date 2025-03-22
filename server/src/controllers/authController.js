const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

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
    
    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Allow cross-site cookies
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
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
    const { email, password, name, tenantKey } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Determine tenant ID - if tenant key provided, use that, otherwise use default
    let tenantId;
    
    if (tenantKey) {
      const tenant = await Tenant.findOne({ tenantKey });
      if (!tenant) {
        return res.status(404).json({ message: 'Invalid tenant key' });
      }
      tenantId = tenant._id;
    } else {
      tenantId = await getDefaultTenantId();
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'user',
      tenantId
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Allow cross-site cookies
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user info (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
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
    
    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Allow cross-site cookies
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
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
    res.status(500).json({ message: 'Login failed' });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token');
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