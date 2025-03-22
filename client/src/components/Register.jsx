import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Auth.css';

const Register = ({ onRegisterSuccess }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantKey: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = userData;
      
      const response = await registerUser(registrationData);
      console.log('Registration successful:', response);
      
      // Call the onRegisterSuccess callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess(response);
      }
      
      // Redirect to the login page or dashboard
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create a New Account</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={userData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Create a password"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Confirm your password"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tenantKey">Tenant Key (Optional)</label>
          <input
            type="text"
            id="tenantKey"
            name="tenantKey"
            value={userData.tenantKey}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Enter your organization's tenant key if you have one"
          />
          <small>Leave blank to create a new tenant</small>
        </div>
        
        <button 
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
      <div className="auth-links">
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <p>
          <Link to="/auth/google">
            <button className="google-auth-button">
              <i className="fab fa-google"></i> Register with Google
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 