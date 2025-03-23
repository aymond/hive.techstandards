import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import TechnologyFilter from './components/TechnologyFilter';
import TechnologyList from './components/TechnologyList';
import TechnologyForm from './components/TechnologyForm';
import { 
  fetchTechnologies, 
  createTechnology, 
  updateTechnology, 
  deleteTechnology,
  getCurrentUser,
  logoutUser
} from './services/api';
import fallbackTechnologies from './data/technologies';
import './App.css';

// Eager load critical components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';

// Lazy load non-critical components
const TechnologyDetail = lazy(() => import('./components/TechnologyDetail'));
const AddTechnology = lazy(() => import('./components/AddTechnology'));
const ProfileSettings = lazy(() => import('./components/ProfileSettings'));

// Fallback loading component for lazy-loaded routes
const SuspenseFallback = () => (
  <div className="suspense-loading">
    <LoadingSpinner />
    <p>Loading component...</p>
  </div>
);

// Protected route component to handle authentication
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the current route is a public route
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
  
  useEffect(() => {
    // Skip auth check for public routes
    if (isPublicRoute) {
      setLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      try {
        await getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Auth check failed:', error.message || 'Unknown error');
        setIsAuthenticated(false);
        
        // Only redirect if this is an actual protected route
        if (!isPublicRoute) {
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname } // Save the intended destination
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location.pathname, isPublicRoute]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If it's a public route, or the user is authenticated, render the children
  return (isPublicRoute || isAuthenticated) ? children : null;
};

// Create an App wrapper to use router hooks outside of Router context
const AppContent = () => {
  const [user, setUser] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user authentication...');
        const userData = await getCurrentUser();
        console.log('User data received:', userData);
        setUser(userData);
      } catch (err) {
        console.log('User not authenticated:', err);
        setUser(null);
      } finally {
        setIsAuthChecked(true);
        setIsLoading(false);
      }
    };

    // Only check authentication if we're not on a public route
    const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
    if (isPublicRoute) {
      setIsAuthChecked(true);
      setIsLoading(false);
    } else {
      checkUser();
    }
  }, [location.pathname]);

  // Authentication handlers
  const handleLoginSuccess = (userData) => {
    console.log('Login successful, user data:', userData);
    setUser(userData);
    navigate('/dashboard');
  };

  const handleRegisterSuccess = () => {
    // Registration success, redirect to login happens in component
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      await logoutUser();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Simple loading screen
  if (!isAuthChecked) {
    return <div className="loading">Checking authentication...</div>;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<SuspenseFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/technologies/:id" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback />}>
                    <TechnologyDetail />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<SuspenseFallback />}>
                    <ProfileSettings />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

// Main App component - Note: Router is removed as it's already in index.js
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App; 