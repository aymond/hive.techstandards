import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  if (loading) {
    return <LoadingSpinner text="Loading profile..." />;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="profile-not-found">
        <h2>User Profile Not Found</h2>
        <p>Unable to retrieve your profile information.</p>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <h1>Profile Settings</h1>
      
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-title">
            <h2>{user.name || 'User'}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        
        <div className="profile-details">
          <div className="profile-info-group">
            <h3>Account Information</h3>
            <div className="profile-info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            {user.roles && (
              <div className="profile-info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{user.roles.join(', ')}</span>
              </div>
            )}
            {user.tenant && (
              <div className="profile-info-item">
                <span className="info-label">Organization:</span>
                <span className="info-value">{user.tenant.name || 'Not specified'}</span>
              </div>
            )}
            <div className="profile-info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="profile-actions">
        <p className="profile-note">
          To update your profile information, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings; 