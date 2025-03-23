const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const technologyRoutes = require('./routes/technologyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

// Import middleware
const { optionalAuthenticate } = require('./middleware/auth');
const { csrfProtection } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 5081;

// Security headers with Helmet
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));

// Rate limiting to prevent brute force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/api/auth/', apiLimiter);

// CORS Configuration
// Explicitly define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5080',
  'http://localhost:5081',
  'http://client',
  'http://server',
  process.env.CLIENT_URL
].filter(Boolean); // Remove any undefined values

console.log('CORS allowed origins:', allowedOrigins);

// Configure CORS more explicitly
app.use(cors({
  origin: function(origin, callback) {
    console.log('Incoming request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) {
      console.log('Request has no origin, allowing');
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      // In production, actually reject unauthorized origins
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Origin not allowed by CORS policy'), false);
      }
      // In development, allow the request but log it
      console.warn('CORS warning: Allowing unauthorized origin in development mode');
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// Other middleware
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(cookieParser());

// MongoDB connection
let db;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tech-standards', {
  // Add security-related MongoDB connection options
  autoIndex: false, // Don't build indexes in production
})
  .then((connection) => {
    console.log('MongoDB connected');
    db = connection;
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Continuing without MongoDB as it might not be required for initial setup');
  });

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: true, // Changed to true to support OAuth
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/tech-standards',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Stricter in production
    domain: process.env.COOKIE_DOMAIN || undefined // Domain from env or default
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
require('./config/passport')();

// Debugging middleware for all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`User-Agent: ${req.headers['user-agent']}`);
  console.log(`Auth header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  console.log(`Cookies:`, req.cookies);
  next();
});

// API Routes with CSRF protection for mutating operations
app.use('/api/auth', authRoutes);
app.use('/api/technologies', csrfProtection, technologyRoutes);
app.use('/api/tenants', csrfProtection, tenantRoutes);

// Non-API auth routes for OAuth
app.use('/auth', authRoutes);

// Health check route with optional authentication
app.get('/api/health', optionalAuthenticate, (req, res) => {
  const authStatus = req.user ? 'authenticated' : 'unauthenticated';
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    auth: authStatus,
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
});

// Test route that doesn't require authentication but will use it if available
app.get('/api/test', optionalAuthenticate, (req, res) => {
  res.json({ 
    message: 'Test endpoint successful', 
    time: new Date().toISOString(),
    cookies: req.cookies,
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host
    },
    auth: req.user ? 'authenticated' : 'unauthenticated',
    user: req.user ? {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    } : null
  });
});

// If in production, serve static files from client/build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);
  
  // Close Express server first (stop accepting new connections)
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Close all database connections
  if (db) {
    try {
      console.log('Closing MongoDB connection...');
      mongoose.connection.close(false);
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }

  // Force exit after 3 seconds if graceful shutdown doesn't complete
  setTimeout(() => {
    console.log('Forcing shutdown after timeout');
    process.exit(0);
  }, 3000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT')); 