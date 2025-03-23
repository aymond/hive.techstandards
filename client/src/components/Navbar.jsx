import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/api';
import './Navbar.css';

// Memoized NavbarLink component for better performance
const NavbarLink = React.memo(({ to, label, isActive, onClick }) => (
  <li className={`nav-item ${isActive ? 'active' : ''}`}>
    <Link to={to} className="nav-link" onClick={onClick}>
      {label}
    </Link>
  </li>
));

NavbarLink.displayName = 'NavbarLink';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Don't treat this as an error on public routes
        console.log('Not authenticated', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch user if not on public routes
    // This prevents unnecessary authentication checks on public pages
    const isPublicRoute = ['/login', '/register', '/'].includes(location.pathname);
    if (isPublicRoute) {
      setLoading(false);
    } else {
      fetchUser();
    }
  }, [location.pathname]);
  
  // Check if a path is active
  const isActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Toggle mobile menu
  const toggleMenu = () => setMenuOpen(prev => !prev);
  
  // Close menu when clicking a link
  const closeMenu = () => setMenuOpen(false);
  
  // Check if user has required role
  const hasRole = useCallback((requiredRole) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(requiredRole);
  }, [user]);
  
  // Memoize whether user is admin
  const isAdmin = useMemo(() => {
    return hasRole('admin');
  }, [hasRole]);
  
  // Conditional links based on authentication and roles
  const authLinks = useMemo(() => (
    <>
      <NavbarLink to="/dashboard" label="Dashboard" isActive={isActive('/dashboard')} onClick={closeMenu} />
      {isAdmin && (
        <NavbarLink to="/add-technology" label="Add Technology" isActive={isActive('/add-technology')} onClick={closeMenu} />
      )}
      <NavbarLink to="/profile" label="Profile" isActive={isActive('/profile')} onClick={closeMenu} />
      <li className="nav-item">
        <button className="nav-link logout-button" onClick={handleLogout}>
          Logout
        </button>
      </li>
    </>
  ), [isActive, closeMenu, isAdmin, handleLogout]);
  
  const guestLinks = useMemo(() => (
    <>
      <NavbarLink to="/" label="Home" isActive={isActive('/')} onClick={closeMenu} />
      <NavbarLink to="/login" label="Login" isActive={isActive('/login')} onClick={closeMenu} />
      <NavbarLink to="/register" label="Register" isActive={isActive('/register')} onClick={closeMenu} />
    </>
  ), [isActive, closeMenu]);
  
  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">Tech Lifecycle Manager</Link>
        </div>
      </nav>
    );
  }
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to={user ? "/dashboard" : "/"}>Tech Lifecycle Manager</Link>
        </div>
        
        <button 
          className={`navbar-toggler ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav">
            {user ? authLinks : guestLinks}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar); 