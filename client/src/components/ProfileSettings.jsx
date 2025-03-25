import React, { useState, useEffect } from 'react';
import { getCurrentUser, createTenantOrganization, leaveTenant } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [organizationData, setOrganizationData] = useState({
    name: '',
    domain: ''
  });
  
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
  
  const handleCreateOrgToggle = () => {
    setShowCreateOrg(!showCreateOrg);
    setError(null);
    setSuccess(null);
    setConfirmLeave(false);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrganizationData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!organizationData.name) {
      setError('Organization name is required');
      return;
    }
    
    try {
      setLoading(true);
      const result = await createTenantOrganization(organizationData);
      setSuccess(`Organization "${result.name}" created successfully! Organization Code: ${result.tenantKey}`);
      setOrganizationData({
        name: '',
        domain: ''
      });
      
      // Refresh user data to get updated tenant info
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Failed to create organization:', err);
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleLeaveConfirmation = () => {
    setConfirmLeave(!confirmLeave);
    setError(null);
    setSuccess(null);
    setShowCreateOrg(false);
  };
  
  const handleLeaveOrganization = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await leaveTenant();
      
      // Refresh user data to get updated tenant info
      const userData = await getCurrentUser();
      setUser(userData);
      
      setSuccess('You have successfully left the organization.');
      setConfirmLeave(false);
    } catch (err) {
      console.error('Failed to leave organization:', err);
      setError(err.message || 'Failed to leave organization');
    } finally {
      setLoading(false);
    }
  };
  
  const isAdmin = user && user.role === 'admin';
  
  if (loading && !user) {
    return <LoadingSpinner text="Loading profile..." />;
  }
  
  if (error && !user) {
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
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
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
            <div className="profile-info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{user.role || 'User'}</span>
            </div>
            <div className="profile-info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="profile-info-group">
            <h3>Organization Membership</h3>
            {user.tenantId ? (
              <div>
                <div className="profile-info-item">
                  <span className="info-label">Organization:</span>
                  <span className="info-value">{user.tenant?.name || 'Not specified'}</span>
                </div>
                <div className="organization-actions">
                  {!confirmLeave ? (
                    <button 
                      className="leave-org-button"
                      onClick={toggleLeaveConfirmation}
                    >
                      Leave Organization
                    </button>
                  ) : (
                    <div className="confirm-leave-container">
                      <p>Are you sure you want to leave this organization?</p>
                      <div className="confirm-actions">
                        <button 
                          className="confirm-yes"
                          onClick={handleLeaveOrganization}
                          disabled={loading}
                        >
                          Yes, Leave
                        </button>
                        <button 
                          className="confirm-no"
                          onClick={toggleLeaveConfirmation}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-org-message">
                <p>You are not currently a member of any organization.</p>
                <a href="/join-organization" className="join-org-link">
                  Join an Organization
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isAdmin && (
        <div className="admin-actions">
          <div className="admin-actions-header">
            <h3>Admin Actions</h3>
            <button 
              className="toggle-action-button"
              onClick={handleCreateOrgToggle}
            >
              {showCreateOrg ? 'Cancel' : 'Create New Organization'}
            </button>
          </div>
          
          {showCreateOrg && (
            <div className="create-org-form-container">
              <h4>Create New Organization</h4>
              
              <form onSubmit={handleCreateOrg} className="create-org-form">
                <div className="form-group">
                  <label htmlFor="name">Organization Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={organizationData.name}
                    onChange={handleChange}
                    placeholder="Enter organization name"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="domain">Email Domain (Optional)</label>
                  <input
                    type="text"
                    id="domain"
                    name="domain"
                    value={organizationData.domain}
                    onChange={handleChange}
                    placeholder="example.com"
                    disabled={loading}
                  />
                  <small className="helper-text">
                    If specified, users with this email domain will automatically join this organization.
                  </small>
                </div>
                
                <button 
                  type="submit" 
                  className="create-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Organization'}
                </button>
              </form>
            </div>
          )}
          
          <div className="admin-links">
            <a href="/organization" className="admin-link">
              Manage Your Organization
            </a>
          </div>
        </div>
      )}
      
      <div className="profile-actions">
        <p className="profile-note">
          To update your profile information, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings; 