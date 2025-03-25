const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Debugging middleware for auth routes
router.use((req, res, next) => {
  console.log(`[Auth Route] ${req.method} ${req.path}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('Starting Google OAuth flow');
  console.log(`Referrer: ${req.headers.referer}`);
  
  // Store return URL for after authentication
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    console.log('Received callback from Google');
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/failed`,
    session: true 
  }),
  (req, res, next) => {
    console.log('Google authentication successful');
    next();
  },
  authController.googleCallback
);

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.get('/logout', authController.logout);

// Get current authenticated user
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 