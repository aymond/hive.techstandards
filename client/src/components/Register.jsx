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
    tenantKey: '',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrgField, setShowOrgField] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear tenant key if organization name is entered, and vice versa
    if (name === 'organizationName' && value) {
      setUserData(prev => ({ ...prev, tenantKey: '' }));
    } else if (name === 'tenantKey' && value) {
      setUserData(prev => ({ ...prev, organizationName: '' }));
    }
  };

  const toggleOrgField = () => {
    setShowOrgField(!showOrgField);
    // Clear both fields when switching
    setUserData(prev => ({
      ...prev,
      tenantKey: '',
      organizationName: ''
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
      
      // Show success message with organization info if applicable
      let successMessage = `Registration successful! Welcome, ${userData.name}!`;
      if (response.tenant) {
        successMessage += ` You've been added to the "${response.tenant.name}" organization.`;
        if (response.isFirstUser) {
          successMessage += ' You are the admin of this organization.';
        }
      }
      
      alert(successMessage);
      
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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
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
              placeholder="Create a password (min. 6 characters)"
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
              placeholder="Confirm your password"
            />
          </div>
          
          <div className="tenant-options">
            <button 
              type="button" 
              className="toggle-button"
              onClick={toggleOrgField}
            >
              {showOrgField ? "I have an organization code" : "I want to create a new organization"}
            </button>
          </div>
          
          {showOrgField ? (
            <div className="form-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={userData.organizationName}
                onChange={handleChange}
                placeholder="Enter your organization name"
              />
              <small className="helper-text">
                This will create a new organization with you as a member.
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="tenantKey">Organization Code (optional)</label>
              <input
                type="text"
                id="tenantKey"
                name="tenantKey"
                value={userData.tenantKey}
                onChange={handleChange}
                placeholder="Enter organization code if you have one"
              />
              <small className="helper-text">
                Leave empty to join the default organization or enter a code to join a specific organization.
              </small>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 