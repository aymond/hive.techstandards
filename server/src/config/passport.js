const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Tenant = require('../models/Tenant');

// Get Google OAuth credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

// Log configuration for debugging
console.log('Google OAuth Configuration:');
console.log(`- Client ID: ${GOOGLE_CLIENT_ID.substring(0, 8)}...`);
console.log(`- Client Secret: ${GOOGLE_CLIENT_SECRET ? '****' : 'Not set'}`);
console.log(`- Callback URL: ${CALLBACK_URL}`);

// Helper function to get default tenant ID
const getDefaultTenantId = async () => {
  // Look for a default tenant or create one if it doesn't exist
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

module.exports = () => {
  // Serialize user to session
  passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.id}`);
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      console.log(`Deserializing user: ${id}`);
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Deserialize error:', error);
      done(error, null);
    }
  });
  
  // Configure Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    proxy: true, // Handle proxy issues
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google auth callback received');
      console.log(`Profile: ${profile.displayName} (${profile.id})`);
      
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log(`Existing user found: ${user.email}`);
        // Update last login time
        user.lastLogin = Date.now();
        await user.save();
        return done(null, user);
      }
      
      console.log('Creating new user from Google profile');
      // If user doesn't exist, assign to default tenant
      const email = profile.emails[0].value;
      const tenantId = await getDefaultTenantId();
      
      // Create a new user
      user = await User.create({
        googleId: profile.id,
        email: email,
        name: profile.displayName,
        picture: profile.photos[0].value,
        role: 'user', // Default role
        tenantId: tenantId
      });
      
      console.log(`New user created: ${user.email}`);
      return done(null, user);
    } catch (error) {
      console.error('Google strategy error:', error);
      return done(error, null);
    }
  }));
}; 