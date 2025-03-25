import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinTenant, joinTenantByInvitation } from '../services/api';
import './JoinOrganization.css';

const JoinOrganization = () => {
  const [isUsingInvitation, setIsUsingInvitation] = useState(true);
  const [invitationCode, setInvitationCode] = useState('');
  const [tenantKey, setTenantKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  
  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (isUsingInvitation && !invitationCode) {
      setError('Please enter an invitation code');
      return;
    }
    
    if (!isUsingInvitation && !tenantKey) {
      setError('Please enter a tenant key');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isUsingInvitation) {
        await joinTenantByInvitation(invitationCode);
        setSuccess('Successfully joined organization via invitation!');
      } else {
        await joinTenant(tenantKey);
        setSuccess('Successfully joined organization!');
      }
      
      // Redirect to dashboard after a short delay to show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error joining organization:', err);
      setError(err.message || 'Failed to join organization');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleJoinMethod = () => {
    setIsUsingInvitation(!isUsingInvitation);
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="join-organization-container">
      <div className="join-card">
        <h2>Join an Organization</h2>
        <p className="join-subtitle">
          {isUsingInvitation 
            ? "Enter your invitation code to join your organization" 
            : "Enter your organization's tenant key to join"}
        </p>
        
        <div className="toggle-method">
          <button 
            className={`toggle-button ${isUsingInvitation ? 'active' : ''}`}
            onClick={() => isUsingInvitation || toggleJoinMethod()}
          >
            Invitation Code
          </button>
          <button 
            className={`toggle-button ${!isUsingInvitation ? 'active' : ''}`}
            onClick={() => !isUsingInvitation || toggleJoinMethod()}
          >
            Tenant Key
          </button>
        </div>
        
        <form onSubmit={handleJoin} className="join-form">
          {isUsingInvitation ? (
            <div className="form-group">
              <label htmlFor="invitationCode">Invitation Code</label>
              <input
                type="text"
                id="invitationCode"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="Enter your invitation code"
                disabled={loading}
              />
              <small className="helper-text">
                The invitation code was shared with you by your organization admin.
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="tenantKey">Tenant Key</label>
              <input
                type="text"
                id="tenantKey"
                value={tenantKey}
                onChange={(e) => setTenantKey(e.target.value)}
                placeholder="Enter your organization's tenant key"
                disabled={loading}
              />
              <small className="helper-text">
                The tenant key is available to your organization's administrator.
              </small>
            </div>
          )}
          
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
          
          <button 
            type="submit" 
            className="join-button"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Organization'}
          </button>
        </form>
        
        <div className="join-footer">
          <button 
            onClick={() => navigate('/dashboard')}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinOrganization; 